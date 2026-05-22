import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { Ellipse, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

const { width: screenWidth, height } = Dimensions.get('window');

// const LOGO_W = screenWidth * 0.72;
// const LOGO_W = screenWidth * 0.9;
const LOGO_W=screenWidth-112-19.25
const LOGO_H = LOGO_W * (2622 / 1206);

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
      {/* <View style={styles.logoWrapper}>
        <Image
          source={require('../assets/logo1.png')}
          style={styles.robotImage}
          resizeMode="contain"
        />

        <View style={styles.shadow}>
          <LogoShadow />
        </View> */}
      {/* </View> */}
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
  logoWrapper: {
    // position: 'absolute',
    // left: 112,
    // bottom: 146.94,
    // width: LOGO_W,
    // // height: LOGO_H,
    // alignItems: 'center',
    position: 'absolute',

    left: 60,       // 👉 너가 맞춘 값 유지
    bottom: 0,

    transform: [{ translateY: 120 }], // 🔥 여기서 같이 이동

    alignItems: 'center',
  },
  robotArea: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'flex-end',
    // paddingRight: 19,
    // paddingLeft: 112,
    paddingBottom: 100,
  },
  robotImage: {
    position: 'absolute',
    left: 45,

    bottom: 0, // 기준은 바닥

    width: LOGO_W,
    height: LOGO_H,

    transform: [
      { translateY: 120 } // 🔥 이 값이 핵심 (내려주는 값)
    ],
  },
  // robotImage: {
  //   width: LOGO_W,
  //   height: LOGO_H,
  // },
  // robotImage: {
  //   position: 'absolute',
  //   left: 112,
  //   bottom: 146.94,
  //   width: LOGO_W,
  //   height: LOGO_H,
  // },
  // shadow: {
  //   position: 'absolute',
  //   left: 112,
  //   bottom: 136, // 👉 그림자 위치 (미세조정 가능)
  // },

});
