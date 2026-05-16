import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type TabType = 'all' | 'manual' | 'qna';

type SearchResult = {
  id: number;
  type: 'manual' | 'qna';
  question: string;
  summary: string | null;
  category: { name: string; slug: string };
  scrapCount?: number;
  scrapped?: boolean;
};

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'manual', label: '매뉴얼' },
  { key: 'qna', label: 'QnA' },
];

function HighlightText({ text, keyword, style, numberOfLines, onTextLayout }: {
  text: string; keyword: string; style?: any; numberOfLines?: number; onTextLayout?: (e: any) => void;
}) {
  if (!keyword.trim()) {
    return <Text style={style} numberOfLines={numberOfLines} onTextLayout={onTextLayout}>{text}</Text>;
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <Text style={style} numberOfLines={numberOfLines} onTextLayout={onTextLayout}>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <Text key={i} style={{ backgroundColor: '#FFE566' }}>{part}</Text>
          : part
      )}
    </Text>
  );
}

function AiChatFabIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path d="M10.5306 26.6595C13.0748 27.9646 16.0013 28.3181 18.783 27.6563C21.5647 26.9945 24.0185 25.361 25.7024 23.0501C27.3862 20.7391 28.1893 17.9028 27.9669 15.0521C27.7445 12.2014 26.5113 9.52395 24.4894 7.50211C22.4676 5.48026 19.7901 4.24703 16.9394 4.02464C14.0888 3.80225 11.2524 4.60533 8.94148 6.28916C6.63054 7.97299 4.997 10.4268 4.33521 13.2085C3.67343 15.9902 4.02692 18.9168 5.33199 21.4609L2.66602 29.3255L10.5306 26.6595Z" stroke="white" strokeWidth="2.66598" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10.6638 15.9961H10.6771" stroke="white" strokeWidth="2.66598" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M15.9958 15.9961H16.0092" stroke="white" strokeWidth="2.66598" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21.3279 15.9961H21.3412" stroke="white" strokeWidth="2.66598" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function ManualIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M7.99963 4.66602V13.9989" stroke="#678720" strokeWidth="1.33327" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M1.99989 11.9996C1.82309 11.9996 1.65352 11.9293 1.52851 11.8043C1.40349 11.6793 1.33325 11.5097 1.33325 11.3329V2.66664C1.33325 2.48983 1.40349 2.32027 1.52851 2.19525C1.65352 2.07023 1.82309 2 1.99989 2H5.33308C6.04029 2 6.71854 2.28094 7.21861 2.78101C7.71869 3.28109 7.99963 3.95934 7.99963 4.66655C7.99963 3.95934 8.28057 3.28109 8.78064 2.78101C9.28072 2.28094 9.95896 2 10.6662 2H13.9994C14.1762 2 14.3457 2.07023 14.4707 2.19525C14.5958 2.32027 14.666 2.48983 14.666 2.66664V11.3329C14.666 11.5097 14.5958 11.6793 14.4707 11.8043C14.3457 11.9293 14.1762 11.9996 13.9994 11.9996H9.99954C9.46913 11.9996 8.96044 12.2103 8.58539 12.5853C8.21033 12.9604 7.99963 13.4691 7.99963 13.9995C7.99963 13.4691 7.78892 12.9604 7.41387 12.5853C7.03881 12.2103 6.53012 11.9996 5.99971 11.9996H1.99989Z" stroke="#678720" strokeWidth="1.33327" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function QnaIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M5.26641 13.3332C6.53874 13.9859 8.00235 14.1627 9.39349 13.8317C10.7846 13.5007 12.0118 12.6838 12.8539 11.5281C13.696 10.3723 14.0976 8.95386 13.9864 7.52822C13.8752 6.10259 13.2585 4.76355 12.2473 3.75241C11.2362 2.74127 9.89714 2.12452 8.4715 2.0133C7.04586 1.90208 5.62738 2.30371 4.47166 3.1458C3.31594 3.9879 2.499 5.21509 2.16803 6.60623C1.83707 7.99737 2.01385 9.46098 2.66653 10.7333L1.33325 14.6665L5.26641 13.3332Z" stroke="#678720" strokeWidth="1.33327" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function ResultCard({ item, keyword, accessToken, onPress }: {
  item: SearchResult; keyword: string; accessToken: string | null; onPress: () => void
}) {
  const [titleLines, setTitleLines] = useState(2);
  const [scrapped, setScrapped] = useState(item.scrapped ?? false);
  const [scrapCount, setScrapCount] = useState(item.scrapCount ?? 0);

  useEffect(() => { setScrapped(item.scrapped ?? false); }, [item.scrapped]);
  useEffect(() => { setScrapCount(item.scrapCount ?? 0); }, [item.scrapCount]);

  const handleScrap = async () => {
    if (!accessToken) return;
    const url = item.type === 'manual'
      ? `${API_BASE}/manual/articles/${item.id}/scrap`
      : `${API_BASE}/qna/${item.id}/scrap`;
    try {
      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setScrapped(data.scrapped);
      setScrapCount(prev => prev + (data.scrapped ? 1 : -1));
    } catch {}
  };

  return (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.resultTopRow}>
        <View style={item.type === 'qna' ? styles.tagQna : styles.tagManual}>
          {item.type === 'qna' ? <QnaIcon /> : <ManualIcon />}
          <Text style={item.type === 'qna' ? styles.tagTextQna : styles.tagTextManual}>
            {item.type === 'qna' ? 'QnA' : '매뉴얼'}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleScrap} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={scrapped ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={scrapped ? '#3C6802' : '#9CAF88'}
          />
        </TouchableOpacity>
        {scrapCount > 0 && (
          <Text style={styles.scrapCount}>{scrapCount}</Text>
        )}
      </View>
      <HighlightText
        text={item.question}
        keyword={keyword}
        style={styles.resultTitle}
        numberOfLines={2}
        onTextLayout={(e) => setTitleLines(e.nativeEvent.lines.length)}
      />
      {item.summary ? (
        <HighlightText
          text={item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
          keyword={keyword}
          style={styles.resultDesc}
          numberOfLines={titleLines >= 2 ? 1 : 2}
        />
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

  const isSearchingRef = useRef(false);
  const searchQueryRef = useRef('');

  const swipeBackPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        gs.dx > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2.5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 80) handleClearSearch();
      },
    })
  ).current;

  const runSearch = useCallback(async (q: string) => {
    setSearchLoading(true);
    const encoded = encodeURIComponent(q.trim());
    const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    try {
      const [manualData, qnaData] = await Promise.all([
        fetch(`${API_BASE}/manual/search?q=${encoded}`, authHeaders ? { headers: authHeaders } : undefined).then(r => r.json()),
        fetch(`${API_BASE}/qna/search?q=${encoded}`, authHeaders ? { headers: authHeaders } : undefined).then(r => r.json()),
      ]);
      const manualResults: SearchResult[] = (Array.isArray(manualData) ? manualData : []).map((item: any) => ({
        ...item, type: 'manual' as const,
      }));
      const qnaResults: SearchResult[] = (Array.isArray(qnaData) ? qnaData : []).map((item: any) => ({
        id: item.id,
        type: 'qna' as const,
        question: item.title,
        summary: null,
        category: { name: item.category, slug: item.category },
        scrapped: item.scrapped,
      }));
      const combined = [...manualResults, ...qnaResults];

      if (accessToken && combined.length > 0) {
        const scrapStates = await Promise.all(
          combined.map(item => {
            const url = item.type === 'manual'
              ? `${API_BASE}/manual/articles/${item.id}/scrap`
              : `${API_BASE}/qna/${item.id}/scrap`;
            return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
              .then(r => r.json())
              .then(data => ({ scrapped: data.scrapped ?? false, count: data.count ?? 0 }))
              .catch(() => ({ scrapped: item.scrapped ?? false, count: item.scrapCount ?? 0 }));
          })
        );
        setSearchResults(combined.map((item, i) => ({ ...item, scrapped: scrapStates[i].scrapped, scrapCount: scrapStates[i].count })));
      } else {
        setSearchResults(combined);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/notifications/unread-count`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setHasNotification((data.count ?? 0) > 0))
      .catch(() => {});

    // 상세 페이지에서 스크랩 후 돌아왔을 때 스크랩 수 갱신
    if (isSearchingRef.current && searchQueryRef.current) {
      runSearch(searchQueryRef.current);
    }
  }, [accessToken, runSearch]));

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    isSearchingRef.current = true;
    searchQueryRef.current = searchQuery.trim();
    setIsSearching(true);
    setActiveTab('all');
    runSearch(searchQuery);
  };

  const handleClearSearch = () => {
    isSearchingRef.current = false;
    searchQueryRef.current = '';
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    setActiveTab('all');
  };

  const filteredResults = activeTab === 'all'
    ? searchResults
    : searchResults.filter(r => r.type === activeTab);

  // ── 검색 결과 화면 ──
  if (isSearching) {
    return (
      <SafeAreaView style={styles.container} edges={['top']} {...swipeBackPan.panHandlers}>
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={handleClearSearch} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#586144" />
          </TouchableOpacity>
          <Text style={styles.searchResultTitle} numberOfLines={1}>
            '{searchQuery}'에 대한 검색결과
          </Text>
        </View>

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.resultContainer}
        >
          {searchLoading ? (
            <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={40} color="#CCD9BA" />
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            </View>
          ) : (
            <View style={styles.resultList}>
              {filteredResults.map((item) => (
                <ResultCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  keyword={searchQuery}
                  accessToken={accessToken}
                  onPress={() => item.type === 'qna'
                    ? router.push(`/qna/${item.id}`)
                    : router.push(`/manual-detail?articleId=${item.id}`)
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 홈 메인 화면 ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color="#586144" />
            {hasNotification && <View style={styles.notiBadge} />}
          </TouchableOpacity>
        </View>

        <View style={styles.decorCircle} />

        <View style={styles.searchArea}>
          <View style={styles.searchBox}>
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
              <Ionicons name="search" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.searchExample}>ex) 알바비 미지급</Text>
      </ScrollView>

      <TouchableOpacity style={styles.aiFab} onPress={() => router.push('/ai-chat' as any)} activeOpacity={0.85}>
        <AiChatFabIcon />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },

  decorCircle: {
    width: 140,
    height: 140,
    borderRadius: 9999,
    backgroundColor: '#DFEDBE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 28,
  },

  searchArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  searchBox: {
    flex: 1,
    height: 59,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  searchBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#CCD9BA' },
  searchExample: { fontSize: 12, color: '#9CAF88', marginBottom: 24, marginLeft: 24 },

  // 검색 결과 화면
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  backBtn: { padding: 4 },
  searchResultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 32,
    letterSpacing: 0.07,
    flex: 1,
  },

  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 9999,
    borderWidth: 1.544,
    borderColor: '#CCD9BA',
    padding: 4,
    gap: 8,
    height: 51,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  filterTab: { flex: 1, borderRadius: 9999, justifyContent: 'center', alignItems: 'center' },
  filterTabActive: { backgroundColor: '#B2D36E' },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#9CAF88' },
  filterTabTextActive: { color: '#fff' },

  resultContainer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 4 },
  resultList: { gap: 12 },
  resultCard: {
    padding: 17.5,
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  resultTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, width: '100%' },
  tagManual: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDF5E1', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  tagTextManual: { fontSize: 11, fontWeight: '600', color: '#678720' },
  tagQna: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDF5E1', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  tagTextQna: { fontSize: 11, fontWeight: '600', color: '#678720' },
  scrapCount: { fontSize: 12, color: '#9CAF88', marginLeft: 3 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439, marginBottom: 4 },
  resultDesc: { fontSize: 14, fontWeight: '400', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },

  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#9CAF88', marginTop: 12 },

  aiFab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 9999,
    backgroundColor: '#586144',
    justifyContent: 'center', alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
});
