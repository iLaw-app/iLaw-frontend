import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput, Alert, Pressable } from 'react-native';
import { AppModal } from '../../components/AppModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/auth';
import { BottomNav } from '../../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

function calcAge(birthDate: string): string {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `만 ${age}세`;
}

type QnADetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
  imageUrls: string[];
  isAuthor?: boolean;
  author: {
    nickname: string | null;
    birthDate?: string | null;
    region?: string | null;
    gender?: string | null;
  };
  answer: {
    id: number;
    content: string;
    createdAt: string;
    isMyAnswer?: boolean;
    lawyer: { nickname: string | null; role: string; affiliation: string | null };
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
  const [scrapCount, setScrapCount] = useState(0);
  const [scrapLoading, setScrapLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAnswerSuccessModal, setShowAnswerSuccessModal] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [editAnswerSubmitting, setEditAnswerSubmitting] = useState(false);

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      Alert.alert('답변 내용을 입력해 주세요.');
      return;
    }
    setAnswerSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/qa/${id}/answer`, {
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
            affiliation: prev.answer?.lawyer.affiliation ?? null,
          },
        },
      } : prev);
      setShowAnswerSuccessModal(true);
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
      const res = await fetch(`${API_BASE}/qa/${id}/scrap`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setScrapped(data.scrapped);
      if (typeof data.count === 'number') setScrapCount(data.count);
      else setScrapCount(prev => Math.max(0, prev + (data.scrapped ? 1 : -1)));
    } finally {
      setScrapLoading(false);
    }
  };

  const handleAnswerEdit = async () => {
    if (!editAnswerText.trim()) return;
    setEditAnswerSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/qa/${id}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content: editAnswerText }),
      });
      if (!res.ok) throw new Error();
      setPost(prev => prev && prev.answer ? { ...prev, answer: { ...prev.answer, content: editAnswerText } } : prev);
      setIsEditingAnswer(false);
    } catch {
      Alert.alert('오류', '답변 수정에 실패했습니다.');
    } finally {
      setEditAnswerSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken) return;
    const res = await fetch(`${API_BASE}/qa/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok || res.status === 204) {
      router.back();
    } else {
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    fetch(`${API_BASE}/qa/${id}`, { headers })
      .then(r => r.json())
      .then(data => setPost(data?.id ? data : null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    if (accessToken) {
      fetch(`${API_BASE}/qa/${id}/scrap`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(data => { setScrapped(data.scrapped ?? false); setScrapCount(data.count ?? 0); })
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
          <Text style={role === 'lawyer' ? styles.lawyerBackText : styles.backText}>{role === 'lawyer' ? '질문 상세' : 'Q&A'}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {post.isAuthor && (
            <TouchableOpacity onPress={() => setShowMenu(v => !v)} style={styles.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#586144" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3-dot 메뉴 — AppModal로 띄워 웹/네이티브 모두 동작, 바깥(메뉴가 아닌 화면) 누르면 닫힘 */}
      <AppModal visible={!!post.isAuthor && showMenu} onRequestClose={() => setShowMenu(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setShowMenu(false)}>
          <Pressable style={styles.dropdown} onPress={() => {}}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowMenu(false); setShowDeleteModal(true); }}>
              <Ionicons name="trash-outline" size={14} color="#586144" />
              <Text style={styles.dropdownTextRed}>삭제하기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </AppModal>

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

        {/* 답변 영역 */}
        {role === 'lawyer' ? (
          <>
            <View style={styles.studentInfoCard}>
              <View style={styles.studentInfoHeader}>
                <Ionicons name="person-outline" size={16} color="#586144" />
                <Text style={styles.studentInfoTitle}>아동 정보</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <Text style={styles.studentInfoItem}><Text style={styles.studentInfoLabel}>나이</Text> {post.author.birthDate ? calcAge(post.author.birthDate) : '-'}</Text>
                <Text style={styles.studentInfoItem}><Text style={styles.studentInfoLabel}>지역</Text> {post.author.region ?? '-'}</Text>
                <Text style={styles.studentInfoItem}><Text style={styles.studentInfoLabel}>성별</Text> {post.author.gender === 'female' ? '여성' : post.author.gender === 'male' ? '남성' : post.author.gender === 'other' ? '기타' : '-'}</Text>
              </View>
            </View>

            {post.status === 'pending' ? (
              <View style={styles.lawyerAnswerCard}>
                <Text style={styles.lawyerAnswerTitle}>답변 작성</Text>
                <View style={styles.lawyerAnswerInputContainer}>
                  <TextInput
                    style={styles.lawyerAnswerInput}
                    placeholder={'아동에게 도움이 될 수 있는 답변을\n작성해주세요.\n\n- 법적 근거를 명확히 제시해주세요\n- 구체적인 대처 방법을 알려주세요\n- 필요한 기관 연락처를 안내해주세요'}
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
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lawyerName}>{post.answer?.lawyer.nickname ?? '변호사'}</Text>
                    <View style={styles.orgRow}>
                      <Ionicons name="business-outline" size={12} color="#4A5565" />
                      <Text style={styles.lawyerOrg}>{post.answer?.lawyer.affiliation ?? '소속 미등록'}</Text>
                    </View>
                  </View>
                  {post.answer?.isMyAnswer && !isEditingAnswer && (
                    <TouchableOpacity onPress={() => { setEditAnswerText(post.answer?.content ?? ''); setIsEditingAnswer(true); }} style={styles.editAnswerBtn}>
                      <Ionicons name="create-outline" size={18} color="#2B56B5" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.answerDivider} />
                {isEditingAnswer ? (
                  <>
                    <View style={styles.lawyerAnswerInputContainer}>
                      <TextInput
                        style={styles.lawyerAnswerInput}
                        value={editAnswerText}
                        onChangeText={setEditAnswerText}
                        multiline
                        textAlignVertical="top"
                        autoFocus
                      />
                    </View>
                    <View style={styles.editAnswerBtns}>
                      <TouchableOpacity style={styles.editAnswerCancelBtn} onPress={() => setIsEditingAnswer(false)}>
                        <Text style={styles.editAnswerCancelText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editAnswerSaveBtn, editAnswerSubmitting && { opacity: 0.6 }]}
                        onPress={handleAnswerEdit}
                        disabled={editAnswerSubmitting}
                      >
                        <Text style={styles.editAnswerSaveText}>{editAnswerSubmitting ? '저장 중...' : '저장'}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.answerContent}>{post.answer?.content}</Text>
                )}
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
                  <Text style={styles.lawyerOrg}>{post.answer?.lawyer.affiliation ?? '소속 미등록'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.answerDivider} />
            <Text style={styles.answerContent}>{post.answer?.content}</Text>
          </View>
        )}

        {role !== 'lawyer' && (
          <View style={styles.scrapArea}>
            <TouchableOpacity
              style={[styles.scrapBottomBtn, scrapped && styles.scrapBottomBtnActive]}
              activeOpacity={0.85}
              onPress={handleScrap}
              disabled={scrapLoading}
            >
              <Ionicons name={scrapped ? 'bookmark' : 'bookmark-outline'} size={18} color="#fff" />
              <Text style={styles.scrapBottomText}>{scrapped ? '스크랩됨' : '스크랩하기'}</Text>
              {scrapCount > 0 && <Text style={styles.scrapBottomCount}>{scrapCount}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AppModal visible={!!selectedImage} onRequestClose={() => setSelectedImage(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedImage(null)}>
          <Image source={{ uri: selectedImage! }} style={styles.modalImage} resizeMode="contain" />
        </TouchableOpacity>
      </AppModal>

      <AppModal visible={showDeleteModal} onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable style={styles.deleteOverlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={styles.deleteCard} onPress={() => {}}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash-outline" size={32} color="#C10007" />
            </View>
            <Text style={styles.deleteTitle}>질문 삭제</Text>
            <View style={styles.deleteTextContainer}>
              <Text style={styles.deleteBody}>이 질문을 삭제하시겠습니까?</Text>
              <Text style={styles.deleteWarning}>삭제 후에는 복구할 수 없습니다.</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => { setShowDeleteModal(false); handleDelete(); }}>
              <Text style={styles.deleteBtnText}>삭제하기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </AppModal>

      <AppModal visible={showAnswerSuccessModal} onRequestClose={() => setShowAnswerSuccessModal(false)}>
        <View style={styles.deleteOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>답변 완료!</Text>
            <Text style={styles.successBody}>답변이 성공적으로 등록됐습니다.</Text>
            <View style={styles.successBtns}>
              <TouchableOpacity
                style={styles.successBtnOutline}
                onPress={() => { setShowAnswerSuccessModal(false); router.navigate('/(tabs)/qna' as any); }}
              >
                <Text style={styles.successBtnOutlineText}>목록으로</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successBtnPrimary}
                onPress={() => { setShowAnswerSuccessModal(false); router.navigate('/(tabs)/home' as any); }}
              >
                <Text style={styles.successBtnPrimaryText}>홈으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AppModal>

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
  menuBtn: { padding: 4 },
  dropdown: {
    position: 'absolute', top: 90, right: 16, backgroundColor: '#fff',
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
    minWidth: 120, zIndex: 100, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden',
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  dropdownTextRed: { fontSize: 14, color: '#586144', fontWeight: '500' },
  scrapBtn: { padding: 4 },
  scrapArea: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  scrapBottomBtn: {
    width: 290, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#B2D36E', paddingVertical: 16, borderRadius: 9999, gap: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  scrapBottomBtnActive: { backgroundColor: '#3C6802' },
  scrapBottomText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  scrapBottomCount: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 2 },

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
  deleteBody: { fontSize: 16, color: '#4A5565', textAlign: 'center', lineHeight: 24 },
  deleteWarning: { fontSize: 14, color: '#C10007', textAlign: 'center' },
  deleteTextContainer: { width: 280, alignItems: 'center', gap: 4 },
  deleteBtn: {
    marginTop: 8, backgroundColor: '#C10007', borderRadius: 9999,
    paddingTop: 11, paddingBottom: 13, alignSelf: 'stretch',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  editAnswerBtn: { padding: 4 },
  editAnswerBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editAnswerCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 9999,
    borderWidth: 1, borderColor: '#CCD9BA', alignItems: 'center',
  },
  editAnswerCancelText: { fontSize: 15, color: '#586144', fontWeight: '600' },
  editAnswerSaveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 9999,
    backgroundColor: '#2B56B5', alignItems: 'center',
  },
  editAnswerSaveText: { fontSize: 15, color: '#fff', fontWeight: '700' },

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
  divider: { height: 1.544, backgroundColor: '#F3F4F6' },
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
  contentBox: {},
  questionBody: { fontSize: 15, color: '#444', lineHeight: 23 },
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
  answerDivider: { height: 1.544, backgroundColor: '#E5E7EB' },
  answerContent: { fontSize: 15, color: '#333', lineHeight: 23 },

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
  studentInfoTitle: { fontSize: 15, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  studentInfoRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  studentInfoItem: { fontSize: 14, color: '#586144' },
  studentInfoLabel: { fontSize: 14, fontWeight: '700', color: '#586144' },

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

  successCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 12, width: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
  },
  successIconCircle: {
    width: 72, height: 72, borderRadius: 9999,
    backgroundColor: '#2B56B5', justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#1E2939', textAlign: 'center' },
  successBody: { fontSize: 15, color: '#4A5565', textAlign: 'center', lineHeight: 22 },
  successBtns: { flexDirection: 'row', gap: 10, marginTop: 8, alignSelf: 'stretch' },
  successBtnOutline: {
    flex: 1, paddingTop: 11, paddingBottom: 13, borderRadius: 9999,
    borderWidth: 1.5, borderColor: '#2B56B5', alignItems: 'center',
  },
  successBtnOutlineText: { fontSize: 15, fontWeight: '600', color: '#1E2939' },
  successBtnPrimary: {
    flex: 1, paddingTop: 11, paddingBottom: 13, borderRadius: 9999,
    backgroundColor: '#2B56B5', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  successBtnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
