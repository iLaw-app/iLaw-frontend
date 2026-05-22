import React, { useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SW } = Dimensions.get('window');

const SLIDES = [
  {
    iconName: 'search-outline' as const,
    iconColor: '#678720',
    iconBg: '#EEF8D9',
    title: '검색으로 빠르게 찾기',
    desc: '궁금한 법률 정보를 키워드로 검색해\n매뉴얼, Q&A, 커뮤니티에서\n한번에 찾아보세요',
  },
  {
    iconName: 'chatbubble-ellipses-outline' as const,
    iconColor: '#2B56B5',
    iconBg: '#E9F3FF',
    title: 'AI 챗봇으로 상황진단',
    desc: '내가 겪은 상황을 말하면 AI가\n상황을 요약하고\n추천 콘텐츠를 찾아드려요',
  },
  {
    iconName: 'star-outline' as const,
    iconColor: '#678720',
    iconBg: '#EEF8D9',
    title: '추천 콘텐츠',
    desc: '많이 찾는 법률 콘텐츠를\n홈 화면에서 바로 확인해요',
  },
  {
    iconName: 'book-outline' as const,
    iconColor: '#678720',
    iconBg: '#EEF8D9',
    title: '매뉴얼',
    desc: '궁금한 주제를 선택해\n필요한 법률 정보를 확인해요',
  },
  {
    iconName: 'call-outline' as const,
    iconColor: '#C10007',
    iconBg: '#FEF2F2',
    title: '매뉴얼 도움 요청',
    desc: '상황에 맞는 도움 기관과\n요청 방법을 확인해요',
  },
  {
    iconName: 'chatbubble-outline' as const,
    iconColor: '#2B56B5',
    iconBg: '#E9F3FF',
    title: 'Q&A',
    desc: '더 정확한 도움이 필요할 때\n변호사님께 직접 질문할 수 있어요',
  },
  {
    iconName: 'people-outline' as const,
    iconColor: '#678720',
    iconBg: '#EEF8D9',
    title: '커뮤니티',
    desc: '비슷한 경험을 가진\n사람들과 이야기나눠요',
  },
];

type Props = {
  visible: boolean;
  onDone: () => void;
};

export function TutorialSlideshow({ visible, onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = idx === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) { onDone(); return; }
    const next = idx + 1;
    scrollRef.current?.scrollTo({ x: next * SW, animated: true });
    setIdx(next);
  };

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent={false}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (idx > 0) {
          const prev = idx - 1;
          scrollRef.current?.scrollTo({ x: prev * SW, animated: true });
          setIdx(prev);
        }
      }}
    >
      <SafeAreaView style={sty.root} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={sty.header}>
          <Text style={sty.brand}>아이로</Text>
          <TouchableOpacity onPress={onDone} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={sty.skip}>건너뛰기</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={200}
          onMomentumScrollEnd={e => {
            setIdx(Math.round(e.nativeEvent.contentOffset.x / SW));
          }}
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {SLIDES.map((slide, i) => (
            <View key={i} style={sty.slide}>
              <View style={[sty.iconCircle, { backgroundColor: slide.iconBg }]}>
                <Ionicons name={slide.iconName} size={60} color={slide.iconColor} />
              </View>
              <Text style={sty.title}>{slide.title}</Text>
              <Text style={sty.desc}>{slide.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={sty.footer}>
          <View style={sty.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={i === idx ? sty.dotOn : sty.dotOff} />
            ))}
          </View>
          <TouchableOpacity style={sty.nextBtn} onPress={goNext} activeOpacity={0.85}>
            <Text style={sty.nextTxt}>{isLast ? '시작하기' : '다음'}</Text>
            {!isLast && <Ionicons name="arrow-forward" size={15} color="#01180A" style={{ marginLeft: 4 }} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const sty = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  brand: { fontSize: 20, fontWeight: '800', color: '#3C6802', letterSpacing: -0.5 },
  skip: { fontSize: 14, color: '#9CAF88', fontWeight: '500' },
  slide: {
    width: SW,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 20,
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  title: {
    fontSize: 24, fontWeight: '700', color: '#586144',
    textAlign: 'center', lineHeight: 34, letterSpacing: -0.5,
  },
  desc: {
    fontSize: 16, color: '#6A7282',
    textAlign: 'center', lineHeight: 26, letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 24,
    borderTopWidth: 1, borderTopColor: '#F0F5E8',
  },
  dots: { flexDirection: 'row', gap: 6 },
  dotOn: { width: 24, height: 8, borderRadius: 4, backgroundColor: '#B2D36E' },
  dotOff: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#B2D36E', borderRadius: 9999,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  nextTxt: { fontSize: 15, fontWeight: '700', color: '#01180A' },
});
