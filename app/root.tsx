// app/root.tsx
import { SetupScreen } from '@/components/SetupScreen';
import { getServerUrl, saveServerUrl } from '@/lib/storage';
import { validateServer } from '@/lib/validateServer';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Root() {
  const [checking, setChecking] = useState(true);
  const [needSetup, setNeedSetup] = useState(false);

  useEffect(() => {
    (async () => {
      const url = await getServerUrl();
      if (url) {
        const valid = await validateServer(url);
        if (valid) {
          router.replace('/assets');
          return;
        }
      }
      setNeedSetup(true);
      setChecking(false);
    })();
  }, []);

  const handleSetup = async (url: string) => {
    await saveServerUrl(url);
    router.replace('/assets');
  };

  if (checking) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  return <SetupScreen onDone={handleSetup} />;
}
