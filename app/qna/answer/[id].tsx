import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_QNA } from '../../data/qnaData';

export default function AnswerPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [answer, setAnswer] = useState('');

  const item = MOCK_QNA.find((q) => q.id === id);
  if (!item) return (
    <SafeAreaView style={styles.container}>
      <Text style={{ padding: 20 }}>질문을 찾을 수 없습니다.</Text>
    </SafeAreaView>
  );

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert('답변 내용을 입력해 주세요.');
      return;
    }
    // TODO: POST /qna/:id/answer API 연결
    Alert.alert('답변이 등록되었습니다.', '', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'< 답변 작성'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionBox}>
          <View style={styles.categoryRow}>
            {item.categories.map((c) => (
              <View key={c} style={styles.badge}>
                <Text style={styles.badgeText}>{c}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.questionTitle}>{item.title}</Text>
          <Text style={styles.questionBody}>{item.content}</Text>
        </View>

        <Text style={styles.label}>답변 내용 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="답변 내용을 작성해 주세요"
          value={answer}
          onChangeText={setAnswer}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.notice}>
          * 답변은 질문자 및 모든 사용자에게 공개됩니다.{'\n'}
          * 신중하게 작성해 주세요.
        </Text>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>답변 등록하기</Text>
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
  questionBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { backgroundColor: '#e8f5e9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  questionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  questionBody: { fontSize: 14, color: '#555', lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#f44336' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0' },
  textarea: { height: 200, marginBottom: 8 },
  notice: { fontSize: 12, color: '#aaa', lineHeight: 20, marginTop: 8 },
  submitBtn: { backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
