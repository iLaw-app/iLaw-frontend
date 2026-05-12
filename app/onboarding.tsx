import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from './context/auth';

const REGIONS = [
  '서울', '부산', '대구', '인천', '대전', '광주', '울산', '제주', '세종',
  '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도',
];

const BIRTH_YEARS = Array.from({ length: 2026 - 1900 + 1 }, (_, i) => String(2026 - i));

const NICKNAME_REGEX = /^[a-zA-Z0-9_]*$/;

function PickerModal({
  visible,
  title,
  items,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
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

export default function OnboardingScreen() {
  const API_BASE_URL = 'https://ilaw-backend.up.railway.app';
  const router = useRouter();
  const { accessToken, setUser } = useAuth();

  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAge14, setAgreedAge14] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showBirthYearPicker, setShowBirthYearPicker] = useState(false);

  const allRequiredAgreed = agreedTerms && agreedPrivacy && agreedAge14;

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    if (text && !NICKNAME_REGEX.test(text)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
    } else {
      setNicknameError('');
    }
  };

  const handleAgreeAll = () => {
    const newVal = !(agreedTerms && agreedPrivacy && agreedAge14 && agreedMarketing);
    setAgreedTerms(newVal);
    setAgreedPrivacy(newVal);
    setAgreedAge14(newVal);
    setAgreedMarketing(newVal);
  };

  const handleSubmit = async () => {
    if (!nickname || !region || !birthYear || !gender) {
      Alert.alert('입력 오류', '아이디, 지역, 출생연도, 성별을 모두 입력해주세요.');
      return;
    }
    if (!NICKNAME_REGEX.test(nickname)) {
      Alert.alert('아이디 오류', '아이디는 영어, 숫자, _만 사용 가능합니다.');
      return;
    }
    if (!allRequiredAgreed) {
      Alert.alert('약관 동의', '필수 약관에 모두 동의해주세요.');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        nickname,
        region,
        birthYear: parseInt(birthYear, 10),
        gender,
        agreedTermsOfService: agreedTerms,
        agreedPrivacyPolicy: agreedPrivacy,
        agreedAge14,
        agreedMarketing,
      }),
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
      Alert.alert('오류', '프로필 저장에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (meRes.ok) setUser(await meRes.json());
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.decorCircle} />

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

        {/* 약관 */}
        <View style={styles.agreeBox}>
          <TouchableOpacity style={styles.agreeRow} onPress={handleAgreeAll}>
            <View style={[styles.checkbox, agreedTerms && agreedPrivacy && agreedAge14 && agreedMarketing && styles.checkboxActive]}>
              {agreedTerms && agreedPrivacy && agreedAge14 && agreedMarketing && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.agreeAllText}>전체 동의</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {[
            { label: '이용약관 동의 (필수)', value: agreedTerms, onPress: () => setAgreedTerms(!agreedTerms) },
            { label: '개인정보처리방침 동의 (필수)', value: agreedPrivacy, onPress: () => setAgreedPrivacy(!agreedPrivacy) },
            { label: '14세 이상 확인 (필수)', value: agreedAge14, onPress: () => setAgreedAge14(!agreedAge14) },
            { label: '마케팅 수신 동의 (선택)', value: agreedMarketing, onPress: () => setAgreedMarketing(!agreedMarketing) },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.agreeRow} onPress={item.onPress}>
              <View style={[styles.checkbox, item.value && styles.checkboxActive]}>
                {item.value && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.agreeText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitText}>가입하기</Text>
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
  inner: {
    paddingTop: 48,
    paddingRight: 56,
    paddingBottom: 85,
    paddingLeft: 47,
    alignItems: 'center',
  },
  decorCircle: {
    width: 200,
    height: 200,
    borderRadius: 9999,
    backgroundColor: '#DFEDBE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 36,
  },
  fieldGroup: { width: '100%', marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C6802',
    lineHeight: 20,
    letterSpacing: -0.15,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#1a1a1a',
  },
  inputError: { borderColor: '#f44336' },
  errorText: { fontSize: 12, color: '#f44336', marginTop: 4 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, color: '#1a1a1a' },
  selectPlaceholder: { fontSize: 15, color: '#bbb' },
  selectArrow: { fontSize: 20, color: '#ccc' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    width: 89,
    paddingVertical: 13,
    paddingHorizontal: 29,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBtnActive: { borderColor: '#B2D36E', backgroundColor: '#f4faed' },
  genderText: { fontSize: 14, color: '#888' },
  genderTextActive: { color: '#3C6802', fontWeight: '600' },
  agreeBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  agreeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#ddd', marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#B2D36E', borderColor: '#B2D36E' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  agreeAllText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  agreeText: { fontSize: 13, color: '#555' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },
  submitBtn: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#B2D36E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  closeBtn: { fontSize: 14, color: '#3C6802', fontWeight: '600' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  optionActive: { backgroundColor: '#f4faed' },
  optionText: { fontSize: 15, color: '#333' },
  optionTextActive: { color: '#3C6802', fontWeight: '600' },
  checkIcon: { color: '#3C6802', fontSize: 16, fontWeight: '700' },
});
