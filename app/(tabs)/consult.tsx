import { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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

function IconTriangle() {
  return (
    <Svg width={23} height={21} viewBox="0 0 23 21" fill="none">
      <Path d="M20.9979 16.2639L12.9979 2.2639C12.8235 1.9561 12.5705 1.70008 12.2649 1.52197C11.9592 1.34385 11.6117 1.25 11.2579 1.25C10.9041 1.25 10.5567 1.34385 10.251 1.52197C9.94533 1.70008 9.69237 1.9561 9.51793 2.2639L1.51793 16.2639C1.34162 16.5693 1.24916 16.9158 1.24994 17.2684C1.25072 17.621 1.34471 17.9671 1.52238 18.2717C1.70005 18.5763 1.95508 18.8285 2.26163 19.0027C2.56818 19.177 2.91534 19.2671 3.26794 19.2639H19.2679C19.6188 19.2635 19.9635 19.1709 20.2672 18.9952C20.571 18.8195 20.8232 18.567 20.9984 18.263C21.1737 17.959 21.266 17.6143 21.2659 17.2634C21.2658 16.9125 21.1734 16.5678 20.9979 16.2639Z" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconWifi() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M11.9995 19.999H12.0095" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M2 8.81966C4.75011 6.35989 8.31034 5 12 5C15.6897 5 19.2499 6.35989 22 8.81966" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4.99976 12.8586C6.86904 11.0263 9.38223 10 11.9998 10C14.6173 10 17.1305 11.0263 18.9998 12.8586" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8.4996 16.4283C9.43425 15.5122 10.6908 14.999 11.9996 14.999C13.3084 14.999 14.565 15.5122 15.4996 16.4283" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconBaby() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M8.99957 11.999H9.00957" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14.9993 11.999H15.0093" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9.99954 15.999C10.4995 16.299 11.1995 16.499 11.9995 16.499C12.7995 16.499 13.4995 16.299 13.9995 15.999" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M19 6.3C19.906 7.43567 20.5236 8.77378 20.8 10.2C21.1381 10.3638 21.4233 10.6195 21.6229 10.9378C21.8224 11.2562 21.9282 11.6243 21.9282 12C21.9282 12.3757 21.8224 12.7438 21.6229 13.0622C21.4233 13.3805 21.1381 13.6362 20.8 13.8C20.3683 15.8135 19.2592 17.618 17.6577 18.9125C16.0562 20.207 14.0592 20.9132 12 20.9132C9.94076 20.9132 7.94379 20.207 6.34231 18.9125C4.74083 17.618 3.63171 15.8135 3.2 13.8C2.86186 13.6362 2.57668 13.3805 2.37714 13.0622C2.17761 12.7438 2.07178 12.3757 2.07178 12C2.07178 11.6243 2.17761 11.2562 2.37714 10.9378C2.57668 10.6195 2.86186 10.3638 3.2 10.2C3.61426 8.1705 4.71589 6.34602 6.31902 5.03437C7.92216 3.72271 9.92866 3.00418 12 3C14 3 15.5 4.1 15.5 5.5C15.5 6.9 14.6 8 13.5 8C12.7 8 12 7.6 12 7" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconSchool() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 21H21" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4 21V8.5L12 3.5L20 8.5V21" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 21V15.5H14V21" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 3.5V1.5" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconScale() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M15.9993 16L18.9993 8L21.9993 16C21.1293 16.65 20.0793 17 18.9993 17C17.9193 17 16.8693 16.65 15.9993 16Z" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M1.99991 16L4.99991 8L7.99991 16C7.12991 16.65 6.07991 17 4.99991 17C3.91991 17 2.86991 16.65 1.99991 16Z" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6.99966 20.999H16.9997" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11.9995 3V21" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 7H5C7 7 10 6 12 5C14 6 17 7 19 7H21" stroke="white" strokeWidth="2.49989" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

const categories = [
  { id: 'child-abuse',         label: '아동학대/가정폭력', desc: '가정 내 폭력, 보호방법',      Icon: IconShield },
  { id: 'labor',               label: '노동',              desc: '아르바이트, 임금, 근로계약',  Icon: IconBriefcase },
  { id: 'finance',             label: '금융',              desc: '빚, 사기, 금융 문제 해결',   Icon: IconMoney },
  { id: 'sexual-violence',     label: '성폭력',            desc: '성착취, 성폭력, 신고방법',   Icon: IconTriangle },
  { id: 'online-violence',     label: '온라인폭력',        desc: '사이버 괴롭힘, 악플, 신고',  Icon: IconWifi },
  { id: 'birth-and-parenting', label: '출생·양육',         desc: '출생신고, 입양, 양육비',     Icon: IconBaby },
  { id: 'parental-rights',     label: '법정대리인',        desc: '친권, 후견, 보호제도',       Icon: IconScale },
  { id: 'school-violence',    label: '학교폭력',          desc: '학교폭력, 신고절차, 보호',   Icon: IconSchool },
];

export default function ManualScreen() {
  const router = useRouter();


  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []));




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
            const isFirst = index === 0;
            const isLast = index === categories.length - 1;
            return (
              <View key={cat.id}>
                <TouchableOpacity
                  style={[
                    styles.card,
                    isFirst && { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
                    isLast && { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
                  ]}
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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#586144', lineHeight: 32, letterSpacing: 0.07, marginBottom: 4 },
  subtitle: { fontSize: 18, fontWeight: '300', color: '#586144', lineHeight: 32, letterSpacing: 0.07 },
  list: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 4,
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
  cardLabel: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
  cardDesc: { fontSize: 12, fontWeight: '400', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },
});
