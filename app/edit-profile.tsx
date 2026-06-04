import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, FlatList, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';
import { BottomSheet } from '../components/AppModal';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const REGIONS = [
  '선택안함',
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기도', '충청북도', '충청남도', '전라남도', '경상북도', '경상남도', '강원도', '전라북도', '제주',
];

const BIRTH_YEARS = Array.from({ length: 2026 - 1900 + 1 }, (_, i) => String(2026 - i));
const BIRTH_MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
function getBirthDays(year: string, month: string): string[] {
  const y = parseInt(year) || 2000;
  const m = parseInt(month) || 1;
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'));
}

const NICKNAME_REGEX = /^[a-zA-Z0-9_]*$/;

function PickerModal({
  visible, title, items, selected, onSelect, onClose,
}: {
  visible: boolean; title: string; items: string[];
  selected: string; onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.sheetHeader}>
          <Text style={pickerStyles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={pickerStyles.closeBtn}>닫기</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item}
          style={{ maxHeight: 320 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[pickerStyles.option, selected === item && pickerStyles.optionActive]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <Text style={[pickerStyles.optionText, selected === item && pickerStyles.optionTextActive]}>
                {item}
              </Text>
              {selected === item && <Text style={pickerStyles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          )}
        />
      </View>
    </BottomSheet>
  );
}

function BirthDatePickerModal({
  visible, year, month, day, onYearChange, onMonthChange, onDayChange, onClose, onSkip,
}: {
  visible: boolean; year: string; month: string; day: string;
  onYearChange: (v: string) => void; onMonthChange: (v: string) => void;
  onDayChange: (v: string) => void; onClose: () => void; onSkip: () => void;
}) {
  const days = getBirthDays(year, month);
  const renderCol = (data: string[], selected: string, onSelect: (v: string) => void, suffix: string, flex: number) => (
    <FlatList
      style={{ flex, maxHeight: 280 }}
      data={data}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[pickerStyles.option, selected === item && pickerStyles.optionActive]}
          onPress={() => onSelect(item)}
        >
          <Text style={[pickerStyles.optionText, selected === item && pickerStyles.optionTextActive]}>
            {item}{suffix}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
  return (
    <BottomSheet visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.sheetHeader}>
          <TouchableOpacity onPress={onSkip}><Text style={pickerStyles.skipBtn}>선택안함</Text></TouchableOpacity>
          <Text style={pickerStyles.sheetTitle}>생년월일 선택</Text>
          <TouchableOpacity onPress={onClose}><Text style={pickerStyles.closeBtn}>확인</Text></TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {renderCol(BIRTH_YEARS, year, onYearChange, '년', 2)}
          {renderCol(BIRTH_MONTHS, month, onMonthChange, '월', 1)}
          {renderCol(days, day, onDayChange, '일', 1)}
        </View>
      </View>
    </BottomSheet>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, accessToken, setUser, role, clearAuth } = useAuth();

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

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState(user?.region ?? '선택안함');
  const existingBirth = user?.birthDate ? new Date(user.birthDate) : null;
  const [birthYear, setBirthYear] = useState(existingBirth ? String(existingBirth.getFullYear()) : '');
  const [birthMonth, setBirthMonth] = useState(existingBirth ? String(existingBirth.getMonth() + 1).padStart(2, '0') : '');
  const [birthDay, setBirthDay] = useState(existingBirth ? String(existingBirth.getDate()).padStart(2, '0') : '');
  const [gender, setGender] = useState(user?.gender ?? 'none');
  const [affiliation, setAffiliation] = useState(user?.affiliation ?? '');
  const [saving, setSaving] = useState(false);

  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    if (text && !NICKNAME_REGEX.test(text)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
    } else {
      setNicknameError('');
    }
  };

  const handleSave = async () => {
    if (!nickname) {
      Alert.alert('입력 오류', '아이디를 입력해주세요.');
      return;
    }
    if (!NICKNAME_REGEX.test(nickname)) {
      Alert.alert('아이디 오류', '아이디는 영어, 숫자, _만 사용 가능합니다.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          nickname,
          region: region === '선택안함' || !region ? null : region,
          birthDate: birthYear ? `${birthYear}-${birthMonth}-${birthDay}` : null,
          gender: gender === 'none' || !gender ? null : gender,
          affiliation: role === 'lawyer' ? affiliation : undefined,
        }),
      });

      if (res.status === 409) {
        setNicknameError('이미 사용 중인 아이디입니다.');
        return;
      }
      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        Alert.alert('입력 오류', data.message ?? '입력값을 확인해주세요.');
        return;
      }
      if (!res.ok) {
        Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (user) {
        setUser({
          ...user,
          nickname,
          region: region === '선택안함' || !region ? null : region,
          birthDate: birthYear ? `${birthYear}-${birthMonth}-${birthDay}` : null,
          gender: gender === 'none' || !gender ? null : gender,
          affiliation: role === 'lawyer' ? affiliation : user.affiliation,
        });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
          <Text style={styles.headerTitle}>정보 수정</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* 아바타 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={46} color="#fff" />
          </View>
        </View>

        {/* 아이디 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={[styles.input, nicknameError ? styles.inputError : null]}
            placeholder="영어, 숫자, _만 사용 가능"
            placeholderTextColor="#bbb"
            value={nickname}
            onChangeText={handleNicknameChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
        </View>

        {/* 지역 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>지역</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectBtn]}
            onPress={() => setShowRegionPicker(true)}
          >
            <Text style={region ? styles.selectText : styles.selectPlaceholder}>
              {region || '지역을 선택해주세요'}
            </Text>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 생년월일 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>생년월일</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectBtn]}
            onPress={() => setShowBirthDatePicker(true)}
          >
            <Text style={birthYear ? styles.selectText : styles.selectPlaceholder}>
              {birthYear ? `${birthYear}년 ${birthMonth}월 ${birthDay}일` : '생년월일을 선택해주세요'}
            </Text>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 소속 (변호사 전용) */}
        {role === 'lawyer' && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>소속</Text>
            <TextInput
              style={styles.input}
              placeholder="소속 기관을 입력해주세요"
              placeholderTextColor="#bbb"
              value={affiliation}
              onChangeText={setAffiliation}
            />
          </View>
        )}

        {/* 성별 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>성별</Text>
          <View style={styles.genderRow}>
            {[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
              { value: 'none', label: '선택안함' },
            ].map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.genderBtn, gender === g.value && styles.genderBtnActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.genderText, gender === g.value && styles.genderTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>{saving ? '저장 중...' : '저장하기'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={16} color="#C10007" />
          <Text style={styles.logoutBtnText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      <PickerModal
        visible={showRegionPicker}
        title="지역 선택"
        items={REGIONS}
        selected={region}
        onSelect={setRegion}
        onClose={() => setShowRegionPicker(false)}
      />
      <BirthDatePickerModal
        visible={showBirthDatePicker}
        year={birthYear} month={birthMonth} day={birthDay}
        onYearChange={setBirthYear} onMonthChange={setBirthMonth} onDayChange={setBirthDay}
        onClose={() => setShowBirthDatePicker(false)}
        onSkip={() => { setBirthYear(''); setBirthMonth(''); setBirthDay(''); setShowBirthDatePicker(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#586144' },
  saveBtn: { fontSize: 15, color: '#3C6802', fontWeight: '700', width: 32, textAlign: 'right' },
  saveBtnDisabled: { color: '#aaa' },
  inner: { padding: 20, gap: 4 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 9999,
    backgroundColor: '#B2D36E',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#3C6802', marginBottom: 6 },
  input: {
    width: '100%', paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff', fontSize: 15, color: '#1a1a1a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  inputError: { borderColor: '#f44336' },
  errorText: { fontSize: 12, color: '#f44336', marginTop: 4 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, color: '#1a1a1a' },
  selectPlaceholder: { fontSize: 15, color: '#bbb' },
  selectArrow: { fontSize: 20, color: '#ccc' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  genderBtnActive: { borderColor: '#B2D36E', backgroundColor: '#f4faed' },
  genderText: { fontSize: 14, color: '#888' },
  genderTextActive: { color: '#3C6802', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#B2D36E', borderRadius: 9999,
    paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, marginTop: 4, marginBottom: 8,
  },
  logoutBtnText: { fontSize: 14, fontWeight: '600', color: '#C10007' },
});

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  closeBtn: { fontSize: 14, color: '#3C6802', fontWeight: '600' },
  skipBtn: { fontSize: 14, color: '#888', fontWeight: '500' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f8f8f8',
  },
  optionActive: { backgroundColor: '#f4faed' },
  optionText: { fontSize: 15, color: '#333' },
  optionTextActive: { color: '#3C6802', fontWeight: '600' },
  checkIcon: { color: '#3C6802', fontSize: 16, fontWeight: '700' },
});
