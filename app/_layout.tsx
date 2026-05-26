import { useEffect } from 'react';
import { Alert, View, Platform, StyleSheet, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import { AuthProvider, getStoredTokens, useAuth, UserInfo } from './context/auth';
import { NotificationSettingsProvider } from '../contexts/notificationSettings';
import { TutorialProvider, useTutorial } from '../contexts/tutorial';
import { TutorialSlideshow } from '../components/TutorialSlideshow';

function WebTutorialOverlay() {
  const { visible, complete } = useTutorial();
  return <TutorialSlideshow visible={visible} onDone={complete} />;
}

const API_BASE_URL = 'https://ilaw-backend.up.railway.app';

const PHONE_W = 390;
const PHONE_H = 844;

export default function RootLayout() {
  if (Platform.OS === 'web') {
    const { width: vw, height: vh } = Dimensions.get('window');
    const scale = Math.min(1, Math.min((vh - 16) / PHONE_H, (vw - 16) / PHONE_W));
    return (
      <View style={webStyles.bg}>
        <View style={{
          width: PHONE_W * scale,
          height: PHONE_H * scale,
          overflow: 'hidden',
          borderRadius: 40 * scale,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.3,
          shadowRadius: 40,
        }}>
          <View style={{
            width: PHONE_W,
            height: PHONE_H,
            backgroundColor: '#FDFFF8',
            transform: [{ scale }],
            transformOrigin: '0% 0%' as any,
            paddingTop: 30,
            paddingBottom: 5,
          }}>
            <TutorialProvider>
              <AuthProvider>
                <NotificationSettingsProvider>
                  <AppNavigator />
                </NotificationSettingsProvider>
              </AuthProvider>
              <WebTutorialOverlay />
            </TutorialProvider>
          </View>
        </View>
      </View>
    );
  }
  return (
    <TutorialProvider>
      <AuthProvider>
        <NotificationSettingsProvider>
          <AppNavigator />
        </NotificationSettingsProvider>
      </AuthProvider>
    </TutorialProvider>
  );
}

const webStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#D4DFC9',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
});

function AppNavigator() {
  const [fontsLoaded] = useFonts({ AiroFont: require('../assets/font.ttf') });
  const router = useRouter();
  const { setAuthTokens, clearAuth, setUser } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function fetchMe(accessToken: string): Promise<UserInfo | null> {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok ? res.json() : null;
    }

    async function refreshTokens(refreshToken: string) {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      return res.ok ? res.json() as Promise<{ accessToken: string; refreshToken: string }> : null;
    }

    function routeByProfile(user: UserInfo | null, profileCompleted?: boolean) {
      router.replace((profileCompleted ?? user?.profileCompleted) ? '/(tabs)/home' : '/onboarding');
    }

    async function handleAuthCallback(url: string): Promise<boolean> {
      const { path, queryParams } = Linking.parse(url);
      if (path !== 'auth') return false;

      if (queryParams?.error) {
        await clearAuth();
        if (cancelled) return true;
        Alert.alert('로그인 실패', '다시 시도해주세요.\n(' + queryParams.error + ')');
        router.replace('/login');
        return true;
      }

      const accessToken = queryParams?.accessToken as string | undefined;
      const refreshToken = queryParams?.refreshToken as string | undefined;
      if (!accessToken || !refreshToken) return false;

      await setAuthTokens({ accessToken, refreshToken });
      const user = await fetchMe(accessToken);
      if (cancelled) return true;
      if (user) setUser(user);
      const profileCompleted = queryParams?.profileCompleted === 'true';
      routeByProfile(user, profileCompleted);
      return true;
    }

    async function restoreSession() {
      const startTime = Date.now();
      const minSplash = (ms: number) => new Promise<void>(resolve =>
        setTimeout(resolve, Math.max(0, ms - (Date.now() - startTime)))
      );

      const initialUrl = await Linking.getInitialURL();
      if (cancelled) return;
      if (initialUrl && await handleAuthCallback(initialUrl)) return;

      const stored = await getStoredTokens();
      if (cancelled) return;
      if (!stored.refreshToken) {
        await clearAuth();
        await minSplash(2000);
        if (!cancelled) router.replace('/login');
        return;
      }

      if (stored.accessToken) {
        const user = await fetchMe(stored.accessToken).catch(() => null);
        if (cancelled) return;
        if (user) {
          await setAuthTokens({ accessToken: stored.accessToken, refreshToken: stored.refreshToken });
          setUser(user);
          await minSplash(2000);
          routeByProfile(user);
          return;
        }
      }

      const refreshed = await refreshTokens(stored.refreshToken).catch(() => null);
      if (cancelled) return;
      if (!refreshed) {
        await clearAuth();
        await minSplash(2000);
        if (!cancelled) router.replace('/login');
        return;
      }

      await setAuthTokens(refreshed);
      const user = await fetchMe(refreshed.accessToken).catch(() => null);
      if (cancelled) return;
      if (user) {
        setUser(user);
        await minSplash(2000);
        routeByProfile(user);
      } else {
        await clearAuth();
        await minSplash(2000);
        if (!cancelled) router.replace('/login');
      }
    }

    restoreSession();

    // Warm start: 앱 실행 중 딥링크 수신
    const sub = Linking.addEventListener('url', ({ url }) => {
      handleAuthCallback(url).catch(() => {
        clearAuth().finally(() => router.replace('/login'));
      });
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="manual-list" />
      <Stack.Screen name="manual-detail" />
      <Stack.Screen name="manual-help" />
      <Stack.Screen name="qna/[id]" />
      <Stack.Screen name="qna/ask" />
      <Stack.Screen name="qna/answer/[id]" />
      <Stack.Screen name="my-questions" />
      <Stack.Screen name="my-scraps" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="my-answers" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
