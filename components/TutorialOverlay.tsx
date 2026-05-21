import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SW, height: SH } = Dimensions.get('screen');

export type SpotlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TutorialStep = {
  spotlight: SpotlightRect | null;
  spotlightRadius?: number;
  title: string;
  description: string;
  tooltipBelow?: boolean;
};

type Props = {
  steps: TutorialStep[];
  visible: boolean;
  currentStep: number;
  dontShowAgain: boolean;
  onNext: () => void;
  onSkip: () => void;
  onToggleDontShow: () => void;
};

const SPOT_PAD = 10;
const DARK = 'rgba(0,0,0,0.80)';
const BAR_W = 346;

export function TutorialOverlay({
  steps, visible, currentStep, dontShowAgain, onNext, onSkip, onToggleDontShow,
}: Props) {
  if (!visible || steps.length === 0) return null;

  const step = steps[Math.min(currentStep, steps.length - 1)];
  const isLast = currentStep === steps.length - 1;
  const spot = step.spotlight;
  const radius = step.spotlightRadius ?? 16;

  const hasSpot = spot != null && spot.width > 0 && spot.height > 0;
  const sx = hasSpot ? Math.max(0, spot!.x - SPOT_PAD) : 0;
  const sy = hasSpot ? Math.max(0, spot!.y - SPOT_PAD) : 0;
  const sw = hasSpot ? spot!.width + SPOT_PAD * 2 : SW;
  const sh = hasSpot ? spot!.height + SPOT_PAD * 2 : SH;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={StyleSheet.absoluteFill}>
        {/* 4-rect dark overlay with spotlight cutout */}
        {hasSpot ? (
          <>
            <View style={[sty.dark, { top: 0, left: 0, right: 0, height: sy }]} />
            <View style={[sty.dark, { top: sy + sh, left: 0, right: 0, bottom: 0 }]} />
            <View style={[sty.dark, { top: sy, left: 0, width: Math.max(0, sx), height: sh }]} />
            <View style={[sty.dark, { top: sy, left: sx + sw, right: 0, height: sh }]} />
            <View
              pointerEvents="none"
              style={[sty.ring, { top: sy, left: sx, width: sw, height: sh, borderRadius: radius }]}
            />
          </>
        ) : (
          <View style={[sty.dark, StyleSheet.absoluteFill]} />
        )}

        {/* Tooltip */}
        {hasSpot && (
          <View
            pointerEvents="none"
            style={[
              sty.tooltip,
              step.tooltipBelow
                ? { top: sy + sh + 14 }
                : { bottom: SH - sy + 14 },
            ]}
          >
            <Text style={sty.tipTitle}>{step.title}</Text>
            <Text style={sty.tipDesc}>{step.description}</Text>
          </View>
        )}

        {/* Progress dots */}
        <View style={sty.dotsRow} pointerEvents="none">
          {steps.map((_, i) => (
            <View key={i} style={i === currentStep ? sty.dotOn : sty.dotOff} />
          ))}
        </View>

        {/* Bottom bar */}
        <View style={sty.bar}>
          <TouchableOpacity style={sty.checkRow} onPress={onToggleDontShow} activeOpacity={0.8}>
            <View style={[sty.cb, dontShowAgain && sty.cbOn]}>
              {dontShowAgain && <Ionicons name="checkmark" size={11} color="#01180A" />}
            </View>
            <Text style={sty.cbLabel}>다시 보지 않기</Text>
          </TouchableOpacity>
          <View style={sty.btnRow}>
            <TouchableOpacity onPress={onSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={sty.skipTxt}>건너뛰기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sty.nextBtn} onPress={onNext} activeOpacity={0.85}>
              <Text style={sty.nextTxt}>{isLast ? '완료' : '다음'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const sty = StyleSheet.create({
  dark: { position: 'absolute', backgroundColor: DARK },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  tooltip: {
    position: 'absolute', left: 20, right: 20,
    backgroundColor: 'rgba(1,24,10,0.95)',
    borderRadius: 16, padding: 16, gap: 6,
  },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#B2D36E' },
  tipDesc: { fontSize: 14, color: '#FFFFFF', lineHeight: 21 },
  dotsRow: {
    position: 'absolute', bottom: 100, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  dotOn: { width: 24, height: 8, borderRadius: 4, backgroundColor: '#B2D36E' },
  dotOff: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6A7282' },
  bar: {
    position: 'absolute', bottom: 20,
    left: (SW - BAR_W) / 2, width: BAR_W, height: 69,
    borderRadius: 16, backgroundColor: '#01180A',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, justifyContent: 'space-between',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cb: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#6A7282',
    justifyContent: 'center', alignItems: 'center',
  },
  cbOn: { backgroundColor: '#B2D36E', borderColor: '#B2D36E' },
  cbLabel: { fontSize: 12, color: '#9CAF88' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skipTxt: { fontSize: 14, color: '#9CAF88' },
  nextBtn: { backgroundColor: '#B2D36E', borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 8 },
  nextTxt: { fontSize: 14, fontWeight: '700', color: '#01180A' },
});
