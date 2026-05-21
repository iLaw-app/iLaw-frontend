import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from './context/auth';
import { useNotificationSettings } from './context/notificationSettings';
import { BottomNav } from '../components/BottomNav';

type NotificationSettingKey = 'answer' | 'scrap' | 'manual' | 'newQuestion' | 'community';

const TYPE_TO_SETTING: Record<string, NotificationSettingKey> = {
  answer:            'answer',
  qna_answered:      'answer',
  scrap_answer:      'scrap',
  manual_update:     'manual',
  new_question:      'newQuestion',
  community_comment: 'community',
  community_like:    'community',
};

const API_BASE = 'https://ilaw-backend.up.railway.app';

// 디자인 확인용 샘플 데이터 — 실제 알림 없을 때만 표시됨. 확인 후 제거 가능
const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'answer',            title: '내 질문에 답변이 달렸습니다',           body: '알바비를 안 주는데 어떻게 해야 하나요?',                              read: false, refId: 1, createdAt: '2026-05-05T10:30:00Z' },
  { id: 2, type: 'scrap_answer',      title: '스크랩한 질문에 답변이 달렸습니다',      body: '학교 단톡방에서 욕을 먹고 있어요',                                  read: false, refId: 2, createdAt: '2026-05-04T15:20:00Z' },
  { id: 3, type: 'manual_update',     title: '매뉴얼이 업데이트되었습니다',            body: '아동학대/가정폭력 카테고리에 새로운 내용이 추가되었습니다',              read: true,  refId: 3, createdAt: '2026-05-03T09:00:00Z' },
  { id: 4, type: 'community_comment', title: '커뮤니티 내 글에 댓글이 달렸습니다',    body: '미성년자 근로계약서 작성 방법이 궁금해요',                            read: true,  refId: 4, createdAt: '2026-05-02T14:15:00Z' },
  { id: 5, type: 'community_like',    title: '커뮤니티 내 글에 좋아요가 달렸습니다',  body: '미성년자 근로계약서 작성 방법이 궁금해요',                            read: true,  refId: 5, createdAt: '2026-05-02T14:15:00Z' },
];

type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  refId: number | null;
  createdAt: string;
  category?: string;
};

// ── 아이콘 ──────────────────────────────────────────────────
function QnaAnswerIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.58105 16.6605C8.17098 17.4761 9.99994 17.697 11.7383 17.2834C13.4767 16.8699 15.0103 15.849 16.0626 14.4048C17.1149 12.9606 17.6168 11.188 17.4778 9.40648C17.3388 7.62498 16.5681 5.95168 15.3045 4.68814C14.041 3.42459 12.3677 2.65389 10.5862 2.51491C8.80469 2.37593 7.03212 2.87781 5.58791 3.93011C4.14369 4.98242 3.12282 6.51594 2.70924 8.25434C2.29565 9.99274 2.51657 11.8217 3.33217 13.4116L1.66608 18.3266L6.58105 16.6605Z"
        stroke="#586144" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function ScrapAnswerIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M15.8279 17.4938L9.99654 14.1617L4.16522 17.4938V4.16512C4.16522 3.72324 4.34076 3.29946 4.65321 2.98701C4.96566 2.67456 5.38944 2.49902 5.83131 2.49902H14.1618C14.6036 2.49902 15.0274 2.67456 15.3399 2.98701C15.6523 3.29946 15.8279 3.72324 15.8279 4.16512V17.4938Z"
        stroke="#586144" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function ManualUpdateIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9.99652 5.83105V17.4937"
        stroke="#586144" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M2.49912 14.9947C2.27818 14.9947 2.0663 14.9069 1.91007 14.7507C1.75384 14.5945 1.66608 14.3826 1.66608 14.1617V3.33207C1.66608 3.11113 1.75384 2.89924 1.91007 2.74302C2.0663 2.58679 2.27818 2.49902 2.49912 2.49902H6.66435C7.5481 2.49902 8.39566 2.85009 9.02056 3.475C9.64547 4.0999 9.99654 4.94746 9.99654 5.83121C9.99654 4.94746 10.3476 4.0999 10.9725 3.475C11.5974 2.85009 12.445 2.49902 13.3287 2.49902H17.4939C17.7149 2.49902 17.9268 2.58679 18.083 2.74302C18.2392 2.89924 18.327 3.11113 18.327 3.33207V14.1617C18.327 14.3826 18.2392 14.5945 18.083 14.7507C17.9268 14.9069 17.7149 14.9947 17.4939 14.9947H12.4957C11.8329 14.9947 11.1972 15.258 10.7285 15.7267C10.2598 16.1954 9.99654 16.831 9.99654 17.4938C9.99654 16.831 9.73323 16.1954 9.26455 15.7267C8.79588 15.258 8.16021 14.9947 7.4974 14.9947H2.49912Z"
        stroke="#586144" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function CommunityIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.4937 1.66602H4.9975C4.55569 1.66602 4.13198 1.84152 3.81958 2.15393C3.50717 2.46633 3.33167 2.89004 3.33167 3.33185V16.6585C3.33167 17.1003 3.50717 17.524 3.81958 17.8364C4.13198 18.1488 4.55569 18.3244 4.9975 18.3244H14.9925C15.4343 18.3244 15.858 18.1488 16.1704 17.8364C16.4828 17.524 16.6583 17.1003 16.6583 16.6585V5.8306L12.4937 1.66602Z"
        stroke="#586144" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M11.6608 1.66602V4.99768C11.6608 5.43949 11.8363 5.8632 12.1487 6.1756C12.4611 6.48801 12.8849 6.66352 13.3267 6.66352H16.6583"
        stroke="#586144" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M8.32916 7.49609H6.66333" stroke="#586144" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.3267 10.8281H6.66333" stroke="#586144" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.3267 14.1592H6.66333" stroke="#586144" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function NotiIcon({ type }: { type: string }) {
  if (type === 'answer' || type === 'qna_answered') return <QnaAnswerIcon />;
  if (type === 'scrap_answer') return <ScrapAnswerIcon />;
  if (type === 'manual_update') return <ManualUpdateIcon />;
  if (type === 'community_comment' || type === 'community_like') return <CommunityIcon />;
  return <QnaAnswerIcon />;
}

// ── 빈 알림 아이콘 ──────────────────────────────────────────
function EmptyBellIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <Path
        d="M27.3806 55.998C27.8487 56.8087 28.522 57.4819 29.3327 57.95C30.1434 58.418 31.063 58.6644 31.9992 58.6644C32.9353 58.6644 33.8549 58.418 34.6656 57.95C35.4763 57.4819 36.1496 56.8087 36.6177 55.998"
        stroke="#CCD9BA" strokeWidth="5.33318" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M8.69841 40.868C8.35006 41.2498 8.12017 41.7246 8.03671 42.2347C7.95325 42.7447 8.01981 43.2681 8.2283 43.741C8.4368 44.2139 8.77823 44.6161 9.21107 44.8985C9.64392 45.1809 10.1495 45.3315 10.6664 45.3319H53.3318C53.8486 45.3321 54.3543 45.1821 54.7874 44.9002C55.2205 44.6183 55.5624 44.2166 55.7715 43.744C55.9805 43.2714 56.0477 42.7482 55.9649 42.2381C55.8821 41.728 55.6529 41.2529 55.3051 40.8707C51.7585 37.2148 47.9986 33.3296 47.9986 21.3326C47.9986 17.0892 46.313 13.0197 43.3125 10.0192C40.312 7.01867 36.2424 5.33301 31.9991 5.33301C27.7557 5.33301 23.6862 7.01867 20.6857 10.0192C17.6852 13.0197 15.9995 17.0892 15.9995 21.3326C15.9995 33.3296 12.237 37.2148 8.69841 40.868Z"
        stroke="#CCD9BA" strokeWidth="5.33318" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── 날짜 포맷 ────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { accessToken, role } = useAuth();
  const { settings } = useNotificationSettings();
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

    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
  }, [accessToken]));

  const visibleNotifications = notifications.filter(n => {
    if (role === 'lawyer' && n.type !== 'new_question') return false;
    const settingKey = TYPE_TO_SETTING[n.type];
    if (!settingKey) return true;
    return settings[settingKey];
  });

  const handlePress = (noti: Notification) => {
    if (!noti.refId) return;
    if (noti.type === 'answer' || noti.type === 'qna_answered' || noti.type === 'scrap_answer') {
      router.push(`/qna/${noti.refId}` as any);
    } else if (noti.type === 'new_question') {
      router.push(`/qna/${noti.refId}` as any);
    } else if (noti.type === 'community_comment' || noti.type === 'community_like') {
      router.push(`/community/${noti.refId}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#586144" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 알림</Text>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator color="#3C6802" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {(visibleNotifications.length > 0 ? visibleNotifications : SAMPLE_NOTIFICATIONS).map((noti) => (
              <TouchableOpacity
                key={noti.id}
                style={[styles.notiCard, noti.read && styles.notiCardRead]}
                activeOpacity={0.7}
                onPress={() => handlePress(noti)}
              >
                <View style={styles.notiLeft}>
                  <NotiIcon type={noti.type} />
                </View>
                <View style={styles.notiBody}>
                  <View style={styles.notiTitleRow}>
                    <Text style={styles.notiTitle}>{noti.title}</Text>
                    {!noti.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notiDesc} numberOfLines={2}>{noti.body}</Text>
                  <Text style={styles.notiDate}>{formatDate(noti.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },

  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100, gap: 12 },

  notiCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 17.5,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  notiCardRead: { backgroundColor: '#FFFFFF' },

  notiLeft: {
    marginRight: 14,
    paddingTop: 4,
  },
  notiBody: { flex: 1 },

  notiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#586144',
    lineHeight: 27,
    letterSpacing: -0.439,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336',
    marginLeft: 8, flexShrink: 0,
  },

  notiDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8C937D',
    lineHeight: 20,
    letterSpacing: -0.15,
    marginBottom: 6,
  },
  notiDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#586144',
    lineHeight: 16,
  },

  emptyWrapper: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 14, color: '#9CAF88' },
});
