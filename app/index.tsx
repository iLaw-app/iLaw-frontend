import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { Ellipse, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

const { width: screenWidth, height } = Dimensions.get('window');

const LOGO_W = screenWidth - 112 - 19;
const LOGO_H = LOGO_W * (356 / 328);

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
      <View style={styles.textArea}>
        <Text style={styles.tagline}>아이들을 위한 길,{'\n'}아이들을 위한 LAW</Text>
        <Text style={styles.appName}>아이로</Text>
      </View>

      <View style={styles.robotArea}>
        <Image
          source={require('../assets/logo1.png')}
          style={styles.robotImage}
          resizeMode="contain"
        />
        <LogoShadow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  textArea: {
    paddingTop: height * 0.22,
    paddingHorizontal: 36,
  },
  tagline: {
    fontSize: 24,
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
  robotArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 19,
    paddingLeft: 112,
    paddingBottom: 100,
  },
  robotImage: {
    width: LOGO_W,
    height: LOGO_H,
  },
});
