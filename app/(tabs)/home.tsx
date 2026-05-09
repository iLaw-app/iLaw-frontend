// app/(tabs)/home.tsx
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── 더미 데이터 ───────────────────────────────────────────
const ALL_CONTENTS = [
  { id: 1, type: '매뉴얼', category: '노동', title: '알바비를 받지 못했을 때 대처법', desc: '근로기준법에 따라 임금체불 시 신고 및 구제 방법을 안내합니다.', views: 342 },
  { id: 2, type: 'QnA',   category: '노동', title: '알바비 안주면 어떻게 해야하나요?', desc: '근로감독관에게 신고하거나 소액사건 재판을 통해 해결할 수 있습니다.', views: 289 },
  { id: 3, type: '매뉴얼', category: '노동', title: '미성년자 근로 시 알아야 할 권리', desc: '미성년자의 근로 시간, 임금, 근로계약서 작성 등에 대해 설명합니다.', views: 215 },
  { id: 4, type: '매뉴얼', category: '아동학대', title: '아동학대 신고 절차 및 방법', desc: '아동학대/가정폭력 카테고리에 새로운 내용이 추가되었습니다.', views: 256 },
  { id: 5, type: 'QnA',   category: '학교폭력', title: '학교 단톡방에서 욕을 먹고 있어요', desc: '사이버불링은 학교폭력에 해당하며 신고 및 대처 방법이 있습니다.', views: 198 },
];

const RECOMMENDED = ALL_CONTENTS.slice(0, 3);

type TabType = '전체' | '매뉴얼' | 'QnA';

// ─── 컴포넌트 ───────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const hasNotification = true; // 나중에 실제 데이터로 교체

  // 검색 실행
  const handleSearch = () => {
    if (searchQuery.trim()) setIsSearching(true);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setActiveTab('전체');
  };

  // 탭 필터 적용한 결과
  const filteredResults = ALL_CONTENTS.filter((item) => {
    const matchesQuery =
      item.title.includes(searchQuery) ||
      item.category.includes(searchQuery) ||
      item.desc.includes(searchQuery);
    const matchesTab =
      activeTab === '전체' || item.type === activeTab;
    return matchesQuery && matchesTab;
  });

  // 콘텐츠 클릭 → 탭 이동
  const handleContentPress = (type: string) => {
    if (type === '매뉴얼') router.push('/(tabs)/consult');
    else router.push('/(tabs)/qna');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* 상단 알림 벨 */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color="#333" />
            {hasNotification && <View style={styles.notiBadge} />}
          </TouchableOpacity>
        </View>

        {/* 타이틀 */}
        {!isSearching && (
          <View style={styles.titleArea}>
            <Text style={styles.title}>아이로</Text>
            <Text style={styles.subtitle}>우리 아이를 지키는 법률 가이드</Text>
          </View>
        )}

        {/* 검색창 */}
        <View style={styles.searchArea}>
          {isSearching && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
          )}
          <View style={[styles.searchBox, isSearching && styles.searchBoxActive]}>
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 내용을 검색해주세요"
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Ionicons name="search" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {!isSearching && (
          <Text style={styles.searchExample}>ex) 알바비 미지급</Text>
        )}

        {/* ── 검색 결과 화면 ── */}
        {isSearching ? (
          <View style={styles.section}>
            <Text style={styles.searchResultTitle}>
              '{searchQuery}'에 대한 검색결과
            </Text>

            {/* 탭 필터 */}
            <View style={styles.tabRow}>
              {(['전체', '매뉴얼', 'QnA'] as TabType[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 결과 목록 */}
            {filteredResults.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              <View style={styles.card}>
                {filteredResults.map((item, index) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.contentItem}
                      activeOpacity={0.7}
                      onPress={() => handleContentPress(item.type)}
                    >
                      <View style={styles.tagRow}>
                        <View style={[styles.tag, item.type === 'QnA' ? styles.tagQna : styles.tagManual]}>
                          <Text style={[styles.tagText, item.type === 'QnA' ? styles.tagTextQna : styles.tagTextManual]}>
                            {item.type === 'QnA' ? '💬' : '📖'} {item.type}
                          </Text>
                        </View>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                      <Text style={styles.contentTitle}>{item.title}</Text>
                      <Text style={styles.contentDesc} numberOfLines={2}>{item.desc}</Text>
                      <Text style={styles.viewCount}>📋 {item.views}</Text>
                    </TouchableOpacity>
                    {index < filteredResults.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            )}
          </View>

        ) : (
          /* ── 홈 메인 화면 ── */
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 추천 콘텐츠</Text>
              <TouchableOpacity>
                <Text style={styles.moreBtn}>더보기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {RECOMMENDED.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.contentItem}
                    activeOpacity={0.7}
                    onPress={() => handleContentPress(item.type)}
                  >
                    <View style={styles.tagRow}>
                      <View style={[styles.tag, item.type === 'QnA' ? styles.tagQna : styles.tagManual]}>
                        <Text style={[styles.tagText, item.type === 'QnA' ? styles.tagTextQna : styles.tagTextManual]}>
                          {item.type === 'QnA' ? '💬' : '📖'} {item.type}
                        </Text>
                      </View>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.contentTitle}>{item.title}</Text>
                    <Text style={styles.viewCount}>📋 {item.views}</Text>
                  </TouchableOpacity>
                  {index < RECOMMENDED.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 스타일 ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0faf4' },

  // 상단 바
  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },

  // 타이틀
  titleArea: { alignItems: 'center', paddingVertical: 20 },
  title: { fontSize: 36, fontWeight: '800', color: '#2E7D32', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666' },

  // 검색
  searchArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  backBtn: { marginRight: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 30, borderWidth: 1.5, borderColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 4 },
  searchBoxActive: { borderColor: '#2E7D32' },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 10 },
  searchBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  searchExample: { fontSize: 12, color: '#4CAF50', marginBottom: 24, marginLeft: 24 },
  searchResultTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },

  // 탭 필터
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  tabBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  // 섹션
  section: { paddingHorizontal: 20, marginBottom: 24, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  moreBtn: { fontSize: 13, color: '#4CAF50' },

  // 카드
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#eee' },
  contentItem: { paddingVertical: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagManual: { backgroundColor: '#E8F5E9' },
  tagQna: { backgroundColor: '#E3F2FD' },
  tagText: { fontSize: 11, fontWeight: '600' },
  tagTextManual: { color: '#2E7D32' },
  tagTextQna: { color: '#1565C0' },
  categoryText: { fontSize: 12, color: '#888' },
  contentTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4, lineHeight: 22 },
  contentDesc: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 6 },
  viewCount: { fontSize: 12, color: '#aaa' },
  divider: { height: 1, backgroundColor: '#f5f5f5' },

  // 빈 결과
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: '#aaa', marginTop: 12 },
});