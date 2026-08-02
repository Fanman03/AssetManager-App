import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalizeBarcodeData } from '@/lib/barcodes';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: (barcodes: string[]) => void;
};

/** Collects several unique Data Matrix codes without leaving the camera view. */
export const BatchScannerModal: React.FC<Props> = ({ visible, onClose, onComplete }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const lastScanned = useRef<{ data: string; at: number } | null>(null);

  useEffect(() => {
    if (!visible) return;
    void (async () => {
      if (!permission?.granted) await requestPermission();
      setBarcodes([]);
      setTorchEnabled(false);
      lastScanned.current = null;
    })();
  }, [visible, permission?.granted, requestPermission]);

  const handleBarCodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    const normalizedData = normalizeBarcodeData(data);
    // CameraView can report the same code repeatedly while it remains in frame.
    const now = Date.now();
    if (lastScanned.current?.data === normalizedData && now - lastScanned.current.at < 1200) return;
    lastScanned.current = { data: normalizedData, at: now };

    setBarcodes((current) => {
      if (current.includes(normalizedData)) return current;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return [...current, normalizedData];
    });
  }, []);

  const removeBarcode = useCallback((barcode: string) => {
    setBarcodes((current) => current.filter((item) => item !== barcode));
  }, []);

  const handleComplete = useCallback(() => {
    if (barcodes.length === 0) return;
    onComplete(barcodes);
  }, [barcodes, onComplete]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {permission?.granted ? (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={torchEnabled}
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['datamatrix'] }}
            />
            <View pointerEvents="none" style={styles.overlay}>
              <View style={styles.overlayRow} />
              <View style={styles.overlayCenterRow}>
                <View style={styles.overlaySide} />
                <View style={styles.scanArea}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayRow} />
            </View>
          </>
        ) : (
          <View style={styles.permission}><Text style={styles.permissionText}>Camera access is required to scan barcodes.</Text></View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Batch scan</Text>
          <Text style={styles.subtitle}>Scan every asset you want to edit, then continue.</Text>
        </View>

        <View style={styles.counter}><Text style={styles.counterText}>{barcodes.length} selected</Text></View>

        {barcodes.length > 0 && (
          <View style={styles.chips}>
            {barcodes.slice(-3).map((barcode) => (
              <TouchableOpacity key={barcode} onPress={() => removeBarcode(barcode)} style={styles.chip}>
                <Text numberOfLines={1} style={styles.chipText}>{barcode}</Text>
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity onPress={() => setTorchEnabled((enabled) => !enabled)} style={styles.torchButton}>
          <MaterialCommunityIcons name={torchEnabled ? 'flashlight' : 'flashlight-off'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity disabled={barcodes.length === 0} onPress={handleComplete} style={[styles.doneButton, barcodes.length === 0 && styles.doneButtonDisabled]}>
          <Text style={styles.doneText}>Edit {barcodes.length || ''} asset{barcodes.length === 1 ? '' : 's'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.65)' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#e9ecef', fontSize: 15, marginTop: 4 },
  counter: { alignSelf: 'center', marginTop: 20, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: '#0d6efd' },
  counterText: { color: '#fff', fontWeight: '700' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  overlayRow: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  overlayCenterRow: { flexDirection: 'row', height: 200 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  scanArea: { width: 200, height: '100%', position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: 'white', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  chips: { position: 'absolute', left: 20, right: 20, bottom: 104, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(13,110,253,0.95)' },
  chipText: { flex: 1, color: '#fff', fontSize: 13 },
  torchButton: { position: 'absolute', bottom: 32, left: 28, padding: 12, borderRadius: 24, backgroundColor: '#00000099' },
  closeButton: { position: 'absolute', top: 52, right: 20, padding: 8, borderRadius: 20, backgroundColor: '#00000099' },
  doneButton: { position: 'absolute', bottom: 28, right: 28, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 8, backgroundColor: '#0d6efd' },
  doneButtonDisabled: { backgroundColor: '#6c757d' },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
