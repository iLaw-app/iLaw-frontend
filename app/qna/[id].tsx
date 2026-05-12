import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal } from 'react-native';
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
  imageUrls: string[];
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
  const { role, accessToken } = useAuth();

  const handleScrap = async () => {
    if (!accessToken) return;
    setScrapLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qna/${id}/scrap`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setScrapped(data.scrapped);
    } finally {
      setScrapLoading(false);
    }
  };
  const [post, setPost] = useState<QnADetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scrapped, setScrapped] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/qna/${id}`)
      .then(r => r.json())
      .then(data => setPost(data?.id ? data : null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    if (accessToken) {
      fetch(`${API_BASE}/qna/${id}/scrap`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(data => setScrapped(data.scrapped ?? false))
        .catch(() => {});
    }
  }, [id]));

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
        <TouchableOpacity onPress={handleScrap} disabled={scrapLoading} style={styles.scrapBtn}>
          <Text style={styles.scrapIcon}>{scrapped ? '🔖' : '📄'}</Text>
          <Text style={[styles.scrapText, scrapped && styles.scrapTextActive]}>
            {scrapped ? '스크랩됨' : '스크랩'}
          </Text>
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

        {post.imageUrls?.length > 0 && (
          <View style={styles.imageRow}>
            {post.imageUrls.map((url, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedImage(url)}>
                <Image source={{ uri: url }} style={styles.imageThumb} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedImage(null)}>
            <Image source={{ uri: selectedImage! }} style={styles.modalImage} resizeMode="contain" />
          </TouchableOpacity>
        </Modal>

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
  topBar: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scrapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scrapIcon: { fontSize: 18 },
  scrapText: { fontSize: 13, color: '#aaa', fontWeight: '600' },
  scrapTextActive: { color: '#3C6802' },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  imageThumb: { width: 100, height: 100, borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '100%' },
});
