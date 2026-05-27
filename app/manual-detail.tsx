import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuth } from './context/auth';
import { BottomNav } from '../components/BottomNav';
import RenderHtml, { HTMLContentModel, HTMLElementModel } from 'react-native-render-html';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type ArticleDetail = {
  id: number;
  question: string;
  summary: string | null;
  content: string;
  category: { name: string; slug: string };
};

function HtmlRenderer({ content }: { content: string }) {
  const { width } = useWindowDimensions();
  const contentWidth = Platform.OS === 'web' ? Math.min(width, 390) - 40 : width - 40;
  return (
    <RenderHtml
      contentWidth={contentWidth}
      source={{ html: content }}
      tagsStyles={{
        h2: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 20, marginBottom: 10 },
        h3: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 18, marginBottom: 8, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#CCD9BA' },
        p: { fontSize: 14, color: '#364153', lineHeight: 23, marginBottom: 10 },
        li: { fontSize: 14, color: '#364153', lineHeight: 22 },
        ul: { marginBottom: 10, paddingLeft: 22 },
        ol: { marginBottom: 10, paddingLeft: 22 },
        strong: { fontWeight: '700' },
        blockquote: { fontSize: 14, color: '#364153', lineHeight: 22, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#F7FEE7', borderTopRightRadius: 10, borderBottomRightRadius: 10, borderLeftWidth: 3.861, borderLeftColor: '#CCD9BA', marginBottom: 8 },
        figcaption: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4 },
        hr: { backgroundColor: '#eee', height: 1, marginVertical: 12 },
        mark: { backgroundColor: 'transparent', color: '#364153' },
      }}
      classesStyles={{
        'bulleted-list': { marginBottom: 10 },
      }}
      renderersProps={{
        img: { enableExperimentalPercentWidth: true },
      }}
    />
  );
}

export default function ManualDetailScreen() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const { accessToken } = useAuth();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapped, setScrapped] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/manual/articles/${articleId}`)
      .then(r => r.json())
      .then(data => setArticle(data?.id ? data : null))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [articleId]);

  useEffect(() => {
    if (!accessToken || !articleId) return;
    fetch(`${API_BASE}/manual/articles/${articleId}/scrap`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(data => {
        setScrapped(data.scrapped);
      })
      .catch(() => {});
  }, [articleId, accessToken]);

  const handleScrap = async () => {
    if (!accessToken) {
      Alert.alert('로그인 필요', '로그인 후 스크랩할 수 있습니다.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/manual/articles/${articleId}/scrap`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setScrapped(data.scrapped);
    } catch {
      Alert.alert('오류', '스크랩 처리에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#586144" />
        </TouchableOpacity>
        {article?.category && <Text style={s.headerTitle}>{article.category.name}</Text>}
      </View>

      {!loading && article && <View style={s.headerDivider} />}

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : !article ? (
        <View style={s.center}><Text style={s.emptyText}>내용을 불러올 수 없어요.</Text></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <View style={s.questionHeader}>
            <Text style={s.questionLabel}>Q.</Text>
            <Text style={s.questionText}>{article.question}</Text>
          </View>

          {article.summary && (
            <View style={s.summaryBox}>
              <Text style={s.summaryText}>{article.summary}</Text>
            </View>
          )}

          <HtmlRenderer content={article.content ?? ''} />

          <View style={s.scrapArea}>
            <TouchableOpacity
              style={[s.scrapBtn, scrapped && s.scrapBtnActive]}
              activeOpacity={0.85}
              onPress={handleScrap}
            >
              <Ionicons name={scrapped ? 'bookmark' : 'bookmark-outline'} size={18} color="#fff" />
              <Text style={s.scrapBtnText}>{scrapped ? '스크랩됨' : '스크랩하기'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <BottomNav activeTab="consult" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#999' },
  questionHeader: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  questionLabel: { fontSize: 18, fontWeight: '700', color: '#000000' },
  questionText: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1a1a1a', lineHeight: 28 },
  summaryBox: {
    backgroundColor: '#F7FEE7',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3.861,
    borderLeftColor: '#CCD9BA',
  },
  summaryText: { fontSize: 15, color: '#364153', lineHeight: 22, fontWeight: '500' },
  headerDivider: { height: 2.5, backgroundColor: '#CCD9BA', width: 348, alignSelf: 'center', marginTop: 8, marginBottom: 8 },
  scrapArea: { alignItems: 'center', marginTop: 36, marginBottom: 40 },
  scrapBtn: {
    width: 290,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B2D36E',
    paddingVertical: 16,
    borderRadius: 9999,
    gap: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 6,
  },
  scrapBtnActive: { backgroundColor: '#3C6802' },
  scrapBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
