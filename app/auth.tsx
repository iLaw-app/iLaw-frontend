import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from './context/auth';

const API_BASE_URL = 'https://ilaw-backend.up.railway.app';

export default function AuthCallback() {
  const router = useRouter();
  const { setAuthTokens, setUser } = useAuth();
  const params = useLocalSearchParams<{
    accessToken?: string;
    refreshToken?: string;
    profileCompleted?: string;
    error?: string;
  }>();

  useEffect(() => {
    const run = async () => {
      if (params.error) {
        router.replace('/login');
        return;
      }

      const { accessToken, refreshToken, profileCompleted } = params;
      if (!accessToken || !refreshToken) {
        router.replace('/login');
        return;
      }

      await setAuthTokens({ accessToken, refreshToken });

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) setUser(await res.json());
      } catch {}

      router.replace(profileCompleted === 'true' ? '/(tabs)/home' : '/onboarding');
    };

    run();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFFF8' }}>
      <ActivityIndicator color="#3C6802" size="large" />
    </View>
  );
}
