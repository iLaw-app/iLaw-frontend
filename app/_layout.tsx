import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { AuthProvider, useAuth } from './context/auth';
import { NotificationSettingsProvider } from './context/notificationSettings';

const API_BASE_URL = 'https://ilaw-backend.up.railway.app';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationSettingsProvider>
        <AppNavigator />
      </NotificationSettingsProvider>
    </AuthProvider>
  );
}

function AppNavigator() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuth();
  const splashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // OAuth 딥링크 콜백 처리
    // BE가 인증 완료 후 ilaw://auth?accessToken=JWT&refreshToken=JWT&profileCompleted=true/false 로 redirect
    // BE 실패 시: ilaw://auth?error=login_failed
    function handleAuthCallback(url: string) {
      const { path, queryParams } = Linking.parse(url);
      if (path !== 'auth') return;

      if (queryParams?.error) {
        clearTimeout(splashTimer.current);
        Alert.alert('로그인 실패', '다시 시도해주세요.\n(' + queryParams.error + ')');
        router.replace('/login');
        return;
      }

      const accessToken = queryParams?.accessToken as string | undefined;
      const refreshToken = queryParams?.refreshToken as string | undefined;
      if (!accessToken || !refreshToken) return;

      setAccessToken(accessToken);
      fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUser(data); });
      clearTimeout(splashTimer.current);
      const profileCompleted = queryParams?.profileCompleted === 'true';
      router.replace(profileCompleted ? '/(tabs)/home' : '/onboarding');
    }

    // Cold start: 딥링크로 앱이 실행된 경우
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthCallback(url);
    });

    // Warm start: 앱 실행 중 딥링크 수신
    const sub = Linking.addEventListener('url', ({ url }) => handleAuthCallback(url));

    // 일반 시작: 스플래시 2초 후 로그인
    splashTimer.current = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => {
      clearTimeout(splashTimer.current);
      sub.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
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
    </Stack>
  );
}
