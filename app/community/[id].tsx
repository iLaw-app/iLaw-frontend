import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Rect, Defs, ClipPath } from 'react-native-svg';
import { BottomNav } from '../../components/BottomNav';

function PersonIcon({ size = 15 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <G clipPath="url(#clip_cd)">
        <Path d="M11.875 13.125V11.875C11.875 11.212 11.6116 10.5761 11.1428 10.1072C10.6739 9.63839 10.038 9.375 9.375 9.375H5.625C4.96196 9.375 4.32607 9.63839 3.85723 10.1072C3.38839 10.5761 3.125 11.212 3.125 11.875V13.125" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7.5 6.875C8.88071 6.875 10 5.75571 10 4.375C10 2.99429 8.88071 1.875 7.5 1.875C6.11929 1.875 5 2.99429 5 4.375C5 5.75571 6.11929 6.875 7.5 6.875Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <Defs><ClipPath id="clip_cd"><Rect width="15" height="15" fill="white" /></ClipPath></Defs>
    </Svg>
  );
}

function ThumbsUpIcon({ filled = false, size = 19 }: { filled?: boolean; size?: number }) {
  const color = filled ? '#3C6802' : '#4A5565';
  return (
    <Svg width={size} height={size} viewBox="0 0 19 19" fill="none">
      <Path
        d="M11.6614 4.06485L10.8284 7.49661H15.6845C15.9431 7.49661 16.1982 7.55682 16.4295 7.67248C16.6608 7.78814 16.8621 7.95607 17.0172 8.16297C17.1724 8.36987 17.2773 8.61005 17.3235 8.8645C17.3698 9.11895 17.3562 9.38068 17.2838 9.62896L15.343 16.2926C15.2421 16.6386 15.0316 16.9426 14.7433 17.1588C14.4549 17.3751 14.1042 17.492 13.7437 17.492H2.49891C2.05708 17.492 1.63336 17.3165 1.32094 17.0041C1.00852 16.6917 0.833008 16.2679 0.833008 15.8261V9.16251C0.833008 8.72068 1.00852 8.29696 1.32094 7.98454C1.63336 7.67212 2.05708 7.49661 2.49891 7.49661H4.79785C5.10778 7.49644 5.41151 7.40982 5.67491 7.24649C5.9383 7.08316 6.15091 6.84958 6.28883 6.57203L9.16251 0.833008C9.55531 0.837872 9.94193 0.931437 10.2935 1.10671C10.6451 1.28199 10.9525 1.53444 11.1927 1.84521C11.433 2.15598 11.6 2.51703 11.6811 2.90139C11.7623 3.28575 11.7555 3.68348 11.6614 4.06485Z"
        stroke={color} strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.1077 18.0636C12.1394 18.1425 12.1944 18.2098 12.2654 18.2565C12.3364 18.3032 12.4199 18.327 12.5049 18.3248C12.5898 18.3227 12.6721 18.2946 12.7406 18.2443C12.8091 18.194 12.8606 18.124 12.8882 18.0436L18.3024 2.21756C18.329 2.14375 18.3341 2.06388 18.317 1.98729C18.3 1.9107 18.2614 1.84056 18.2059 1.78507C18.1504 1.72958 18.0803 1.69104 18.0037 1.67397C17.9271 1.65689 17.8472 1.66197 17.7734 1.68863L1.94739 7.10281C1.86701 7.13037 1.79698 7.18187 1.74671 7.25038C1.69644 7.3189 1.66833 7.40115 1.66615 7.4861C1.66398 7.57105 1.68784 7.65463 1.73454 7.72563C1.78124 7.79662 1.84853 7.85164 1.9274 7.88328L8.53269 10.5321C8.7415 10.6157 8.93122 10.7407 9.09041 10.8996C9.2496 11.0585 9.37496 11.248 9.45893 11.4566L12.1077 18.0636Z" stroke="white" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.2033 1.78809L9.09082 10.8997" stroke="white" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BarChartIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M1.99963 2V12.6646C1.99963 13.0182 2.14008 13.3572 2.39008 13.6072C2.64008 13.8572 2.97916 13.9977 3.33271 13.9977H13.9973" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M11.9977 11.3313V5.99902" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.66498 11.3315V3.33301" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.33228 11.3307V9.33105" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type PollOption = { label: string; votes: number };
type Comment = { id: number; nickname: string; date: string; text: string; likes: number; replies?: Comment[] };
type Post = {
  id: number; nickname: string; createdAt: string; title: string; content: string;
  likes: number; scraps: number; bookmarked: boolean;
  poll?: { options: PollOption[]; total: number };
  comments: Comment[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return diffDays === 0 ? '오늘' : `${diffDays}일 전`;
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

const ALL_POSTS: Post[] = [
  {
    id: 1, nickname: '익명1', createdAt: '2026-05-11T00:00:00Z',
    title: '처음으로 알바하는데 궁금한 게 있어요',
    content: '내일 첫 알바 출근인데 너무 떨려요. 혹시 알바 처음 하시는 분들 어떻게 준비하셨나요? 사장님께 어떻게 인사드려야 할지도...',
    likes: 12, scraps: 3, bookmarked: false,
    comments: [{ id: 1, nickname: '익명2', date: '5일 전', text: '저도 처음엔 많이 떨렸어요! 밝게 인사하면 다 좋아하시더라고요 :)', likes: 5, replies: [] }],
  },
  {
    id: 2, nickname: '익명2', createdAt: '2026-05-10T00:00:00Z',
    title: '법을 공부하시는 분들 계신가요?',
    content: '진로를 법조인으로 생각하고 있는데 어떤 준비를 해야 할까요?',
    likes: 8, scraps: 2, bookmarked: false,
    comments: [{ id: 1, nickname: '익명4', date: '6일 전', text: '로스쿨 준비라면 학점 관리가 제일 중요해요!', likes: 3, replies: [] }],
  },
  {
    id: 3, nickname: '익명3', createdAt: '2026-05-08T00:00:00Z',
    title: '청소년도 SNS 계정 해킹 당하면 경찰에 신고할 수 있나요?',
    content: '', likes: 34, scraps: 7, bookmarked: false,
    poll: { options: [{ label: '가능하다', votes: 78 }, { label: '불가능하다', votes: 12 }, { label: '잘 모르겠다', votes: 15 }], total: 105 },
    comments: [{
      id: 1, nickname: '익명5', date: '05.08',
      text: '당연히 가능해요! 나이 상관없이 피해자면 신고할 수 있습니다.',
      likes: 12,
      replies: [{ id: 2, nickname: '익명3', date: '05.08', text: '감사합니다! 도움이 됐어요', likes: 3 }],
    }],
  },
];

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <View style={[s.avatar, { width: size, height: size }]}>
      <PersonIcon size={Math.round(size * 0.47)} />
    </View>
  );
}

function PollBar({ option, total, onVote, disabled }: { option: PollOption; total: number; onVote: () => void; disabled: boolean }) {
  const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
  return (
    <TouchableOpacity style={ps.row} onPress={onVote} activeOpacity={disabled ? 1 : 0.8} disabled={disabled}>
      <View style={ps.barBg}>
        <View style={[ps.barFill, { width: `${pct}%` }]} />
        <Text style={ps.barLabel}>{option.label}</Text>
      </View>
      <Text style={ps.pct}>{pct}%</Text>
    </TouchableOpacity>
  );
}

function ReplyItem({ reply }: { reply: Comment }) {
  const [likes, setLikes] = useState(reply.likes);
  const [liked, setLiked] = useState(false);
  return (
    <View style={s.replyRow}>
      <View style={s.replyLeftLine} />
      <Avatar size={28} />
      <View style={{ flex: 1 }}>
        <View style={s.commentMeta}>
          <Text style={s.replyNickname}>{reply.nickname}</Text>
          <Text style={s.replyDate}>{reply.date}</Text>
        </View>
        <Text style={s.commentText}>{reply.text}</Text>
        <TouchableOpacity style={s.commentLike} activeOpacity={0.7} onPress={() => { setLiked(v => !v); setLikes(c => liked ? c - 1 : c + 1); }}>
          <ThumbsUpIcon filled={liked} size={13} />
          <Text style={[s.replyMeta, liked && { color: '#3C6802' }]}>{likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (id: number) => void }) {
  const [likes, setLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(false);
  return (
    <View>
      <View style={s.commentRow}>
        <Avatar size={32} />
        <View style={{ flex: 1 }}>
          <View style={s.commentMeta}>
            <Text style={s.commentNickname}>{comment.nickname}</Text>
            <Text style={s.replyDate}>{comment.date}</Text>
          </View>
          <Text style={s.commentText}>{comment.text}</Text>
          <View style={s.commentActions}>
            <TouchableOpacity style={s.commentLike} activeOpacity={0.7} onPress={() => { setLiked(v => !v); setLikes(c => liked ? c - 1 : c + 1); }}>
              <ThumbsUpIcon filled={liked} size={13} />
              <Text style={[s.replyMeta, liked && { color: '#3C6802' }]}>{likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReply(comment.id)} activeOpacity={0.7}>
              <Text style={s.replyBtn}>답글</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {(comment.replies ?? []).map(reply => <ReplyItem key={reply.id} reply={reply} />)}
    </View>
  );
}

export default function CommunityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const post = ALL_POSTS.find(p => String(p.id) === String(id)) ?? ALL_POSTS[0];

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [scrapCount, setScrapCount] = useState(post.scraps);
  const [votedIdx, setVotedIdx] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
  const pollOptions = (post.poll?.options ?? []).map((opt, i) => votedIdx === i ? { ...opt, votes: opt.votes + 1 } : opt);
  const pollTotal = votedIdx !== null ? (post.poll?.total ?? 0) + 1 : (post.poll?.total ?? 0);

  const getNextNickname = (currentComments: Comment[]) => {
    const allNames = [
      ...currentComments.map(c => c.nickname),
      ...currentComments.flatMap(c => (c.replies ?? []).map(r => r.nickname)),
    ];
    const nums = allNames
      .map(n => Number(n.match(/^익명(\d+)$/)?.[1]))
      .filter(n => n > 0);
    return `익명${nums.length > 0 ? Math.max(...nums) + 1 : 1}`;
  };

  const handleSend = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = { id: Date.now(), nickname: getNextNickname(comments), date: '방금', text: commentText.trim(), likes: 0 };
    if (replyingTo !== null) {
      setComments(prev => prev.map(c => c.id === replyingTo ? { ...c, replies: [...(c.replies ?? []), newComment] } : c));
      setReplyingTo(null);
    } else {
      setComments(prev => [...prev, newComment]);
    }
    setCommentText('');
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#586144" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(v => !v)} style={s.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#586144" />
          </TouchableOpacity>
          {showMenu && (

            <View style={s.dropdown}>
              <TouchableOpacity style={s.dropdownItem} onPress={() => {
                setShowMenu(false);
                Alert.alert('게시글 삭제', '정말 삭제하시겠습니까?', [
                  { text: '취소', style: 'cancel' },
                  { text: '삭제', style: 'destructive', onPress: () => router.replace('/(tabs)/community' as any) },
                ]);
              }}>
                <Ionicons name="trash-outline" size={14} color="#C10007" />
                <Text style={s.dropdownTextRed}>삭제하기</Text>
              </TouchableOpacity>
              <View style={s.dropdownDivider} />
              <TouchableOpacity style={s.dropdownItem} onPress={() => {
                setShowMenu(false);
                router.push({ pathname: '/community/write', params: { editId: String(post.id), editTitle: post.title, editContent: post.content } } as any);
              }}>
                <Ionicons name="create-outline" size={14} color="#586144" />
                <Text style={s.dropdownText}>수정하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" onScrollBeginDrag={() => setShowMenu(false)}>
          {/* Author */}
          <View style={s.authorRow}>
            <Avatar size={36} />
            <View>
              <Text style={s.nickname}>{post.nickname}</Text>
              <Text style={s.date}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>

          <Text style={s.title}>{post.title}</Text>
          {post.content ? <Text style={s.content}>{post.content}</Text> : null}

          {/* Poll */}
          {post.poll && (
            <View style={ps.container}>
              {pollOptions.map((opt, i) => (
                <PollBar key={opt.label} option={opt} total={pollTotal} disabled={votedIdx !== null} onVote={() => setVotedIdx(i)} />
              ))}
              <View style={ps.footer}>
                <BarChartIcon />
                <Text style={ps.totalText}>{pollTotal}명 참여</Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={s.actions}>
            <View style={s.actionsLeft}>
              <TouchableOpacity style={s.actionBtn} onPress={() => { setLiked(v => !v); setLikeCount(c => liked ? c - 1 : c + 1); }} activeOpacity={0.7}>
                <ThumbsUpIcon filled={liked} size={18} />
                <Text style={[s.actionText, liked && { color: '#3C6802' }]}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={18} color="#4A5565" />
                <Text style={s.actionText}>{totalComments}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.actionBtn} onPress={() => { setBookmarked(v => !v); setScrapCount(c => bookmarked ? c - 1 : c + 1); }} activeOpacity={0.7}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color="#4A5565" />
              <Text style={[s.actionText, bookmarked && { color: '#3C6802' }]}>{scrapCount}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.thickDivider} />

          <Text style={s.commentsHeader}>댓글 {totalComments}</Text>

          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReply={(cid) => setReplyingTo(replyingTo === cid ? null : cid)} />
          ))}
        </ScrollView>

        {/* Comment Input */}
        <View style={s.inputBar}>
          {replyingTo !== null && (
            <View style={s.replyingBanner}>
              <Text style={s.replyingText}>답글 작성 중</Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close" size={14} color="#9CAF88" />
              </TouchableOpacity>
            </View>
          )}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="rgba(10,10,10,0.50)"
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
            />
            <TouchableOpacity style={s.sendBtn} onPress={handleSend} activeOpacity={0.8}>
              <SendIcon />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <BottomNav activeTab="community" />
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  container: { padding: 16, paddingBottom: 0, borderRadius: 14, backgroundColor: '#F9FAFB', gap: 8, marginBottom: 8, alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg: {
    flex: 1, height: 44, borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#EFF4E1', borderRadius: 8 },
  barLabel: { fontSize: 13, color: '#586144', fontWeight: '500', marginLeft: 12, zIndex: 1 },
  pct: { fontSize: 13, color: '#586144', fontWeight: '700', width: 36, textAlign: 'right' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 16 },
  totalText: { fontSize: 12, fontWeight: '400', color: '#6A7282', lineHeight: 16 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, position: 'relative', zIndex: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 4 },
  menuBtn: { padding: 4 },
  dropdown: { position: 'absolute', top: 48, right: 16, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 8, minWidth: 120, zIndex: 100, borderWidth: 1, borderColor: '#F0F5E8' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  dropdownDivider: { height: 1, backgroundColor: '#F0F5E8' },
  dropdownText: { fontSize: 14, color: '#586144', fontWeight: '500' },
  dropdownTextRed: { fontSize: 14, color: '#C10007', fontWeight: '500' },

  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 16 },
  avatar: { borderRadius: 9999, backgroundColor: '#CCD9BA', justifyContent: 'center', alignItems: 'center' },
  nickname: { fontSize: 16, fontWeight: '700', color: '#1E2939', lineHeight: 24, letterSpacing: -0.312 },
  date: { fontSize: 12, color: '#99A1AF', lineHeight: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', lineHeight: 28, letterSpacing: -0.449, marginBottom: 8 },
  content: { fontSize: 14, color: '#586144', lineHeight: 22, marginBottom: 12 },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, borderTopWidth: 0.678, borderTopColor: '#F3F4F6' },
  actionsLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 14, color: '#4A5565', fontWeight: '500' },

  thickDivider: { height: 7.458, backgroundColor: '#F3F4F6', marginHorizontal: -20, marginBottom: 16 },
  commentsHeader: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },

  commentRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  replyRow: { flexDirection: 'row', gap: 8, marginLeft: 16, marginBottom: 16, alignItems: 'flex-start' },
  replyLeftLine: { width: 1.356, backgroundColor: '#F3F4F6', alignSelf: 'stretch', marginRight: 4 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentNickname: { fontSize: 13, fontWeight: '700', color: '#1E2939' },
  replyNickname: { fontSize: 13, fontWeight: '700', color: '#6A7282' },
  replyDate: { fontSize: 11, color: '#6A7282' },
  commentText: { fontSize: 14, color: '#1a1a1a', lineHeight: 20, marginBottom: 6 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentLikeText: { fontSize: 12, color: '#9CAF88' },
  replyMeta: { fontSize: 12, color: '#6A7282' },
  replyBtn: { fontSize: 12, color: '#6A7282', fontWeight: '600' },

  inputBar: { borderTopWidth: 1, borderTopColor: '#F0F5E8', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10 },
  replyingBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6 },
  replyingText: { fontSize: 12, color: '#9CAF88' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: 44, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: '#F3F4F6', fontSize: 16, color: '#0a0a0a', letterSpacing: -0.312 },
  sendBtn: { width: 40, height: 40, borderRadius: 9999, backgroundColor: '#D1D5DC', justifyContent: 'center', alignItems: 'center' },
});
