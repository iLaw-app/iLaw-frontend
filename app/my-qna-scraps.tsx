import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuth } from './context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type QnAItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  author: { nickname: string | null };
};

export default function MyQnAScrapsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<QnAItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch(`${API_BASE}/qa/my-scraps`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [accessToken]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스크랩한 Q&A</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={styles.emptyText}>스크랩한 Q&A가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/qna/${item.id}`)}>
              <View style={styles.cardTop}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'answered' && styles.statusBadgeAnswered]}>
                  <Text style={[styles.statusText, item.status === 'answered' && styles.statusTextAnswered]}>
                    {item.status === 'answered' ? '답변완료' : '답변대기'}
                  </Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.author.nickname ?? '익명'} · {new Date(item.createdAt).toLocaleDateString('ko-KR')}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  back: { fontSize: 20, color: '#3C6802', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: '#9CAF88' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E4EED4' },
  cardTop: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: '#3C6802', fontWeight: '600' },
  statusBadge: { backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeAnswered: { backgroundColor: '#e8f5e9' },
  statusText: { fontSize: 12, color: '#aaa', fontWeight: '600' },
  statusTextAnswered: { color: '#4CAF50' },
  title: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', lineHeight: 22, marginBottom: 8 },
  meta: { fontSize: 12, color: '#9CAF88' },
});
