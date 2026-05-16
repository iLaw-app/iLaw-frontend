import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
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

export default function ManualHelpScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [callTarget, setCallTarget] = useState<Agency | null>(null);
  const [regionModalVisible, setRegionModalVisible] = useState(false);

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

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>여기에서 도움을 받을 수 있어요!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* 지역 선택 버튼 */}
        <Text style={s.sectionLabel}>지역 선택</Text>
        <TouchableOpacity
          style={s.regionBtn}
          activeOpacity={0.8}
          onPress={() => setRegionModalVisible(true)}
        >
          <Text style={s.regionBtnText}>
            {selectedRegion === '전체' ? '지역 선택' : selectedRegion}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CAF88" />
        </TouchableOpacity>

        {/* 긴급 신고 */}
        <View style={s.emergencyBox}>
          <View style={s.emergencyHeader}>
            <Ionicons name="call" size={15} color="#E53935" />
            <Text style={s.emergencyTitle}>긴급 신고 (전국 공통)</Text>
          </View>
          {emergency.map((e, i) => (
            <Text key={i} style={s.emergencyLine}>
              <Text style={s.emergencyLabel}>{e.label}: </Text>
              {e.number}
            </Text>
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
                <Ionicons name="call-outline" size={14} color="#4CAF50" />
                <Text style={s.phoneText}>{agency.contact}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 지역 선택 모달 */}
      <Modal
        visible={regionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRegionModalVisible(false)}
      >
        <TouchableOpacity
          style={s.regionModalOverlay}
          activeOpacity={1}
          onPress={() => setRegionModalVisible(false)}
        >
          <View style={s.regionModalCard}>
            <Text style={s.regionModalTitle}>지역 선택</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.regionOption, selectedRegion === r && s.regionOptionActive]}
                  onPress={() => {
                    setSelectedRegion(r);
                    setRegionModalVisible(false);
                  }}
                >
                  <Text style={[s.regionOptionText, selectedRegion === r && s.regionOptionTextActive]}>
                    {r}
                  </Text>
                  {selectedRegion === r && <Ionicons name="checkmark" size={18} color="#3C6802" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 전화 걸기 팝업 - 화면 중앙 */}
      <Modal
        visible={callTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCallTarget(null)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setCallTarget(null)}
        >
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>전화 걸기</Text>
              <TouchableOpacity onPress={() => setCallTarget(null)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {callTarget && (
              <>
                <Text style={s.modalCenterName}>{callTarget.name}</Text>
                <Text style={s.modalPhone}>{callTarget.contact}</Text>
                <TouchableOpacity
                  style={s.callBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setCallTarget(null);
                    Linking.openURL(`tel:${callTarget.contact.replace(/-/g, '')}`);
                  }}
                >
                  <Text style={s.callBtnText}>전화 걸기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <BottomNav activeTab="consult" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 10 },

  regionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  regionBtnText: { fontSize: 14, color: '#586144', fontWeight: '500' },

  emergencyBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  emergencyTitle: { fontSize: 14, fontWeight: '700', color: '#E53935' },
  emergencyLine: { fontSize: 13, color: '#444', lineHeight: 24 },
  emergencyLabel: { fontWeight: '700' },

  centerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  centerName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  roleText: { fontSize: 12, color: '#999', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },

  // 지역 선택 모달
  regionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  regionModalCard: {
    width: '100%',
    maxHeight: 480,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  regionModalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  regionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  regionOptionActive: { backgroundColor: '#F4F8EE', borderRadius: 8 },
  regionOptionText: { fontSize: 14, color: '#444' },
  regionOptionTextActive: { color: '#3C6802', fontWeight: '700' },

  // 전화 걸기 팝업 - 중앙 배치
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalCenterName: { fontSize: 13, color: '#999', marginBottom: 8 },
  modalPhone: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', marginBottom: 24 },
  callBtn: {
    backgroundColor: '#B2D36E', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
