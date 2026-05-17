import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/auth';
import { BottomNav } from '../../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type QnADetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
  imageUrls: string[];
  author: {
    nickname: string | null;
    age?: number;
    region?: string;
    gender?: string;
  };
  answer: {
    id: number;
    content: string;
    createdAt: string;
    lawyer: { nickname: string | null; role: string };
  } | null;
};

function ClockIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <Path
        d="M31.9985 58.664C46.7255 58.664 58.664 46.7255 58.664 31.9985C58.664 17.2716 46.7255 5.33301 31.9985 5.33301C17.2716 5.33301 5.33301 17.2716 5.33301 31.9985C5.33301 46.7255 17.2716 58.664 31.9985 58.664Z"
        stroke="#C10007" strokeWidth="5.3331" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M31.9985 15.999V31.9983L42.6647 37.3314"
        stroke="#C10007" strokeWidth="5.3331" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function QnaDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role, accessToken } = useAuth();

  const [post, setPost] = useState<QnADetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scrapped, setScrapped] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      Alert.alert('답변 내용을 입력해 주세요.');
      return;
    }
    setAnswerSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/qna/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content: answerText }),
      });
      if (res.status === 409) {
        Alert.alert('이미 답변된 질문입니다.');
        router.back();
        return;
      }
      if (!res.ok) throw new Error();
      const answer = await res.json();
      setPost(prev => prev ? {
        ...prev,
        status: 'answered',
        answer: {
          ...answer,
          lawyer: {
            nickname: prev.answer?.lawyer.nickname ?? null,
            role: 'lawyer',
          },
        },
      } : prev);
      Alert.alert('답변이 등록되었습니다.', '', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('오류', '답변 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleScrap = async () => {
    if (!accessToken) return;
    setScrapLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qna/${id}/scrap`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setScrapped(data.scrapped);
    } finally {
      setScrapLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/qna/${id}`)
      .then(r => r.json())
      .then(data => setPost(data?.id ? data : null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    if (accessToken) {
      fetch(`${API_BASE}/qna/${id}/scrap`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(data => setScrapped(data.scrapped ?? false))
        .catch(() => {});
    }
  }, [id, accessToken]));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1 }}>
          <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
        </View>
        <BottomNav activeTab="qna" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1 }}>
          <Text style={{ padding: 20 }}>질문을 찾을 수 없습니다.</Text>
        </View>
        <BottomNav activeTab="qna" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
          <Text style={role === 'lawyer' ? styles.lawyerBackText : styles.backText}>{role === 'lawyer' ? '질문 상세' : 'QnA'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleScrap} disabled={scrapLoading} style={styles.scrapBtn}>
          <Ionicons name={scrapped ? 'bookmark' : 'bookmark-outline'} size={28} color={scrapped ? '#3C6802' : '#9CAF88'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* 질문 카드 */}
        <View style={styles.questionCard}>
          {/* 유저 정보 */}
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.userName}>{post.author.nickname ?? '익명'}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="time-outline" size={12} color="#4A5565" />
                <Text style={styles.userDate}>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 제목 */}
          <Text style={styles.questionTitle}>{post.title}</Text>

          {/* 본문 */}
          <View style={styles.contentBox}>
            <Text style={styles.questionBody}>{post.content}</Text>
          </View>

          {/* 이미지 */}
          {post.imageUrls?.length > 0 && (
            <View style={styles.imageRow}>
              {post.imageUrls.map((url, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedImage(url)}>
                  <Image source={{ uri: url }} style={styles.imageThumb} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 이미지 전체보기 모달 */}
        <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedImage(null)}>
            <Image source={{ uri: selectedImage! }} style={styles.modalImage} resizeMode="contain" />
          </TouchableOpacity>
        </Modal>

        {/* 답변 영역 */}
        {role === 'lawyer' ? (
          <>
            <View style={styles.studentInfoCard}>
              <View style={styles.studentInfoHeader}>
                <Ionicons name="person-outline" size={16} color="#586144" />
                <Text style={styles.studentInfoTitle}>학생 정보</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <Text style={styles.studentInfoItem}>나이: {post.author.age ? `${post.author.age}세` : '-'}</Text>
                <Text style={styles.studentInfoItem}>지역: {post.author.region ?? '-'}</Text>
                <Text style={styles.studentInfoItem}>성별: {post.author.gender ?? '-'}</Text>
              </View>
            </View>

            {post.status === 'pending' ? (
              <View style={styles.lawyerAnswerCard}>
                <Text style={styles.lawyerAnswerTitle}>답변 작성</Text>
                <View style={styles.lawyerAnswerInputContainer}>
                  <TextInput
                    style={styles.lawyerAnswerInput}
                    placeholder={'학생에게 도움이 될 수 있는 답변을\n작성해주세요.\n\n- 법적 근거를 명확히 제시해주세요\n- 구체적인 대처 방법을 알려주세요\n- 필요한 기관 연락처를 안내해주세요'}
                    placeholderTextColor="rgba(10,10,10,0.5)"
                    value={answerText}
                    onChangeText={setAnswerText}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.lawyerSubmitBtn, answerSubmitting && { opacity: 0.6 }]}
                  onPress={handleAnswerSubmit}
                  disabled={answerSubmitting}
                >
                  <Text style={styles.lawyerSubmitBtnText}>{answerSubmitting ? '등록 중...' : '답변 제출'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.answerCard}>
                <View style={styles.lawyerRow}>
                  <View style={styles.lawyerAvatar}>
                    <Ionicons name="person-outline" size={22} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.lawyerName}>{post.answer?.lawyer.nickname ?? '변호사'}</Text>
                    <View style={styles.orgRow}>
                      <Ionicons name="business-outline" size={12} color="#4A5565" />
                      <Text style={styles.lawyerOrg}>{post.answer?.lawyer.role ?? '법률 전문가'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.answerDivider} />
                <Text style={styles.answerContent}>{post.answer?.content}</Text>
              </View>
            )}
          </>
        ) : post.status === 'pending' ? (
          <View style={styles.pendingCard}>
            <View style={styles.pendingIconWrap}>
              <ClockIcon />
            </View>
            <Text style={styles.pendingTitle}>답변 대기 중</Text>
            <Text style={styles.pendingDesc}>
              변호사님이 검토 중입니다.{'\n'}답변까지 <Text style={{ fontWeight: '700' }}>1~3일</Text> 정도 소요됩니다.
            </Text>
            <Text style={styles.pendingNote}>
              긴급한 상황이라면 112 또는 관련 기관에 먼저 연락해주세요.
            </Text>
          </View>
        ) : (
          <View style={styles.answerCard}>
            <View style={styles.lawyerRow}>
              <View style={styles.lawyerAvatar}>
                <Ionicons name="person-outline" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.lawyerName}>{post.answer?.lawyer.nickname ?? '변호사'}</Text>
                <View style={styles.orgRow}>
                  <Ionicons name="business-outline" size={12} color="#4A5565" />
                  <Text style={styles.lawyerOrg}>{post.answer?.lawyer.role ?? '법률 전문가'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.answerDivider} />
            <Text style={styles.answerContent}>{post.answer?.content}</Text>
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="qna" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 20, color: '#586144', fontWeight: '700' },
  scrapBtn: { padding: 4 },

  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 16 },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    paddingBottom: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 6,
  },
  divider: { height: 1.544, backgroundColor: '#CCD9BA' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 9999,
    backgroundColor: '#B2D36E', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  userName: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  userDate: { fontSize: 12, fontWeight: '400', color: '#4A5565', lineHeight: 18, letterSpacing: -0.15 },
  questionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', lineHeight: 27, letterSpacing: -0.439 },
  contentBox: { borderRadius: 16, backgroundColor: '#F9FAFB', padding: 16 },
  questionBody: { fontSize: 14, color: '#444', lineHeight: 22 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumb: { width: 90, height: 90, borderRadius: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '100%' },

  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 6,
  },
  pendingIconWrap: { marginBottom: 4 },
  pendingTitle: {
    fontSize: 20, fontWeight: '700', color: '#C10007',
    lineHeight: 28, letterSpacing: -0.449, textAlign: 'center',
  },
  pendingDesc: { fontSize: 14, color: '#C10007', lineHeight: 22, textAlign: 'center' },
  pendingNote: { fontSize: 12, color: '#C10007', lineHeight: 18, textAlign: 'center', paddingBottom: 8 },
  answerBtn: {
    marginTop: 8, backgroundColor: '#B2D36E', borderRadius: 9999,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  answerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  answerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 25,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 6,
  },
  lawyerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lawyerAvatar: {
    width: 44, height: 44, borderRadius: 9999,
    backgroundColor: '#2B56B5', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  lawyerName: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  lawyerOrg: { fontSize: 12, color: '#4A5565' },
  answerDivider: { height: 1.544, backgroundColor: '#FFF' },
  answerContent: { fontSize: 14, color: '#333', lineHeight: 22 },

  lawyerBackText: { fontSize: 24, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },

  studentInfoCard: {
    paddingTop: 17.353, paddingHorizontal: 17.353, paddingBottom: 1.356,
    flexDirection: 'column', alignItems: 'flex-start', gap: 11.992,
    borderRadius: 16, backgroundColor: '#FDFFF8',
    minHeight: 84,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  studentInfoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  studentInfoTitle: { fontSize: 14, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  studentInfoRow: { flexDirection: 'row', gap: 16 },
  studentInfoItem: { fontSize: 13, color: '#586144' },

  lawyerAnswerCard: {
    borderRadius: 24,
    backgroundColor: '#F9FAFB', padding: 20, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  lawyerAnswerTitle: { fontSize: 16, fontWeight: '700', color: '#2B56B5' },
  lawyerAnswerInputContainer: {
    width: '100%', minHeight: 256, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1.356, borderColor: '#FFF', backgroundColor: '#FFF',
  },
  lawyerAnswerInput: {
    minHeight: 230, fontSize: 16, color: '#0a0a0a',
    lineHeight: 24, letterSpacing: -0.312, textAlignVertical: 'top',
  },
  lawyerSubmitBtn: {
    alignSelf: 'center', width: 295, paddingTop: 15, paddingBottom: 17,
    borderRadius: 9999, backgroundColor: '#2B56B5', alignItems: 'center', marginTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  lawyerSubmitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
