import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Linking, ActivityIndicator,
} from 'react-native';
import { AppModal } from '../components/AppModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';
import { BottomNav } from '../components/BottomNav';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const EMERGENCY: Record<string, { label: string; number: string }[]> = {
  'child-abuse': [
    { label: '아동학대', number: '112 또는 1577-1391' },
    { label: '가정폭력', number: '112 또는 1366' },
    { label: '학교폭력', number: '117' },
  ],
  'sexual-violence': [{ label: '여성긴급전화', number: '1366' }, { label: '성폭력 피해상담', number: '1899-3075' }],
  'online-violence': [{ label: '사이버범죄 신고', number: '182' }],
  'labor': [{ label: '고용노동부 상담', number: '1350' }],
  'finance': [{ label: '금융감독원', number: '1332' }],
};

const REGIONS = ['전체', '서울', '부산', '대구', '인천', '대전', '광주', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

type Agency = { id: number; region: string; name: string; role: string; contact: string };
type TipsKey = 'where' | 'who' | 'what' | 'help' | 'question' | 'evidence';

const TIPS_FIELDS: { key: TipsKey; label: string; placeholder: string }[] = [
  { key: 'where',    label: '어디에서',         placeholder: '예) 학교, 집, 편의점 등' },
  { key: 'who',      label: '누구와',           placeholder: '예) 친구, 선생님, 사장님 등' },
  { key: 'what',     label: '어떤 일을 겪었는지', placeholder: '예) 알바비를 3개월째 못 받았어요' },
  { key: 'help',     label: '받고 싶은 도움',    placeholder: '예) 밀린 알바비를 받고 싶어요' },
  { key: 'question', label: '궁금한 점',         placeholder: '예) 이게 불법인지 궁금해요' },
  { key: 'evidence', label: '가지고 있는 증거',  placeholder: '예) 카카오톡 대화 캡처, 녹음 파일 등' },
];

const initTips = (): Record<TipsKey, string> => ({ where: '', who: '', what: '', help: '', question: '', evidence: '' });

function EmergencyPhoneIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_emergency)">
        <Path
          d="M14.6638 11.2778V13.2774C14.6645 13.4631 14.6265 13.6468 14.5521 13.8169C14.4778 13.987 14.3687 14.1397 14.2319 14.2651C14.0951 14.3906 13.9336 14.4862 13.7578 14.5457C13.5819 14.6051 13.3956 14.6272 13.2107 14.6105C11.1597 14.3876 9.1895 13.6868 7.4585 12.5642C5.84803 11.5409 4.48263 10.1755 3.45927 8.56501C2.33281 6.82614 1.63179 4.84639 1.413 2.78612C1.39635 2.6018 1.41825 2.41604 1.47732 2.24065C1.5364 2.06526 1.63134 1.90409 1.75611 1.7674C1.88089 1.63072 2.03275 1.52151 2.20204 1.44673C2.37134 1.37195 2.55434 1.33325 2.73941 1.33307H4.73903C5.0625 1.32989 5.3761 1.44444 5.62136 1.65537C5.86663 1.86629 6.02683 2.15921 6.0721 2.47952C6.1565 3.11944 6.31302 3.74776 6.53868 4.35249C6.62835 4.59106 6.64776 4.85033 6.5946 5.0996C6.54144 5.34886 6.41794 5.57766 6.23873 5.75888L5.39223 6.60538C6.34109 8.27409 7.72275 9.65576 9.39146 10.6046L10.238 9.75811C10.4192 9.5789 10.648 9.4554 10.8972 9.40224C11.1465 9.34908 11.4058 9.36849 11.6444 9.45816C12.2491 9.68382 12.8774 9.84034 13.5173 9.92474C13.8411 9.97042 14.1368 10.1335 14.3482 10.383C14.5596 10.6325 14.6719 10.9509 14.6638 11.2778Z"
          stroke="#C10007" strokeWidth={1.33308} strokeLinecap="round" strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_emergency">
          <Rect width={15.9969} height={15.9969} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

function ChatIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.4899 12.4933C17.4899 12.935 17.3144 13.3587 17.002 13.6711C16.6897 13.9835 16.266 14.159 15.8242 14.159H5.82995L2.49854 17.4904V4.16473C2.49854 3.72296 2.67403 3.29928 2.98641 2.9869C3.29879 2.67452 3.72247 2.49902 4.16424 2.49902H15.8242C16.266 2.49902 16.6897 2.67452 17.002 2.9869C17.3144 3.29928 17.4899 3.72296 17.4899 4.16473V12.4933Z"
        stroke="white" strokeWidth="1.66571" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ManualHelpScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [callTarget, setCallTarget] = useState<Agency | null>(null);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tipsValues, setTipsValues] = useState<Record<TipsKey, string>>(initTips());

  useEffect(() => {
    const url = selectedRegion === '전체'
      ? `${API_BASE}/manual/categories/${categoryId}/agencies`
      : `${API_BASE}/manual/categories/${categoryId}/agencies?region=${encodeURIComponent(selectedRegion)}`;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(setAgencies)
      .catch(() => setAgencies([]))
      .finally(() => setLoading(false));
  }, [categoryId, selectedRegion]);

  const emergency = EMERGENCY[categoryId ?? ''] ?? [{ label: '경찰', number: '112' }];

  const handleOpenTips = () => {
    setTipsValues(initTips());
    setShowTips(true);
  };

  const handleCloseAll = () => {
    setShowTips(false);
    setCallTarget(null);
    setTipsValues(initTips());
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/[^0-9]/g, '')}`);
  };

  // "/", "또는", "," 모두 구분자로 처리 ("112 또는 1577-1391" → ["112", "1577-1391"])
  const getNumbers = (contact: string) =>
    contact.split(/\/|또는|,/).map(n => n.trim()).filter(Boolean);

  // 긴급 신고 번호도 기관 카드처럼 '전화 걸기' 팝업(이렇게 말하면 좋아요 / 전화 걸기)을 띄운다
  const handleEmergencyPress = (item: { label: string; number: string }) => {
    setCallTarget({ id: -1, region: '', name: item.label, role: '', contact: item.number });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#586144" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>여기에서 도움을 받을 수 있어요!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.sectionLabel}>지역 선택</Text>
        <TouchableOpacity style={s.regionBtn} activeOpacity={0.8} onPress={() => setRegionModalVisible(true)}>
          <Text style={s.regionBtnText}>{selectedRegion === '전체' ? '지역 선택' : selectedRegion}</Text>
          <Ionicons name="chevron-down" size={18} color="#9CAF88" />
        </TouchableOpacity>

        <View style={s.emergencyBox}>
          <View style={s.emergencyHeader}>
            <EmergencyPhoneIcon />
            <Text style={s.emergencyTitle}>긴급 신고 (전국 공통)</Text>
          </View>
          {emergency.map((e, i) => (
            <TouchableOpacity
              key={i}
              style={s.emergencyRow}
              activeOpacity={0.7}
              onPress={() => handleEmergencyPress(e)}
            >
              <Text style={s.emergencyLine}>
                <Text style={s.emergencyLabel}>{e.label}: </Text>
                {e.number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#4CAF50" style={{ marginTop: 20 }} />
        ) : agencies.length === 0 ? (
          <Text style={s.emptyText}>선택한 지역에 등록된 기관이 없어요.</Text>
        ) : (
          agencies.map((agency) => (
            <TouchableOpacity key={agency.id} style={s.centerCard} activeOpacity={0.8} onPress={() => setCallTarget(agency)}>
              <Text style={s.centerName}>{agency.name}</Text>
              {agency.role ? <Text style={s.roleText}>{agency.role}</Text> : null}
              <View style={s.phoneRow}>
                <Ionicons name="call-outline" size={14} color="#3C6802" />
                <Text style={s.phoneText}>{agency.contact}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 지역 선택 모달 */}
      <AppModal visible={regionModalVisible} onRequestClose={() => setRegionModalVisible(false)}>
        <TouchableOpacity style={s.regionModalOverlay} activeOpacity={1} onPress={() => setRegionModalVisible(false)}>
          <View style={s.regionModalCard}>
            <Text style={s.regionModalTitle}>지역 선택</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.regionOption, selectedRegion === r && s.regionOptionActive]}
                  onPress={() => { setSelectedRegion(r); setRegionModalVisible(false); }}
                >
                  <Text style={[s.regionOptionText, selectedRegion === r && s.regionOptionTextActive]}>{r}</Text>
                  {selectedRegion === r && <Ionicons name="checkmark" size={18} color="#3C6802" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </AppModal>

      {/* 전화 걸기 팝업 — 1단계: 기관 정보 */}
      <AppModal visible={callTarget !== null && !showTips} onRequestClose={() => setCallTarget(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>전화 걸기</Text>
              <TouchableOpacity onPress={() => setCallTarget(null)}>
                <Ionicons name="close" size={22} color="#586144" />
              </TouchableOpacity>
            </View>
            {callTarget && (
              <>
                <Text style={s.modalCenterName} numberOfLines={1}>{callTarget.name}</Text>
                <Text style={s.modalPhone}>{callTarget.contact}</Text>
                <View style={s.modalBtns}>
                  <TouchableOpacity style={s.tipsBtn} activeOpacity={0.85} onPress={handleOpenTips}>
                    <Text style={s.tipsBtnText}>이렇게 말하면 좋아요!</Text>
                  </TouchableOpacity>
                  {getNumbers(callTarget.contact).length > 1 ? (
                    getNumbers(callTarget.contact).map((num) => (
                      <TouchableOpacity key={num} style={s.callBtn} activeOpacity={0.85} onPress={() => handleCall(num)}>
                        <Text style={s.callBtnText}>전화 걸기 ({num})</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity style={s.callBtn} activeOpacity={0.85} onPress={() => handleCall(getNumbers(callTarget.contact)[0] ?? callTarget.contact)}>
                      <Text style={s.callBtnText}>전화 걸기</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </AppModal>

      {/* 전화 걸기 팝업 — 2단계: 말하기 팁 폼 */}
      <AppModal visible={callTarget !== null && showTips} onRequestClose={() => setShowTips(false)}>
        <View style={s.tipsOverlay}>
          <View style={s.tipsCardShadow}>
            <View style={s.tipsCardInner}>
              {/* 고정 헤더 */}
              <View style={s.tipsCardTop}>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>전화 걸기</Text>
                  <TouchableOpacity onPress={handleCloseAll}>
                    <Ionicons name="close" size={22} color="#586144" />
                  </TouchableOpacity>
                </View>
                {callTarget && (
                  <>
                    <Text style={s.modalCenterName} numberOfLines={1}>{callTarget.name}</Text>
                    <Text style={s.modalPhone}>{callTarget.contact}</Text>
                  </>
                )}
              </View>

              {/* 스크롤 가능한 폼 */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.tipsScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={s.bigContainer}>
                  <View style={s.tipsHint}>
                    <Text style={s.tipsHintTitle}>전화하기 전에 아래 내용을 정리해보세요</Text>
                    <Text style={s.tipsHintSub}>차근차근 말하면 도움을 받기 쉬워요</Text>
                  </View>

                  {TIPS_FIELDS.map(field => (
                    <View key={field.key} style={s.tipsField}>
                      <Text style={s.tipsFieldLabel}>{field.label}</Text>
                      <TextInput
                        style={[s.tipsFieldInput, field.key === 'what' && s.tipsFieldInputLarge]}
                        placeholder={field.placeholder}
                        placeholderTextColor="rgba(10,10,10,0.30)"
                        value={tipsValues[field.key]}
                        onChangeText={v => setTipsValues(prev => ({ ...prev, [field.key]: v }))}
                        multiline={field.key === 'what'}
                        textAlignVertical={field.key === 'what' ? 'top' : 'center'}
                      />
                    </View>
                  ))}


                </View>
              </ScrollView>

              {/* 고정 하단 */}
              <View style={s.tipsCardBottom}>
                {callTarget && (getNumbers(callTarget.contact).length > 1 ? (
                  getNumbers(callTarget.contact).map((num) => (
                    <TouchableOpacity key={num} style={s.callBtn} activeOpacity={0.85} onPress={() => handleCall(num)}>
                      <Text style={s.callBtnText}>전화 걸기 ({num})</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <TouchableOpacity style={s.callBtn} activeOpacity={0.85} onPress={() => handleCall(getNumbers(callTarget.contact)[0] ?? callTarget.contact)}>
                    <Text style={s.callBtnText}>전화 걸기</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </AppModal>

      <BottomNav activeTab="consult" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15, marginBottom: 10 },

  regionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20,
    backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  regionBtnText: { fontSize: 14, color: '#586144', fontWeight: '500' },

  emergencyBox: {
    backgroundColor: '#FFF5F5', borderRadius: 14, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  emergencyTitle: { fontSize: 18, fontWeight: '700', color: '#C10007', lineHeight: 27, letterSpacing: -0.439 },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, gap: 8 },
  emergencyLine: { flex: 1, fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
  emergencyLabel: { fontWeight: '700' },

  centerCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  centerName: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 27, letterSpacing: -0.439, marginBottom: 4 },
  roleText: { fontSize: 14, fontWeight: '500', color: '#8C937D', lineHeight: 22.75, letterSpacing: -0.15, marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneText: { fontSize: 14, fontWeight: '700', color: '#3C6802', lineHeight: 20, letterSpacing: -0.15 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },

  regionModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  regionModalCard: { width: '100%', maxHeight: 480, backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  regionModalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  regionOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  regionOptionActive: { backgroundColor: '#F4F8EE', borderRadius: 8 },
  regionOptionText: { fontSize: 14, color: '#444' },
  regionOptionTextActive: { color: '#3C6802', fontWeight: '700' },

  // ─── 전화 모달 1단계 ───
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    width: 345,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1.356,
    borderColor: '#FFF',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.10,
    shadowRadius: 25,
    elevation: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#586144', lineHeight: 28, letterSpacing: -0.449 },
  modalCenterName: { fontSize: 16, fontWeight: '400', color: '#586144', lineHeight: 24, letterSpacing: -0.312, marginBottom: 10 },
  modalPhone: { fontSize: 26, fontWeight: '700', color: '#586144', marginBottom: 16 },
  modalBtns: { gap: 10 },

  tipsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 9999, backgroundColor: '#5A7B10',
    paddingVertical: 13, alignSelf: 'stretch',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 4,
  },
  tipsBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF', lineHeight: 24, letterSpacing: -0.312 },

  callBtn: {
    backgroundColor: '#B2D36E', paddingVertical: 14,
    borderRadius: 9999, alignItems: 'center', alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 4,
  },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ─── 전화 모달 2단계 ───
  tipsOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 48,
  },
  tipsCardShadow: {
    width: '100%', flex: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.10,
    shadowRadius: 25,
    elevation: 12,
  },
  tipsCardInner: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  tipsCardTop: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 },
  tipsScroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 },
  tipsCardBottom: {
    paddingHorizontal: 16, paddingVertical: 16, gap: 8,
  },

  bigContainer: {
    borderRadius: 16,
    borderWidth: 1.532,
    borderColor: '#F3F4F6',
    backgroundColor: '#F3F4F6',
    padding: 16,
    gap: 12,
  },
  tipsHint: { gap: 4 },
  tipsHintTitle: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 22, letterSpacing: -0.3 },
  tipsHintSub: { fontSize: 15, fontWeight: '400', color: '#586144', lineHeight: 25 },

  tipsField: { gap: 4 },
  tipsFieldLabel: { fontSize: 14, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  tipsFieldInput: {
    height: 46,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.532,
    borderColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0a0a0a',
    letterSpacing: -0.15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tipsFieldInputLarge: {
    height: 92,
    textAlignVertical: 'top',
  },

  copyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5.995,
    paddingTop: 8.826, paddingRight: 72.236, paddingBottom: 10.228, paddingLeft: 74.412,
    borderRadius: 14,
    borderWidth: 1.532, borderColor: '#F3F4F6',
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  copyBtnText: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
});
