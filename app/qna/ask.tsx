import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const QNA_CATEGORIES = ['아동학대', '노동', '금융', '성폭력', '온라인폭력', '출생·양육', '법정대리인', '기타'];

export default function AskPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [images, setImages] = useState<{ uri: string; type: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('최대 3장까지 첨부할 수 있습니다.');
      return;
    }
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
    if (!title.trim() || !content.trim() || !selectedCategory) {
      Alert.alert('입력 확인', '제목, 카테고리, 질문 내용을 모두 입력해 주세요.');
      return;
    }
    if (!accessToken) {
      Alert.alert('로그인 필요', '로그인 후 질문을 작성할 수 있습니다.');
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      const res = await fetch(`${API_BASE}/qna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ title, content, category: selectedCategory, imageUrls }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('제출 완료!', '빠른 시일 내로 답변 드리겠습니다.', [
        { text: 'QnA 보기', onPress: () => router.replace('/(tabs)/qna') },
      ]);
    } catch {
      Alert.alert('오류', '질문 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>
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

        <Text style={styles.notice}>
          * 질문은 익명으로 전체 공개됩니다.{'\n'}
          * 답변까지 1~3일 정도 소요됩니다.
        </Text>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? '등록 중...' : '질문 작성하기'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  notice: { fontSize: 12, color: '#9CAF88', lineHeight: 20, marginTop: 16 },
  submitBtn: { backgroundColor: '#B2D36E', borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
