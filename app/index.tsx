import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.textArea}>
        <Text style={styles.tagline}>아이들을 위한 길,{'\n'}아이들을 위한 LAW</Text>
        <Text style={styles.appName}>아이로</Text>
      </View>

      <View style={styles.circleWrapper}>
        <View style={styles.circle} />
      </View>
    </View>
  );
}

const CIRCLE_SIZE = width * 0.85;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFFF8',
  },
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
  circleWrapper: {
    position: 'absolute',
    bottom: -CIRCLE_SIZE * 0.25,
    right: -CIRCLE_SIZE * 0.1,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#DFEDBE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
});
