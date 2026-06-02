import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { AppModal } from '../../components/AppModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const QNA_CATEGORIES = ['노동', '금융', '온라인폭력', '아동학대', '성폭력', '출생', '법정대리인', '기타'];

function PhotoIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M15.8262 2.49902H4.16492C3.24487 2.49902 2.49902 3.24487 2.49902 4.16492V15.8262C2.49902 16.7463 3.24487 17.4921 4.16492 17.4921H15.8262C16.7463 17.4921 17.4921 16.7463 17.4921 15.8262V4.16492C17.4921 3.24487 16.7463 2.49902 15.8262 2.49902Z" stroke="#364153" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7.49647 9.16285C8.41652 9.16285 9.16237 8.41701 9.16237 7.49695C9.16237 6.5769 8.41652 5.83105 7.49647 5.83105C6.57642 5.83105 5.83057 6.5769 5.83057 7.49695C5.83057 8.41701 6.57642 9.16285 7.49647 9.16285Z" stroke="#364153" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M17.4918 12.4938L14.9213 9.9233C14.6089 9.61099 14.1853 9.43555 13.7435 9.43555C13.3018 9.43555 12.8781 9.61099 12.5657 9.9233L4.99756 17.4915" stroke="#364153" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

const NOTICE_ITEMS = [
  '이름, 주민등록번호, 주소, 전화번호 등 개인정보는 적지 마세요.',
  '얼굴이 보이는 사진이나 개인을 특정할 수 있는 이미지는 올리지 마세요.',
  '상황을 구체적으로 설명할수록 더 정확한 답변을 받을 수 있어요.',
  '욕설, 비방, 장난성 질문은 삼가 주세요.',
  '변호사님의 답변은 보통 1~3일 정도 걸릴 수 있어요.',
  '지금 바로 위험한 상황이라면 앱에 질문하기보다\n112 또는 관련 기관에 먼저 연락해 주세요.',
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
  const [contentFocused, setContentFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  // 내용 입력란에 커서가 들어가거나 내용을 입력하면 주의사항 안내를 숨기고 박스를 줄인다 (제목 포커스와는 무관)
  const showPlaceholder = !content && !contentFocused;

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

  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return;            // 중복 제출(더블탭) 방지
    if (!title.trim() || !content.trim() || selectedCategories.length === 0) return;
    if (!accessToken) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      const res = await fetch(`${API_BASE}/qa`, {
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
      submittingRef.current = false;
    }
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>질문하기</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 제목 + 내용 통합 카드 */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.titleInput}
            placeholder={titleFocused ? '' : '제목을 입력하세요'}
            placeholderTextColor="#99A1AF"
            value={title}
            onChangeText={setTitle}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
          <View style={styles.cardDivider} />
          <View style={[styles.contentWrapper, { minHeight: showPlaceholder ? 257 : 100 }]}>
            <TextInput
              style={[styles.contentInput, { minHeight: showPlaceholder ? 257 : 100 }]}
              value={content}
              onChangeText={setContent}
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(false)}
              multiline
              textAlignVertical="top"
            />
            {showPlaceholder && (
              <View style={styles.contentPlaceholder} pointerEvents="none">
                <Text style={styles.placeholderMain}>내용을 입력하세요</Text>
                <Text style={styles.placeholderSub}>{'\n'}질문 전 꼭 확인해 주세요</Text>
                {NOTICE_ITEMS.map((item, i) => (
                  <View key={i} style={styles.noteRow}>
                    <Text style={styles.noteBullet}>•</Text>
                    <Text style={styles.placeholderNote}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 사진 추가 - 카드 바깥 (커뮤니티 글쓰기처럼 구분선으로 분리) */}
        <View style={styles.photoSection}>
          <View style={styles.photoDivider} />
          <View style={styles.photoRow}>
            {images.length < 3 && (
              <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage} activeOpacity={0.7}>
                <PhotoIcon />
                <Text style={styles.photoBtnText}>사진 추가</Text>
              </TouchableOpacity>
            )}
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumbWrap}>
                <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                <TouchableOpacity style={styles.imageRemove} onPress={() => handleRemoveImage(i)}>
                  <Text style={styles.imageRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 카테고리 */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>카테고리</Text>
          <View style={styles.categoryGrid}>
            {QNA_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategories.includes(cat) && styles.categoryChipSelected]}
                onPress={() => setSelectedCategories(prev =>
                  prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                )}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryChipText, selectedCategories.includes(cat) && styles.categoryChipTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 질문 제출하기 + 안내 */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !canSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>{submitting ? '등록 중...' : '질문 제출하기'}</Text>
          </TouchableOpacity>
          <Text style={styles.bottomNotice}>질문은 익명으로 공개되며, 다른 사용자들도 볼 수 있어요.</Text>
        </View>
      </ScrollView>


      <AppModal visible={showSuccess}>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>제출 완료!</Text>
            <Text style={styles.successDesc}>빠른 시일 내로{'\n'}답변 드리겠습니다!</Text>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => { setShowSuccess(false); router.replace('/(tabs)/home'); }}
            >
              <Text style={styles.homeBtnText}>홈으로</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.myQnaBtn}
              onPress={() => { setShowSuccess(false); router.replace('/my-questions'); }}
            >
              <Text style={styles.myQnaBtnText}>내 질문 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, paddingVertical: 12, position: 'relative',
  },
  backBtn: { position: 'absolute', left: 16, zIndex: 1, padding: 4 },
  topBarTitle: {
    fontSize: 20, fontWeight: '700', color: '#586144',
    lineHeight: 36, letterSpacing: 0.07,
  },

  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 32 },

  inputCard: {
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    padding: 16,
    gap: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.449,
    paddingVertical: 0,
    minHeight: 28,
  },
  cardDivider: { height: 1, backgroundColor: '#D1D5DC' },
  contentWrapper: { minHeight: 257, position: 'relative', paddingBottom: 8 },
  contentInput: {
    minHeight: 257,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 24,
    letterSpacing: -0.312,
    textAlignVertical: 'top',
    padding: 0,
  },
  contentPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0 },
  placeholderMain: { fontSize: 13, fontWeight: '400', color: '#99A1AF', lineHeight: 22, letterSpacing: -0.312 },
  placeholderSub: { fontSize: 12, fontWeight: '400', color: '#99A1AF', lineHeight: 20, letterSpacing: -0.312 },
  noteRow: { flexDirection: 'row', gap: 4 },
  noteBullet: { fontSize: 12, fontWeight: '400', color: '#99A1AF', lineHeight: 20, width: 12 },
  placeholderNote: { fontSize: 12, fontWeight: '400', color: '#99A1AF', lineHeight: 20, letterSpacing: -0.312, flex: 1 },

  photoSection: { gap: 16 },
  photoDivider: { height: 1, backgroundColor: '#E5E7EB' },
  photoRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: 10, alignItems: 'center' },
  photoBtn: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: '#364153', whiteSpace: 'nowrap' } as any,
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 10 },
  imageRemove: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: '#f44336', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  imageRemoveText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  categorySection: { gap: 10 },
  categoryLabel: { fontSize: 14, fontWeight: '700', color: '#586144' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
  },
  categoryChipSelected: { backgroundColor: '#B2D36E' },
  categoryChipText: { fontSize: 14, fontWeight: '700', color: '#4A5565', lineHeight: 20, letterSpacing: -0.15 },
  categoryChipTextSelected: { color: '#fff' },

  submitBtn: {
    borderRadius: 9999,
    backgroundColor: '#B2D36E',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 5,
  },
  submitSection: { gap: 24 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  bottomNotice: {
    fontSize: 14, fontWeight: '700', color: '#C10007',
    lineHeight: 20, letterSpacing: -0.15, textAlign: 'center',
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  successCard: {
    width: '100%', backgroundColor: '#FFF', borderRadius: 24,
    padding: 36, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25, shadowRadius: 50, elevation: 20,
  },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#B2D36E',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  successDesc: { fontSize: 15, color: '#586144', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  homeBtn: {
    alignSelf: 'stretch', backgroundColor: '#B2D36E', borderRadius: 9999,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  myQnaBtn: {
    alignSelf: 'stretch', borderRadius: 9999, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#CCD9BA',
  },
  myQnaBtnText: { color: '#586144', fontSize: 16, fontWeight: '600' },
});
