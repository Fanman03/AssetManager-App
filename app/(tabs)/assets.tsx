import BootstrapButton from '@/components/BootstrapButton';
import eventBus from '@/lib/eventBus';
import { getServerUrl } from '@/lib/storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import {
    BackHandler,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export default function AssetsScreen() {
    const colorScheme = useColorScheme();
    const webRef = useRef<WebView>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [serverUrl, setServerUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [reloadKey, setReloadKey] = useState(0); // Force WebView remount
    const baseUrlRef = useRef<string | null>(null);

    // Load saved server URL on mount
    useEffect(() => {
        (async () => {
            const saved = await getServerUrl();
            if (saved) {
                setServerUrl(saved);
                setUrl(saved);
                baseUrlRef.current = saved;
            }
        })();
    }, []);

    // When the Assets tab is pressed, go back to the main URL
    useEffect(() => {
        const handler = () => {
            const target = baseUrlRef.current ?? serverUrl ?? url;
            if (!target) return;
            navigateToBase(target);
        };

        eventBus.on('assets-tab-pressed', handler);
        return () => eventBus.off('assets-tab-pressed', handler);
    }, [serverUrl]);

    const navigateToBase = (target: string) => {
        setUrl(target);
        setReloadKey(prev => prev + 1); // Force WebView to remount
        setError(null);
        setCanGoBack(false);
    };

    // Helper to safely join base + path with a single slash
    const joinUrl = (base: string, path: string) => {
        const trimmedBase = base.replace(/\/+$/, '');
        const trimmedPath = path.replace(/^\/+/, '');
        return `${trimmedBase}/${trimmedPath}`;
    };

    // Helper to extract the slug after the **first** slash
    const extractAfterFirstSlash = (scanned: string) => {
        const i = scanned.indexOf('/');
        return i === -1 ? scanned : scanned.slice(i + 1);
    };

    // Listen for barcode scan events
    useEffect(() => {
        const handleScanned = (scannedUrl: string) => {
            setError(null); // clear errors on new scan

            try {
                const slug = extractAfterFirstSlash(scannedUrl);
                const base = serverUrl ?? url ?? ''; // fall back to whatever we have
                if (!base) {
                    throw new Error('No base server URL available');
                }

                const finalUrl = joinUrl(base, slug);
                setUrl(finalUrl); // navigate WebView
                setReloadKey(prev => prev + 1); // ensure reload
            } catch (e) {
                console.error(e);
                setError('Invalid QR code');
            }
        };

        eventBus.on('barcode-scanned', handleScanned);
        return () => eventBus.off('barcode-scanned', handleScanned);
    }, [serverUrl, url]);

    // Handle Android back button
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (canGoBack && webRef.current) {
                webRef.current.goBack();
                return true;
            }
            return false;
        });

        return () => sub.remove();
    }, [canGoBack]);

    async function handleWebViewMessage(event: WebViewMessageEvent) {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'download' && data.base64 && data.filename) {
                const permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
                if (!permission.granted) {
                    alert('Permission to access media library is required.');
                    return;
                }

                const base64Data = data.base64.replace(/^data:image\/(png|jpeg);base64,/, '');
                const fileUri = FileSystem.cacheDirectory + data.filename; // Use cacheDirectory to avoid gallery duplication

                await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const asset = await MediaLibrary.createAssetAsync(fileUri);

                // Save to Download album (or create it if it doesn't exist)
                await MediaLibrary.createAlbumAsync('Download', asset, false);

                alert('Downloaded to device successfully.');
            }
        } catch (err) {
            console.error('Failed to save download:', err);
        }
    }

    const injectedJS = `
    document.documentElement.setAttribute('data-bs-theme', '${colorScheme === 'dark' ? 'dark' : 'light'}');
    true;`;

    if (error) {
        return (
            <View
                style={[
                    styles.errorContainer,
                    colorScheme === 'dark' ? styles.errorContainerDark : styles.errorContainerLight,
                ]}
            >
                <Text
                    style={[
                        styles.errorTitle,
                        colorScheme === 'dark' ? styles.textLight : styles.textDark,
                    ]}
                >
                    Unable to load asset.
                </Text>
                <BootstrapButton
                    variant="primary"
                    size="md"
                    style={{ alignSelf: 'center' }}
                    onPress={async () => {
                        const saved = await getServerUrl();
                        if (saved) {
                            setServerUrl(saved);
                            setUrl(saved);
                            setReloadKey(prev => prev + 1);
                            setError(null);
                        }
                    }}
                >
                    Back to Asset List
                </BootstrapButton>
                <Text style={[styles.errorDesc, colorScheme === 'dark' ? styles.textLight : styles.textDark]}>
                    Requested URL:{"\n"}{url}
                </Text>
            </View>
        );
    }

    if (!url) return null;

    return (
        <View style={{ flex: 1 }}>
            {Platform.OS === 'android' && (
                <View style={{ height: StatusBar.currentHeight, backgroundColor: '#0d6efd' }} />
            )}
            <WebView
                key={`${url}-${reloadKey}`}  // Force remount on URL change
                source={{ uri: url }}
                ref={webRef}
                injectedJavaScript={injectedJS}
                javaScriptEnabled
                domStorageEnabled
                onMessage={handleWebViewMessage}
                onError={() => setError('WebView load error')}
                onHttpError={(e) => setError(`HTTP error: ${e.nativeEvent.statusCode}`)}
                onNavigationStateChange={(navState) => {
                    setCanGoBack(navState.canGoBack);
                }}
                style={{ flex: 1 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorContainerLight: {
        backgroundColor: '#f8f9fa', // Bootstrap light background
    },
    errorContainerDark: {
        backgroundColor: '#212529', // Bootstrap dark background
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    errorDesc: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 24,
        textAlign: 'center',
    },
    textLight: {
        color: '#f8f9fa', // Bootstrap light text
    },
    textDark: {
        color: '#212529', // Bootstrap dark text
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 160,
        color: '#ffffff',
    },
    buttonLight: {
        backgroundColor: '#0d6efd', // Bootstrap primary blue
        borderColor: '#0d6efd',
        color: '#ffffff'
    },
    buttonDark: {
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd',
        color: '#ffffff'
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});