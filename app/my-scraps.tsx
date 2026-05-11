import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type ScrapArticle = {
  id: number;
  question: string;
  summary: string | null;
  category: { name: string; slug: string };
};

export default function MyScrapsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [articles, setArticles] = useState<ScrapArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    fetch(`${API_BASE}/manual/my-scraps`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스크랩한 매뉴얼</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={40} color="#CCD9BA" />
              <Text style={styles.emptyText}>스크랩한 매뉴얼이 없습니다</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/manual-detail?articleId=${item.id}`)}
            >
              <View style={styles.categoryRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.category.name}</Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={2}>{item.question}</Text>
              {item.summary ? (
                <Text style={styles.summary} numberOfLines={2}>
                  {item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1.544, borderColor: '#CCD9BA',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  categoryRow: { flexDirection: 'row', marginBottom: 8 },
  badge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },
  title: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', lineHeight: 22, marginBottom: 4 },
  summary: { fontSize: 13, color: '#9CAF88', lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
