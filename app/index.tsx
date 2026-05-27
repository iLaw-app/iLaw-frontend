import { View, Text, StyleSheet, Image, Platform } from 'react-native';


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
      <View style={[styles.textArea, Platform.OS === 'web' && { paddingTop: 170 }]}>
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
    left: 112,
    bottom: 146.94,
    width: 262,
    height: 323,
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
    color: '#69764C',
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
    color: '#586144',
    lineHeight: 72,
    letterSpacing: 0.123,
    fontFamily: 'AiroFont',
  },
});
