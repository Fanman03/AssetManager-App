import BootstrapButton from '@/components/BootstrapButton';
import { ScannerModal } from '@/components/ScannerModal';
import { Ionicons } from '@expo/vector-icons';
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  async function submitUrl(candidateUrl: string) {
    setError(null);
    setSubmitBusy(true);
    const ok = await validateServer(candidateUrl);
    setSubmitBusy(false);
    if (!ok) {
      setError(
        'Could not connect to server. Make sure the server is reachable and running v.2.2.0 or later.'
      );
      return;
    }
    onDone(candidateUrl.replace(/\/+$/, ''));
  }

  async function handleSubmit() {
    await submitUrl(url);
  }

  function handleServerQrScan(data: string) {
    const scannedUrl = data.trim();
    try {
      const parsedUrl = new URL(scannedUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Unsupported URL protocol');
      }
    } catch {
      setError('This QR code does not contain a valid HTTP or HTTPS server URL.');
      return;
    }

    setUrl(scannedUrl);
    void submitUrl(scannedUrl);
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
        <Text style={[styles.helpText, isDark ? styles.textLight : styles.textDark]}>
          Scan a pairing QR code from the server's Settings page, or enter the server URL manually.
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
            onPress={() => setScannerOpen(true)}
            disabled={submitBusy || demoBusy}
            block
            leftIcon={<Ionicons name="scan-outline" size={20} color="#fff" />}
          >
            Scan QR Code
          </BootstrapButton>
          <BootstrapButton
            variant="secondary"
            size="md"
            onPress={handleSubmit}
            disabled={submitBusy || demoBusy}
            loading={submitBusy}
            block
            leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
          >
            Submit
          </BootstrapButton>
          <BootstrapButton
            variant="secondary"
            size="md"
            onPress={setupDemo}
            disabled={submitBusy || demoBusy}
            loading={demoBusy}
            block
            leftIcon={<Ionicons name="play-circle-outline" size={20} color="#fff" />}
          >
            Demo Mode
          </BootstrapButton>
        </View>
      </View>
      <ScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={({ data }) => handleServerQrScan(data)}
        barcodeTypes={['qr']}
        normalizeScannedData={false}
        returnToAssets={false}
        emitBarcodeEvent={false}
      />
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
  helpText: {
    marginBottom: 12,
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
    alignItems: 'stretch',
    marginTop: 16,
  },
});
