import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from './context/auth';

const API_BASE_URL = 'https://ilaw-backend.up.railway.app';

export default function LoginScreen() {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  const handleLogin = async (provider: 'kakao' | 'naver' | 'google') => {
    const appRedirectUri = Linking.createURL('auth');
    const url = `${API_BASE_URL}/auth/${provider}?redirectUri=${encodeURIComponent(appRedirectUri)}`;
    const result = await WebBrowser.openAuthSessionAsync(url, appRedirectUri);

    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      const accessToken = queryParams?.accessToken as string | undefined;
      if (accessToken) {
        setAccessToken(accessToken);
        const profileCompleted = queryParams?.profileCompleted === 'true';
        router.replace(profileCompleted ? '/(tabs)/home' : '/onboarding');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>⚖️</Text>
        </View>
        <Text style={styles.appName}>아이로</Text>
        <Text style={styles.tagline}>소셜 계정으로 로그인해요</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.kakao]}
            onPress={() => handleLogin('kakao')}
          >
            <Text style={[styles.btnText, { color: '#191919' }]}>카카오 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.naver]}
            onPress={() => handleLogin('naver')}
          >
            <Text style={[styles.btnText, { color: '#fff' }]}>N  네이버 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.google]}
            onPress={() => handleLogin('google')}
          >
            <Text style={[styles.btnText, { color: '#333' }]}>G  구글 로그인</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          계정이 없으신가요?{'  '}
          <Text
            style={styles.signupLink}
            onPress={() => router.push('/onboarding')}
          >
            회원가입
          </Text>
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faf4',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  google: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  footer: {
    marginTop: 32,
    fontSize: 13,
    color: '#aaa',
  },
  signupLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});