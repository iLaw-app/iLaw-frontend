import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  {
    id: 'child-abuse',
    emoji: '🛡️',
    label: '아동학대/가정폭력',
    desc: '가정 내 폭력, 보호방법',
    color: '#FF6B6B',
    bg: '#FFF0F0',
  },
  {
    id: 'labor',
    emoji: '💼',
    label: '노동',
    desc: '아르바이트, 임금, 근로계약',
    color: '#FF9500',
    bg: '#FFF4E6',
  },
  {
    id: 'finance',
    emoji: '💵',
    label: '금융',
    desc: '빚, 사기, 금융 문제 해결',
    color: '#4CAF50',
    bg: '#F0FAF4',
  },
  {
    id: 'sexual-violence',
    emoji: '💜',
    label: '성폭력',
    desc: '성착취, 성폭력, 신고방법',
    color: '#9B59B6',
    bg: '#F8F0FF',
  },
  {
    id: 'online-violence',
    emoji: '📡',
    label: '온라인폭력',
    desc: '사이버 괴롭힘, 악플, 신고',
    color: '#00BCD4',
    bg: '#F0FAFE',
  },
  {
    id: 'birth-adoption',
    emoji: '👶',
    label: '출생·양육',
    desc: '출생신고, 입양, 양육비',
    color: '#FF9800',
    bg: '#FFF8F0',
  },
  {
    id: 'guardianship',
    emoji: '⚖️',
    label: '법정대리인',
    desc: '친권, 후견, 보호제도',
    color: '#607D8B',
    bg: '#F5F7FA',
  },
];

export default function ManualScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>어떤 도움이 필요하신가요?</Text>
          <Text style={styles.subtitle}>상황에 맞는 법률 정보를 확인해보세요</Text>
        </View>

        <View style={styles.list}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => router.push(`/manual-list?categoryId=${cat.id}`)}
            >
              <View style={[styles.iconCircle, { backgroundColor: cat.bg }]}>
                <Text style={styles.emoji}>{cat.emoji}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{cat.label}</Text>
                <Text style={styles.cardDesc}>{cat.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faf4',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 26 },
  cardText: { flex: 1 },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#999',
  },
});
