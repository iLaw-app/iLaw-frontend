import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Pressable, BackHandler, Platform } from 'react-native';
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

const API_BASE = 'https://ilaw-backend.up.railway.app';

function LogoutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M8.99834 20.9955H4.99912C4.46879 20.9955 3.96018 20.7848 3.58518 20.4098C3.21018 20.0348 2.99951 19.5262 2.99951 18.9959V4.99863C2.99951 4.4683 3.21018 3.95969 3.58518 3.5847C3.96018 3.2097 4.46879 2.99902 4.99912 2.99902H8.99834" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M15.9968 16.9971L20.9958 11.998L15.9968 6.99902" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20.9959 11.998H8.99829" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function WithdrawIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15.9968 20.9959V18.9963C15.9968 17.9356 15.5754 16.9184 14.8254 16.1684C14.0754 15.4184 13.0582 14.9971 11.9976 14.9971H5.99873C4.93807 14.9971 3.92085 15.4184 3.17086 16.1684C2.42086 16.9184 1.99951 17.9356 1.99951 18.9963V20.9959" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8.99824 10.9975C11.2069 10.9975 12.9975 9.20695 12.9975 6.99824C12.9975 4.78953 11.2069 2.99902 8.99824 2.99902C6.78953 2.99902 4.99902 4.78953 4.99902 6.99824C4.99902 9.20695 6.78953 10.9975 8.99824 10.9975Z" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16.9966 7.99805L21.9966 12.998" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21.9966 7.99805L16.9966 12.998" stroke="#E7000B" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}


const USER_MENU_ITEMS = [
  { icon: 'bookmark-outline' as const,          label: '내 스크랩',          route: '/my-scraps' },
  { icon: 'chatbubble-outline' as const,        label: '내 질문 보기',       route: '/my-questions' },
  { icon: 'notifications-outline' as const,    label: '알림설정',           route: '/notification-settings' },
  { icon: 'refresh-outline' as const,          label: '튜토리얼 다시보기',   route: '/tutorial-replay' },
  { icon: 'document-text-outline' as const,    label: '이용약관',           route: null },
  { icon: 'shield-outline' as const,           label: '개인정보처리방침',    route: null },
] as const;

const LAWYER_MENU_ITEMS = [
  { icon: 'chatbubble-outline' as const,        label: '내 답변 보기',       route: '/my-answers' },
  { icon: 'notifications-outline' as const,    label: '알림설정',           route: '/notification-settings' },
  { icon: 'document-text-outline' as const,    label: '이용약관',           route: null },
  { icon: 'shield-outline' as const,           label: '개인정보처리방침',    route: null },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { user, accessToken, clearAuth, role, setRoleOverride } = useAuth();

  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []));

  const handleLogout = () => {
    const doLogout = async () => {
      if (accessToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});
      }
      await clearAuth();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('로그아웃 하시겠습니까?')) doLogout();
      return;
    }

    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: doLogout },
    ]);
  };

  const handleTutorialReplay = async () => {
    await SecureStore.deleteItemAsync('airo_tutorial_done');
    await SecureStore.deleteItemAsync('airo_tutorial_phase');
    router.replace('/(tabs)/home' as any);
  };

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);

  const handleWithdraw = () => setShowWithdrawModal(true);

  const doWithdraw = async () => {
    setShowWithdrawModal(false);
    await fetch(`${API_BASE}/auth/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    await clearAuth();
    setShowWithdrawSuccess(true);
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
                onPress={() => item.route === '/tutorial-replay' ? handleTutorialReplay() : item.route ? router.push(item.route as any) : Alert.alert('준비 중입니다.')}
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

        {/* 로그아웃 / 회원탈퇴 */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogoutIcon />
            <Text style={styles.actionBtnText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleWithdraw} activeOpacity={0.8}>
            <WithdrawIcon />
            <Text style={styles.actionBtnText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showWithdrawModal} transparent animationType="fade" onRequestClose={() => setShowWithdrawModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowWithdrawModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>정말로 아이로를 떠나시나요?</Text>
            <Text style={styles.modalBody}>
              {'탈퇴하시면\n지금까지 스크랩한 자료와\n질문 내역이 모두 사라져요.'}
            </Text>
            <TouchableOpacity style={styles.withdrawBtn} onPress={doWithdraw} activeOpacity={0.8}>
              <Text style={styles.withdrawBtnText}>탈퇴할게요</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showWithdrawSuccess} transparent animationType="fade" onRequestClose={() => {}}>
        <Pressable style={styles.modalOverlay} onPress={() => {}}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>회원탈퇴가 완료되었습니다.</Text>
            <Text style={styles.modalBody}>
              {'언제든 다시 돌아와주세요.\n아이로는 항상 여러분을 응원합니다!'}
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => { setShowWithdrawSuccess(false); router.replace('/login'); }} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>확인</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: '#B2D36E',
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
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#1E2939', lineHeight: 24, letterSpacing: -0.312 },
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
