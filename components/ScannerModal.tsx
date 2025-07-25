import eventBus from '@/lib/eventBus';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics'; // <-- import haptics
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onScan: (data: { type: string; data: string }) => void;
};

export const ScannerModal: React.FC<Props> = ({ visible, onClose, onScan }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!visible) return;
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      setScanned(false);
    })();
  }, [visible, permission?.granted, requestPermission]);

  const handleBarCodeScanned = useCallback(
    async ({ type, data }: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);

      // Trigger haptic feedback vibration
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      eventBus.emit('barcode-scanned', data);
      router.replace('/assets');

      onScan({ type, data });
      onClose();
    },
    [scanned, onScan, onClose, router]
  );

  const handleClose = useCallback(() => {
    router.replace('/assets');
    onClose();
  }, [router, onClose]);

  if (!visible) return null;

  const notAskedYet = !permission;
  const denied = permission?.granted === false;
  const granted = permission?.granted === true;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {notAskedYet && <Text>Requesting camera permission…</Text>}
        {denied && <Text>No access to camera. Please enable it in settings.</Text>}
        {granted && (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['datamatrix'],
              }}
            />
            {/* Overlay */}
            <View style={styles.overlay}>
              <View style={styles.overlayRow} />
              <View style={styles.overlayCenterRow}>
                <View style={styles.overlaySide} />
                <View style={styles.overlayTarget} />
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayRow} />
            </View>
          </View>
        )}

        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#00000088',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeText: { color: '#fff', fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  overlayRow: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  overlayCenterRow: { flexDirection: 'row', height: 200 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  overlayTarget: {
    width: 200,
    height: '100%',
    borderColor: 'white',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});
