import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const QNA_CATEGORIES = ['아동학대', '노동', '금융', '성폭력', '온라인폭력', '출생·양육', '법정대리인', '기타'];

export default function AskPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch(`${API_BASE}/qna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ title, content, category: selectedCategory }),
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
  notice: { fontSize: 12, color: '#9CAF88', lineHeight: 20, marginTop: 16 },
  submitBtn: { backgroundColor: '#B2D36E', borderRadius: 9999, paddingVertical: 16, alignItems: 'center', marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
