import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, PanResponder, BackHandler, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, ClipPath, Rect, Defs, Ellipse } from 'react-native-svg';
import { useAuth } from '../context/auth';
import * as SecureStore from 'expo-secure-store';
import { useTutorial } from '../../contexts/tutorial';
import { cacheGet, cacheSet } from '../../utils/cache';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type TabType = 'all' | 'manual' | 'qna' | 'community';

type SearchResult = {
  id: number;
  type: 'manual' | 'qna' | 'community';
  question: string;
  summary: string | null;
  category: { name: string; slug: string } | null;
  scrapCount?: number;
  scrapped?: boolean;
};

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'manual', label: '매뉴얼' },
  { key: 'qna', label: 'Q&A' },
  { key: 'community', label: '커뮤니티' },
];

function HighlightText({ text, keywords, style, numberOfLines, onTextLayout }: {
  text: string; keywords: string[]; style?: any; numberOfLines?: number; onTextLayout?: (e: any) => void;
}) {
  const active = keywords.map(k => k.trim()).filter(k => k);
  if (active.length === 0) {
    return <Text style={style} numberOfLines={numberOfLines} onTextLayout={onTextLayout}>{text}</Text>;
  }
  const escaped = active.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return (
    <Text style={style} numberOfLines={numberOfLines} onTextLayout={onTextLayout}>
      {parts.map((part, i) =>
        active.some(k => part.toLowerCase() === k.toLowerCase())
          ? <Text key={i} style={{ backgroundColor: '#E0E0E0' }}>{part}</Text>
          : part
      )}
    </Text>
  );
}

type PopularItem = {
  type: 'manual' | 'qna' | 'community';
  id: number;
  label: string;
  category: string;
  scrapCount: number;
};

function ManualIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M9.99805 1.33301H3.99921C3.64566 1.33301 3.30659 1.47346 3.05659 1.72346C2.80659 1.97346 2.66614 2.31253 2.66614 2.66608V13.3307C2.66614 13.6842 2.80659 14.0233 3.05659 14.2733C3.30659 14.5233 3.64566 14.6638 3.99921 14.6638H11.9977C12.3512 14.6638 12.6903 14.5233 12.9403 14.2733C13.1903 14.0233 13.3307 13.6842 13.3307 13.3307V4.6657L9.99805 1.33301Z" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9.33151 1.33301V3.99916C9.33151 4.35271 9.47196 4.69178 9.72196 4.94178C9.97196 5.19178 10.311 5.33223 10.6646 5.33223H13.3307" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6.66538 5.99902H5.33231" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10.6646 8.66504H5.33231" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10.6646 11.3311H5.33231" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function BookIcon() {
  return (
    <Svg width={15} height={20} viewBox="0 0 15 19.9931" fill="none">
      <G clipPath="url(#book_clip)">
        <Path d="M7.5 5.83105V17.4937" stroke="#678720" strokeWidth="1.66609" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M1.875 14.9947C1.70924 14.9947 1.55027 14.9069 1.43306 14.7507C1.31585 14.5945 1.25 14.3826 1.25 14.1617V3.33207C1.25 3.11113 1.31585 2.89924 1.43306 2.74302C1.55027 2.58679 1.70924 2.49902 1.875 2.49902H5.00001C5.66305 2.49902 6.29893 2.85009 6.76777 3.475C7.23662 4.0999 7.50001 4.94746 7.50001 5.83121C7.50001 4.94746 7.7634 4.0999 8.23224 3.475C8.70108 2.85009 9.33697 2.49902 10 2.49902H13.125C13.2908 2.49902 13.4497 2.58679 13.567 2.74302C13.6842 2.89924 13.75 3.11113 13.75 3.33207V14.1617C13.75 14.3826 13.6842 14.5945 13.567 14.7507C13.4497 14.9069 13.2908 14.9947 13.125 14.9947H9.37501C8.87773 14.9947 8.40081 15.258 8.04918 15.7267C7.69755 16.1954 7.50001 16.831 7.50001 17.4938C7.50001 16.831 7.30246 16.1954 6.95083 15.7267C6.5992 15.258 6.12229 14.9947 5.62501 14.9947H1.875Z" stroke="#678720" strokeWidth="1.66609" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
      <Defs>
        <ClipPath id="book_clip">
          <Rect width="15" height="19.9931" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}

function QnaIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 16 16" fill="none">
      <Path d="M5.26641 13.3332C6.53874 13.9859 8.00235 14.1627 9.39349 13.8317C10.7846 13.5007 12.0118 12.6838 12.8539 11.5281C13.696 10.3723 14.0976 8.95386 13.9864 7.52822C13.8752 6.10259 13.2585 4.76355 12.2473 3.75241C11.2362 2.74127 9.89714 2.12452 8.4715 2.0133C7.04586 1.90208 5.62738 2.30371 4.47166 3.1458C3.31594 3.9879 2.499 5.21509 2.16803 6.60623C1.83707 7.99737 2.01385 9.46098 2.66653 10.7333L1.33325 14.6665L5.26641 13.3332Z" stroke="#678720" strokeWidth="1.33327" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function CommunityIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path d="M12.4937 1.66602H4.9975C4.55569 1.66602 4.13198 1.84152 3.81958 2.15393C3.50717 2.46633 3.33167 2.89004 3.33167 3.33185V16.6585C3.33167 17.1003 3.50717 17.524 3.81958 17.8364C4.13198 18.1488 4.55569 18.3244 4.9975 18.3244H14.9925C15.4343 18.3244 15.858 18.1488 16.1704 17.8364C16.4828 17.524 16.6583 17.1003 16.6583 16.6585V5.8306L12.4937 1.66602Z" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11.6608 1.66602V4.99768C11.6608 5.43949 11.8363 5.8632 12.1487 6.1756C12.4611 6.48801 12.8849 6.66352 13.3267 6.66352H16.6583" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8.32916 7.49609H6.66333" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M13.3267 10.8281H6.66333" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M13.3267 14.1592H6.66333" stroke="#678720" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function ResultCard({ item, keywords, onPress }: {
  item: SearchResult; keywords: string[]; onPress: () => void
}) {
  const [titleLines, setTitleLines] = useState(2);
  const [scrapped, setScrapped] = useState(item.scrapped ?? false);
  const [scrapCount, setScrapCount] = useState(item.scrapCount ?? 0);

  useEffect(() => { setScrapped(item.scrapped ?? false); }, [item.scrapped]);
  useEffect(() => { setScrapCount(item.scrapCount ?? 0); }, [item.scrapCount]);

  const tagIcon = item.type === 'qna' ? <QnaIcon /> : item.type === 'community' ? <CommunityIcon /> : <ManualIcon />;
  const tagLabel = item.type === 'qna' ? 'Q&A' : item.type === 'community' ? '커뮤니티' : '매뉴얼';
  const tagStyle = item.type === 'qna' ? styles.tagQna : styles.tagManual;
  const tagTextStyle = item.type === 'qna' ? styles.tagTextQna : styles.tagTextManual;

  return (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.resultTopRow}>
        <View style={tagStyle}>
          {tagIcon}
          <Text style={tagTextStyle}>{tagLabel}</Text>
        </View>
        <View style={{ flex: 1 }} />
        {/* 검색 결과에서는 스크랩 토글 불가 — 상태/개수만 표시 (커뮤니티 포함) */}
        <Ionicons
          name={scrapped ? 'bookmark' : 'bookmark-outline'}
          size={16}
          color={scrapped ? '#3C6802' : '#9CAF88'}
        />
        {scrapCount > 0 && (
          <Text style={styles.scrapCount}>{scrapCount}</Text>
        )}
      </View>
      <HighlightText
        text={item.question}
        keywords={keywords}
        style={styles.resultTitle}
        numberOfLines={2}
        onTextLayout={(e) => setTitleLines(e.nativeEvent.lines.length)}
      />
      {item.summary ? (
        <HighlightText
          text={item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
          keywords={keywords}
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
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [hasNotification, setHasNotification] = useState(false);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [winking, setWinking] = useState(false);

  const isSearchingRef = useRef(false);
  const searchQueryRef = useRef('');

  const navigation = useNavigation();
  const { show: showTutorial } = useTutorial();

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSearchingRef.current) {
        handleClearSearch();
        return true;
      }
      return true;
    });
    return () => handler.remove();
  }, []);

  // 홈 탭을 다시 누르면(이미 홈에 있어도) 검색 화면을 닫고 초기 화면으로 리셋
  useEffect(() => {
    const unsub = navigation.addListener('tabPress' as any, () => {
      if (isSearchingRef.current) handleClearSearch();
    });
    return unsub;
  }, [navigation]);

  // 홈 탭에 들어올 때마다 챗봇이 계속 윙크 (사진 → 윙크 → 사진 반복)
  useFocusEffect(useCallback(() => {
    let blinkTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setWinking(true);
      blinkTimer = setTimeout(() => setWinking(false), 220);
    }, 2200);
    return () => {
      clearInterval(interval);
      if (blinkTimer) clearTimeout(blinkTimer);
      setWinking(false);
    };
  }, []));

  useFocusEffect(useCallback(() => {
    // 웹: 신규 가입 시 onboarding에서 세팅한 pending 플래그가 있을 때만 튜토리얼 표시
    // 네이티브: SecureStore에 done 플래그 없으면 표시
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const done = localStorage.getItem('airo_tutorial_done');
      const pending = sessionStorage.getItem('airo_tutorial_pending');
      if (!done && pending) {
        sessionStorage.removeItem('airo_tutorial_pending');
        showTutorial();
      }
    } else {
      SecureStore.getItemAsync('airo_tutorial_done').then(done => {
        if (!done) showTutorial();
      });
    }
    const cachedPopular = cacheGet<PopularItem[]>('popular-home', 300_000);
    if (cachedPopular) { setPopularItems(cachedPopular); setPopularLoading(false); return; }
    setPopularLoading(true);
    fetch(`${API_BASE}/home/popular`)
      .then(r => r.json())
      .then(data => { const items = Array.isArray(data) ? data : []; cacheSet('popular-home', items); setPopularItems(items); })
      .catch(() => {})
      .finally(() => setPopularLoading(false));
  }, []));

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
      const [manualData, qnaData, communityData] = await Promise.all([
        fetch(`${API_BASE}/manual/search?q=${encoded}`, authHeaders ? { headers: authHeaders } : undefined).then(r => r.json()),
        fetch(`${API_BASE}/qa/search?q=${encoded}`, authHeaders ? { headers: authHeaders } : undefined).then(r => r.json()),
        fetch(`${API_BASE}/community/search?q=${encoded}`, authHeaders ? { headers: authHeaders } : undefined).then(r => r.json()).catch(() => []),
      ]);
      const mergedTerms = Array.from(new Set([
        ...(manualData.expandedTerms ?? []),
        ...(qnaData.expandedTerms ?? []),
      ]));
      setExpandedTerms(mergedTerms);
      const manualResults: SearchResult[] = (Array.isArray(manualData.results) ? manualData.results : []).map((item: any) => ({
        ...item, type: 'manual' as const,
      }));
      const qnaResults: SearchResult[] = (Array.isArray(qnaData.results) ? qnaData.results : []).map((item: any) => ({
        id: item.id,
        type: 'qna' as const,
        question: item.title,
        summary: item.content ? String(item.content).replace(/\*\*(.*?)\*\*/g, '$1') : null,
        category: { name: item.category, slug: item.category },
        scrapped: item.scrapped,
      }));
      const rawCommunity = Array.isArray(communityData) ? communityData : (Array.isArray(communityData?.results) ? communityData.results : []);
      const communityResults: SearchResult[] = rawCommunity.map((item: any) => ({
        id: item.id,
        type: 'community' as const,
        question: item.title,
        summary: item.content ? String(item.content).replace(/\*\*(.*?)\*\*/g, '$1').substring(0, 120) : null,
        category: null,
        scrapCount: item.bookmarks ?? 0,
      }));
      const combined = [...manualResults, ...qnaResults, ...communityResults];

      if (accessToken && combined.length > 0) {
        const scrapStates = await Promise.all(
          combined.map(item => {
            if (item.type === 'community') return Promise.resolve({ scrapped: false, count: item.scrapCount ?? 0 });
            const url = item.type === 'manual'
              ? `${API_BASE}/manual/articles/${item.id}/scrap`
              : `${API_BASE}/qa/${item.id}/scrap`;
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
    setExpandedTerms([]);
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
                  keywords={Array.from(new Set([searchQuery, ...expandedTerms]))}
                  onPress={() => {
                    if (item.type === 'qna') router.push(`/qna/${item.id}` as any);
                    else if (item.type === 'community') router.push(`/community/${item.id}` as any);
                    else router.push(`/manual-detail?articleId=${item.id}` as any);
                  }}
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
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#858D7A" />
            {hasNotification && <View style={styles.notiBadge} />}
          </TouchableOpacity>
          <Image source={require('../../assets/logo2.png')} style={styles.heroLogo} resizeMode="contain" />
        </View>
        <Text style={styles.mainTitle}>{"혼자 고민하지 않아도 괜찮아요\n아이로와 함께해요!"}</Text>

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

        <Text style={styles.recommendTitle}>인기 콘텐츠</Text>

        <View style={styles.recommendContainer}>
          {popularLoading ? (
            <ActivityIndicator color="#3C6802" style={{ marginVertical: 32 }} />
          ) : popularItems.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#9CAF88', paddingVertical: 32, fontSize: 14 }}>
              아직 인기 콘텐츠가 없어요
            </Text>
          ) : (
            popularItems.slice(0, 3).map((item, index, arr) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={[styles.recommendItem, index === arr.length - 1 && styles.recommendItemLast]}
                activeOpacity={0.7}
                onPress={() => item.type === 'qna'
                  ? router.push(`/qna/${item.id}` as any)
                  : item.type === 'community'
                    ? router.push(`/community/${item.id}` as any)
                    : router.push(`/manual-detail?articleId=${item.id}` as any)
                }
              >
                <Text style={styles.recommendNum}>{index + 1}</Text>
                <View style={styles.recommendContent}>
                  <View style={styles.recommendMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {item.type === 'qna' ? <QnaIcon /> : item.type === 'community' ? <CommunityIcon /> : <BookIcon />}
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.recommendLabel} numberOfLines={1}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.speechBubbleWrapper, Platform.OS === 'web' && { shadowOpacity: 0, elevation: 0 } as any]}>
        <Svg
          width={115} height={74} viewBox="0 0 95 60"
          style={Platform.OS === 'web' ? { filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.25))' } as any : undefined}
        >
          <Ellipse cx={46.5} cy={25} rx={45.5} ry={25} fill="white" />
          <Path d="M84.5596 54.0391L64.9844 40.0523L82.2344 30.093L84.5596 54.0391Z" fill="white" />
        </Svg>
        <View style={styles.speechBubbleTextArea}>
          <Text style={styles.speechBubbleText}>{"챗봇 '아이로'에게\n물어보세요!"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.aiFab} onPress={() => router.push('/ai-chat' as any)} activeOpacity={0.9}>
        {/* 평소엔 기본 이미지, 윙크할 때만 살짝 작고 그림자 있는 wink 이미지로 */}
        <Image
          source={require('../../assets/chatbot_logo.png')}
          style={[styles.aiFabImage, winking && { opacity: 0 }]}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/wink.png')}
          style={[
            styles.aiFabWinkImage,
            Platform.OS === 'web' && ({ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.18))' } as any),
            !winking && { opacity: 0 },
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  bellBtn: {
    position: 'absolute',
    top: 8,
    right: 20,
    width: 48, height: 48, borderRadius: 9999,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.544, borderColor: '#CCD9BA',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },

  bellRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  heroLogo: { width: 134, height: 134, marginBottom: 0 },
  mainTitle: { fontSize: 18, fontWeight: '400', color: '#586144', lineHeight: 32, letterSpacing: 0.07, textAlign: 'center', fontFamily: 'AiroFont', paddingHorizontal: 20, marginTop: -8, marginBottom: 12 },

  recommendTitle: {
    fontSize: 18, fontWeight: '700', color: '#586144',
    lineHeight: 30, letterSpacing: -0.449,
    marginHorizontal: 20, marginTop: 8, marginBottom: 8,
  },
  recommendContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.356, borderColor: '#FFF',
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
  },
  recommendItem: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 84.646, paddingHorizontal: 15.997, paddingVertical: 16, gap: 15.997,
    borderBottomWidth: 0.678, borderBottomColor: '#EEF8D9',
  },
  recommendItemLast: { borderBottomWidth: 0 },
  recommendNum: { fontSize: 16, fontWeight: '700', color: '#586144', width: 18, textAlign: 'center' },
  recommendContent: { flex: 1, gap: 4 },
  recommendMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scrapMeta: { fontSize: 12, fontWeight: '400', color: '#9CAF88', lineHeight: 16 },
  categoryBadge: {
    backgroundColor: '#EEF8D9', borderRadius: 9999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '600', color: '#678720' },
  recommendLabel: { fontSize: 16, fontWeight: '500', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },

  searchArea: { paddingHorizontal: 20, marginBottom: 4 },
  searchBox: {
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
  searchInput: { flex: 1, fontSize: 14, color: '#333', height: '100%', paddingVertical: 0, textAlignVertical: 'center' },
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
    position: 'absolute', right: 0, bottom: -8,
    width: 130, height: 130,
  },
  aiFabImage: { width: 130, height: 130 },
  // 윙크 이미지만 살짝 작게(118) + 130 박스 중앙에 두고 그림자
  aiFabWinkImage: {
    position: 'absolute', top: 6, left: 6,
    width: 118, height: 118,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 2, elevation: 3,
  },
  speechBubbleWrapper: {
    position: 'absolute',
    right: 116,
    bottom: 58,
    width: 115,
    height: 74,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },
  speechBubbleTextArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBubbleText: {
    color: '#8C937D',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.07,
    textAlign: 'center',
    fontFamily: 'AiroFont',
  },
});
