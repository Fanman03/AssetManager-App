import { clearServerUrl } from '@/lib/storage';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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

    return (
        <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
            <Pressable
                onPress={onResetPress}
                style={({ pressed }) => [
                    styles.button,
                    isDark ? styles.buttonDark : styles.buttonLight,
                    pressed && styles.buttonPressed,
                ]}
            >
                <Text style={[styles.buttonText, isDark ? styles.textLight : styles.textLight]}>
                    Reset Server URL
                </Text>
            </Pressable>
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
        backgroundColor: '#f8f9fa', // Bootstrap light bg
    },
    bgDark: {
        backgroundColor: '#212529', // Bootstrap dark bg
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#dc3545',
        backgroundColor: '#dc3545',
        alignItems: 'center',
    },
    buttonLight: {
        // same as button above, but kept for possible future changes
    },
    buttonDark: {
        // same as button above, but you could tweak opacity if you want
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#fff',
    },
    textLight: {
        color: '#fff',
    },
});
