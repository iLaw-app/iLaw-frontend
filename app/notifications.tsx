// app/notifications.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS = [
  { id: 1, type: 'qna',    read: false, title: '내 질문에 답변이 달렸습니다', desc: '알바비를 안 주는데 어떻게 해야 하나요?', date: '2026-05-05 10:30' },
  { id: 2, type: 'qna',    read: false, title: '스크랩한 질문에 답변이 달렸습니다', desc: '학교 단톡방에서 욕을 먹고 있어요', date: '2026-05-04 15:20' },
  { id: 3, type: 'manual', read: true,  title: '매뉴얼이 업데이트되었습니다', desc: '아동학대/가정폭력 카테고리에 새로운 내용이 추가되었습니다', date: '2026-05-03 09:00' },
  { id: 4, type: 'qna',    read: true,  title: '스크랩한 질문에 답변이 달렸습니다', desc: '미성년자 근로계약서 작성 방법이 궁금해요', date: '2026-05-02 14:15' },
];

const hasNotifications = NOTIFICATIONS.length > 0;

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 알림</Text>
        <View style={{ width: 32 }} />
      </View>

      {hasNotifications ? (
        /* ── 알림 있을 때 ── */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {NOTIFICATIONS.map((noti) => (
            <TouchableOpacity key={noti.id} style={styles.notiCard} activeOpacity={0.7}>
              <View style={styles.notiLeft}>
                <Ionicons
                  name={noti.type === 'qna' ? 'chatbubble-outline' : 'book-outline'}
                  size={18}
                  color="#555"
                />
              </View>
              <View style={styles.notiBody}>
                <Text style={styles.notiTitle}>{noti.title}</Text>
                <Text style={styles.notiDesc} numberOfLines={1}>{noti.desc}</Text>
                <Text style={styles.notiDate}>{noti.date}</Text>
              </View>
              {!noti.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* ── 알림 없을 때 ── */
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color="#C8D9C0" />
            <Text style={styles.emptyText}>알림이 없습니다</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf4' },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },

  // 알림 리스트
  listContent: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  notiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  notiLeft: { marginRight: 12 },
  notiBody: { flex: 1 },
  notiTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  notiDesc: { fontSize: 13, color: '#666', marginBottom: 4 },
  notiDate: { fontSize: 11, color: '#aaa' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#F44336',
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  // 알림 없을 때
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 100 },
  emptyContainer: {
    width: 345,
    height: 202,
    borderRadius: 24,
    borderWidth: 1.36,
    borderColor: '#CCD9BA',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: { fontSize: 14, color: '#aaa' },
});