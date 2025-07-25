import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { validateServer } from '../lib/validateServer';

type Props = {
  onDone: (url: string) => void;
};

export const SetupScreen: React.FC<Props> = ({ onDone }) => {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    const ok = await validateServer(url);
    setBusy(false);
    if (!ok) {
      setError(
        'Could not validate server. Make sure the app is reachable and running v.2.2.0 or later.'
      );
      return;
    }
    onDone(url.replace(/\/+$/, '')); // normalize
  }

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
        Enter your server URL
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        keyboardType="url"
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
        ]}
        placeholder="https://example.com"
        placeholderTextColor={isDark ? '#adb5bd' : '#6c757d'}
        value={url}
        onChangeText={setUrl}
      />
      {error && (
        <Text style={[styles.error, isDark ? styles.textLight : styles.textDark]}>{error}</Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          busy && styles.buttonDisabled,
        ]}
        disabled={busy}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{busy ? 'Validating…' : 'Continue'}</Text>
      </Pressable>
      <Text style={[styles.hintTitle, isDark ? styles.textLight : styles.textDark]}>
        For a demo, enter:{"\n"}https://jp-am.vercel.app
      </Text>
      {busy && <ActivityIndicator style={{ marginTop: 12 }} color="#0d6efd" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  containerLight: {
    backgroundColor: '#f8f9fa', // Bootstrap light background
  },
  containerDark: {
    backgroundColor: '#212529', // Bootstrap dark background
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  hintTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  textLight: {
    color: '#f8f9fa',
  },
  textDark: {
    color: '#212529',
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputLight: {
    backgroundColor: '#fff',
    borderColor: '#ced4da',
    color: '#212529',
  },
  inputDark: {
    backgroundColor: '#343a40',
    borderColor: '#495057',
    color: '#f8f9fa',
  },
  error: {
    color: '#dc3545', // Bootstrap danger color
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0d6efd', // Bootstrap primary
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d', // Bootstrap secondary when disabled
  },
});
