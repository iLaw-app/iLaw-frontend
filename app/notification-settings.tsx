import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TOGGLES = [
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

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    answer: true,
    scrap: true,
    manual: false,
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
        {TOGGLES.map((item, idx) => (
          <View key={item.key}>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={20} color="#586144" />
              </View>
              <View style={styles.textGroup}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={enabled[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: '#E4EED4', true: '#B2D36E' }}
                thumbColor="#fff"
              />
            </View>
            {idx < TOGGLES.length - 1 && <View style={styles.divider} />}
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#586144' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 20, gap: 14,
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: 9999,
    backgroundColor: '#CCD9BA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: { flex: 1 },
  rowTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439 },
  rowDesc: { fontSize: 12, fontWeight: '400', color: '#586144', lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#F0F5E8' },
});
