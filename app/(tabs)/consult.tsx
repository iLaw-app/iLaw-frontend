import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Rect, ClipPath, Defs } from 'react-native-svg';

function IconShield() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M20 13.0004C20 18.0004 16.5 20.5005 12.34 21.9505C12.1222 22.0243 11.8855 22.0207 11.67 21.9405C7.5 20.5005 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconBriefcase() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M15.9996 20V4C15.9996 3.46957 15.7889 2.96086 15.4138 2.58579C15.0388 2.21071 14.5301 2 13.9996 2H9.99963C9.4692 2 8.96049 2.21071 8.58542 2.58579C8.21035 2.96086 7.99963 3.46957 7.99963 4V20" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M19.9999 6H3.99991C2.89534 6 1.99991 6.89543 1.99991 8V18C1.99991 19.1046 2.89534 20 3.99991 20H19.9999C21.1045 20 21.9999 19.1046 21.9999 18V8C21.9999 6.89543 21.1045 6 19.9999 6Z" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconMoney() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Defs>
        <ClipPath id="clip_money">
          <Rect width="23.9989" height="23.9989" fill="white"/>
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip_money)">
        <Path d="M11.9995 2V22" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M16.9997 5H9.49973C8.57147 5 7.68123 5.36875 7.02485 6.02513C6.36847 6.6815 5.99973 7.57174 5.99973 8.5C5.99973 9.42826 6.36847 10.3185 7.02485 10.9749C7.68123 11.6313 8.57147 12 9.49973 12H14.4997C15.428 12 16.3182 12.3687 16.9746 13.0251C17.631 13.6815 17.9997 14.5717 17.9997 15.5C17.9997 16.4283 17.631 17.3185 16.9746 17.9749C16.3182 18.6313 15.428 19 14.4997 19H5.99973" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
    </Svg>
  );
}

const categories = [
  { id: 'child-abuse',        label: '아동학대/가정폭력', desc: '가정 내 폭력, 보호방법',      Icon: IconShield },
  { id: 'labor',              label: '노동',              desc: '아르바이트, 임금, 근로계약',  Icon: IconBriefcase },
  { id: 'finance',            label: '금융',              desc: '빚, 사기, 금융 문제 해결',   Icon: IconMoney },
  { id: 'sexual-violence',    label: '성폭력',            desc: '성착취, 성폭력, 신고방법',   Icon: IconMoney },
  { id: 'online-violence',    label: '온라인폭력',        desc: '사이버 괴롭힘, 악플, 신고',  Icon: IconMoney },
  { id: 'birth-and-parenting',label: '출생·양육',         desc: '출생신고, 입양, 양육비',     Icon: IconMoney },
  { id: 'parental-rights',    label: '법정대리인',        desc: '친권, 후견, 보호제도',       Icon: IconMoney },
];

export default function ManualScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>어떤 도움이 필요하신가요?</Text>
          <Text style={styles.subtitle}>상황에 맞는 법률 정보를 확인해보세요</Text>
        </View>

        <View style={styles.list}>
          {categories.map((cat, index) => {
            const Icon = cat.Icon;
            return (
              <View key={cat.id}>
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/manual-list?categoryId=${cat.id}`)}
                >
                  <View style={styles.iconCircle}>
                    <Icon />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardLabel}>{cat.label}</Text>
                    <Text style={styles.cardDesc}>{cat.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CAF88" />
                </TouchableOpacity>
                {index < categories.length - 1 && <View style={styles.cardDivider} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#9CAF88' },
  list: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E4EED4',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cardDivider: { height: 1, backgroundColor: '#F0F5E8', marginHorizontal: 20 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#DFEDBE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: { flex: 1, paddingHorizontal: 14 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  cardDesc: { fontSize: 12, color: '#9CAF88' },
});
