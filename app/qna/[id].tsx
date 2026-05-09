import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_QNA } from '../data/qnaData';
import { useAuth } from '../context/auth';

export default function QnaDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();

  const item = MOCK_QNA.find((q) => q.id === id);
  if (!item) return (
    <SafeAreaView style={styles.container}>
      <Text style={{ padding: 20 }}>질문을 찾을 수 없습니다.</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'< QnA'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoryRow}>
          {item.categories.map((c) => (
            <View key={c} style={styles.badge}>
              <Text style={styles.badgeText}>{c}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>작성자 · {item.createdAt}</Text>
        <Text style={styles.body}>{item.content}</Text>

        <View style={styles.divider} />

        {item.status === 'pending' ? (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingIcon}>🕐</Text>
            <Text style={styles.pendingTitle}>답변 대기 중</Text>
            <Text style={styles.pendingDesc}>변호사님이 검토 중입니다.{'\n'}답변까지 1~3일 정도 소요됩니다.</Text>
            {role === 'lawyer' && (
              <TouchableOpacity
                style={styles.answerBtn}
                onPress={() => router.push(`/qna/answer/${item.id}`)}
              >
                <Text style={styles.answerBtnText}>답변하기</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.answerBox}>
            <View style={styles.lawyerRow}>
              <View style={styles.lawyerAvatar}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>법</Text>
              </View>
              <View>
                <Text style={styles.lawyerName}>{item.answer!.lawyerName}</Text>
                <Text style={styles.lawyerOrg}>{item.answer!.lawyerOrg}</Text>
              </View>
            </View>
            <Text style={styles.answerContent}>{item.answer!.content}</Text>
            <TouchableOpacity style={styles.consultBtn}>
              <Text style={styles.consultBtnText}>1:1 상담 신청</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { backgroundColor: '#e8f5e9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', lineHeight: 28, marginBottom: 8 },
  meta: { fontSize: 12, color: '#aaa', marginBottom: 16 },
  body: { fontSize: 15, color: '#333', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 24 },
  pendingBox: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  pendingIcon: { fontSize: 40, marginBottom: 12 },
  pendingTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  pendingDesc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  answerBtn: { marginTop: 16, backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  answerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  answerBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  lawyerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  lawyerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  lawyerName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  lawyerOrg: { fontSize: 12, color: '#888', marginTop: 2 },
  answerContent: { fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 20 },
  consultBtn: { borderWidth: 1, borderColor: '#4CAF50', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  consultBtnText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
});
