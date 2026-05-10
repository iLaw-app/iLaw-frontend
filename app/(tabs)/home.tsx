// app/(tabs)/home.tsx
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type SearchResult = {
  id: number;
  question: string;
  summary: string | null;
  category: { name: string; slug: string };
};

// ─── 컴포넌트 ───────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const hasNotification = true;

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchLoading(true);
    fetch(`${API_BASE}/manual/search?q=${encodeURIComponent(searchQuery.trim())}`)
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* 상단 알림 벨 */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color="#333" />
            {hasNotification && <View style={styles.notiBadge} />}
          </TouchableOpacity>
        </View>

        {/* 타이틀 */}
        {!isSearching && (
          <View style={styles.titleArea}>
            <Text style={styles.title}>아이로</Text>
            <Text style={styles.subtitle}>우리 아이를 지키는 법률 가이드</Text>
          </View>
        )}

        {/* 검색창 */}
        <View style={styles.searchArea}>
          {isSearching && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
          )}
          <View style={[styles.searchBox, isSearching && styles.searchBoxActive]}>
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 내용을 검색해주세요"
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Ionicons name="search" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {!isSearching && (
          <Text style={styles.searchExample}>ex) 알바비 미지급</Text>
        )}

        {/* ── 검색 결과 화면 ── */}
        {isSearching ? (
          <View style={styles.section}>
            <Text style={styles.searchResultTitle}>
              '{searchQuery}'에 대한 검색결과
            </Text>

            {searchLoading ? (
              <ActivityIndicator color="#4CAF50" style={{ marginTop: 40 }} />
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              <View style={styles.card}>
                {searchResults.map((item, index) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.contentItem}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/manual-detail?articleId=${item.id}`)}
                    >
                      <View style={styles.tagRow}>
                        <View style={styles.tagManual}>
                          <Text style={[styles.tagText, styles.tagTextManual]}>📖 매뉴얼</Text>
                        </View>
                        <Text style={styles.categoryText}>{item.category.name}</Text>
                      </View>
                      <Text style={styles.contentTitle}>{item.question}</Text>
                      {item.summary ? (
                        <Text style={styles.contentDesc} numberOfLines={2}>
                          {item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                    {index < searchResults.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            )}
          </View>

        ) : (
          /* ── 홈 메인 화면 ── */
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 자주 찾는 주제</Text>
            </View>
            <View style={styles.card}>
              {[
                { label: '알바비 못 받았을 때', slug: 'labor' },
                { label: '아동학대 신고 방법', slug: 'child-abuse' },
                { label: '온라인 괴롭힘 대처법', slug: 'online-violence' },
              ].map((item, index, arr) => (
                <View key={item.slug}>
                  <TouchableOpacity
                    style={styles.contentItem}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/manual-list?categoryId=${item.slug}`)}
                  >
                    <Text style={styles.contentTitle}>{item.label}</Text>
                  </TouchableOpacity>
                  {index < arr.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 스타일 ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf4' },

  // 상단 바
  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },

  // 타이틀
  titleArea: { alignItems: 'center', paddingVertical: 20 },
  title: { fontSize: 36, fontWeight: '800', color: '#2E7D32', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666' },

  // 검색
  searchArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  backBtn: { marginRight: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 30, borderWidth: 1.5, borderColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 4 },
  searchBoxActive: { borderColor: '#2E7D32' },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 10 },
  searchBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  searchExample: { fontSize: 12, color: '#4CAF50', marginBottom: 24, marginLeft: 24 },
  searchResultTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },


  // 섹션
  section: { paddingHorizontal: 20, marginBottom: 24, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  moreBtn: { fontSize: 13, color: '#4CAF50' },

  // 카드
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#eee' },
  contentItem: { paddingVertical: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagManual: { backgroundColor: '#E8F5E9' },
  tagQna: { backgroundColor: '#E3F2FD' },
  tagText: { fontSize: 11, fontWeight: '600' },
  tagTextManual: { color: '#2E7D32' },
  tagTextQna: { color: '#1565C0' },
  categoryText: { fontSize: 12, color: '#888' },
  contentTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4, lineHeight: 22 },
  contentDesc: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 6 },
  divider: { height: 1, backgroundColor: '#f5f5f5' },

  // 빈 결과
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#aaa', marginTop: 12 },
});