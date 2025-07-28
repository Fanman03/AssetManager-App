import React, { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, useColorScheme, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ScannerModal } from '../components/ScannerModal';

type Props = {
  serverUrl: string;
  onResetUrl: () => void;
};

export const WebAppScreen: React.FC<Props> = ({ serverUrl, onResetUrl }) => {
  const colorScheme = useColorScheme();
  const webRef = useRef<WebView>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const injectedThemeJS = useMemo(() => {
    // Make Bootstrap (v5.3+) respect system via data-bs-theme
    return `
      (function() {
        try {
          const scheme = '${colorScheme}';
          if (document.documentElement) {
            document.documentElement.setAttribute('data-bs-theme', scheme === 'dark' ? 'dark' : 'light');
          }
        } catch (e) {}
        true; // keep return true for Android
      })();
    `;
  }, [colorScheme]);

  const onMessage = (e: WebViewMessageEvent) => {
    const payload = e.nativeEvent.data;
    if (payload === 'reset-url') {
      Alert.alert('Reset URL', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetUrl },
      ]);
    }
  };

  const handleScan = ({ data, type }: { data: string; type: string }) => {
    setScannerOpen(false);
    // ship result into the webapp
    const js = `
      (function(){
        const ev = new CustomEvent('datamatrix-scan', { detail: { type: ${JSON.stringify(type)}, data: ${JSON.stringify(data)} } });
        window.dispatchEvent(ev);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('scan-sent');
        }
      })();
      true;
    `;
    webRef.current?.injectJavaScript(js);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: serverUrl }}
        onMessage={onMessage}
        injectedJavaScript={injectedThemeJS}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
      />
      <ScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
