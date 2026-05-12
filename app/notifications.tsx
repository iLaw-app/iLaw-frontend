import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from './context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  refId: number | null;
  createdAt: string;
};

function EmptyBellIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <Path
        d="M27.3806 55.998C27.8487 56.8087 28.522 57.4819 29.3327 57.95C30.1434 58.418 31.063 58.6644 31.9992 58.6644C32.9353 58.6644 33.8549 58.418 34.6656 57.95C35.4763 57.4819 36.1496 56.8087 36.6177 55.998"
        stroke="#D1D5DC" strokeWidth="5.33318" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M8.69841 40.868C8.35006 41.2498 8.12017 41.7246 8.03671 42.2347C7.95325 42.7447 8.01981 43.2681 8.2283 43.741C8.4368 44.2139 8.77823 44.6161 9.21107 44.8985C9.64392 45.1809 10.1495 45.3315 10.6664 45.3319H53.3318C53.8486 45.3321 54.3543 45.1821 54.7874 44.9002C55.2205 44.6183 55.5624 44.2166 55.7715 43.744C55.9805 43.2714 56.0477 42.7482 55.9649 42.2381C55.8821 41.728 55.6529 41.2529 55.3051 40.8707C51.7585 37.2148 47.9986 33.3296 47.9986 21.3326C47.9986 17.0892 46.313 13.0197 43.3125 10.0192C40.312 7.01867 36.2424 5.33301 31.9991 5.33301C27.7557 5.33301 23.6862 7.01867 20.6857 10.0192C17.6852 13.0197 15.9995 17.0892 15.9995 21.3326C15.9995 33.3296 12.237 37.2148 8.69841 40.868Z"
        stroke="#D1D5DC" strokeWidth="5.33318" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));

    // 화면 진입 시 전체 읽음 처리
    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
  }, [accessToken]));

  const handlePress = (noti: Notification) => {
    if (noti.type === 'new_question' && noti.refId) {
      router.push(`/qna/${noti.refId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 알림</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <EmptyBellIcon />
            <Text style={styles.emptyText}>알림이 없습니다</Text>
          </View>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {notifications.map((noti) => (
            <TouchableOpacity
              key={noti.id}
              style={[styles.notiCard, noti.read && styles.notiCardRead]}
              activeOpacity={0.7}
              onPress={() => handlePress(noti)}
            >
              <View style={styles.notiLeft}>
                <Ionicons
                  name={noti.type === 'new_question' ? 'chatbubble-outline' : 'book-outline'}
                  size={18}
                  color="#586144"
                />
              </View>
              <View style={styles.notiBody}>
                <Text style={styles.notiTitle}>{noti.title}</Text>
                <Text style={styles.notiDesc} numberOfLines={1}>{noti.body}</Text>
                <Text style={styles.notiDate}>{formatDate(noti.createdAt)}</Text>
              </View>
              {!noti.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  listContent: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  notiCard: {
    flexDirection: 'row', alignItems: 'center', minHeight: 90,
    padding: 17.5, borderRadius: 16, borderWidth: 1.544,
    borderColor: '#CCD9BA', backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  notiCardRead: { backgroundColor: '#FAFAFA', borderColor: '#E4EED4' },
  notiLeft: { marginRight: 12 },
  notiBody: { flex: 1 },
  notiTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 6, lineHeight: 20 },
  notiDesc: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  notiDate: { fontSize: 11, color: '#aaa', lineHeight: 16 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336',
    marginLeft: 8, alignSelf: 'flex-start', marginTop: 4,
  },
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 },
  emptyContainer: {
    width: 345, height: 202, padding: 49, flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', gap: 16, borderRadius: 16,
    borderWidth: 1.544, borderColor: '#CCD9BA', backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
