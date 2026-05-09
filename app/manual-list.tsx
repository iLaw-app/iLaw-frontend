import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_LABELS, QUESTIONS } from './data/manualData';

export default function ManualListScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const categoryLabel = CATEGORY_LABELS[categoryId] ?? '매뉴얼';
  const questions = QUESTIONS[categoryId] ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryLabel}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {questions.map((q, index) => (
          <TouchableOpacity
            key={q.id}
            style={styles.questionItem}
            activeOpacity={0.7}
            onPress={() => router.push(`/manual-detail?questionId=${q.id}`)}
          >
            <Text style={styles.questionNumber}>Q{index + 1}.</Text>
            <Text style={styles.questionText}>{q.question}</Text>
            <Ionicons name="chevron-forward" size={18} color="#bbb" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.floatingContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.floatingBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/manual-help?categoryId=${categoryId}`)}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.floatingText}>도움이 필요하신가요?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  content: { paddingBottom: 100 },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 8,
  },
  questionNumber: { fontSize: 15, fontWeight: '700', color: '#4CAF50', minWidth: 28 },
  questionText: { flex: 1, fontSize: 15, color: '#1a1a1a', lineHeight: 22 },
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
