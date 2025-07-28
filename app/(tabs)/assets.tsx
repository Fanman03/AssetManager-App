import BootstrapButton from '@/components/BootstrapButton';
import eventBus from '@/lib/eventBus';
import { getServerUrl } from '@/lib/storage';
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
import { WebView } from 'react-native-webview';

export default function AssetsScreen() {
    const colorScheme = useColorScheme();
    const webRef = useRef<WebView>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [serverUrl, setServerUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [canGoBack, setCanGoBack] = useState(false);
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
            setError(null);
            setCanGoBack(false);
            setUrl(target);
            // optional hard refresh:
            // webRef.current?.stopLoading();
            // webRef.current?.reload();
        };
        eventBus.on('assets-tab-pressed', handler);
        return () => eventBus.off('assets-tab-pressed', handler);
    }, [serverUrl, url]);

    // Helper to safely join base + path with a single slash
    const joinUrl = (base: string, path: string) => {
        const trimmedBase = base.replace(/\/+$/, '');
        const trimmedPath = path.replace(/^\/+/, '');
        return `${trimmedBase}/${trimmedPath}`;
    };

    // Helper to extract the slug after the **first** slash
    // If you want **after the last slash**, use lastIndexOf('/') instead.
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
                setUrl(finalUrl); // this will re-render and navigate the WebView
            } catch (e) {
                console.error(e);
                setError('Invalid QR code');
            }
        };

        eventBus.on('barcode-scanned', handleScanned);
        return () => eventBus.off('barcode-scanned', handleScanned);
    }, [serverUrl, url]);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (canGoBack && webRef.current) {
                webRef.current.goBack();
                return true; // we've handled it
            }
            return false; // let the default behavior run
        });

        return () => sub.remove();
    }, [canGoBack]);

    const injectedJS = `
    document.documentElement.setAttribute('data-bs-theme', '${colorScheme === 'dark' ? 'dark' : 'light'}');
    true;
  `;

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
                source={{ uri: url }}
                ref={webRef}
                injectedJavaScript={injectedJS}
                javaScriptEnabled
                domStorageEnabled
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
