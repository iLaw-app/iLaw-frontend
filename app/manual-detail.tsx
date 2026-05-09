import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QUESTION_DETAILS, ContentBlock } from './data/manualData';

function ContentRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'summary':
      return (
        <View style={s.summaryBox}>
          <Text style={s.summaryText}>{block.text}</Text>
        </View>
      );
    case 'heading':
      return <Text style={s.heading}>{block.text}</Text>;
    case 'subheading':
      return <Text style={s.subheading}>{block.text}</Text>;
    case 'text':
      return <Text style={s.bodyText}>{block.text}</Text>;
    case 'box':
      return (
        <View style={s.infoBox}>
          <Text style={s.infoBoxText}>{block.text}</Text>
        </View>
      );
    case 'bullet':
      return (
        <View style={s.bulletContainer}>
          {block.items.map((item, i) => (
            <View key={i} style={s.bulletItem}>
              <Text style={s.bulletDot}>•</Text>
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    default:
      return null;
  }
}

export default function ManualDetailScreen() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const detail = QUESTION_DETAILS[questionId];

  if (!detail) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
        <View style={s.emptyState}>
          <Text style={s.emptyText}>내용을 불러올 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{detail.categoryLabel}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.questionHeader}>
          <Text style={s.questionLabel}>Q.</Text>
          <Text style={s.questionText}>{detail.question}</Text>
        </View>

        {detail.content.map((block, i) => (
          <ContentRenderer key={i} block={block} />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

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
  questionHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
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
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginTop: 18,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  bodyText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 23,
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#FFD98A',
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
  },
  infoBoxText: { fontSize: 14, color: '#333', lineHeight: 22 },
  bulletContainer: { marginBottom: 10 },
  bulletItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bulletDot: { fontSize: 14, color: '#4CAF50', lineHeight: 22, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: '#999' },
});
