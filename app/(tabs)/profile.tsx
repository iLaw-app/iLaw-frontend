import { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, ClipPath, Defs, Rect } from 'react-native-svg';

function PencilIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <G clipPath="url(#pencilClip)">
        <Path d="M10.5804 3.40369C10.8446 3.13957 10.993 2.78132 10.9931 2.40775C10.9931 2.03418 10.8448 1.67589 10.5807 1.4117C10.3165 1.14752 9.95828 0.99907 9.58471 0.999023C9.21114 0.998977 8.85286 1.14733 8.58867 1.41145L1.9199 8.08173C1.80388 8.1974 1.71808 8.33983 1.67005 8.49646L1.00997 10.6711C0.997058 10.7143 0.996083 10.7602 1.00715 10.8039C1.01822 10.8476 1.04091 10.8876 1.07283 10.9194C1.10475 10.9513 1.1447 10.9739 1.18844 10.9849C1.23218 10.9959 1.27808 10.9949 1.32128 10.9819L3.4964 10.3223C3.65288 10.2747 3.79529 10.1894 3.91113 10.074L10.5804 3.40369Z" stroke="#5EA500" strokeWidth="1.24921" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7.49536 2.49805L9.49409 4.49678" stroke="#5EA500" strokeWidth="1.24921" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
      <Defs>
        <ClipPath id="pencilClip">
          <Rect width="11.9924" height="11.9924" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}
import { useAuth } from '../context/auth';
import * as SecureStore from 'expo-secure-store';


const USER_MENU_ITEMS = [
  { icon: 'bookmark-outline' as const,          label: '내 스크랩',          route: '/my-scraps' },
  { icon: 'chatbubble-outline' as const,        label: '내 질문 보기',       route: '/my-questions' },
  { icon: 'notifications-outline' as const,    label: '알림설정',           route: '/notification-settings' },
  { icon: 'refresh-outline' as const,          label: '튜토리얼 다시보기',   route: '/tutorial-replay' },
  { icon: 'document-text-outline' as const,    label: '이용약관',           route: '/terms' },
  { icon: 'shield-outline' as const,           label: '개인정보처리방침',    route: '/privacy' },
] as const;

const LAWYER_MENU_ITEMS = [
  { icon: 'chatbubble-outline' as const,        label: '내 답변 보기',       route: '/my-answers' },
  { icon: 'notifications-outline' as const,    label: '알림설정',           route: '/notification-settings' },
  { icon: 'document-text-outline' as const,    label: '이용약관',           route: '/terms' },
  { icon: 'shield-outline' as const,           label: '개인정보처리방침',    route: '/privacy' },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { user, role, setRoleOverride } = useAuth();

  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []));

  const handleTutorialReplay = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('airo_tutorial_done');
      localStorage.removeItem('airo_tutorial_phase');
      sessionStorage.setItem('airo_tutorial_pending', '1');
    } else {
      await SecureStore.deleteItemAsync('airo_tutorial_done');
      await SecureStore.deleteItemAsync('airo_tutorial_phase');
    }
    router.replace('/(tabs)/home' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>마이페이지</Text>

        {/* 프로필 아바타 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={() => router.push('/edit-profile')} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={38} color="#fff" />
            </View>
            <View style={styles.editBadge}>
              <PencilIcon />
            </View>
          </TouchableOpacity>
          {role === 'lawyer' ? (
            <>
              <Text style={styles.nickname}>{user?.nickname ?? ''} 변호사</Text>
              <Text style={styles.lawyerAffiliation}>{user?.affiliation ?? '소속 미등록'}</Text>
            </>
          ) : (
            <Text style={styles.nickname}>{user?.nickname ?? 'user'}</Text>
          )}
        </View>

        {/* 메뉴 카드 */}
        <View style={styles.menuCard}>
          {(role === 'lawyer' ? LAWYER_MENU_ITEMS : USER_MENU_ITEMS).map((item, idx) => {
            const menuList = role === 'lawyer' ? LAWYER_MENU_ITEMS : USER_MENU_ITEMS;
            return (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.route === '/tutorial-replay') handleTutorialReplay();
                  else if (item.route) router.push(item.route as any);
                  else Alert.alert('준비 중입니다.');
                }}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon} size={20} color="#586144" />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#99A1AF" />
              </TouchableOpacity>
              {idx < menuList.length - 1 && <View style={styles.menuDivider} />}
            </View>
            );
          })}
          <View style={styles.menuDivider} />
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="information-circle-outline" size={20} color="#586144" />
              <Text style={styles.menuLabel}>앱버전</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </View>

        {/* DEV: 역할 전환 */}
        <TouchableOpacity
          style={styles.devToggle}
          onPress={() => setRoleOverride(role === 'lawyer' ? 'user' : 'lawyer')}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-horizontal-outline" size={14} color="#9CAF88" />
          <Text style={styles.devToggleText}>
            [DEV] {role === 'lawyer' ? '변호사 모드' : '유저 모드'} — 탭하여 전환
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07, marginBottom: 12 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: {
    width: 81, height: 81, borderRadius: 9999,
    backgroundColor: '#CCD9BA',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 9999,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.356, borderColor: '#D8F999',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  nickname: { fontSize: 28, fontWeight: '700', color: '#4A5565', marginTop: 12, lineHeight: 34, letterSpacing: -0.15 },
  lawyerAffiliation: { fontSize: 14, color: '#9CAF88', marginTop: 4, fontWeight: '500' },

  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.356, borderColor: '#FFF',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 16, height: 56,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
  menuDivider: { height: 1, backgroundColor: '#F0F5E8', marginHorizontal: 18 },
  versionText: { fontSize: 14, color: '#9CAF88', fontWeight: '500' },

  devToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, marginBottom: 12,
  },
  devToggleText: { fontSize: 12, color: '#9CAF88' },
  btnRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    height: 47,
    borderRadius: 16,
    borderWidth: 1.356, borderColor: '#FFF',
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 16,
  },
  modalCard: {
    width: '100%', maxWidth: 361, borderRadius: 24,
    borderWidth: 1.356, borderColor: '#FFF', backgroundColor: '#FFF',
    paddingTop: 25.504, paddingHorizontal: 25, paddingBottom: 18.471,
    alignItems: 'center', gap: 14.025,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  modalTitle: {
    fontSize: 20, fontWeight: '700', color: '#4A5565',
    lineHeight: 28, letterSpacing: -0.449, textAlign: 'center',
  },
  modalBody: { fontSize: 14, color: '#364153', lineHeight: 22, textAlign: 'center' },
  withdrawBtn: {
    width: 209, height: 36, borderRadius: 14,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: '#FB2C36',
    justifyContent: 'center', alignItems: 'center',
  },
  withdrawBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  confirmBtn: {
    width: 209, height: 36, borderRadius: 14,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: '#B2D36E',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
