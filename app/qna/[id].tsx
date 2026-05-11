import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type QnADetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
  author: { nickname: string | null };
  answer: {
    id: number;
    content: string;
    createdAt: string;
    lawyer: { nickname: string | null; role: string };
  } | null;
};

export default function QnaDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();
  const [post, setPost] = useState<QnADetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/qna/${id}`)
      .then(r => r.json())
      .then(data => setPost(data?.id ? data : null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20 }}>질문을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'< QnA'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoryRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{post.category}</Text>
          </View>
        </View>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          {post.author.nickname ?? '익명'} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
        </Text>
        <Text style={styles.body}>{post.content}</Text>

        <View style={styles.divider} />

        {post.status === 'pending' ? (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingIcon}>🕐</Text>
            <Text style={styles.pendingTitle}>답변 대기 중</Text>
            <Text style={styles.pendingDesc}>변호사님이 검토 중입니다.{'\n'}답변까지 1~3일 정도 소요됩니다.</Text>
            {role === 'lawyer' && (
              <TouchableOpacity
                style={styles.answerBtn}
                onPress={() => router.push(`/qna/answer/${post.id}`)}
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
                <Text style={styles.lawyerName}>{post.answer?.lawyer.nickname ?? '변호사'}</Text>
                <Text style={styles.lawyerOrg}>법률 전문가</Text>
              </View>
            </View>
            <Text style={styles.answerContent}>{post.answer?.content}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 16, color: '#3C6802', fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { backgroundColor: '#EDF5E1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: '#3C6802', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', lineHeight: 28, marginBottom: 8 },
  meta: { fontSize: 12, color: '#9CAF88', marginBottom: 16 },
  body: { fontSize: 15, color: '#333', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#E4EED4', marginVertical: 24 },
  pendingBox: {
    alignItems: 'center', paddingVertical: 24,
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 1.544, borderColor: '#CCD9BA',
  },
  pendingIcon: { fontSize: 40, marginBottom: 12 },
  pendingTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  pendingDesc: { fontSize: 14, color: '#9CAF88', textAlign: 'center', lineHeight: 22 },
  answerBtn: {
    marginTop: 16, backgroundColor: '#B2D36E', borderRadius: 9999,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  answerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  answerBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 1.544, borderColor: '#CCD9BA',
  },
  lawyerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  lawyerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#DFEDBE', justifyContent: 'center', alignItems: 'center',
  },
  lawyerName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  lawyerOrg: { fontSize: 12, color: '#9CAF88', marginTop: 2 },
  answerContent: { fontSize: 14, color: '#333', lineHeight: 22 },
});
