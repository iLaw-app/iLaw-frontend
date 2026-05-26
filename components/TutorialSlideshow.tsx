import React, { useState, useEffect } from 'react';
import { Modal, View, Image, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: _SW, height: _SH } = Dimensions.get('screen');
const SW = Platform.OS === 'web' ? 390 : _SW;
const SH = Platform.OS === 'web' ? 844 : _SH;

const IMAGES = [
  require('../assets/tutorial/tutorial_1.png'),
  require('../assets/tutorial/tutorial_2.png'),
  require('../assets/tutorial/tutorial_3.png'),
  require('../assets/tutorial/tutorial_4.png'),
  require('../assets/tutorial/tutorial_5.png'),
  require('../assets/tutorial/tutorial_6.png'),
  require('../assets/tutorial/tutorial_7.png'),
  require('../assets/tutorial/tutorial_8.png'),
];

const TOTAL = IMAGES.length;
const BAR_ZONE = 130;

type Props = {
  visible: boolean;
  onDone: (dontShowAgain: boolean) => void;
};

export function TutorialSlideshow({ visible, onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (visible) setStep(0);
  }, [visible]);

  const advance = () => {
    if (step === TOTAL - 1) onDone(true);
    else setStep(s => s + 1);
  };
  const retreat = () => setStep(s => Math.max(0, s - 1));
  const skip = () => onDone(false);

  if (!visible) return null;

  const isLast = step === TOTAL - 1;

  const inner = (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Background image */}
      <Image
        source={IMAGES[step]}
        style={{ position: 'absolute', top: 0, left: 0, width: SW, height: SH }}
        resizeMode="cover"
      />

      {/* Last page: logo + text, vertically centered between top and bottom bar */}
      {isLast && (
        <View style={[styles.lastOverlay, { top: 0, bottom: BAR_ZONE }]}>
          <Image source={require('../assets/logo2.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.startText}>아이로와 함께 시작해요</Text>
        </View>
      )}

      {/* First page: tap hint */}
      {step === 0 && (
        <View style={[styles.hintContainer, { bottom: BAR_ZONE + 20 }]} pointerEvents="none">
          <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.75)" />
          <Text style={styles.hintText}>화면을 탭하여 넘겨보세요</Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.75)" />
        </View>
      )}

      {/* Left / right tap zones — only above the bottom bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: BAR_ZONE }} pointerEvents="box-none">
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={retreat} activeOpacity={1} />
          <TouchableOpacity style={{ flex: 1 }} onPress={advance} activeOpacity={1} />
        </View>
      </View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <View key={i} style={i === step ? styles.dotActive : styles.dotInactive} />
        ))}
      </View>

      {/* Bottom bar */}
      <View style={styles.barWrapper}>
        <View style={[styles.bar, isLast && { justifyContent: 'center' }]}>
          {isLast ? (
            <TouchableOpacity onPress={advance} activeOpacity={0.85} style={styles.doneBtn}>
              <Text style={styles.doneText}>완료</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={skip} activeOpacity={0.8} style={styles.skipBtn}>
                <Text style={styles.skipText}>건너뛰기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={advance} activeOpacity={0.85} style={styles.doneBtn}>
                <Text style={styles.doneText}>다음</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, width: SW, height: SH, zIndex: 999 }}>
        {inner}
      </View>
    );
  }

  return (
    <Modal visible transparent={false} animationType="fade" statusBarTranslucent onRequestClose={skip}>
      {inner}
    </Modal>
  );
}

const styles = StyleSheet.create({
  lastOverlay: {
    position: 'absolute',
    left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logo: { width: 180, height: 180 },
  startText: {
    width: 264,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'AiroFont',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 72,
    letterSpacing: 0.123,
  },

  hintContainer: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },

  dotsRow: {
    position: 'absolute',
    bottom: 107,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#B2D36E',
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#6A7282',
  },

  barWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0, right: 0,
    alignItems: 'center',
  },
  bar: {
    width: 346,
    height: 69,
    paddingHorizontal: 17,
    borderRadius: 16,
    borderWidth: 0.719,
    borderColor: '#01180A',
    backgroundColor: '#01180A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  skipBtn: { paddingHorizontal: 4 },
  skipText: {
    color: '#99A1AF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },

  doneBtn: {
    width: 73,
    height: 36,
    borderRadius: 9999,
    backgroundColor: '#B2D36E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {
    color: '#01180A',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
