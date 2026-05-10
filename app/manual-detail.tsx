import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type ArticleDetail = {
  id: number;
  question: string;
  summary: string | null;
  content: string;
  category: { name: string; slug: string };
};

function stripInline(text: string) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .trim();
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <View key={`b-${key++}`} style={s.bulletContainer}>
        {bulletBuffer.map((item, i) => (
          <View key={i} style={s.bulletItem}>
            <Text style={s.bulletDot}>•</Text>
            <Text style={s.bulletText}>{stripInline(item)}</Text>
          </View>
        ))}
      </View>
    );
    bulletBuffer = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (/^-{3,}$/.test(t)) {
      flushBullets();
      elements.push(<View key={key++} style={s.divider} />);
    } else if (t.startsWith('|')) {
      // skip table rows
    } else if (t.startsWith('![')) {
      flushBullets();
      const imgMatch = t.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        elements.push(
          <Image key={key++} source={{ uri: imgMatch[2] }} style={s.contentImage} resizeMode="contain" />
        );
      }
    } else if (t.startsWith('>')) {
      flushBullets();
      const quotedText = stripInline(t.replace(/^>\s*/, ''));
      if (quotedText) {
        elements.push(<Text key={key++} style={s.blockquote}>{quotedText}</Text>);
      }
    } else if (t.startsWith('## ')) {
      flushBullets();
      elements.push(<Text key={key++} style={s.heading}>{stripInline(t.slice(3))}</Text>);
    } else if (t.startsWith('### ')) {
      flushBullets();
      elements.push(<Text key={key++} style={s.subheading}>{stripInline(t.slice(4))}</Text>);
    } else if (t.startsWith('- ') || t.startsWith('* ')) {
      bulletBuffer.push(t.slice(2));
    } else if (t === '') {
      flushBullets();
    } else {
      flushBullets();
      const cleaned = stripInline(t);
      if (cleaned) {
        elements.push(<Text key={key++} style={s.bodyText}>{cleaned}</Text>);
      }
    }
  }
  flushBullets();
  return <>{elements}</>;
}

export default function ManualDetailScreen() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/manual/articles/${articleId}`)
      .then(r => r.json())
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [articleId]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        {article?.category && <Text style={s.headerTitle}>{article.category.name}</Text>}
      </View>

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
              <Text style={s.summaryText}>{stripInline(article.summary)}</Text>
            </View>
          )}

          <MarkdownRenderer content={article.content} />
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.scrapBtn}
          activeOpacity={0.85}
          onPress={() => Alert.alert('스크랩', '스크랩되었어요!')}
        >
          <Ionicons name="bookmark-outline" size={18} color="#fff" />
          <Text style={s.scrapBtnText}>스크랩하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#999' },
  questionHeader: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  questionLabel: { fontSize: 18, fontWeight: '700', color: '#4CAF50' },
  questionText: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1a1a1a', lineHeight: 28 },
  summaryBox: {
    backgroundColor: '#F5FAF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  summaryText: { fontSize: 15, color: '#2d6a2d', lineHeight: 22, fontWeight: '500' },
  heading: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 20, marginBottom: 10 },
  subheading: {
    fontSize: 15, fontWeight: '700', color: '#333',
    marginTop: 18, marginBottom: 8, paddingLeft: 10,
    borderLeftWidth: 3, borderLeftColor: '#4CAF50',
  },
  bodyText: { fontSize: 14, color: '#444', lineHeight: 23, marginBottom: 10 },
  bulletContainer: { marginBottom: 10 },
  bulletItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bulletDot: { fontSize: 14, color: '#4CAF50', lineHeight: 22, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  contentImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  blockquote: { fontSize: 14, color: '#555', lineHeight: 22, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: '#ccc', marginBottom: 8, fontStyle: 'italic' },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  scrapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scrapBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
