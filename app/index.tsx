import { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { getStoredTokens } from './context/auth';

// 스플래시 미리보기 모드: true면 자동 이동 없이 스플래시에 머무름 (미리보기 끝나면 false)
const DEV_SPLASH_ONLY = false;


export default function SplashScreen() {
  const router = useRouter();

  // 토큰이 없으면(로그아웃·회원탈퇴 직후 포함) 스플래시를 잠깐 보여준 뒤 로그인으로 이동.
  // 토큰이 있는 정상 콜드스타트는 RootLayout의 restoreSession이 라우팅을 담당하므로 건드리지 않는다.
  useEffect(() => {
    if (DEV_SPLASH_ONLY) return;   // 스플래시 미리보기: 자동 이동 막기 (끝나면 false로)
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    getStoredTokens().then(({ refreshToken }) => {
      if (cancelled || refreshToken) return;
      timer = setTimeout(() => { if (!cancelled) router.replace('/login'); }, 2000);
    });
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, []);

  return (
    <View style={styles.container}>
      {/* 배경 그라데이션 (위 진한 초록 → 아래 크림) */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="splashGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#88A54D" stopOpacity={1} />
            <Stop offset="0.5" stopColor="#C1D39A" stopOpacity={0.93} />
            <Stop offset="1" stopColor="#FDFFF8" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#splashGrad)" />
      </Svg>

      {/* 로고 이미지 — 텍스트 뒤(아래)에 렌더링 */}
      <Image
        source={require('../assets/logo1.png')}
        style={styles.robotImage}
        resizeMode="contain"
      />

      {/* 텍스트 — 로고 위(앞)에 렌더링 */}
      <View style={[styles.textArea, Platform.OS === 'web' && { paddingTop: 170 }]}>
        <Text style={styles.tagline} allowFontScaling={false}>아이들을 위한 길,{'\n'}아이들을 위한 LAW</Text>
        <Text style={styles.appName} allowFontScaling={false}>아이로</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  robotImage: {
    position: 'absolute',
    left: 102,
    bottom: 146.94,
    width: 281,
    height: 347,
    aspectRatio: 73 / 90,
  },
  textArea: {
    position: 'absolute',
    paddingTop: 211,
    paddingHorizontal: 36,
  },
  tagline: {
    width: 280,
    fontSize: 24,
    // color: '#69764C',
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: 0.07,
    marginBottom: 17,
    fontFamily: 'AiroFont',
  },
  appName: {
    width: 300,
    fontSize: 75,
    fontWeight: '400',
    // color: '#586144',
    color: '#FFFFFF',
    lineHeight: 72,
    letterSpacing: 0.123,
    fontFamily: 'AiroFont',
  },
});
