import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';
import { BottomNav } from '../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type QnAPost = {
  id: number;
  title: string;
  content?: string;
  category: string;
  status: string;
  createdAt: string;
};

export default function MyQuestionsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<QnAPost[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!accessToken) {
        setLoading(false);
        return () => { cancelled = true; };
      }
      setLoading(true);
      fetch(`${API_BASE}/qna/mine`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(r => r.json())
        .then(data => {
          if (!cancelled) setPosts(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!cancelled) setPosts([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }, [accessToken])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
          <Text style={styles.headerTitle}>내 질문</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color="#CCD9BA" />
                <Text style={styles.emptyText}>아직 작성한 질문이 없습니다</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/qna/${item.id}`)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.statusBadge,
                  item.status === 'answered' ? styles.statusAnswered : styles.statusPending,
                ]}>
                  <Text style={[
                    styles.statusText,
                    item.status === 'answered' ? styles.statusTextAnswered : styles.statusTextPending,
                  ]}>
                    {item.status === 'answered' ? '답변 완료' : '답변 대기'}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                  </View>
                </View>

                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                {item.content ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.contentBox}>
                      <Text style={styles.contentPreview} numberOfLines={3}>{item.content}</Text>
                    </View>
                  </>
                ) : null}

                <View style={styles.cardBottom}>
                  <Ionicons name="time-outline" size={12} color="#9CAF88" />
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#586144' },
  list: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  statusBadge: {
    position: 'absolute', top: 16, right: 16,
    borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusAnswered: { backgroundColor: '#E9F3FF' },
  statusPending: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  statusTextAnswered: { color: '#2B56B5' },
  statusTextPending: { color: '#C10007' },
  badgeRow: { flexDirection: 'row', marginBottom: 10, marginRight: 90 },
  badge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439, marginBottom: 6 },
  contentPreview: { fontSize: 14, color: '#586144', lineHeight: 20, letterSpacing: -0.15, marginBottom: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  date: { fontSize: 12, color: '#9CAF88' },
  divider: { height: 1, backgroundColor: '#E4EED4', marginVertical: 8 },
  contentBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  emptyContainer: {
    margin: 16,
    padding: 49,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
