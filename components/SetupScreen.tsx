import BootstrapButton from '@/components/BootstrapButton';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { validateServer } from '../lib/validateServer';

type Props = {
  onDone: (url: string) => void;
};

const DEMO_URL = 'https://jp-am.vercel.app/';

export const SetupScreen: React.FC<Props> = ({ onDone }) => {
  const [url, setUrl] = useState('');
  const [submitBusy, setSubmitBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  async function handleSubmit() {
    setError(null);
    setSubmitBusy(true);
    const ok = await validateServer(url);
    setSubmitBusy(false);
    if (!ok) {
      setError(
        'Could not connect to server. Make sure the server is reachable and running v.2.2.0 or later.'
      );
      return;
    }
    onDone(url.replace(/\/+$/, ''));
  }

  async function setupDemo() {
    setError(null);
    setDemoBusy(true);
    const ok = await validateServer(DEMO_URL);
    setDemoBusy(false);
    if (!ok) {
      setError('Error loading demo.');
      return;
    }
    onDone(DEMO_URL.replace(/\/+$/, ''));
  }

  return (
    <View
      style={[
        styles.outerContainer,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.innerContainer,
          isLandscape && styles.innerContainerLandscape,
        ]}
      >
        <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
          Enter your server URL:
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
        {error && <Text style={[styles.error]}>{error}</Text>}
        <View style={styles.buttonRow}>
          <BootstrapButton
            variant="primary"
            size="md"
            onPress={handleSubmit}
            disabled={submitBusy}
            style={{ marginRight: 20 }}
            loading={submitBusy}
          >
            Submit
          </BootstrapButton>
          <BootstrapButton
            variant="secondary"
            size="md"
            onPress={setupDemo}
            disabled={demoBusy}
            loading={demoBusy}
          >
            Demo Mode
          </BootstrapButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  innerContainer: {
    width: '100%',
  },
  innerContainerLandscape: {
    maxWidth: 480,
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#212529',
  },
  title: {
    fontSize: 20,
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
    color: '#dc3545',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
