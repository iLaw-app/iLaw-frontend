import { useState, useRef, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';

function CustomToggle({ value, onValueChange }: { value: boolean; onValueChange: () => void }) {
  const translateX = useRef(new Animated.Value(value ? 18 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 18 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  return (
    <TouchableOpacity
      onPress={onValueChange}
      activeOpacity={0.9}
      style={[ts.track, { backgroundColor: value ? '#B2D36E' : '#E4EED4' }]}
    >
      <Animated.View style={[ts.thumb, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
}

const ts = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: 13, padding: 3 },
  thumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
});

const USER_TOGGLES = [
  {
    key: 'answer',
    icon: 'chatbubble-outline' as const,
    title: '내 질문 답변 알림',
    desc: '변호사님의 답변을 받으면 알려드려요',
  },
  {
    key: 'scrap',
    icon: 'bookmark-outline' as const,
    title: '스크랩한 질문 답변 알림',
    desc: '스크랩한 질문에 답변이 달리면 알려드려요',
  },
  {
    key: 'manual',
    icon: 'book-outline' as const,
    title: '매뉴얼 업데이트 알림',
    desc: '새로운 법률 정보가 추가되면 알려드려요',
  },
];

const LAWYER_TOGGLES = [
  {
    key: 'newQuestion',
    icon: 'chatbubble-outline' as const,
    title: '질문 등록 알림',
    desc: '학생의 질문이 등록되면 알려드려요',
  },
  {
    key: 'manual',
    icon: 'book-outline' as const,
    title: '매뉴얼 업데이트 알림',
    desc: '새로운 법률 정보가 추가되면 알려드려요',
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { role } = useAuth();
  const toggles = role === 'lawyer' ? LAWYER_TOGGLES : USER_TOGGLES;
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    answer: true,
    scrap: true,
    manual: false,
    newQuestion: true,
  });

  const toggle = (key: string) => setEnabled(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
          <Text style={styles.headerTitle}>알림 설정</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {toggles.map((item, idx) => (
          <View key={item.key}>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </View>
              <View style={styles.textGroup}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowDesc}>{item.desc}</Text>
              </View>
              <CustomToggle
                value={enabled[item.key]}
                onValueChange={() => toggle(item.key)}
              />
            </View>
            {idx < toggles.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#586144' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 20, gap: 14,
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: 9999,
    backgroundColor: '#B2D36E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: { flex: 1 },
  rowTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439 },
  rowDesc: { fontSize: 12, fontWeight: '400', color: '#586144', lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#F0F5E8' },
});
