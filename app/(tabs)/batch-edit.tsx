import { BatchScannerModal } from '@/components/BatchScannerModal';
import eventBus from '@/lib/eventBus';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function BatchEditScreen() {
  const isFocused = useIsFocused();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isFocused) setVisible(true);
  }, [isFocused]);

  return (
    <BatchScannerModal
      visible={visible}
      onClose={() => {
        setVisible(false);
        router.replace('/assets');
      }}
      onComplete={(barcodes) => {
        setVisible(false);
        eventBus.emit('batch-barcodes-scanned', barcodes);
        router.replace('/assets');
      }}
    />
  );
}
