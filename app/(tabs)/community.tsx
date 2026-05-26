import { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable, BackHandler, Image, TextInput } from 'react-native';
import { AppModal } from '../../components/AppModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Rect, Defs, ClipPath } from 'react-native-svg';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

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

function ClockIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <G clipPath="url(#clock_clip)">
        <Path d="M6.49998 11.9163C9.49152 11.9163 11.9166 9.49122 11.9166 6.49967C11.9166 3.50813 9.49152 1.08301 6.49998 1.08301C3.50844 1.08301 1.08331 3.50813 1.08331 6.49967C1.08331 9.49122 3.50844 11.9163 6.49998 11.9163Z" stroke="#6A7282" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M6.5 3.25V6.5L8.66667 7.58333" stroke="#6A7282" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
      <Defs>
        <ClipPath id="clock_clip">
          <Rect width="13" height="13" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}

function ThumbsUpIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <Path d="M5.83069 8.3291V18.3245" stroke="#6A7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12.4942 4.89786L11.6613 8.32962H16.5174C16.776 8.32962 17.0311 8.38983 17.2624 8.50549C17.4937 8.62115 17.6949 8.78908 17.8501 8.99598C18.0053 9.20287 18.1102 9.44306 18.1564 9.69751C18.2027 9.95196 18.1891 10.2137 18.1167 10.462L16.1759 17.1256C16.075 17.4716 15.8645 17.7756 15.5762 17.9918C15.2878 18.2081 14.9371 18.325 14.5766 18.325H3.33179C2.88997 18.325 2.46624 18.1495 2.15382 17.8371C1.84141 17.5247 1.66589 17.1009 1.66589 16.6591V9.99552C1.66589 9.55369 1.84141 9.12996 2.15382 8.81755C2.46624 8.50513 2.88997 8.32962 3.33179 8.32962H5.63074C5.94066 8.32945 6.2444 8.24283 6.50779 8.0795C6.77119 7.91616 6.9838 7.68259 7.12172 7.40504L9.99539 1.66602C10.3882 1.67088 10.7748 1.76444 11.1264 1.93972C11.4779 2.11499 11.7853 2.36745 12.0256 2.67822C12.2659 2.98899 12.4329 3.35004 12.514 3.7344C12.5952 4.11876 12.5884 4.51648 12.4942 4.89786Z" stroke="#6A7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
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
  updatedAt?: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  imageUrls?: string[];
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
      <Text style={ps.pct} numberOfLines={1}>{pct}%</Text>
    </View>
  );
}

function PostCard({ item, onPress, isOwner, onMenuPress, keywords = [] }: {
  item: CommunityPost;
  onPress: () => void;
  isOwner: boolean;
  onMenuPress: (postId: number, y: number) => void;
  keywords?: string[];
}) {
  const moreRef = useRef<View>(null);
  const handleMorePress = () => {
    moreRef.current?.measure((_fx, _fy, _w, _h, _px, py) => {
      onMenuPress(item.id, py);
    });
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.avatarRow}>
          <Image source={require('../../assets/Container.png')} style={styles.avatar} resizeMode="contain" />
          <Text style={styles.nickname}>{item.nickname}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.date}>
            {formatDate(item.createdAt)}{item.updatedAt && new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime() > 1000 ? ' (수정됨)' : ''}
          </Text>
          {isOwner && (
            <View ref={moreRef}>
              <TouchableOpacity onPress={handleMorePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="ellipsis-vertical" size={16} color="#9CAF88" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTextArea}>
          <HighlightText text={item.title} keywords={keywords} style={styles.title} />
          {item.content ? (
            <HighlightText text={item.content} keywords={keywords} style={styles.content} numberOfLines={2} />
          ) : null}
        </View>
        {item.imageUrls && item.imageUrls.length > 0 && (
          <Image source={{ uri: item.imageUrls[0] }} style={styles.cardThumb} resizeMode="cover" />
        )}
      </View>

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
          <Ionicons name="chatbubble-outline" size={14} color="#6A7282" />
          <Text style={styles.metaText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [menuY, setMenuY] = useState(0);

  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []));

  const handleMenuPress = (postId: number, y: number) => {
    setMenuPostId(postId);
    setMenuY(y);
  };

  const handleDelete = async () => {
    const id = menuPostId;
    setMenuPostId(null);
    if (!id || !accessToken) return;
    try {
      await fetch(`${API_BASE}/community/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const handleEdit = () => {
    const id = menuPostId;
    setMenuPostId(null);
    if (!id) return;
    const post = posts.find(p => p.id === id);
    if (!post) return;
    router.push({
      pathname: '/community/write' as any,
      params: { editId: String(id), editTitle: post.title, editContent: post.content },
    });
  };

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
            const list: any[] = Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : [];
            const posts = list.map((p: any) => ({ ...p, poll: mapPoll(p.poll) }));
            setPosts(posts);
            // 목록 API가 imageUrls를 포함하지 않으므로 상세 API로 보강
            if (posts.length > 0) {
              Promise.all(
                posts.map(p =>
                  fetch(`${API_BASE}/community/${p.id}`, { headers })
                    .then(r => r.ok ? r.json() : null)
                    .then(d => ({ ...p, imageUrls: d?.imageUrls ?? [] }))
                    .catch(() => ({ ...p, imageUrls: [] }))
                )
              ).then(enriched => { if (!cancelled) setPosts(enriched); });
            }
          }
        } catch {
          if (!cancelled) setPosts([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      loadPosts();
      return () => { cancelled = true; };
    }, [accessToken])
  );

  const displayPosts = [...posts]
    .filter(p => !searchQuery.trim() || p.title.includes(searchQuery) || (p.content ?? '').includes(searchQuery))
    .sort((a, b) => sort === 'popular' ? b.likes - a.likes : 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <Text style={styles.headerSub}>정보 공유를 통해 함께 도움을 주고받아요</Text>
        <View style={styles.sortBtns}>
          <TouchableOpacity style={[styles.sortBtn, sort === 'popular' && styles.sortBtnActive]} activeOpacity={0.7} onPress={() => setSort('popular')}>
            <Text style={styles.sortText}>인기순</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortBtn, sort === 'latest' && styles.sortBtnActive]} activeOpacity={0.7} onPress={() => setSort('latest')}>
            <Text style={styles.sortText}>최신순</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="키워드로 검색해보세요!"
            placeholderTextColor="#9CAF88"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchBtn}>
            <Ionicons name="search" size={16} color="#fff" />
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#9CAF88" />
        ) : (
          <FlatList
            data={displayPosts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View>
                <PostCard
                  item={item}
                  onPress={() => router.push(`/community/${item.id}` as any)}
                  isOwner={user?.nickname === item.nickname}
                  onMenuPress={handleMenuPress}
                />
              </View>
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubble-outline" size={40} color="#CCD9BA" />
                <Text style={styles.emptyText}>아직 등록된 게시물이 없어요</Text>
                <Text style={styles.emptySubText}>첫 번째 글을 작성해보세요!</Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/community/write' as any)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <AppModal visible={menuPostId !== null} onRequestClose={() => setMenuPostId(null)}>
        <Pressable style={{ flex: 1 }} onPress={() => setMenuPostId(null)}>
          <Pressable style={[menuS.dropdown, { top: menuY + 20, right: 16 }]} onPress={() => {}}>
            <TouchableOpacity style={menuS.item} activeOpacity={0.7} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color="#586144" />
              <Text style={menuS.deleteText}>삭제하기</Text>
            </TouchableOpacity>
            <View style={menuS.sep} />
            <TouchableOpacity style={menuS.item} activeOpacity={0.7} onPress={handleEdit}>
              <Ionicons name="create-outline" size={16} color="#FB8C00" />
              <Text style={menuS.editText}>수정하기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </AppModal>
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
  pct: { fontSize: 13, color: '#586144', fontWeight: '600', width: 40, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: {
    paddingTop: 19.991,
    paddingHorizontal: 19.991,
    paddingBottom: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3.994,
    flexShrink: 0,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  subRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 8 },
  headerSub: { fontSize: 17, fontWeight: '300', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  sortBtns: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    width: 74, height: 25,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 50, borderWidth: 1, borderColor: '#D1D5DC',
    backgroundColor: '#fff',
  },
  sortBtnActive: { backgroundColor: '#EFF4E1', borderColor: '#CCD9BA' },
  sortText: { fontSize: 14, fontWeight: '500', color: '#6A7282', lineHeight: 20, letterSpacing: 0.1 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  searchArea: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, borderRadius: 9999,
    borderWidth: 1.5, borderColor: '#CCD9BA',
    backgroundColor: '#FFF',
    paddingLeft: 20, paddingRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 0 },
  searchBtn: {
    width: 32, height: 32, borderRadius: 9999,
    backgroundColor: '#CCD9BA',
    justifyContent: 'center', alignItems: 'center',
  },

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
  avatar: { width: 32, height: 32, borderRadius: 16 },
  nickname: { fontSize: 14, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  date: { fontSize: 12, fontWeight: '500', color: '#99A1AF', lineHeight: 16 },

  title: {
    fontSize: 18, fontWeight: '700', color: '#586144',
    lineHeight: 27, letterSpacing: -0.439, marginBottom: 4,
  },
  content: {
    fontSize: 14, fontWeight: '400', color: '#586144', lineHeight: 20,
    letterSpacing: -0.15, marginBottom: 8,
  },

  poll: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, gap: 8, marginTop: 8, marginBottom: 4 },

  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTextArea: { flex: 1 },
  cardThumb: { width: 72, height: 72, borderRadius: 8, flexShrink: 0 },
  cardBottom: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6A7282' },

  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 9999,
    paddingHorizontal: 16,
    backgroundColor: '#678720',
    justifyContent: 'center', alignItems: 'center',
    elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 15,
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CAF88', fontWeight: '500' },
  emptySubText: { fontSize: 13, color: '#CCD9BA' },
});

const menuS = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 8,
    minWidth: 140,
    overflow: 'hidden',
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  sep: { height: 1, backgroundColor: '#F3F4F6' },
  deleteText: { fontSize: 14, fontWeight: '500', color: '#586144' },
  editText: { fontSize: 14, fontWeight: '500', color: '#586144' },
});

