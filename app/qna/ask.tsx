import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { QNA_CATEGORIES } from '../data/qnaData';

export default function AskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      Alert.alert('입력 확인', '제목, 카테고리, 질문 내용을 모두 입력해 주세요.');
      return;
    }
    // TODO: POST /qna API 연결
    Alert.alert('제출 완료!', '빠른 시일 내로 답변 드리겠습니다.', [
      { text: '홈으로', onPress: () => router.replace('/(tabs)/home') },
      { text: '내 질문 보기', onPress: () => router.back() },
    ]);
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

        <Text style={styles.label}>첨부파일</Text>
        <TouchableOpacity style={styles.attachBtn}>
          <Text style={styles.attachBtnText}>📎 파일 첨부</Text>
        </TouchableOpacity>

        <Text style={styles.notice}>
          * 질문은 익명으로 전체 공개됩니다.{'\n'}
          * 답변까지 1~3일 정도 소요됩니다.
        </Text>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>질문 작성하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  required: { color: '#f44336' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0' },
  textarea: { height: 160, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderRadius: 20, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  categoryChipSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  categoryChipText: { fontSize: 13, color: '#555' },
  categoryChipTextSelected: { color: '#fff', fontWeight: '600' },
  attachBtn: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', padding: 14, alignItems: 'center' },
  attachBtnText: { fontSize: 14, color: '#888' },
  notice: { fontSize: 12, color: '#aaa', lineHeight: 20, marginTop: 16 },
  submitBtn: { backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
