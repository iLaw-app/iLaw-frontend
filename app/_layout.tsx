import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { AuthProvider, useAuth } from './context/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  const router = useRouter();
  const { setAccessToken } = useAuth();
  const splashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // OAuth 딥링크 콜백 처리
    // BE가 인증 완료 후 ilaw://auth?accessToken=JWT&refreshToken=JWT&profileCompleted=true/false 로 redirect
    // BE 실패 시: ilaw://auth?error=login_failed
    function handleAuthCallback(url: string) {
      const { path, queryParams } = Linking.parse(url);
      if (path !== 'auth') return;

      if (queryParams?.error) {
        // TODO: 로그인 실패 Toast 또는 에러 메시지 표시
        clearTimeout(splashTimer.current);
        router.replace('/login');
        return;
      }

      const accessToken = queryParams?.accessToken as string | undefined;
      const refreshToken = queryParams?.refreshToken as string | undefined;
      if (!accessToken || !refreshToken) return;

      // TODO: 앱 재시작 후 로그인 유지하려면 @react-native-async-storage/async-storage 설치 후 여기서 저장
      // AsyncStorage.setItem('accessToken', accessToken);
      // AsyncStorage.setItem('refreshToken', refreshToken);

      setAccessToken(accessToken);
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
    <Stack screenOptions={{ headerShown: false }}>
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
    </Stack>
  );
}
