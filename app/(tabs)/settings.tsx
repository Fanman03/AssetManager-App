import BootstrapButton from '@/components/BootstrapButton';
import eventBus from '@/lib/eventBus';
import { clearServerUrl, getServerUrl } from '@/lib/storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    useWindowDimensions,
    View,
} from 'react-native';

type ServerInfo = { version?: string, appName?: string };

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const clientVersion =
        Constants.expoConfig?.version ??
        // fallback for older SDKs
        // @ts-ignore
        Constants.manifest?.version ??
        'unknown';

    const [serverVersion, setServerVersion] = useState<string | null>(null);
    const [serverName, setServerName] = useState<string | null>(null);
    const [serverErr, setServerErr] = useState<string | null>(null);
    const [loadingServerVersion, setLoadingServerVersion] = useState<boolean>(true);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoadingServerVersion(true);
                setServerErr(null);

                const base = await getServerUrl();
                if (!base) {
                    throw new Error('No server URL configured');
                }

                const url = `${base.replace(/\/$/, '')}/api/mobile-app/info`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const json: ServerInfo = await res.json();
                if (!cancelled) {
                    setServerVersion(json.version ?? 'unknown');
                    setServerName(json.appName ?? 'unknown');
                }
            } catch (e: any) {
                if (!cancelled) {
                    setServerErr(e?.message ?? 'Failed to load');
                    setServerVersion(null);
                    setServerName(null);
                }
            } finally {
                if (!cancelled) setLoadingServerVersion(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const resetApp = async () => {
        await clearServerUrl();
        router.replace('/root');
    };

    const onResetPress = () => {
        Alert.alert('Reset Server URL', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: resetApp },
        ]);
    };

    const onSettingsPress = () => {
        eventBus.emit('barcode-scanned', 'settings');
        router.replace('/assets');
    };

    return (
        <View
            style={[
                styles.outerContainer,
                isDark ? styles.bgDark : styles.bgLight,
            ]}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.contentContainer,
                    isLandscape && styles.innerContainerLandscape,
                ]}
            >
                <View style={styles.header}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={styles.appIcon}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={[styles.headerText, isDark ? styles.textLight : styles.textDark]}>
                            Asset Manager
                        </Text>
                        <Text style={[styles.headerSubtext, isDark ? styles.textLight : styles.textDark]}>
                            by Jack Pendleton
                        </Text>
                    </View>
                </View>
                <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
                    App Settings
                </Text>
                <BootstrapButton
                    variant="danger"
                    size="md"
                    onPress={onResetPress}
                >
                    Reset Server URL
                </BootstrapButton>
                <Text style={[styles.version, isDark ? styles.textLight : styles.textDark]}>
                    Client Version: v{clientVersion}
                </Text>

                <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
                    Server Settings
                </Text>
                <BootstrapButton
                    variant="primary"
                    size="md"
                    onPress={onSettingsPress}
                >
                    Open Server Settings
                </BootstrapButton>

                {loadingServerVersion ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <ActivityIndicator size="small" color={isDark ? '#f8f9fa' : '#212529'} />
                        <Text style={[styles.version, isDark ? styles.textLight : styles.textDark, { marginLeft: 8 }]}>
                            Fetching server info
                        </Text>
                    </View>
                ) : serverErr ? (
                    <Text style={[styles.version, styles.error, isDark ? styles.textLight : styles.textDark]}>
                        Server Version: {serverErr}
                    </Text>
                ) : (
                    <>
                        <Text style={[styles.version, isDark ? styles.textLight : styles.textDark]}>
                            Server Name: {serverName}
                        </Text>
                        <Text style={[styles.version, isDark ? styles.textLight : styles.textDark]}>
                            Server Version: v{serverVersion}
                        </Text>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    innerContainerLandscape: {
        maxWidth: 480,
        width: '100%',
        marginLeft: 100
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        justifyContent: 'center',
    },
    header: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    appIcon: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '700'
    },
    headerSubtext: {
        marginTop: -4
    },
    bgLight: {
        backgroundColor: '#f8f9fa',
    },
    bgDark: {
        backgroundColor: '#212529',
    },
    textLight: {
        color: '#f8f9fa',
    },
    textDark: {
        color: '#212529',
    },
    title: {
        fontSize: 30,
        marginTop: 16,
        fontWeight: '600',
    },
    version: {
        fontSize: 14,
        fontWeight: '500',
    },
    error: {
        color: '#dc3545',
    },
});
