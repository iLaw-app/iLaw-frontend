import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, BackHandler, Keyboard, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/auth';
import { cacheGet, cacheSet } from '../../utils/cache';

function HighlightText({ text, keywords, style, numberOfLines }: { text: string; keywords: string[]; style?: any; numberOfLines?: number }) {
  const active = keywords.map(k => k.trim()).filter(k => k);
  if (active.length === 0) return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
  const escaped = active.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        active.some(k => part.toLowerCase() === k.toLowerCase())
          ? <Text key={i} style={{ backgroundColor: '#E0E0E0' }}>{part}</Text>
          : part
      )}
    </Text>
  );
}

function AnsweredChatIcon() {
  return (
    <Svg width={17} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.58042 16.6589C8.17017 17.4744 9.99892 17.6953 11.7371 17.2817C13.4753 16.8682 15.0087 15.8474 16.0609 14.4034C17.113 12.9594 17.6149 11.187 17.4759 9.40569C17.3369 7.62439 16.5663 5.95129 15.3029 4.68789C14.0395 3.42449 12.3664 2.65387 10.5851 2.51491C8.80381 2.37594 7.03144 2.87776 5.58739 3.92995C4.14335 4.98213 3.12259 6.51548 2.70905 8.25368C2.29552 9.99188 2.51641 11.8206 3.33192 13.4104L1.66602 18.3248L6.58042 16.6589Z"
        stroke="#2B56B5" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

const API_BASE = 'https://ilaw-backend.up.railway.app';

type QnAPost = {
  id: number;
  title: string;
  content?: string;
  category: string;
  status: string;
  createdAt: string;
  scrapCount?: number;
  author: { nickname: string | null };
};


function QnaCard({ item, onPress, keywords = [] }: { item: QnAPost; onPress: () => void; keywords?: string[] }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.statusBadge, item.status === 'answered' ? styles.statusAnswered : styles.statusPending]}>
        <Text style={[styles.statusText, item.status === 'answered' ? styles.statusTextAnswered : styles.statusTextPending]}>
          {item.status === 'answered' ? '답변완료' : '답변대기'}
        </Text>
      </View>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
      </View>
      <HighlightText text={item.title} keywords={keywords} style={[styles.cardTitle, { flexShrink: 1 }]} numberOfLines={2} />
      {item.content ? <HighlightText text={item.content} keywords={keywords} style={styles.cardContent} numberOfLines={2} /> : null}
      <View style={styles.cardMeta}>
        <View style={styles.metaLeft}>
          <Ionicons name="chatbubble-outline" size={12} color="#586144" />
          <Text style={styles.metaText}>{item.author.nickname ?? '익명'}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Ionicons name="time-outline" size={12} color="#586144" />
          <Text style={styles.metaText}>{new Date(item.createdAt).toISOString().slice(0, 10)}</Text>
        </View>
        <View style={styles.metaRight}>
          <Ionicons name="bookmark-outline" size={12} color="#586144" />
          <Text style={styles.metaText}>{item.scrapCount ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function QnaPage() {
  const router = useRouter();
  const { role, accessToken } = useAuth();
  const [posts, setPosts] = useState<QnAPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const navigation = useNavigation();

  const exitSearch = () => {
    isSearchingRef.current = false;
    setIsSearching(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) { exitSearch(); return; }
    isSearchingRef.current = true;
    setIsSearching(true);
    Keyboard.dismiss();
  };

  // 검색 중 왼쪽→오른쪽 스와이프하면 검색 전 화면으로 복귀
  const swipeBackPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        isSearchingRef.current && gs.dx > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2.5,
      onPanResponderRelease: (_, gs) => { if (gs.dx > 80) exitSearch(); },
    })
  ).current;

  // 검색 중에는 하드웨어 뒤로가기로 검색을 닫고 목록으로 돌아간다
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSearchingRef.current) { exitSearch(); return true; }
      return true;
    });
    return () => sub.remove();
  }, []));

  // Q&A 탭을 다시 누르면 검색을 닫고 첫 화면으로 리셋
  useEffect(() => {
    const unsub = navigation.addListener('tabPress' as any, () => {
      if (isSearchingRef.current) exitSearch();
    });
    return unsub;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const cacheKey = `qa-list-${accessToken ?? 'guest'}`;
      const cached = cacheGet<QnAPost[]>(cacheKey, 30_000);
      if (cached) { setPosts(cached); setLoadedOnce(true); setLoading(false); return; }
      if (!loadedOnce) setLoading(true);
      const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : null;
      const options = authHeaders ? { headers: authHeaders } : undefined;
      fetch(`${API_BASE}/qa`, options)
        .then(r => r.json())
        .then((data) => {
          if (cancelled) return;
          const list: QnAPost[] = Array.isArray(data) ? data : [];
          cacheSet(cacheKey, list);
          if (!cancelled) { setPosts(list); setLoadedOnce(true); }
        })
        .catch(() => { if (!cancelled) setPosts([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [accessToken, loadedOnce])
  );

  const filteredPosts = isSearching && searchQuery.trim()
    ? posts.filter(p => p.title.includes(searchQuery) || p.content?.includes(searchQuery) || p.category.includes(searchQuery))
    : posts;

  if (role === 'lawyer') {
    const pendingPosts = posts.filter(p => p.status === 'pending');
    const answeredPosts = posts.filter(p => p.status !== 'pending');

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Q&A 답변 관리</Text>
          <Text style={styles.headerSub}>아이들의 질문에 답변해주세요</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lawyerList}>
            <View style={styles.sectionBox}>
              <View style={styles.sectionRow}>
                <Ionicons name="time-outline" size={17} color="#C10007" style={{ width: 17, height: 16 }} />
                <Text style={[styles.sectionTitle, { color: '#C10007' }]}>답변 대기 중 ({pendingPosts.length})</Text>
              </View>
              {pendingPosts.length === 0
                ? <Text style={styles.sectionEmpty}>대기 중인 질문이 없습니다</Text>
                : <View style={styles.sectionList}>
                    {pendingPosts.map(item => <QnaCard key={item.id} item={item} onPress={() => router.push(`/qna/${item.id}`)} />)}
                  </View>
              }
            </View>

            <View style={styles.sectionBox}>
              <View style={styles.sectionRow}>
                <AnsweredChatIcon />
                <Text style={[styles.sectionTitle, { color: '#2B56B5' }]}>답변 완료 ({answeredPosts.length})</Text>
              </View>
              {answeredPosts.length === 0
                ? <Text style={styles.sectionEmpty}>완료된 답변이 없습니다</Text>
                : <View style={styles.sectionList}>
                    {answeredPosts.map(item => <QnaCard key={item.id} item={item} onPress={() => router.push(`/qna/${item.id}`)} />)}
                  </View>
              }
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} {...swipeBackPan.panHandlers}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Q&A</Text>
        <Text style={styles.headerSub}>변호사님이 직접 답변해 드립니다</Text>
      </View>

      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="키워드로 검색해보세요!"
            placeholderTextColor="#9CAF88"
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); if (!t.trim()) exitSearch(); }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {isSearching ? (
            <TouchableOpacity style={styles.searchBtn} onPress={exitSearch}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
              <Ionicons name="search" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View>
              <QnaCard item={item} onPress={() => router.push(`/qna/${item.id}`)} keywords={searchQuery.trim() ? [searchQuery] : []} />
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={40} color="#CCD9BA" />
              <Text style={styles.emptyText}>아직 등록된 질문이 없습니다</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/qna/ask')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  headerSub: { fontSize: 18, fontWeight: '300', color: '#586144', lineHeight: 28, letterSpacing: 0.07, marginTop: 2 },
  searchArea: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, borderRadius: 9999,
    borderWidth: 1.5, borderColor: '#CCD9BA',
    backgroundColor: '#FFF',
    paddingLeft: 20, paddingRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 8, elevation: 5,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', height: '100%', paddingVertical: 0, textAlignVertical: 'center' },
  searchBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#CCD9BA',
    justifyContent: 'center', alignItems: 'center',
  },

  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },

  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusAnswered: { backgroundColor: '#E9F3FF' },
  statusPending: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  statusTextAnswered: { color: '#2B56B5' },
  statusTextPending: { color: '#C10007' },

  badgeRow: { flexDirection: 'row', marginBottom: 10, marginRight: 90 },
  badge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 27,
    letterSpacing: -0.439,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    fontWeight: '400',
    color: '#586144',
    lineHeight: 20,
    letterSpacing: -0.15,
    marginBottom: 8,
  },

  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#586144' },
  metaDot: { fontSize: 12, color: '#586144' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#678720',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },

  lawyerList: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  sectionBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCD9BA',
    backgroundColor: '#FFF',
    padding: 16,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', lineHeight: 28, letterSpacing: -0.449 },
  sectionEmpty: { fontSize: 14, color: '#9CAF88', paddingLeft: 4, marginBottom: 12 },
  sectionList: { gap: 12, marginBottom: 8 },
  cardDivider: { height: 0.678, backgroundColor: '#F3F4F6', marginTop: 6, marginBottom: 2 },
});
