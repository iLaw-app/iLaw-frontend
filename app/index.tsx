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
    backgroundColor: '#fff',
  },
  textArea: {
    paddingTop: height * 0.22,
    paddingHorizontal: 36,
  },
  tagline: {
    fontSize: 16,
    color: '#5BBB5E',
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
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
    backgroundColor: '#C8E6C9',
  },
});
