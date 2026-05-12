import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth';

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuLabel, danger && styles.menuDanger]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const API_BASE = 'https://ilaw-backend.up.railway.app';

async function updateDevRole(role: 'user' | 'lawyer', accessToken: string) {
  await fetch(`${API_BASE}/auth/dev-role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ role }),
  });
}

const PROVIDER_LABEL: Record<string, string> = {
  kakao: '카카오 로그인',
  naver: '네이버 로그인',
  google: '구글 로그인',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, accessToken, setAccessToken, setUser } = useAuth();

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: () => {
          setAccessToken(null);
          setUser(null);
          router.replace('/login');
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('회원 탈퇴', '정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          await fetch('https://ilaw-backend.up.railway.app/auth/me', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setAccessToken(null);
          setUser(null);
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nickname}>{user?.nickname ?? '닉네임 없음'}</Text>
          <Text style={styles.provider}>{user ? (PROVIDER_LABEL[user.provider] ?? user.provider) : ''}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editBtnText}>수정</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 활동</Text>
        <MenuItem label="내 질문 목록" onPress={() => router.push('/my-questions')} />
        <MenuItem label="스크랩한 매뉴얼" onPress={() => router.push('/my-scraps')} />
        <MenuItem label="스크랩한 Q&A" onPress={() => router.push('/my-qna-scraps')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>푸시 알림</Text>
          <Switch value={true} onValueChange={() => Alert.alert('준비 중')} trackColor={{ true: '#4CAF50' }} />
        </View>
        <MenuItem label="로그아웃" onPress={handleLogout} />
        <MenuItem label="회원 탈퇴" onPress={handleWithdraw} danger />
      </View>

      <View style={styles.devSection}>
        <Text style={styles.devLabel}>🛠 개발용</Text>
        <View style={styles.roleRow}>
          <Text style={styles.menuLabel}>현재 역할: <Text style={{ fontWeight: '700', color: user?.role === 'lawyer' ? '#3C6802' : '#1a1a1a' }}>{user?.role === 'lawyer' ? '변호사' : '일반 유저'}</Text></Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.roleBtn, user?.role === 'user' && styles.roleBtnActive]}
              onPress={async () => { if (user && accessToken) { await updateDevRole('user', accessToken); setUser({ ...user, role: 'user' }); } }}
            >
              <Text style={[styles.roleBtnText, user?.role === 'user' && styles.roleBtnTextActive]}>일반</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, user?.role === 'lawyer' && styles.roleBtnActive]}
              onPress={async () => { if (user && accessToken) { await updateDevRole('lawyer', accessToken); setUser({ ...user, role: 'lawyer' }); } }}
            >
              <Text style={[styles.roleBtnText, user?.role === 'lawyer' && styles.roleBtnTextActive]}>변호사</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16,
    padding: 16, marginBottom: 16,
  },
  nickname: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  provider: { fontSize: 12, color: '#888', marginTop: 2 },
  editBtn: { marginLeft: 'auto', borderWidth: 1, borderColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  sectionTitle: { fontSize: 12, color: '#aaa', fontWeight: '600', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  menuLabel: { fontSize: 15, color: '#1a1a1a', flex: 1 },
  menuDanger: { color: '#f44336' },
  menuArrow: { fontSize: 20, color: '#ccc' },
  devSection: { backgroundColor: '#fffde7', marginHorizontal: 16, borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#ffe082' },
  devLabel: { fontSize: 12, color: '#f9a825', fontWeight: '700', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  roleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#fff9c4' },
  roleBtn: { borderWidth: 1.5, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  roleBtnActive: { backgroundColor: '#3C6802', borderColor: '#3C6802' },
  roleBtnText: { fontSize: 13, color: '#888', fontWeight: '600' },
  roleBtnTextActive: { color: '#fff' },
});
