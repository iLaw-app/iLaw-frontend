import React, { useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
  spotlightRadius?: number; // 9999 = pill/circle, 0 = sharp rect, default 16
  spotlight2?: SpotlightRect | null;
  spotlight2Radius?: number;
  title: string;
  description: string;
  tooltipBelow?: boolean;
  tooltipLeft?: number;
  tooltipRight?: number;
  titleStyle?: object;
  descStyle?: object;
};

type Props = {
  steps: TutorialStep[];
  visible: boolean;
  currentStep: number;
  dontShowAgain: boolean;
  onNext: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  onToggleDontShow: () => void;
  totalDots?: number;  // global total (e.g. 7); defaults to steps.length
  dotOffset?: number;  // index of first step in global flow; defaults to 0
  showComplete?: boolean; // false = always show "다음" even on last local step
};

const BAR_W = 346;

function buildHole(sx: number, sy: number, sw: number, sh: number, radius: number): string {
  const r = Math.min(radius, sw / 2, sh / 2);
  return [
    `M ${sx + r},${sy}`,
    `H ${sx + sw - r}`,
    `Q ${sx + sw},${sy} ${sx + sw},${sy + r}`,
    `V ${sy + sh - r}`,
    `Q ${sx + sw},${sy + sh} ${sx + sw - r},${sy + sh}`,
    `H ${sx + r}`,
    `Q ${sx},${sy + sh} ${sx},${sy + sh - r}`,
    `V ${sy + r}`,
    `Q ${sx},${sy} ${sx + r},${sy}`,
    `Z`,
  ].join(' ');
}

function buildCutoutPath(
  sx: number, sy: number, sw: number, sh: number, radius: number,
  sx2?: number, sy2?: number, sw2?: number, sh2?: number, r2?: number,
): string {
  const bg = `M 0,0 H ${SW} V ${SH} H 0 Z`;
  const hole1 = buildHole(sx, sy, sw, sh, radius);
  const hole2 = (sw2 && sh2) ? buildHole(sx2!, sy2!, sw2, sh2, r2 ?? 16) : '';
  return `${bg} ${hole1} ${hole2}`.trimEnd();
}

export function TutorialOverlay({
  steps, visible, currentStep, dontShowAgain,
  onNext, onPrev, onSkip, onToggleDontShow,
  totalDots, dotOffset = 0, showComplete = true,
}: Props) {
  // Keep handlers fresh without recreating PanResponder
  const handlersRef = useRef({ onNext, onPrev });
  handlersRef.current = { onNext, onPrev };

  const pan = useRef(
    PanResponder.create({
      // Claim touch immediately in the dark overlay area (above bottom bar ≈ 120px from bottom)
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.pageY < SH - 120,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10) handlersRef.current.onNext();
        else if (gs.dx < -40) handlersRef.current.onNext();
        else if (gs.dx > 40) handlersRef.current.onPrev?.();
      },
    })
  ).current;

  if (!visible || steps.length === 0) return null;

  const step = steps[Math.min(currentStep, steps.length - 1)];
  const isLast = showComplete && currentStep === steps.length - 1;
  const spot = step.spotlight;
  const radius = step.spotlightRadius ?? 16;

  const hasSpot = spot != null && spot.width > 0 && spot.height > 0;
  const sx = hasSpot ? spot!.x : 0;
  const sy = hasSpot ? spot!.y : 0;
  const sw = hasSpot ? spot!.width : SW;
  const sh = hasSpot ? spot!.height : SH;

  const spot2 = step.spotlight2;
  const radius2 = step.spotlight2Radius ?? 16;
  const hasSpot2 = spot2 != null && spot2.width > 0 && spot2.height > 0;

  const tipLeft = step.tooltipLeft ?? 20;
  const tipRight = step.tooltipRight ?? 20;

  const totalDotsCount = totalDots ?? steps.length;
  const activeDot = dotOffset + currentStep;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (currentStep > 0 && onPrev) onPrev();
        else onSkip();
      }}
    >
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
        {/* SVG overlay with exact-shape cutout */}
        <Svg width={SW} height={SH} style={StyleSheet.absoluteFill} pointerEvents="none">
          {hasSpot ? (
            <Path
              d={buildCutoutPath(
                sx, sy, sw, sh, radius,
                hasSpot2 ? spot2!.x : undefined,
                hasSpot2 ? spot2!.y : undefined,
                hasSpot2 ? spot2!.width : undefined,
                hasSpot2 ? spot2!.height : undefined,
                hasSpot2 ? radius2 : undefined,
              )}
              fill="rgba(0,0,0,0.80)"
              fillRule="evenodd"
            />
          ) : (
            <Path d={`M 0,0 H ${SW} V ${SH} H 0 Z`} fill="rgba(0,0,0,0.80)" />
          )}
        </Svg>

        {/* Tooltip — no background box, centered */}
        {hasSpot && (
          <View
            pointerEvents="none"
            style={[
              sty.tooltip,
              { left: tipLeft, right: tipRight },
              step.tooltipBelow
                ? { top: sy + sh + 14 }
                : { bottom: SH - sy + 14 },
            ]}
          >
            <Text style={[sty.tipTitle, step.titleStyle]}>{step.title}</Text>
            <Text style={[sty.tipDesc, step.descStyle]}>{step.description}</Text>
          </View>
        )}

        {/* Progress dots — global 7-dot flow */}
        <View style={sty.dotsRow} pointerEvents="none">
          {Array.from({ length: totalDotsCount }).map((_, i) => (
            <View key={i} style={i === activeDot ? sty.dotOn : sty.dotOff} />
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
  tooltip: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#B2D36E', textAlign: 'center' },
  tipDesc: { fontSize: 14, color: '#FFFFFF', lineHeight: 21, textAlign: 'center' },
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
