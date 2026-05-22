import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Rect, Defs, ClipPath } from 'react-native-svg';
import { BottomNav } from '../../components/BottomNav';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

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
  const color = filled ? '#3C6802' : '#6A7282';
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

function DotsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M11.0002 11.9167C11.5066 11.9167 11.9171 11.5062 11.9171 10.9999C11.9171 10.4935 11.5066 10.083 11.0002 10.083C10.4939 10.083 10.0834 10.4935 10.0834 10.9999C10.0834 11.5062 10.4939 11.9167 11.0002 11.9167Z" stroke="#586144" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11.0002 5.50068C11.5066 5.50068 11.9171 5.0902 11.9171 4.58384C11.9171 4.07748 11.5066 3.66699 11.0002 3.66699C10.4939 3.66699 10.0834 4.07748 10.0834 4.58384C10.0834 5.0902 10.4939 5.50068 11.0002 5.50068Z" stroke="#586144" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11.0002 18.3337C11.5066 18.3337 11.9171 17.9232 11.9171 17.4168C11.9171 16.9105 11.5066 16.5 11.0002 16.5C10.4939 16.5 10.0834 16.9105 10.0834 17.4168C10.0834 17.9232 10.4939 18.3337 11.0002 18.3337Z" stroke="#586144" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
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
type Comment = {
  id: number;
  nickname: string;
  date: string;
  text: string;
  likes: number;
  liked: boolean;
  isAuthor: boolean;
  isPostAuthor?: boolean;
  parentId?: number | null;
  replies?: Comment[];
};
type Post = {
  id: number; nickname: string; createdAt: string; updatedAt?: string; title: string; content: string;
  isAuthor: boolean;
  likes: number; bookmarks: number; bookmarked: boolean;
  imageUrls?: string[];
  poll?: { options: PollOption[]; total: number; votedOptionIndex: number | null };
  comments: Comment[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${min}`;
}

function mapComment(c: any): Comment {
  return {
    id: c.id,
    nickname: c.nickname,
    date: formatDate(c.createdAt),
    text: c.content,
    likes: c.likes ?? 0,
    liked: !!c.liked,
    isAuthor: !!c.isAuthor,
    isPostAuthor: !!c.isPostAuthor,
    parentId: c.parentId ?? null,
    replies: (c.replies ?? []).map(mapComment),
  };
}

function mapPoll(poll: any): { options: PollOption[]; total: number; votedOptionIndex: number | null } | undefined {
  if (!poll?.options) return undefined;
  const options = poll.options as PollOption[];
  return {
    options,
    total: typeof poll.total === 'number' ? poll.total : options.reduce((s, o) => s + o.votes, 0),
    votedOptionIndex: typeof poll.votedOptionIndex === 'number' ? poll.votedOptionIndex : null,
  };
}

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <View style={[s.avatar, { width: size, height: size }]}>
      <PersonIcon size={Math.round(size * 0.47)} />
    </View>
  );
}

function PollBar({ option, total, selected, onVote }: { option: PollOption; total: number; selected: boolean; onVote: () => void }) {
  const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
  return (
    <TouchableOpacity style={ps.row} onPress={onVote} activeOpacity={0.8}>
      <View style={ps.barBg}>
        <View style={[ps.barFill, { width: `${pct}%` }, selected && ps.barFillSelected]} />
        <Text style={ps.barLabel}>{option.label}</Text>
      </View>
      <Text style={ps.pct} numberOfLines={1}>{pct}%</Text>
    </TouchableOpacity>
  );
}

function ReplyItem({ reply, onDelete, onLike, postNickname, viewerIsPostAuthor }: { reply: Comment; onDelete: (id: number) => void; onLike: (id: number) => void; postNickname: string; viewerIsPostAuthor: boolean }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOP = !!reply.isPostAuthor || (reply.isAuthor && viewerIsPostAuthor) || reply.nickname === postNickname;
  return (
    <View style={s.replyRow}>
      <Avatar size={28} />
      <View style={{ flex: 1 }}>
        <View style={s.commentMeta}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={isOP ? s.authorNickname : s.replyNickname}>{isOP ? '익명(글쓴이)' : reply.nickname}</Text>
            <Text style={s.replyDate}>{reply.date}</Text>
          </View>
          {reply.isAuthor && (
            <View>
              <TouchableOpacity onPress={() => setShowMenu(v => !v)} activeOpacity={0.7}>
                <DotsIcon />
              </TouchableOpacity>
              {showMenu && (
                <View style={s.miniDropdown}>
                  <TouchableOpacity style={s.miniDropdownItem} activeOpacity={0.7} onPress={() => { setShowMenu(false); onDelete(reply.id); }}>
                    <Ionicons name="trash-outline" size={14} color="#586144" />
                    <Text style={s.miniDropdownDeleteText}>삭제하기</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
        <Text style={s.commentText}>{reply.text}</Text>
        <TouchableOpacity style={s.commentLike} activeOpacity={0.7} onPress={() => onLike(reply.id)}>
          <ThumbsUpIcon filled={reply.liked} size={13} />
          <Text style={[s.replyMeta, reply.liked && { color: '#3C6802' }]}>{reply.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CommentItem({ comment, onReply, onDelete, onLike, postNickname, viewerIsPostAuthor }: { comment: Comment; onReply: (id: number) => void; onDelete: (id: number) => void; onLike: (id: number) => void; postNickname: string; viewerIsPostAuthor: boolean }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOP = !!comment.isPostAuthor || (comment.isAuthor && viewerIsPostAuthor) || comment.nickname === postNickname;
  return (
    <View>
      <View style={s.commentRow}>
        <Avatar size={32} />
        <View style={{ flex: 1 }}>
          <View style={s.commentMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={isOP ? s.authorNickname : s.commentNickname}>{isOP ? '익명(글쓴이)' : comment.nickname}</Text>
              <Text style={s.replyDate}>{comment.date}</Text>
            </View>
            {comment.isAuthor && (
              <View>
                <TouchableOpacity onPress={() => setShowMenu(v => !v)} activeOpacity={0.7}>
                  <DotsIcon />
                </TouchableOpacity>
                {showMenu && (
                  <View style={s.miniDropdown}>
                    <TouchableOpacity style={s.miniDropdownItem} activeOpacity={0.7} onPress={() => { setShowMenu(false); onDelete(comment.id); }}>
                      <Ionicons name="trash-outline" size={14} color="#586144" />
                      <Text style={s.miniDropdownDeleteText}>삭제하기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
          <Text style={s.commentText}>{comment.text}</Text>
          <View style={s.commentActions}>
            <TouchableOpacity style={s.commentLike} activeOpacity={0.7} onPress={() => onLike(comment.id)}>
              <ThumbsUpIcon filled={comment.liked} size={13} />
              <Text style={[s.replyMeta, comment.liked && { color: '#3C6802' }]}>{comment.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReply(comment.id)} activeOpacity={0.7}>
              <Text style={s.replyBtn}>답글</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {(comment.replies ?? []).map(reply => <ReplyItem key={reply.id} reply={reply} onDelete={onDelete} onLike={onLike} postNickname={postNickname} viewerIsPostAuthor={viewerIsPostAuthor} />)}
    </View>
  );
}

export default function CommunityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { accessToken } = useAuth();
  const postId = String(id);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);
  const [votedIdx, setVotedIdx] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      fetch(`${API_BASE}/community/${postId}`, { headers })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (cancelled || !data) return;
          const poll = mapPoll(data.poll);
          setPost({
            ...data,
            bookmarks: data.bookmarks ?? 0,
            bookmarked: data.bookmarked ?? false,
            imageUrls: data.imageUrls ?? [],
            poll,
            comments: [],
          });
          setLiked(data.liked ?? false);
          setLikeCount(data.likes ?? 0);
          setBookmarked(data.bookmarked ?? false);
          setScrapCount(data.bookmarks ?? 0);
          setVotedIdx(poll?.votedOptionIndex ?? null);
          setComments((data.comments ?? []).map(mapComment).reverse());
        })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [postId, accessToken])
  );

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
  const pollOptions = post?.poll?.options ?? [];
  const pollTotal = post?.poll?.total ?? 0;
  const updateComment = (
    items: Comment[],
    commentId: number,
    updater: (comment: Comment) => Comment,
  ): Comment[] => items.map(comment => {
    if (comment.id === commentId) return updater(comment);
    return { ...comment, replies: updateComment(comment.replies ?? [], commentId, updater) };
  });

  const handleLike = async () => {
    if (!accessToken) { Alert.alert('로그인 필요', '로그인 후 이용해주세요.'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    try {
      const res = await fetch(`${API_BASE}/community/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('like failed');
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(!newLiked);
      setLikeCount(c => newLiked ? c - 1 : c + 1);
    }
  };

  const handleBookmark = async () => {
    if (!accessToken) { Alert.alert('로그인 필요', '로그인 후 이용해주세요.'); return; }
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setScrapCount(c => Math.max(0, newBookmarked ? c + 1 : c - 1));
    try {
      const res = await fetch(`${API_BASE}/community/${postId}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('bookmark failed');
      const data = await res.json();
      setBookmarked(data.bookmarked);
      setScrapCount(data.count);
    } catch {
      setBookmarked(!newBookmarked);
      setScrapCount(c => Math.max(0, newBookmarked ? c - 1 : c + 1));
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!accessToken) { Alert.alert('로그인 필요', '로그인 후 투표할 수 있습니다.'); return; }
    try {
      const res = await fetch(`${API_BASE}/community/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ optionIndex }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'vote failed');
      }
      const data = await res.json();
      const poll = mapPoll(data.poll);
      if (poll) {
        setPost(prev => prev ? { ...prev, poll } : prev);
        setVotedIdx(poll.votedOptionIndex);
      }
    } catch (e) {
      Alert.alert('오류', e instanceof Error ? e.message : '투표에 실패했습니다.');
    }
  };

  const handleDelete = () => {
    if (!accessToken) return;
    fetch(`${API_BASE}/community/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => {
      if (r.ok || r.status === 204) router.replace('/(tabs)/community' as any);
      else Alert.alert('오류', '삭제에 실패했습니다.');
    });
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    if (!accessToken) { Alert.alert('로그인 필요', '로그인 후 댓글을 작성할 수 있습니다.'); return; }
    const text = commentText.trim();
    setCommentText('');
    const res = await fetch(`${API_BASE}/community/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ content: text, parentId: replyingTo ?? undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      const newComment = mapComment(data);
      setComments(prev => {
        if (newComment.parentId) {
          return prev.map(comment => comment.id === newComment.parentId
            ? { ...comment, replies: [...(comment.replies ?? []), newComment] }
            : comment
          );
        }
        return [...prev, newComment];
      });
    }
    setReplyingTo(null);
  };

  const handleCommentLike = async (commentId: number) => {
    if (!accessToken) { Alert.alert('로그인 필요', '로그인 후 이용해주세요.'); return; }
    let nextLiked = false;
    setComments(prev => updateComment(prev, commentId, comment => {
      nextLiked = !comment.liked;
      return { ...comment, liked: nextLiked, likes: Math.max(0, comment.likes + (nextLiked ? 1 : -1)) };
    }));
    try {
      const res = await fetch(`${API_BASE}/community/${postId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('comment like failed');
      const data = await res.json();
      setComments(prev => updateComment(prev, commentId, comment => ({
        ...comment,
        liked: data.liked,
        likes: data.count,
      })));
    } catch {
      setComments(prev => updateComment(prev, commentId, comment => ({
        ...comment,
        liked: !nextLiked,
        likes: Math.max(0, comment.likes + (nextLiked ? -1 : 1)),
      })));
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (!accessToken) return;
    setDeletingCommentId(commentId);
    setShowCommentDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!deletingCommentId || !accessToken) return;
    const commentId = deletingCommentId;
    setShowCommentDeleteModal(false);
    setDeletingCommentId(null);
    const res = await fetch(`${API_BASE}/community/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok && res.status !== 204) {
      Alert.alert('오류', '댓글 삭제에 실패했습니다.');
      return;
    }
    setComments(prev => prev
      .filter(comment => comment.id !== commentId)
      .map(comment => ({
        ...comment,
        replies: (comment.replies ?? []).filter(reply => reply.id !== commentId),
      }))
    );
    if (replyingTo === commentId) setReplyingTo(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#586144" />
          </TouchableOpacity>
        </View>
        <ActivityIndicator style={{ marginTop: 40 }} color="#9CAF88" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#586144" />
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#9CAF88' }}>게시글을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'height' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#586144" />
          </TouchableOpacity>
          {post.isAuthor && (
            <TouchableOpacity onPress={() => setShowMenu(v => !v)} style={s.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#586144" />
            </TouchableOpacity>
          )}
          {post.isAuthor && showMenu && (

            <View style={s.dropdown}>
              <TouchableOpacity style={s.dropdownItem} onPress={() => {
                setShowMenu(false);
                setShowDeleteModal(true);
              }}>
                <Ionicons name="trash-outline" size={14} color="#586144" />
                <Text style={s.dropdownTextRed}>삭제하기</Text>
              </TouchableOpacity>
              {!post.poll && (
                <>
                  <View style={s.dropdownDivider} />
                  <TouchableOpacity style={s.dropdownItem} onPress={() => {
                    setShowMenu(false);
                    router.push({ pathname: '/community/write', params: { editId: String(post.id), editTitle: post.title, editContent: post.content ?? '', editImageUrls: JSON.stringify(post.imageUrls ?? []), editPoll: post.poll ? JSON.stringify(post.poll.options) : '' } } as any);
                  }}>
                    <Ionicons name="create-outline" size={14} color="#586144" />
                    <Text style={s.dropdownText}>수정하기</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" onScrollBeginDrag={() => setShowMenu(false)}>
          {/* Author */}
          <View style={s.authorRow}>
            <Avatar size={36} />
            <View>
              <Text style={s.nickname}>{post.nickname}</Text>
              <Text style={s.date}>
                {formatDate(post.createdAt)}{post.updatedAt && new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000 ? ' (수정됨)' : ''}
              </Text>
            </View>
          </View>

          <Text style={s.title}>{post.title}</Text>
          {post.content ? <Text style={s.content}>{post.content}</Text> : null}

          {post.imageUrls && post.imageUrls.length > 0 && (
            <View style={s.imageRow}>
              {post.imageUrls.map((url, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedImage(url)} activeOpacity={0.85}>
                  <Image source={{ uri: url }} style={s.imageThumb} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Poll */}
          {post.poll && (
            <View style={ps.container}>
              {pollOptions.map((opt, i) => (
                <PollBar key={opt.label} option={opt} total={pollTotal} selected={votedIdx === i} onVote={() => handleVote(i)} />
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
              <TouchableOpacity style={s.actionBtn} onPress={handleLike} activeOpacity={0.7}>
                <ThumbsUpIcon filled={liked} size={18} />
                <Text style={[s.actionText, liked && { color: '#3C6802' }]}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={18} color="#6A7282" />
                <Text style={s.actionText}>{totalComments}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.actionBtn} onPress={handleBookmark} activeOpacity={0.7}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color="#6A7282" />
              <Text style={[s.actionText, bookmarked && { color: '#3C6802' }]}>{scrapCount}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.thickDivider} />

          <Text style={s.commentsHeader}>댓글 {totalComments}</Text>

          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(cid) => setReplyingTo(replyingTo === cid ? null : cid)}
              onDelete={handleDeleteComment}
              onLike={handleCommentLike}
              postNickname={post.nickname}
              viewerIsPostAuthor={post.isAuthor}
            />
          ))}
        </ScrollView>

        <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setSelectedImage(null)}>
            <Image source={{ uri: selectedImage! }} style={s.modalImage} resizeMode="contain" />
          </TouchableOpacity>
        </Modal>

        <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
          <Pressable style={s.deleteOverlay} onPress={() => setShowDeleteModal(false)}>
            <Pressable style={s.deleteCard} onPress={() => {}}>
              <View style={s.deleteIconCircle}>
                <Ionicons name="trash-outline" size={32} color="#C10007" />
              </View>
              <Text style={s.deleteTitle}>게시글 삭제</Text>
              <View style={s.deleteTextContainer}>
                <Text style={s.deleteBody}>이 게시글을 삭제하시겠습니까?</Text>
                <Text style={s.deleteWarning}>삭제 후에는 복구할 수 없습니다.</Text>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => { setShowDeleteModal(false); handleDelete(); }}>
                <Text style={s.deleteBtnText}>삭제하기</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={showCommentDeleteModal} transparent animationType="fade" onRequestClose={() => setShowCommentDeleteModal(false)}>
          <Pressable style={s.deleteOverlay} onPress={() => setShowCommentDeleteModal(false)}>
            <Pressable style={s.deleteCard} onPress={() => {}}>
              <View style={s.deleteIconCircle}>
                <Ionicons name="trash-outline" size={32} color="#C10007" />
              </View>
              <Text style={s.deleteTitle}>댓글 삭제</Text>
              <View style={s.deleteTextContainer}>
                <Text style={s.deleteBody}>이 댓글을 삭제하시겠습니까?</Text>
                <Text style={s.deleteWarning}>삭제 후에는 복구할 수 없습니다.</Text>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={confirmDeleteComment}>
                <Text style={s.deleteBtnText}>삭제하기</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Comment Input */}
        <View style={s.inputBar}>
          {replyingTo !== null && (
            <View style={s.replyingBanner}>
              <Text style={s.replyingText}>
                {(comments.find(c => c.id === replyingTo)?.nickname ?? '댓글')}님에게 답글 작성 중
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Text style={s.cancelText}>취소</Text>
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
            <TouchableOpacity
              style={[s.sendBtn, commentText.trim().length > 0 && s.sendBtnActive]}
              onPress={handleSend}
              activeOpacity={0.8}
            >
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
  barFillSelected: { backgroundColor: '#C4D99A' },
  barSelected: {},
  barLabel: { fontSize: 14, color: 'rgba(10,10,10,0.50)', fontWeight: '400', letterSpacing: -0.312, marginLeft: 12, zIndex: 1 },
  pct: { fontSize: 13, color: '#586144', fontWeight: '700', width: 40, textAlign: 'right' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 16 },
  totalText: { fontSize: 12, fontWeight: '400', color: '#6A7282', lineHeight: 16 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, position: 'relative', zIndex: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 4 },
  menuBtn: { padding: 4 },
  dropdown: { position: 'absolute', top: 48, right: 16, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 8, minWidth: 120, zIndex: 100, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  dropdownDivider: { height: 1, backgroundColor: '#E5E7EB' },
  dropdownText: { fontSize: 14, color: '#586144', fontWeight: '500' },
  dropdownTextRed: { fontSize: 14, color: '#586144', fontWeight: '500' },

  scroll: { paddingHorizontal: 20, paddingBottom: 140 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 16 },
  avatar: { borderRadius: 9999, backgroundColor: '#CCD9BA', justifyContent: 'center', alignItems: 'center' },
  nickname: { fontSize: 16, fontWeight: '700', color: '#1E2939', lineHeight: 24, letterSpacing: -0.312 },
  date: { fontSize: 12, color: '#99A1AF', lineHeight: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', lineHeight: 28, letterSpacing: -0.449, marginBottom: 8 },
  content: { fontSize: 14, color: '#586144', lineHeight: 22, marginBottom: 12 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imageThumb: { width: 90, height: 90, borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '100%' },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, borderTopWidth: 0.678, borderTopColor: '#F3F4F6' },
  actionsLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 14, color: '#6A7282', fontWeight: '500' },

  thickDivider: { height: 7.458, backgroundColor: '#F3F4F6', marginHorizontal: -20, marginBottom: 16 },
  commentsHeader: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },

  commentRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  replyRow: { flexDirection: 'row', gap: 8, marginLeft: 16, marginBottom: 16, alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10 },
  replyLeftLine: { width: 1.356, backgroundColor: '#F3F4F6', alignSelf: 'stretch', marginRight: 4 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  commentNickname: { fontSize: 13, fontWeight: '700', color: '#1E2939' },
  replyNickname: { fontSize: 13, fontWeight: '700', color: '#6A7282' },
  authorNickname: { fontSize: 14, fontWeight: '700', color: '#5A7B10', lineHeight: 20, letterSpacing: -0.15 },
  deleteBtn: { fontSize: 12, color: '#C10007', fontWeight: '600' },
  replyDate: { fontSize: 11, color: '#6A7282' },
  commentText: { fontSize: 14, color: '#1a1a1a', lineHeight: 20, marginBottom: 6 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentLikeText: { fontSize: 12, color: '#9CAF88' },
  replyMeta: { fontSize: 12, color: '#6A7282' },
  replyBtn: { fontSize: 12, color: '#6A7282', fontWeight: '600' },

  miniDropdown: {
    position: 'absolute', top: 24, right: 0, zIndex: 100,
    backgroundColor: '#FFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
    minWidth: 110, overflow: 'hidden',
  },
  miniDropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  miniDropdownDeleteText: { fontSize: 14, fontWeight: '500', color: '#586144' },

  inputBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 0.678, borderTopColor: '#E5E7EB',
    backgroundColor: 'rgba(255,255,255,0.70)',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    gap: 8,
  },
  replyingBanner: {
    height: 36, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: '#EFF4E1',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    flexShrink: 0, alignSelf: 'stretch',
  },
  replyingText: { color: '#586144', fontSize: 14, fontWeight: '400', lineHeight: 20, letterSpacing: -0.15 },
  cancelText: { color: '#586144', fontSize: 12, fontWeight: '700', lineHeight: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: 44, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: '#F3F4F6', fontSize: 16, color: '#0a0a0a', letterSpacing: -0.312 },
  sendBtn: { width: 40, height: 40, borderRadius: 9999, backgroundColor: '#D1D5DC', justifyContent: 'center', alignItems: 'center' },
  sendBtnActive: { backgroundColor: '#678720' },

  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 12, marginHorizontal: 32, width: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
  },
  deleteIconCircle: {
    width: 64, height: 64, borderRadius: 9999,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  deleteTitle: { fontSize: 22, fontWeight: '700', color: '#1E2939', textAlign: 'center' },
  deleteTextContainer: { width: 280, alignItems: 'center', gap: 4 },
  deleteBody: { fontSize: 16, color: '#4A5565', textAlign: 'center', lineHeight: 24 },
  deleteWarning: { fontSize: 14, color: '#C10007', textAlign: 'center' },
  deleteBtn: {
    marginTop: 8, backgroundColor: '#C10007', borderRadius: 9999,
    paddingTop: 11, paddingBottom: 13, alignSelf: 'stretch',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
