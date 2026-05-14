import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const REGIONS = [
  '서울', '부산', '대구', '인천', '대전', '광주', '울산', '제주', '세종',
  '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도',
];

const BIRTH_YEARS = Array.from({ length: 2026 - 1900 + 1 }, (_, i) => String(2026 - i));

const NICKNAME_REGEX = /^[a-zA-Z0-9_]*$/;

function PickerModal({
  visible, title, items, selected, onSelect, onClose,
}: {
  visible: boolean; title: string; items: string[];
  selected: string; onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
    </Modal>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, accessToken, setUser, role } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState(user?.region ?? '');
  const [birthYear, setBirthYear] = useState(user?.birthYear ? String(user.birthYear) : '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [affiliation, setAffiliation] = useState(user?.affiliation ?? '');
  const [saving, setSaving] = useState(false);

  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showBirthYearPicker, setShowBirthYearPicker] = useState(false);

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    if (text && !NICKNAME_REGEX.test(text)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
    } else {
      setNicknameError('');
    }
  };

  const handleSave = async () => {
    if (!nickname || !region || !birthYear || !gender) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
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
        body: JSON.stringify({ nickname, region, birthYear: parseInt(birthYear, 10), gender, affiliation: role === 'lawyer' ? affiliation : undefined }),
      });

      if (res.status === 409) {
        Alert.alert('아이디 중복', '이미 사용 중인 아이디입니다.');
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
        setUser({ ...user, nickname, region, birthYear: parseInt(birthYear, 10), gender, affiliation: role === 'lawyer' ? affiliation : user.affiliation });
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
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={12} color="#fff" />
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

        {/* 출생연도 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>출생연도</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectBtn]}
            onPress={() => setShowBirthYearPicker(true)}
          >
            <Text style={birthYear ? styles.selectText : styles.selectPlaceholder}>
              {birthYear || '출생연도를 선택해주세요'}
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
              { value: 'other', label: '기타' },
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
      </ScrollView>

      <PickerModal
        visible={showRegionPicker}
        title="지역 선택"
        items={REGIONS}
        selected={region}
        onSelect={setRegion}
        onClose={() => setShowRegionPicker(false)}
      />
      <PickerModal
        visible={showBirthYearPicker}
        title="출생연도 선택"
        items={BIRTH_YEARS}
        selected={birthYear}
        onSelect={setBirthYear}
        onClose={() => setShowBirthYearPicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#586144' },
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
  cameraBadge: {
    position: 'absolute', bottom: 0, right: '30%',
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#3C6802',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FDFFF8',
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#3C6802', marginBottom: 6 },
  input: {
    width: '100%', paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff', fontSize: 15, color: '#1a1a1a',
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
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
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
