import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const API_BASE_URL = 'https://ilaw-backend.up.railway.app';
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [region, setRegion] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAge14, setAgreedAge14] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  const allRequiredAgreed = agreedTerms && agreedPrivacy && agreedAge14;

  const handleAgreeAll = () => {
    const newVal = !(agreedTerms && agreedPrivacy && agreedAge14 && agreedMarketing);
    setAgreedTerms(newVal);
    setAgreedPrivacy(newVal);
    setAgreedAge14(newVal);
    setAgreedMarketing(newVal);
  };

  const handleSubmit = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>⚖️</Text>
        </View>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>아이로와 함께 시작해요</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor="#bbb"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>지역</Text>
          <TextInput
            style={styles.input}
            placeholder="예) 서울특별시"
            placeholderTextColor="#bbb"
            value={region}
            onChangeText={setRegion}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>출생연도</Text>
          <TextInput
            style={styles.input}
            placeholder="예) 2000"
            placeholderTextColor="#bbb"
            value={birthYear}
            onChangeText={setBirthYear}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

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

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>이미 계정이 있으신가요? 로그인</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf4' },
  inner: { paddingHorizontal: 28, paddingVertical: 32, alignItems: 'center' },
  logoCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#4CAF50', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 32 },
  fieldGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    width: '100%', paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff', fontSize: 15, color: '#1a1a1a',
  },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
    alignItems: 'center',
  },
  genderBtnActive: { borderColor: '#4CAF50', backgroundColor: '#f0faf4' },
  genderText: { fontSize: 14, color: '#888' },
  genderTextActive: { color: '#4CAF50', fontWeight: '600' },
  agreeBox: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#eee',
  },
  agreeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#ddd', marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  agreeAllText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  agreeText: { fontSize: 13, color: '#555' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },
  submitBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 30,
    backgroundColor: '#4CAF50', alignItems: 'center', marginBottom: 16,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  backText: { fontSize: 13, color: '#888' },
});