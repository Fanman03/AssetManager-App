import { ScannerModal } from '@/components/ScannerModal';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

export default function ScannerScreen() {
  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setVisible(true);
    }
  }, [isFocused]);

  return (
    <ScannerModal
      visible={visible}
      onClose={() => setVisible(false)}
      onScan={() => {}}
    />
  );
}
