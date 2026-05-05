import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 가짜 데이터
const contents = [
  { id: 1, type: '매뉴얼', category: '노동', title: '알바비를 받지 못했을 때 대처법', views: 342 },
  { id: 2, type: 'QnA', category: '노동', title: '미성년자 근로계약서 작성 방법이 궁금해요', views: 289 },
  { id: 3, type: '매뉴얼', category: '아동학대', title: '아동학대 신고 절차 및 방법', views: 256 },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 알림 벨 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* 타이틀 */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>아이로</Text>
          <Text style={styles.subtitle}>우리 아이를 지키는 법률 가이드</Text>
        </View>

        {/* 검색창 */}
        <View style={styles.searchArea}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 내용을 검색해주세요"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.searchExample}>ex) 알바비 인증</Text>
        </View>

        {/* 추천 콘텐츠 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 추천 콘텐츠</Text>
            <TouchableOpacity>
              <Text style={styles.moreBtn}>더보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {contents.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.contentItem} activeOpacity={0.7}>
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
                {index < contents.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faf4',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  bellIcon: {
    fontSize: 18,
  },
  titleArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchArea: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 10,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchExample: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  moreBtn: {
    fontSize: 13,
    color: '#4CAF50',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contentItem: {
    paddingVertical: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagManual: {
    backgroundColor: '#E8F5E9',
  },
  tagQna: {
    backgroundColor: '#E3F2FD',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagTextManual: {
    color: '#2E7D32',
  },
  tagTextQna: {
    color: '#1565C0',
  },
  categoryText: {
    fontSize: 12,
    color: '#888',
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 22,
  },
  viewCount: {
    fontSize: 12,
    color: '#aaa',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f5f5',
  },
});