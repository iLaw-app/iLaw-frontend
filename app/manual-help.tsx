import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

const API_BASE = 'https://ilaw-backend.up.railway.app';

const EMERGENCY: Record<string, { label: string; number: string }[]> = {
  'child-abuse': [{ label: '아동학대 신고', number: '112 또는 1391' }],
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
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>여기에서 도움을 받을 수 있어요!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.sectionLabel}>지역 선택</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.regionScroll}
          contentContainerStyle={s.regionContent}
        >
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[s.regionChip, selectedRegion === r && s.regionChipActive]}
              onPress={() => setSelectedRegion(r)}
            >
              <Text style={[s.regionText, selectedRegion === r && s.regionTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
            <View key={agency.id} style={s.centerCard}>
              <Text style={s.centerName}>{agency.name}</Text>
              {agency.role ? <Text style={s.roleText}>{agency.role}</Text> : null}
              <TouchableOpacity
                style={s.phoneRow}
                onPress={() => setCallTarget(agency)}
              >
                <Ionicons name="call-outline" size={14} color="#4CAF50" />
                <Text style={s.phoneText}>{agency.contact}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={callTarget !== null}
        transparent
        animationType="slide"
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
  regionScroll: { marginBottom: 20 },
  regionContent: { gap: 8 },
  regionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  regionChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  regionText: { fontSize: 13, color: '#666' },
  regionTextActive: { color: '#fff', fontWeight: '600' },
  emergencyBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FFBBB0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  centerName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  roleText: { fontSize: 12, color: '#999', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalCenterName: { fontSize: 13, color: '#999', marginBottom: 8 },
  modalPhone: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', marginBottom: 24 },
  callBtn: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
