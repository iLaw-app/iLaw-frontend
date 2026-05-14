import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/auth';
import { BottomNav } from '../../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const QNA_CATEGORIES = ['아동학대', '노동', '금융', '성폭력', '온라인폭력', '출생·양육', '법정대리인', '기타'];

const NOTICES = [
  '개인정보(실명, 주민번호, 주소 등)는 절대 적지 마세요.',
  '민감한 사진이나 개인을 특정할 수 있는 이미지는 되도록 올리지 마세요.',
  '구체적인 상황을 설명하면 더 정확한 답변을 받을 수 있어요.',
  '욕설이나 비방은 삼가주세요.',
  '변호사님의 답변까지 1~3일 정도 걸릴 수 있어요.',
  '긴급한 상황이라면 112 또는 관련 기관에 먼저 연락하세요.',
];

export default function AskPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<{ uri: string; type: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePickImage = async () => {
    if (images.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    setImages(prev => [...prev, { uri: asset.uri, type: `image/${ext}`, name: `photo.${ext}` }]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const img of images) {
      const form = new FormData();
      form.append('image', { uri: img.uri, type: img.type, name: img.name } as any);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      if (!res.ok) throw new Error('이미지 업로드 실패');
      const data = await res.json();
      urls.push(data.url);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || selectedCategories.length === 0) return;
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      const res = await fetch(`${API_BASE}/qna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ title, content, category: selectedCategories.join(','), imageUrls }),
      });
      if (!res.ok) throw new Error();
      setShowSuccess(true);
    } catch {
      // silent — user stays on form to retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'< 질문하기'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>제목 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="질문 제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>카테고리 <Text style={styles.required}>*</Text></Text>
        <View style={styles.categoryGrid}>
          {QNA_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategories.includes(cat) && styles.categoryChipSelected]}
              onPress={() => setSelectedCategories(prev =>
                prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
              )}
            >
              <Text style={[styles.categoryChipText, selectedCategories.includes(cat) && styles.categoryChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>질문 내용 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="구체적인 질문 내용을 작성해주세요"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>사진 첨부 <Text style={styles.optional}>(선택, 최대 3장)</Text></Text>
        <View style={styles.imageRow}>
          {images.map((img, i) => (
            <View key={i} style={styles.imageThumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.imageRemove} onPress={() => handleRemoveImage(i)}>
                <Text style={styles.imageRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={styles.imageAddBtn} onPress={handlePickImage}>
              <Text style={styles.imageAddIcon}>+</Text>
              <Text style={styles.imageAddText}>사진 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.publicNoticeRow}>
          <Ionicons name="eye-outline" size={16} color="#586144" />
          <Text style={styles.publicNotice}>질문을 공개합니다 (다른 사용자들도 볼 수 있습니다)</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, (submitting || !title.trim() || !content.trim() || selectedCategories.length === 0) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim() || selectedCategories.length === 0}
        >
          <Text style={styles.submitBtnText}>{submitting ? '등록 중...' : '질문 작성하기'}</Text>
        </TouchableOpacity>

        {/* 주의사항 */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeTitleRow}>
            <Ionicons name="alert-circle" size={20} color="#894B00" />
            <Text style={styles.noticeTitle}>질문 시 주의사항</Text>
          </View>
          {NOTICES.map((text, i) => (
            <View key={i} style={styles.noticeItem}>
              <Text style={styles.noticeBullet}>•</Text>
              <Text style={styles.noticeText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNav activeTab="qna" />

      {/* 제출 완료 모달 */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>제출 완료!</Text>
            <Text style={styles.successDesc}>빠른 시일 내로{'\n'}답변 드리겠습니다!</Text>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)/home');
              }}
            >
              <Text style={styles.homeBtnText}>홈으로</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.myQnaBtn}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/my-questions');
              }}
            >
              <Text style={styles.myQnaBtnText}>내 질문 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 16, color: '#3C6802', fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: '#3C6802', marginBottom: 8, marginTop: 16 },
  required: { color: '#f44336' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1.5, borderColor: '#CCD9BA' },
  textarea: { height: 160, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderRadius: 9999, borderWidth: 1.5, borderColor: '#CCD9BA', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  categoryChipSelected: { backgroundColor: '#B2D36E', borderColor: '#B2D36E' },
  categoryChipText: { fontSize: 13, color: '#9CAF88' },
  categoryChipTextSelected: { color: '#fff', fontWeight: '600' },
  optional: { fontSize: 12, color: '#aaa', fontWeight: '400' },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 10 },
  imageRemove: { position: 'absolute', top: -6, right: -6, backgroundColor: '#f44336', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  imageRemoveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  imageAddBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: '#CCD9BA', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fff4' },
  imageAddIcon: { fontSize: 22, color: '#9CAF88' },
  imageAddText: { fontSize: 11, color: '#9CAF88', marginTop: 2 },

  publicNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    marginTop: 20,
    marginBottom: 8,
  },
  publicNotice: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  submitBtn: {
    backgroundColor: '#B2D36E', borderRadius: 9999, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  noticeCard: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.356,
    borderColor: '#FFF9F0',
    padding: 17,
    gap: 10,
    shadowColor: '#894B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  noticeTitle: { fontSize: 18, fontWeight: '700', color: '#894B00', lineHeight: 27, letterSpacing: -0.439 },
  noticeItem: { flexDirection: 'row', gap: 6 },
  noticeBullet: { fontSize: 14, color: '#A65F00', lineHeight: 20, marginTop: 1 },
  noticeText: { flex: 1, fontSize: 14, color: '#A65F00', lineHeight: 20, letterSpacing: -0.15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 3.861,
    borderColor: '#CCD9BA',
    padding: 36,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 20,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B2D36E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 6,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  successDesc: { fontSize: 15, color: '#586144', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  homeBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#B2D36E',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 6,
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  myQnaBtn: {
    alignSelf: 'stretch',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CCD9BA',
  },
  myQnaBtnText: { color: '#586144', fontSize: 16, fontWeight: '600' },
});
