import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type TabType = 'all' | 'manual' | 'qna';

type SearchResult = {
  id: number;
  question: string;
  summary: string | null;
  category: { name: string; slug: string };
  scrapCount?: number;
};

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'manual', label: '매뉴얼' },
  { key: 'qna', label: 'QnA' },
];

function ResultCard({ item, onPress }: { item: SearchResult; onPress: () => void }) {
  const [titleLines, setTitleLines] = useState(2);

  return (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.resultTopRow}>
        <View style={styles.tagManual}>
          <Text style={styles.tagTextManual}>📖 매뉴얼</Text>
        </View>
        <Text style={styles.categoryText}>{item.category.name}</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="bookmark-outline" size={13} color="#9CAF88" />
        <Text style={styles.scrapCount}>{item.scrapCount ?? 0}</Text>
      </View>
      <Text
        style={styles.resultTitle}
        numberOfLines={2}
        onTextLayout={(e) => setTitleLines(e.nativeEvent.lines.length)}
      >
        {item.question}
      </Text>
      {item.summary ? (
        <Text style={styles.resultDesc} numberOfLines={titleLines >= 2 ? 1 : 2}>
          {item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [hasNotification, setHasNotification] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/notifications/unread-count`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setHasNotification((data.count ?? 0) > 0))
      .catch(() => {});
  }, [accessToken]));

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchLoading(true);
    setActiveTab('all');
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
    setActiveTab('all');
  };

  const filteredResults = activeTab === 'qna' ? [] : searchResults;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >

        {/* 알림 벨 - 검색 중 숨김 */}
        {!isSearching && (
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#586144" />
              {hasNotification && <View style={styles.notiBadge} />}
            </TouchableOpacity>
          </View>
        )}

        {/* 타이틀 */}
        {!isSearching && (
          <View style={styles.titleArea}>
            <Text style={styles.title}>아이로</Text>
            <Text style={styles.subtitle}>우리 아이를 지키는 법률 가이드</Text>
          </View>
        )}

        {/* 검색창 */}
        <View style={[styles.searchArea, isSearching && styles.searchAreaSearching]}>
          {isSearching && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#586144" />
            </TouchableOpacity>
          )}
          <View style={[styles.searchBox, isSearching && styles.searchBoxActive]}>
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 내용을 검색해주세요"
              placeholderTextColor="#9CAF88"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Ionicons name="search" size={16} color="#586144" />
            </TouchableOpacity>
          </View>
        </View>
        {!isSearching && (
          <Text style={styles.searchExample}>ex) 알바비 미지급</Text>
        )}

        {/* 검색 필터 탭 */}
        {isSearching && (
          <View style={styles.filterRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── 검색 결과 ── */}
        {isSearching ? (
          <View style={styles.section}>
            <Text style={styles.searchResultTitle}>
              '{searchQuery}'에 대한 검색결과
            </Text>

            {searchLoading ? (
              <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
            ) : filteredResults.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={40} color="#CCD9BA" />
                <Text style={styles.emptyText}>
                  {activeTab === 'qna' ? 'QnA 검색은 준비 중입니다' : '검색 결과가 없습니다'}
                </Text>
              </View>
            ) : (
              <View style={styles.resultList}>
                {filteredResults.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    onPress={() => router.push(`/manual-detail?articleId=${item.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

        ) : (
          /* ── 홈 메인 ── */
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E4EED4',
  },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },

  titleArea: { alignItems: 'center', paddingVertical: 20 },
  title: { fontSize: 36, fontWeight: '700', color: '#3C6802', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#586144' },

  searchArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  searchAreaSearching: { marginTop: 16 },
  backBtn: { marginRight: 8 },
  searchBox: {
    flex: 1,
    height: 59,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#CCD9BA',
    paddingLeft: 20,
    paddingRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBoxActive: { borderColor: '#3C6802' },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 0 },
  searchBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  searchExample: { fontSize: 12, color: '#9CAF88', marginBottom: 24, marginLeft: 24 },

  filterRow: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 20, marginTop: 12, marginBottom: 4 },
  filterTab: {
    width: 106,
    paddingTop: 7,
    paddingBottom: 9,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: '#B2D36E' },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#9CAF88' },
  filterTabTextActive: { color: '#fff' },

  searchResultTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },

  section: { paddingHorizontal: 20, marginBottom: 24, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },

  resultList: { gap: 12 },
  resultCard: {
    paddingTop: 17.5,
    paddingLeft: 17.5,
    paddingRight: 17.5,
    paddingBottom: 17.5,
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1.544,
    borderColor: '#CCD9BA',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  resultTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, width: '100%' },
  tagManual: { backgroundColor: '#EDF5E1', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  tagTextManual: { fontSize: 11, fontWeight: '600', color: '#3C6802' },
  categoryText: { fontSize: 12, color: '#9CAF88' },
  scrapCount: { fontSize: 12, color: '#9CAF88', marginLeft: 3 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439, marginBottom: 4 },
  resultDesc: { fontSize: 14, fontWeight: '400', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },

  card: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E4EED4' },
  contentItem: { paddingVertical: 12 },
  contentTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#F0F5E8' },

  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#9CAF88', marginTop: 12 },
});
