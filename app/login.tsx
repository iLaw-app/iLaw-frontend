import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from './context/auth';

const API_BASE_URL = 'https://ilaw-backend.up.railway.app';

function KakaoIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C7.03 3 3 6.36 3 10.5c0 2.61 1.65 4.9 4.13 6.26L6.1 20.1a.37.37 0 0 0 .54.42l4.3-2.87c.35.04.7.05 1.06.05 4.97 0 9-3.36 9-7.5S16.97 3 12 3z"
        fill="#191919"
      />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M22.5556 12.2476C22.5556 11.4678 22.4856 10.7179 22.3557 9.99805H11.9977V14.2572H17.9165C17.6566 15.6269 16.8767 16.7867 15.707 17.5666V20.336H19.2763C21.3558 18.4164 22.5556 15.5969 22.5556 12.2476Z" fill="#4285F4"/>
      <Path d="M11.9976 22.9959C14.9671 22.9959 17.4566 22.0161 19.2762 20.3364L15.7069 17.567C14.7271 18.2268 13.4774 18.6268 11.9976 18.6268C9.1382 18.6268 6.70868 16.6971 5.83885 14.0977H2.17957V16.9371C3.98921 20.5264 7.69848 22.9959 11.9976 22.9959Z" fill="#34A853"/>
      <Path d="M5.83887 14.087C5.61891 13.4271 5.48894 12.7273 5.48894 11.9974C5.48894 11.2675 5.61891 10.5677 5.83887 9.9078V7.06836H2.17959C1.42973 8.54807 0.999817 10.2177 0.999817 11.9974C0.999817 13.777 1.42973 15.4467 2.17959 16.9264L5.02903 14.7069L5.83887 14.087Z" fill="#FBBC05"/>
      <Path d="M11.9976 5.37914C13.6173 5.37914 15.057 5.93903 16.2068 7.01882L19.3562 3.86944C17.4466 2.08979 14.9671 1 11.9976 1C7.69848 1 3.98921 3.46952 2.17957 7.06881L5.83885 9.90825C6.70868 7.30876 9.1382 5.37914 11.9976 5.37914Z" fill="#EA4335"/>
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { setAuthTokens, setUser } = useAuth();

  const handleLogin = async (provider: 'kakao' | 'google') => {
    const appRedirectUri = Linking.createURL('auth');
    const url = `${API_BASE_URL}/auth/${provider}?redirectUri=${encodeURIComponent(appRedirectUri)}`;

    if (Platform.OS === 'web') {
      window.location.href = url;
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(url, appRedirectUri);

    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      const accessToken = queryParams?.accessToken as string | undefined;
      const refreshToken = queryParams?.refreshToken as string | undefined;
      if (accessToken && refreshToken) {
        await setAuthTokens({ accessToken, refreshToken });
        try {
          const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userRes.ok) setUser(await userRes.json());
        } catch {}
        const profileCompleted = queryParams?.profileCompleted === 'true';
        router.replace(profileCompleted ? '/(tabs)/home' : '/onboarding');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        <Image
          source={require('../assets/logo2.png')}
          style={styles.robotHead}
          resizeMode="contain"
        />

        <Text style={styles.tagline}>아이로와 함께 시작해요</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.kakao]}
            onPress={() => handleLogin('kakao')}
          >
            <KakaoIcon />
            <Text style={[styles.btnText, { color: '#191919' }]}>카카오 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.google]}
            onPress={() => handleLogin('google')}
          >
            <GoogleIcon />
            <Text style={[styles.btnText, { color: '#333' }]}>구글 로그인</Text>
          </TouchableOpacity>

          {false && Platform.OS === 'web' && (
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Text style={styles.demoBtnText}>로그인 없이 둘러보기</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFFF8',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotHead: {
    width: 160,
    height: 160,
    marginBottom: 12,
  },
  tagline: {
    width: 264,
    fontSize: 24,
    fontWeight: '700',
    color: '#586144',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.123,
    marginBottom: 20,
    fontFamily: 'AiroFont',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  google: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  demoBtn: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCD9BA',
  },
  demoBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#586144',
  },

});
