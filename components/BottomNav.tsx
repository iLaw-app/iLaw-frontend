import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'home',      label: '홈',       icon: 'home-outline'        } as const,
  { name: 'consult',   label: '매뉴얼',   icon: 'book-outline'        } as const,
  { name: 'qna',       label: 'QnA',      icon: 'chatbubbles-outline' } as const,
  { name: 'community', label: '커뮤니티', icon: 'people-outline'      } as const,
  { name: 'profile',   label: '마이페이지', icon: 'person-outline'   } as const,
];

const SEGMENT_TO_TAB: Record<string, string> = {
  'manual-list':   'consult',
  'manual-detail': 'consult',
  'manual-help':   'consult',
  'my-questions':  'profile',
  'my-scraps':     'profile',
  'my-qna-scraps': 'profile',
  'notifications': 'home',
  '[id]':          'qna',
  'ask':           'qna',
  'answer':        'qna',
};

export function BottomNav({ activeTab }: { activeTab?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const lastSegment = segments[segments.length - 1] ?? '';
  const resolvedActive = activeTab ?? SEGMENT_TO_TAB[lastSegment] ?? 'home';

  return (
    <View style={s.bar}>
      <View style={s.tabRow}>
        {TABS.map((tab) => {
          const focused = resolvedActive === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={s.tab}
              activeOpacity={0.8}
              onPress={() => router.push(`/(tabs)/${tab.name}` as any)}
            >
              <View style={[s.item, focused && s.itemActive]}>
                <Ionicons name={tab.icon} size={20} color={focused ? '#3C6802' : '#9CAF88'} />
                <Text style={[s.label, { color: focused ? '#3C6802' : '#9CAF88' }]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E4EED4',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: {
    minWidth: 54,
    height: 44,
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 3,
  },
  itemActive: { backgroundColor: '#EFF4E1' },
  label: { fontSize: 10, fontWeight: '600' },
});
