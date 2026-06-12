import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuth } from './context/auth';
import { BottomNav } from '../components/BottomNav';
import RenderHtml from 'react-native-render-html';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type ArticleDetail = {
  id: number;
  question: string;
  summary: string | null;
  content: string;
  category: { name: string; slug: string };
};

type Cell = { text: string; isHeader: boolean };
type TableRow = Cell[];

function parseTableRows(tableHtml: string): TableRow[] {
  const rows: TableRow[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(tableHtml)) !== null) {
    const cells: Cell[] = [];
    const cellRegex = /<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
      cells.push({
        isHeader: cellMatch[1].toLowerCase() === 'th',
        text: cellMatch[2].replace(/<[^>]+>/g, '').trim(),
      });
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function NativeTable({ rows, width }: { rows: TableRow[]; width: number }) {
  if (rows.length === 0) return null;
  const colCount = Math.max(...rows.map(r => r.length));
  return (
    <View style={ts.wrapper}>
      {/* 화면 폭에 고정 + 칸 균등(flex) → 행마다 칸 폭이 같아져 줄이 딱 맞음, 긴 텍스트는 줄바꿈 */}
      <View style={[ts.table, { width }]}>
        {rows.map((row, ri) => (
          <View key={ri} style={[ts.row, ri % 2 === 1 && ts.rowEven, ri === rows.length - 1 && ts.rowLast]}>
            {Array.from({ length: colCount }).map((_, ci) => {
              const cell = row[ci];
              return (
                <View key={ci} style={[ts.cell, ci === colCount - 1 && ts.cellLast, cell?.isHeader && ts.headerCell]}>
                  <Text style={[ts.cellText, cell?.isHeader && ts.headerText]}>
                    {cell?.text ?? ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

type HtmlSegment = { type: 'html'; html: string } | { type: 'table'; rows: TableRow[] };

function splitSegments(html: string): HtmlSegment[] {
  const segments: HtmlSegment[] = [];
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  let last = 0;
  let m;
  while ((m = tableRegex.exec(html)) !== null) {
    if (m.index > last) segments.push({ type: 'html', html: html.slice(last, m.index) });
    segments.push({ type: 'table', rows: parseTableRows(m[0]) });
    last = m.index + m[0].length;
  }
  if (last < html.length) segments.push({ type: 'html', html: html.slice(last) });
  return segments;
}

const HTML_TAGS_STYLES = {
  h2: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a1a', marginTop: 20, marginBottom: 10 },
  h3: { fontSize: 15, fontWeight: '700' as const, color: '#333', marginTop: 18, marginBottom: 8, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: '#CCD9BA' },
  p: { fontSize: 14, color: '#364153', lineHeight: 23, marginBottom: 10 },
  li: { fontSize: 14, color: '#364153', lineHeight: 22 },
  ul: { marginBottom: 10, paddingLeft: 22 },
  ol: { marginBottom: 10, paddingLeft: 22 },
  strong: { fontWeight: '700' as const },
  blockquote: { fontSize: 14, color: '#364153', lineHeight: 22, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#F7FEE7', borderTopRightRadius: 10, borderBottomRightRadius: 10, borderLeftWidth: 3.861, borderLeftColor: '#CCD9BA', marginBottom: 8 },
  figcaption: { fontSize: 12, color: '#888', textAlign: 'center' as const, marginTop: 4 },
  hr: { backgroundColor: '#eee', height: 1, marginVertical: 12 },
  mark: { backgroundColor: 'transparent' as const, color: '#364153' },
};

function HtmlRenderer({ content }: { content: string }) {
  const { width } = useWindowDimensions();
  // 웹 미리보기는 폰 프레임 폭(390)으로 고정해 이미지가 브라우저 폭만큼 커지지 않게 함
  const contentWidth = (Platform.OS === 'web' ? Math.min(width, 390) : width) - 40;
  const segments = splitSegments(content);
  return (
    <View>
      {segments.map((seg, i) =>
        seg.type === 'table' ? (
          <NativeTable key={i} rows={seg.rows} width={contentWidth} />
        ) : (
          <RenderHtml
            key={i}
            contentWidth={contentWidth}
            source={{ html: seg.html }}
            tagsStyles={HTML_TAGS_STYLES}
            classesStyles={{ 'bulleted-list': { marginBottom: 10 } }}
            renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
          />
        )
      )}
    </View>
  );
}

export default function ManualDetailScreen() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const { accessToken } = useAuth();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapped, setScrapped] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);

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
        setScrapCount(data.count ?? 0);
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
      if (typeof data.count === 'number') setScrapCount(data.count);
      else setScrapCount(prev => Math.max(0, prev + (data.scrapped ? 1 : -1)));
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
              {scrapCount > 0 && <Text style={s.scrapBtnCount}>{scrapCount}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <BottomNav activeTab="consult" />
    </SafeAreaView>
  );
}

const ts = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  table: { borderWidth: 1, borderColor: '#CCD9BA', borderRadius: 6, overflow: 'hidden', alignSelf: 'flex-start' },
  row: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#CCD9BA' },
  rowEven: { backgroundColor: '#F9FCF4' },
  rowLast: { borderBottomWidth: 0 },
  cell: { flex: 1, borderRightWidth: 1, borderRightColor: '#CCD9BA', paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
  cellLast: { borderRightWidth: 0 },
  headerCell: { backgroundColor: '#F0F7E0' },
  cellText: { fontSize: 13, color: '#364153', lineHeight: 18 },
  headerText: { fontWeight: '700', textAlign: 'center' },
});

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
  scrapBtnCount: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 2 },
});
