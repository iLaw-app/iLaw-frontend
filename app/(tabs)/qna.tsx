import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MOCK_QNA, QnAItem } from '../data/qnaData';

function CategoryBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function QnACard({ item }: { item: QnAItem }) {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/qna/${item.id}`)}>
      <View style={styles.cardHeader}>
        {item.categories.map((c) => <CategoryBadge key={c} label={c} />)}
        <View style={[styles.statusBadge, item.status === 'answered' ? styles.statusAnswered : styles.statusPending]}>
          <Text style={styles.statusText}>{item.status === 'answered' ? '답변 완료' : '답변 대기'}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardMeta}>작성자 · {item.createdAt}</Text>
    </TouchableOpacity>
  );
}

export default function QnaPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QnA</Text>
        <Text style={styles.headerSub}>변호사님이 직접 답변해 드립니다</Text>
      </View>

      <FlatList
        data={MOCK_QNA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QnACard item={item} />}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/qna/ask')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  badge: { backgroundColor: '#e8f5e9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusAnswered: { backgroundColor: '#e3f2fd' },
  statusPending: { backgroundColor: '#fff3e0' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#555' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 8, lineHeight: 22 },
  cardMeta: { fontSize: 12, color: '#aaa' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
