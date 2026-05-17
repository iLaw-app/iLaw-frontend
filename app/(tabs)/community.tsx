import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Rect, Defs, ClipPath } from 'react-native-svg';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

function ThumbsUpIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 19 19" fill="none">
      <Path
        d="M11.6614 4.06485L10.8284 7.49661H15.6845C15.9431 7.49661 16.1982 7.55682 16.4295 7.67248C16.6608 7.78814 16.8621 7.95607 17.0172 8.16297C17.1724 8.36987 17.2773 8.61005 17.3235 8.8645C17.3698 9.11895 17.3562 9.38068 17.2838 9.62896L15.343 16.2926C15.2421 16.6386 15.0316 16.9426 14.7433 17.1588C14.4549 17.3751 14.1042 17.492 13.7437 17.492H2.49891C2.05708 17.492 1.63336 17.3165 1.32094 17.0041C1.00852 16.6917 0.833008 16.2679 0.833008 15.8261V9.16251C0.833008 8.72068 1.00852 8.29696 1.32094 7.98454C1.63336 7.67212 2.05708 7.49661 2.49891 7.49661H4.79785C5.10778 7.49644 5.41151 7.40982 5.67491 7.24649C5.9383 7.08316 6.15091 6.84958 6.28883 6.57203L9.16251 0.833008C9.55531 0.837872 9.94193 0.931437 10.2935 1.10671C10.6451 1.28199 10.9525 1.53444 11.1927 1.84521C11.433 2.15598 11.6 2.51703 11.6811 2.90139C11.7623 3.28575 11.7555 3.68348 11.6614 4.06485Z"
        stroke="#9CAF88" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <G clipPath="url(#clip0)">
        <Path d="M11.875 13.125V11.875C11.875 11.212 11.6116 10.5761 11.1428 10.1072C10.6739 9.63839 10.038 9.375 9.375 9.375H5.625C4.96196 9.375 4.32607 9.63839 3.85723 10.1072C3.38839 10.5761 3.125 11.212 3.125 11.875V13.125" stroke="white" strokeWidth="3.33269" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7.5 6.875C8.88071 6.875 10 5.75571 10 4.375C10 2.99429 8.88071 1.875 7.5 1.875C6.11929 1.875 5 2.99429 5 4.375C5 5.75571 6.11929 6.875 7.5 6.875Z" stroke="white" strokeWidth="3.33269" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="15" height="15" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}

type PollOption = { label: string; votes: number };

type CommunityPost = {
  id: number;
  nickname: string;
  createdAt: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  poll?: { options: PollOption[]; total: number };
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return diffDays === 0 ? '오늘' : `${diffDays}일 전`;
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

function mapPoll(poll: any): { options: PollOption[]; total: number } | undefined {
  if (!poll?.options) return undefined;
  const options = poll.options as PollOption[];
  return { options, total: options.reduce((s, o) => s + o.votes, 0) };
}

function PollBar({ option, total }: { option: PollOption; total: number }) {
  const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
  return (
    <View style={ps.row}>
      <View style={ps.barBg}>
        <View style={[ps.barFill, { width: `${pct}%` }]} />
        <Text style={ps.barLabel}>{option.label}</Text>
      </View>
      <Text style={ps.pct}>{pct}%</Text>
    </View>
  );
}

function PostCard({ item, onPress }: { item: CommunityPost; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <PersonIcon />
          </View>
          <Text style={styles.nickname}>{item.nickname}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      {item.content ? (
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
      ) : null}

      {item.poll && (
        <View style={styles.poll}>
          {item.poll.options.map((opt) => (
            <PollBar key={opt.label} option={opt} total={item.poll!.total} />
          ))}
        </View>
      )}

      <View style={styles.cardBottom}>
        <View style={styles.metaItem}>
          <ThumbsUpIcon />
          <Text style={styles.metaText}>{item.likes}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="chatbubble-outline" size={14} color="#9CAF88" />
          <Text style={styles.metaText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function loadPosts() {
        setLoading(true);
        try {
          const headers: Record<string, string> = {};
          if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
          const res = await fetch(`${API_BASE}/community?limit=50`, { headers });
          if (res.ok && !cancelled) {
            const data = await res.json();
            setPosts(data.posts.map((p: any) => ({ ...p, poll: mapPoll(p.poll) })));
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      loadPosts();
      return () => { cancelled = true; };
    }, [accessToken])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <Text style={styles.headerSub}>정보 공유를 통해 함께 도움을 주고받아요</Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
          <Ionicons name="swap-vertical-outline" size={12} color="#586144" />
          <Text style={styles.sortText}>최신순</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#9CAF88" />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <PostCard item={item} onPress={() => router.push(`/community/${item.id}` as any)} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/community/write' as any)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg: {
    flex: 1, height: 34, borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: '#EFF4E1', borderRadius: 10,
  },
  barLabel: { fontSize: 13, color: '#586144', fontWeight: '500', marginLeft: 12, zIndex: 1 },
  pct: { fontSize: 13, color: '#586144', fontWeight: '600', width: 36, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: {
    height: 140,
    paddingTop: 19.991,
    paddingHorizontal: 19.991,
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3.994,
    flexShrink: 0,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  headerSub: { fontSize: 14, fontWeight: '400', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  sortBtn: {
    position: 'absolute', bottom: 16, right: 19.991,
    width: 74, height: 25,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#CCD9BA',
    backgroundColor: '#fff',
  },
  sortText: { fontSize: 12, color: '#586144', fontWeight: '500' },

  list: { paddingBottom: 100 },

  card: {
    flexShrink: 0,
    alignSelf: 'stretch',
    borderBottomWidth: 0.678,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFF',
    padding: 19.991,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: 22750400,
    backgroundColor: '#CCD9BA',
    justifyContent: 'center', alignItems: 'center',
  },
  nickname: { fontSize: 14, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  date: { fontSize: 12, fontWeight: '500', color: '#99A1AF', lineHeight: 16 },

  title: {
    fontSize: 16, fontWeight: '700', color: '#1a1a1a',
    lineHeight: 24, marginBottom: 4,
  },
  content: {
    fontSize: 13, color: '#586144', lineHeight: 19,
    letterSpacing: -0.15, marginBottom: 8,
  },

  poll: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, gap: 8, marginTop: 8, marginBottom: 4 },

  cardBottom: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#9CAF88' },

  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 9999,
    paddingHorizontal: 16,
    backgroundColor: '#678720',
    justifyContent: 'center', alignItems: 'center',
    elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 15,
  },
  fabText: { fontSize: 30, color: '#fff', lineHeight: 34 },
});
