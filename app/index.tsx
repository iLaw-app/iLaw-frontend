import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BASE_W = Math.min(screenWidth, 390);
const LOGO_W = BASE_W - 75;
const LOGO_H = LOGO_W * (2622 / 1206);

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* 로고 이미지 — 텍스트 뒤(아래)에 렌더링 */}
      <Image
        source={require('../assets/logo1.png')}
        style={styles.robotImage}
        resizeMode="contain"
      />

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
    bottom: -80,
    width: LOGO_W,
    height: LOGO_H,
  },
  textArea: {
    paddingTop: screenHeight * 0.22,
    paddingHorizontal: 36,
  },
  tagline: {
    fontSize: 30,
    color: '#69764C',
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
