import eventBus from '@/lib/eventBus';
import { clearServerUrl, getServerUrl } from '@/lib/storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

type ServerInfo = { version?: string };

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
    const [serverErr, setServerErr] = useState<string | null>(null);
    const [loadingServerVersion, setLoadingServerVersion] = useState<boolean>(true);

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
                }
            } catch (e: any) {
                if (!cancelled) {
                    setServerErr(e?.message ?? 'Failed to load');
                    setServerVersion(null);
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
        <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
            <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
                App Settings
            </Text>
            <Pressable
                onPress={onResetPress}
                style={({ pressed }) => [
                    styles.buttonDanger,
                    isDark ? styles.buttonDark : styles.buttonLight,
                    pressed && styles.buttonPressed,
                ]}
            >
                <Text style={[styles.buttonText, isDark ? styles.textLight : styles.textLight]}>
                    Reset Server URL
                </Text>
            </Pressable>
            <Text style={[styles.version, isDark ? styles.textLight : styles.textDark]}>
                Client Version: v{clientVersion}
            </Text>

            <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
                Server Settings
            </Text>
            <Pressable
                onPress={onSettingsPress}
                style={({ pressed }) => [
                    styles.buttonPrimary,
                    isDark ? styles.buttonDark : styles.buttonLight,
                    pressed && styles.buttonPressed,
                ]}
            >
                <Text style={[styles.buttonText, isDark ? styles.textLight : styles.textLight]}>
                    Open Server Settings
                </Text>
            </Pressable>

            {loadingServerVersion ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <ActivityIndicator size="small" color={isDark ? '#f8f9fa' : '#212529'} />
                    <Text style={[styles.version, isDark ? styles.textLight : styles.textDark, { marginLeft: 8 }]}>
                        Fetching server version…
                    </Text>
                </View>
            ) : serverErr ? (
                <Text style={[styles.version, styles.error, isDark ? styles.textLight : styles.textDark]}>
                    Server Version: {serverErr}
                </Text>
            ) : (
                <Text style={[styles.version, isDark ? styles.textLight : styles.textDark]}>
                    Server Version: v{serverVersion}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    bgLight: {
        backgroundColor: '#f8f9fa',
    },
    bgDark: {
        backgroundColor: '#212529',
    },
    buttonPrimary: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#0d6efd',
        backgroundColor: '#0d6efd',
        alignItems: 'center',
    },
    buttonDanger: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#dc3545',
        backgroundColor: '#dc3545',
        alignItems: 'center',
    },
    buttonLight: {},
    buttonDark: {},
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#fff',
    },
    textLight: {
        color: '#f8f9fa',
    },
    textDark: {
        color: '#212529',
    },
    title: {
        fontSize: 30,
        marginVertical: 16,
        fontWeight: '600',
    },
    version: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    error: {
        color: '#dc3545',
    },
});
