import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
import { useAuth } from './context/auth';
import { BottomNav } from '../components/BottomNav';

function ClockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <G clipPath="url(#clip_scraps_clock)">
        <Path d="M5.99622 10.9937C8.7559 10.9937 10.9931 8.75651 10.9931 5.99683C10.9931 3.23716 8.7559 1 5.99622 1C3.23655 1 0.99939 3.23716 0.99939 5.99683C0.99939 8.75651 3.23655 10.9937 5.99622 10.9937Z" stroke="#586144" strokeWidth="0.999367" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M5.99622 2.99805V5.99615L7.99495 6.99551" stroke="#586144" strokeWidth="0.999367" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
      <Defs>
        <ClipPath id="clip_scraps_clock">
          <Rect width="11.9924" height="11.9924" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}

const API_BASE = 'https://ilaw-backend.up.railway.app';

type ManualScrap = {
  id: number;
  question: string;
  summary: string | null;
  category: { name: string; slug: string };
  scrapCount?: number;
};

type QnaScrap = {
  id: number;
  title: string;
  content?: string;
  status: string;
  category?: string;
  scrapCount?: number;
  createdAt?: string;
  author?: { nickname: string | null };
};

type CommunityScrap = {
  id: number;
  title: string;
  content?: string;
  nickname: string;
  createdAt?: string;
  bookmarks?: number;
};

type Tab = 'manual' | 'qna' | 'community';

export default function MyScrapsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [manualItems, setManualItems] = useState<ManualScrap[]>([]);
  const [qnaItems, setQnaItems] = useState<QnaScrap[]>([]);
  const [communityItems, setCommunityItems] = useState<CommunityScrap[]>([]);
  const [loadingManual, setLoadingManual] = useState(true);
  const [loadingQna, setLoadingQna] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  const fetchManual = useCallback(() => {
    if (!accessToken) { setLoadingManual(false); return; }
    setLoadingManual(true);
    fetch(`${API_BASE}/manual/my-scraps`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setManualItems(Array.isArray(data) ? data : []))
      .catch(() => setManualItems([]))
      .finally(() => setLoadingManual(false));
  }, [accessToken]);

  const fetchQna = useCallback(() => {
    if (!accessToken) { setLoadingQna(false); return; }
    setLoadingQna(true);
    fetch(`${API_BASE}/qa/my-scraps`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setQnaItems(Array.isArray(data) ? data : []))
      .catch(() => setQnaItems([]))
      .finally(() => setLoadingQna(false));
  }, [accessToken]);

  const fetchCommunity = useCallback(() => {
    if (!accessToken) { setLoadingCommunity(false); return; }
    setLoadingCommunity(true);
    fetch(`${API_BASE}/community/my-bookmarks`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setCommunityItems(Array.isArray(data) ? data : []))
      .catch(() => setCommunityItems([]))
      .finally(() => setLoadingCommunity(false));
  }, [accessToken]);

  // 탭 전환 시에만 해당 탭 로드 (lazy load)
  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;
    setLoadedTabs(prev => new Set(prev).add(activeTab));
    if (activeTab === 'manual') fetchManual();
    else if (activeTab === 'qna') fetchQna();
    else fetchCommunity();
  }, [activeTab, accessToken]);

  const loading = activeTab === 'manual' ? loadingManual : activeTab === 'qna' ? loadingQna : loadingCommunity;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
          <Text style={styles.headerTitle}>내 스크랩</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'manual' && styles.tabBtnActive]}
          onPress={() => setActiveTab('manual')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'manual' && styles.tabBtnTextActive]}>매뉴얼</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'qna' && styles.tabBtnActive]}
          onPress={() => setActiveTab('qna')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'qna' && styles.tabBtnTextActive]}>Q&A</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'community' && styles.tabBtnActive]}
          onPress={() => setActiveTab('community')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'community' && styles.tabBtnTextActive]}>커뮤니티</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
        ) : activeTab === 'manual' ? (
          <FlatList
            key="manual"
            data={manualItems}
            keyExtractor={item => `m-${item.id}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/manual-detail?articleId=${item.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.manualCardTop}>
                  <View style={styles.badge}>
                    <Ionicons name="book-outline" size={11} color="#3C6802" />
                    <Text style={styles.badgeText}>{item.category.name}</Text>
                  </View>
                  <View style={styles.scrapRight}>
                    <Ionicons name="bookmark-outline" size={12} color="#586144" />
                    <Text style={styles.scrapRightText}>{item.scrapCount ?? 0}</Text>
                  </View>
                </View>
                <Text style={styles.manualCardTitle} numberOfLines={2}>{item.question}</Text>
                {item.summary ? (
                  <Text style={styles.cardSummary} numberOfLines={2}>
                    {item.summary.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
        ) : activeTab === 'qna' ? (
          <FlatList
            key="qna"
            data={qnaItems}
            keyExtractor={item => `q-${item.id}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.qnaCard}
                onPress={() => router.push(`/qna/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.qnaStatusBadge, item.status === 'answered' ? styles.qnaStatusAnswered : styles.qnaStatusPending]}>
                  <Text style={[styles.qnaStatusText, item.status === 'answered' ? styles.qnaStatusTextAnswered : styles.qnaStatusTextPending]}>
                    {item.status === 'answered' ? '답변완료' : '답변대기'}
                  </Text>
                </View>
                <View style={styles.qnaBadgeRow}>
                  <View style={styles.qnaBadge}>
                    <Text style={styles.qnaBadgeText}>{item.category ?? 'Q&A'}</Text>
                  </View>
                </View>
                <Text style={styles.qnaCardTitle}>{item.title}</Text>
                {item.content ? <Text style={styles.qnaCardContent} numberOfLines={2}>{item.content}</Text> : null}
                <View style={styles.qnaCardMeta}>
                  <View style={styles.qnaMetaLeft}>
                    <Ionicons name="chatbubble-outline" size={12} color="#586144" />
                    <Text style={styles.qnaMetaText}>{item.author?.nickname ?? '익명'}</Text>
                    <Text style={styles.qnaMetaDot}>•</Text>
                    <Ionicons name="time-outline" size={12} color="#586144" />
                    <Text style={styles.qnaMetaText}>{item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : ''}</Text>
                  </View>
                  <View style={styles.qnaMetaRight}>
                    <Ionicons name="bookmark-outline" size={12} color="#586144" />
                    <Text style={styles.qnaMetaText}>{item.scrapCount ?? 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            key="community"
            data={communityItems}
            keyExtractor={item => `c-${item.id}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/community/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.communityCardTitle} numberOfLines={2}>{item.title}</Text>
                {item.content ? (
                  <Text style={styles.communityCardContent} numberOfLines={2}>{item.content}</Text>
                ) : null}
                <View style={styles.communityCardMeta}>
                  <View style={styles.communityCardDateRow}>
                    <ClockIcon />
                    <Text style={styles.communityCardDate}>
                      {item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : ''}
                    </Text>
                  </View>
                  <View style={styles.communityCardScrap}>
                    <Ionicons name="bookmark-outline" size={12} color="#586144" />
                    <Text style={styles.communityCardScrapText}>{item.bookmarks ?? 0}</Text>
                  </View>
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

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="bookmark-outline" size={40} color="#CCD9BA" />
      <Text style={styles.emptyText}>스크랩한 콘텐츠가 없습니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#586144' },

  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 9999,
    borderWidth: 1.356,
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
  tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 9999 },
  tabBtnActive: { backgroundColor: '#B2D36E' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#9CAF88' },
  tabBtnTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  manualCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EDF5E1', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },
  scrapRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scrapRightText: { fontSize: 12, color: '#586144' },
  manualCardTitle: {
    fontSize: 18, fontWeight: '700', color: '#586144',
    lineHeight: 27, letterSpacing: -0.439,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#586144', lineHeight: 22 },
  cardSummary: { fontSize: 13, color: '#9CAF88', lineHeight: 20 },

  communityCardTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439 },
  communityCardContent: { fontSize: 14, fontWeight: '500', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  communityCardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  communityCardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  communityCardDate: { fontSize: 12, fontWeight: '500', color: '#586144', lineHeight: 16 },
  communityCardScrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  communityCardScrapText: { fontSize: 12, fontWeight: '500', color: '#586144', lineHeight: 16 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },

  qnaCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  qnaStatusBadge: { position: 'absolute', top: 16, right: 16, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 },
  qnaStatusAnswered: { backgroundColor: '#E9F3FF' },
  qnaStatusPending: { backgroundColor: '#FEF2F2' },
  qnaStatusText: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  qnaStatusTextAnswered: { color: '#2B56B5' },
  qnaStatusTextPending: { color: '#C10007' },
  qnaBadgeRow: { flexDirection: 'row', marginBottom: 10, marginRight: 90 },
  qnaBadge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  qnaBadgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },
  qnaCardTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439, marginBottom: 6 },
  qnaCardContent: { fontSize: 14, fontWeight: '400', color: '#586144', lineHeight: 20, letterSpacing: -0.15, marginBottom: 8 },
  qnaCardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qnaMetaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qnaMetaRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qnaMetaText: { fontSize: 12, color: '#586144' },
  qnaMetaDot: { fontSize: 12, color: '#586144' },
});
