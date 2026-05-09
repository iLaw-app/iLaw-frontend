import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { CATEGORY_LABELS, HELP_INFO, HelpCenter } from './data/manualData';

const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전'];

export default function ManualHelpScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [callTarget, setCallTarget] = useState<HelpCenter | null>(null);

  const categoryLabel = CATEGORY_LABELS[categoryId] ?? '매뉴얼';
  const helpInfo = HELP_INFO[categoryId];
  const filteredCenters = helpInfo?.centers.filter(
    (c) => selectedRegion === '전체' || c.region === selectedRegion,
  ) ?? [];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          여기에서 도움을 받을 수 있어요!
        </Text>
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

        {helpInfo && (
          <View style={s.emergencyBox}>
            <View style={s.emergencyHeader}>
              <Ionicons name="call" size={15} color="#E53935" />
              <Text style={s.emergencyTitle}>긴급 신고 (전국 공통)</Text>
            </View>
            {helpInfo.emergency.map((e, i) => (
              <Text key={i} style={s.emergencyLine}>
                <Text style={s.emergencyLabel}>{e.label}: </Text>
                {e.number}
              </Text>
            ))}
          </View>
        )}

        {filteredCenters.length === 0 ? (
          <Text style={s.emptyText}>선택한 지역에 등록된 기관이 없어요.</Text>
        ) : (
          filteredCenters.map((center, i) => (
            <View key={i} style={s.centerCard}>
              <Text style={s.centerName}>{center.name}</Text>
              <TouchableOpacity
                style={s.phoneRow}
                onPress={() => setCallTarget(center)}
              >
                <Ionicons name="call-outline" size={14} color="#4CAF50" />
                <Text style={s.phoneText}>{center.phone}</Text>
              </TouchableOpacity>
              <View style={s.addressRow}>
                <Ionicons name="location-outline" size={14} color="#bbb" />
                <Text style={s.addressText}>{center.address}</Text>
              </View>
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
                <Text style={s.modalPhone}>{callTarget.phone}</Text>
                <TouchableOpacity
                  style={s.callBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setCallTarget(null);
                    Linking.openURL(`tel:${callTarget.phone.replace(/-/g, '')}`);
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
  container: { flex: 1, backgroundColor: '#fff' },
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
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
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
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
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
  centerName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  phoneText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 13, color: '#999' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalCenterName: { fontSize: 13, color: '#999', marginBottom: 8 },
  modalPhone: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', marginBottom: 24 },
  callBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
