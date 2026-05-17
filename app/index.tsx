import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.textArea}>
        <Text style={styles.tagline}>아이들을 위한 길,{'\n'}아이들을 위한 LAW</Text>
        <Text style={styles.appName}>아이로</Text>
      </View>

      <View style={styles.robotArea}>
        <Image
          source={require('../assets/splash-robot.png')}
          style={styles.robotImage}
          resizeMode="contain"
        />
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
  },
  appName: {
    fontSize: 64,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 72,
    letterSpacing: 0.123,
  },
  robotArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  robotImage: {
    width: 328,
    height: 356,
    transform: [{ rotate: '8deg' }],
    marginBottom: 40,
  },
});
