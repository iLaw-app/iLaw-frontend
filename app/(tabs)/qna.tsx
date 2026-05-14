import { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/auth';

function AnsweredChatIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
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
  author: { nickname: string | null };
};

function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '오늘 작성';
  return `${days}일 전 작성`;
}

function QnaCard({ item, onPress }: { item: QnAPost; onPress: () => void }) {
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
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      {item.content ? <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text> : null}
      <View style={styles.cardDivider} />
      <View style={styles.cardMeta}>
        <Ionicons name="time-outline" size={12} color="#9CAF88" />
        <Text style={styles.metaText}>{daysAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function QnaPage() {
  const router = useRouter();
  const { role, accessToken } = useAuth();
  const [posts, setPosts] = useState<QnAPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const options = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
    fetch(`${API_BASE}/qna`, options)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (role === 'lawyer') {
    const pendingPosts = posts.filter(p => p.status === 'pending');
    const answeredPosts = posts.filter(p => p.status !== 'pending');

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>QnA 답변 관리</Text>
          <Text style={styles.headerSub}>학생들의 질문에 답변해주세요</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lawyerList}>
            <View style={styles.sectionRow}>
              <Ionicons name="time-outline" size={18} color="#C10007" />
              <Text style={[styles.sectionTitle, { color: '#C10007' }]}>답변 대기 중 ({pendingPosts.length})</Text>
            </View>
            {pendingPosts.length === 0
              ? <Text style={styles.sectionEmpty}>대기 중인 질문이 없습니다</Text>
              : <View style={styles.sectionList}>
                  {pendingPosts.map(item => <QnaCard key={item.id} item={item} onPress={() => router.push(`/qna/${item.id}`)} />)}
                </View>
            }

            <View style={[styles.sectionRow, { marginTop: 24 }]}>
              <AnsweredChatIcon />
              <Text style={[styles.sectionTitle, { color: '#2B56B5' }]}>답변 완료 ({answeredPosts.length})</Text>
            </View>
            {answeredPosts.length === 0
              ? <Text style={styles.sectionEmpty}>완료된 답변이 없습니다</Text>
              : <View style={styles.sectionList}>
                  {answeredPosts.map(item => <QnaCard key={item.id} item={item} onPress={() => router.push(`/qna/${item.id}`)} />)}
                </View>
            }
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QnA</Text>
        <Text style={styles.headerSub}>변호사님이 직접 답변해 드립니다</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => router.push(`/qna/${item.id}`)}>
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
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              {item.content ? <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text> : null}
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={12} color="#9CAF88" />
                  <Text style={styles.metaText}>{item.author.nickname ?? '익명'}</Text>
                </View>
                <Text style={styles.metaDot}>·</Text>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color="#9CAF88" />
                  <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</Text>
                </View>
              </View>
            </TouchableOpacity>
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
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#9CAF88', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.544,
    borderColor: '#CCD9BA',
    padding: 16,
    minHeight: 170,
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

  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#9CAF88' },
  metaDot: { fontSize: 12, color: '#9CAF88' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#B2D36E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88' },

  lawyerList: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', lineHeight: 28, letterSpacing: -0.449 },
  sectionEmpty: { fontSize: 14, color: '#9CAF88', paddingLeft: 4, marginBottom: 12 },
  sectionList: { gap: 12, marginBottom: 8 },
  cardDivider: { height: 0.678, backgroundColor: '#F3F4F6', marginTop: 6, marginBottom: 2 },
});
