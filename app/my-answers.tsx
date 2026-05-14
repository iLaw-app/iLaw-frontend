import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type AnsweredPost = {
  id: number;
  title: string;
  content?: string;
  category: string;
  createdAt: string;
  answeredAt?: string;
};

export default function MyAnswersPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<AnsweredPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/qna/my-answers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#586144" />
          <Text style={styles.headerTitle}>내 답변</Text>
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/qna/${item.id}`)}
              >
                <View style={styles.badgeRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.answeredBadge}>
                    <Text style={styles.answeredText}>답변완료</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {item.content ? (
                  <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
                ) : null}
                <View style={styles.divider} />
                <View style={styles.dateMeta}>
                  <View style={styles.dateItem}>
                    <Ionicons name="create-outline" size={12} color="#9CAF88" />
                    <Text style={styles.dateLabel}>질문일자</Text>
                    <Text style={styles.dateValue}>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</Text>
                  </View>
                  {item.answeredAt ? (
                    <View style={styles.dateItem}>
                      <Ionicons name="checkmark-circle-outline" size={12} color="#2B56B5" />
                      <Text style={[styles.dateLabel, { color: '#2B56B5' }]}>답변일자</Text>
                      <Text style={[styles.dateValue, { color: '#2B56B5' }]}>{new Date(item.answeredAt).toLocaleDateString('ko-KR')}</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubble-outline" size={40} color="#CCD9BA" />
                <Text style={styles.emptyText}>아직 답변한 질문이 없습니다</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#586144' },

  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.544,
    borderColor: '#CCD9BA',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  categoryBadge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  categoryText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },
  answeredBadge: { backgroundColor: '#E9F3FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  answeredText: { fontSize: 11, color: '#2B56B5', fontWeight: '700' },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 24,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 13,
    color: '#586144',
    lineHeight: 19,
    letterSpacing: -0.15,
    marginBottom: 4,
  },

  divider: { height: 0.678, backgroundColor: '#F3F4F6', marginVertical: 10 },

  dateMeta: { flexDirection: 'row', gap: 16 },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateLabel: { fontSize: 11, color: '#9CAF88', fontWeight: '500' },
  dateValue: { fontSize: 11, color: '#9CAF88' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
