import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type QnAPost = {
  id: number;
  title: string;
  content?: string;
  category: string;
  status: string;
  createdAt: string;
  author: { nickname: string | null };
};

export default function QnaPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<QnAPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/qna`)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QnA</Text>
        <Text style={styles.headerSub}>변호사님이 직접 답변해 드립니다</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/qna/${item.id}`)}
            >
              {/* 상태 배지 - 우상단 절대 위치 */}
              <View style={[
                styles.statusBadge,
                item.status === 'answered' ? styles.statusAnswered : styles.statusPending,
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'answered' ? styles.statusTextAnswered : styles.statusTextPending,
                ]}>
                  {item.status === 'answered' ? '답변완료' : '답변대기'}
                </Text>
              </View>

              {/* 카테고리 배지 */}
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
              </View>

              {/* 제목 */}
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

              {/* 세부 내용 미리보기 */}
              {item.content ? (
                <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
              ) : null}

              {/* 작성자 / 날짜 */}
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={12} color="#9CAF88" />
                  <Text style={styles.metaText}>{item.author.nickname ?? '익명'}</Text>
                </View>
                <Text style={styles.metaDot}>·</Text>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color="#9CAF88" />
                  <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={40} color="#CCD9BA" />
              <Text style={styles.emptyText}>아직 등록된 질문이 없습니다</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/qna/ask')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#9CAF88', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.544,
    borderColor: '#CCD9BA',
    padding: 16,
    minHeight: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },

  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusAnswered: { backgroundColor: '#E9F3FF' },
  statusPending: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  statusTextAnswered: { color: '#2B56B5' },
  statusTextPending: { color: '#C10007' },

  badgeRow: { flexDirection: 'row', marginBottom: 10, marginRight: 90 },
  badge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 27,
    letterSpacing: -0.439,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    fontWeight: '400',
    color: '#586144',
    lineHeight: 20,
    letterSpacing: -0.15,
    marginBottom: 8,
  },

  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto' as any },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#9CAF88' },
  metaDot: { fontSize: 12, color: '#9CAF88' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#B2D36E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
