import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 카테고리 목록
const categories = [
  { id: 1, emoji: '🛡️', label: '아동학대/가정폭력', color: '#FF6B6B', bg: '#FFF0F0' },
  { id: 2, emoji: '💼', label: '노동', color: '#FF9500', bg: '#FFF4E6' },
  { id: 3, emoji: '💵', label: '금융(빚,사기)', color: '#4CAF50', bg: '#F0FAF4' },
  { id: 4, emoji: '⚠️', label: '성착취', color: '#FF6B9D', bg: '#FFF0F6' },
  { id: 5, emoji: '💜', label: '성폭력,데이트폭력', color: '#9B59B6', bg: '#F8F0FF' },
  { id: 6, emoji: '📡', label: '온라인폭력\n(명예훼손,모욕)', color: '#00BCD4', bg: '#F0FAFE' },
  { id: 7, emoji: '👶', label: '출생신고,입양,양육비', color: '#FF9800', bg: '#FFF8F0' },
  { id: 8, emoji: '⚖️', label: '친권,미성년후견', color: '#4CAF50', bg: '#F0FAF4' },
];

export default function ManualScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>법률 매뉴얼</Text>
          <Text style={styles.subtitle}>필요한 카테고리를 선택해주세요</Text>
        </View>

        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, { backgroundColor: cat.bg }]}
              activeOpacity={0.85}
              onPress={() => {
                // 나중에 카테고리별 상세 페이지로 이동
                console.log('선택한 카테고리:', cat.label);
              }}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[styles.cardLabel, { color: cat.color }]}>{cat.label}</Text>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});