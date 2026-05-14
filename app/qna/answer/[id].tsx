import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth';
import { BottomNav } from '../../../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

export default function AnswerPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('답변 내용을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/qna/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content: answer }),
      });
      if (res.status === 409) {
        Alert.alert('이미 답변된 질문입니다.');
        router.back();
        return;
      }
      if (!res.ok) throw new Error();
      Alert.alert('답변이 등록되었습니다.', '', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('오류', '답변 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'< 답변 작성'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? '등록 중...' : '답변 등록하기'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav activeTab="qna" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 16, color: '#3C6802', fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: '#3C6802', marginBottom: 8 },
  required: { color: '#f44336' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1.5, borderColor: '#CCD9BA' },
  textarea: { height: 200, marginBottom: 8 },
  notice: { fontSize: 12, color: '#9CAF88', lineHeight: 20, marginTop: 8 },
  submitBtn: {
    backgroundColor: '#B2D36E', borderRadius: 9999, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
