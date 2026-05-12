import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const SLUG_TO_NAME: Record<string, string> = {
  'finance': '금융(빚 사기 도박)',
  'labor': '노동',
  'sexual-violence': '성폭력 데이트폭력 성착취',
  'child-abuse': '아동학대',
  'online-violence': '온라인폭력',
  'birth-and-parenting': '출생과 양육',
  'parental-rights': '친권 미성년후견',
};

type Article = { id: number; question: string; summary: string | null; order: number };
type SearchResult = { id: number; question: string; summary: string | null; category: { name: string; slug: string } };

export default function ManualListScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/manual/categories/${categoryId}/articles`)
      .then(r => r.json())
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchLoading(true);
    const q = encodeURIComponent(searchQuery.trim());
    fetch(`${API_BASE}/manual/search?q=${q}&categorySlug=${categoryId}`)
      .then(r => r.json())
      .then(data => setSearchResults(Array.isArray(data) ? data : []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const categoryLabel = SLUG_TO_NAME[categoryId ?? ''] ?? '매뉴얼';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryLabel}</Text>
      </View>

      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="키워드로 검색해보세요!"
            placeholderTextColor="#9CAF88"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (!text.trim()) handleClearSearch();
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {isSearching ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={18} color="#9CAF88" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={18} color="#586144" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : isSearching ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {searchLoading ? (
            <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
          ) : searchResults.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={36} color="#CCD9BA" />
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            </View>
          ) : (
            searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.questionItem}
                activeOpacity={0.7}
                onPress={() => router.push(`/manual-detail?articleId=${item.id}`)}
              >
                <Ionicons name="search" size={15} color="#9CAF88" />
                <Text style={styles.questionText}>{item.question}</Text>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {articles.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>아직 등록된 내용이 없어요.</Text>
            </View>
          ) : (
            articles.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={styles.questionItem}
                activeOpacity={0.7}
                onPress={() => router.push(`/manual-detail?articleId=${article.id}`)}
              >
                <Text style={styles.questionNumber}>Q{index + 1}.</Text>
                <Text style={styles.questionText}>{article.question}</Text>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.floatingContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.floatingBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/manual-help?categoryId=${categoryId}`)}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.floatingText}>도움이 필요하신가요?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  searchArea: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 0 },
  content: { paddingBottom: 100 },
  center: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 12 },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 8,
  },
  questionNumber: { fontSize: 15, fontWeight: '700', color: '#4CAF50', minWidth: 28 },
  questionText: { flex: 1, fontSize: 15, color: '#1a1a1a', lineHeight: 22 },
  floatingContainer: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
