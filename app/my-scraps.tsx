import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';
import { BottomNav } from '../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type ManualScrap = {
  id: number;
  question: string;
  summary: string | null;
  category: { name: string; slug: string };
};

type QnaScrap = {
  id: number;
  title: string;
  content?: string;
  status: string;
  category?: { name: string };
  scrapCount?: number;
};

type CommunityScrap = {
  id: number;
  title: string;
  content?: string;
  nickname: string;
};

type Tab = 'manual' | 'qna' | 'community';

const STATUS_LABEL: Record<string, string> = {
  pending: '답변 대기',
  answered: '답변 완료',
  closed: '종료',
};

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
    fetch(`${API_BASE}/community/my-scraps`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setCommunityItems(Array.isArray(data) ? data : []))
      .catch(() => setCommunityItems([]))
      .finally(() => setLoadingCommunity(false));
  }, [accessToken]);

  useEffect(() => { fetchManual(); fetchQna(); fetchCommunity(); }, [fetchManual, fetchQna, fetchCommunity]);

  const loading = activeTab === 'manual' ? loadingManual : activeTab === 'qna' ? loadingQna : loadingCommunity;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
          <Text style={styles.headerTitle}>내 스크랩</Text>
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'manual' && styles.tabBtnActive]}
          onPress={() => setActiveTab('manual')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'manual' && styles.tabBtnTextActive]}>
            매뉴얼
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'qna' && styles.tabBtnActive]}
          onPress={() => setActiveTab('qna')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'qna' && styles.tabBtnTextActive]}>
            Q&A
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'community' && styles.tabBtnActive]}
          onPress={() => setActiveTab('community')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'community' && styles.tabBtnTextActive]}>
            커뮤니티
          </Text>
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
                <View style={styles.cardTop}>
                  <View style={styles.badge}>
                    <Ionicons name="book-outline" size={11} color="#3C6802" />
                    <Text style={styles.badgeText}>{item.category.name}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.question}</Text>
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
                style={styles.card}
                onPress={() => router.push(`/qna/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={styles.badge}>
                    <Ionicons name="chatbubbles-outline" size={11} color="#3C6802" />
                    <Text style={styles.badgeText}>
                      {item.category?.name ?? 'Q&A'}
                    </Text>
                  </View>
                  {item.status ? (
                    <View style={[styles.statusBadge, item.status === 'answered' && styles.statusBadgeAnswered]}>
                      <Text style={[styles.statusText, item.status === 'answered' && styles.statusTextAnswered]}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {item.content ? (
                  <Text style={styles.cardSummary} numberOfLines={2}>{item.content}</Text>
                ) : null}
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
                <View style={styles.cardTop}>
                  <View style={styles.badge}>
                    <Ionicons name="people-outline" size={11} color="#3C6802" />
                    <Text style={styles.badgeText}>커뮤니티</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {item.content ? (
                  <Text style={styles.cardSummary} numberOfLines={2}>{item.content}</Text>
                ) : null}
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
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
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
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EDF5E1', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeText: { fontSize: 11, color: '#3C6802', fontWeight: '600' },
  statusBadge: {
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    backgroundColor: '#FFF3F3',
  },
  statusBadgeAnswered: { backgroundColor: '#EDF5E1' },
  statusText: { fontSize: 11, color: '#C10007', fontWeight: '600' },
  statusTextAnswered: { color: '#3C6802' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', lineHeight: 22 },
  cardSummary: { fontSize: 13, color: '#9CAF88', lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
