import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { BottomNav } from '../components/BottomNav';

function HighlightText({ text, keywords, style }: { text: string; keywords: string[]; style?: any }) {
  const active = keywords.filter(k => k.trim());
  if (active.length === 0) return <Text style={style}>{text}</Text>;
  const escaped = active.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        active.some(k => part.toLowerCase() === k.toLowerCase())
          ? <Text key={i} style={{ backgroundColor: '#FFE566' }}>{part}</Text>
          : part
      )}
    </Text>
  );
}

const API_BASE = 'https://ilaw-backend.up.railway.app';

const SLUG_TO_NAME: Record<string, string> = {
  'finance': '금융(빚 사기 도박)',
  'labor': '노동',
  'sexual-violence': '성폭력 데이트폭력 성착취',
  'child-abuse': '아동학대/가정폭력',
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
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
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
    fetch(`${API_BASE}/manual/search?q=${q}`)
      .then(r => r.json())
      .then(data => {
        setExpandedTerms(data.expandedTerms ?? []);
        setSearchResults(Array.isArray(data.results) ? data.results.filter((item: SearchResult) => item.category.slug === categoryId) : []);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    setExpandedTerms([]);
  };

  // 검색 결과에서 원래 Q 번호 찾기
  const getQuestionNumber = (id: number) => {
    const idx = articles.findIndex(a => a.id === id);
    return idx >= 0 ? idx + 1 : null;
  };

  const categoryLabel = SLUG_TO_NAME[categoryId ?? ''] ?? '매뉴얼';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryLabel}</Text>
      </View>

      {/* 검색창 - 홈화면과 동일한 스타일 */}
      <View style={styles.searchArea}>
        <View style={[styles.searchBox, isSearching && styles.searchBoxActive]}>
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
            <TouchableOpacity style={styles.searchBtn} onPress={handleClearSearch}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Ionicons name="search" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : isSearching ? (
          /* ── 검색 결과 ── */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {searchLoading ? (
              <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
            ) : searchResults.length === 0 ? (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={36} color="#CCD9BA" />
                <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              <View style={styles.resultCard}>
                {searchResults.map((item, idx) => {
                  const qNum = getQuestionNumber(item.id) ?? idx + 1;
                  return (
                    <View key={item.id}>
                      <TouchableOpacity
                        style={styles.questionItem}
                        activeOpacity={0.7}
                        onPress={() => router.push(`/manual-detail?articleId=${item.id}`)}
                      >
                        <Text style={styles.questionNumber}>Q{qNum}.</Text>
                        <HighlightText text={item.question} keywords={expandedTerms.length > 0 ? expandedTerms : [searchQuery]} style={styles.questionText} />
                        <Ionicons name="chevron-forward" size={18} color="#bbb" />
                      </TouchableOpacity>
                      {idx < searchResults.length - 1 && <View style={styles.divider} />}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        ) : (
          /* ── 전체 목록 ── */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {articles.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>아직 등록된 내용이 없어요.</Text>
              </View>
            ) : (
              <View style={styles.resultCard}>
                {articles.map((article, index) => (
                  <View key={article.id}>
                    <TouchableOpacity
                      style={styles.questionItem}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/manual-detail?articleId=${article.id}`)}
                    >
                      <Text style={styles.questionNumber}>Q{index + 1}.</Text>
                      <Text style={styles.questionText}>{article.question}</Text>
                      <Ionicons name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                    {index < articles.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* 도움이 필요하신가요 버튼 - 오른쪽 하단 */}
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
      <BottomNav activeTab="consult" />
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

  searchArea: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#CCD9BA',
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBoxActive: { borderColor: '#3C6802' },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 0 },
  searchBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#CCD9BA',
  },

  content: { paddingBottom: 100 },
  center: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 12 },

  resultCard: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 20 },
  questionNumber: { fontSize: 15, fontWeight: '700', color: '#4CAF50', minWidth: 28 },
  questionText: { flex: 1, fontSize: 15, color: '#1a1a1a', lineHeight: 22 },

  floatingContainer: { position: 'absolute', bottom: 100, right: 20 },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
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
