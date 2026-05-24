import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { Ellipse, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BASE_W = Math.min(screenWidth, 390);
const LOGO_W = BASE_W - 150;
const LOGO_H = LOGO_W * (2622 / 1206);

const SHADOW_LEFT = 100 + (LOGO_W - 209) / 2;

function LogoShadow() {
  return (
    <Svg width={209} height={56} viewBox="0 0 209 56" fill="none">
      <Defs>
        <Filter id="shadow_blur" x="0" y="0" width="209" height="56">
          <FeGaussianBlur stdDeviation={5} />
        </Filter>
      </Defs>
      <G filter="url(#shadow_blur)">
        <Ellipse cx={104.5} cy={28} rx={94.5} ry={18} fill="#E2EACB" fillOpacity={0.3} />
      </G>
    </Svg>
  );
}

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* 로고 이미지 — 텍스트 뒤(아래)에 렌더링 */}
      <Image
        source={require('../assets/logo1.png')}
        style={styles.robotImage}
        resizeMode="contain"
      />
      <View style={styles.shadowWrapper}>
        <LogoShadow />
      </View>

      {/* 텍스트 — 로고 위(앞)에 렌더링 */}
      <View style={styles.textArea}>
        <Text style={styles.tagline}>아이들을 위한 길,{'\n'}아이들을 위한 LAW</Text>
        <Text style={styles.appName}>아이로</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  robotImage: {
    position: 'absolute',
    left: 100,
    bottom: 20,
    width: LOGO_W,
    height: LOGO_H,
  },
  shadowWrapper: {
    position: 'absolute',
    left: SHADOW_LEFT,
    bottom: 40,
  },

  textArea: {
    paddingTop: screenHeight * 0.22,
    paddingHorizontal: 36,
  },
  tagline: {
    fontSize: 30,
    color: '#586144',
    fontWeight: '500',
    lineHeight: 32,
    letterSpacing: 0.07,
    marginBottom: 10,
    fontFamily: 'AiroFont',
  },
  appName: {
    fontSize: 64,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 72,
    letterSpacing: 0.123,
    fontFamily: 'AiroFont',
  },
});
