import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Platform } from 'react-native';
import { TutorialSlideshow } from '../../components/TutorialSlideshow';
import { useTutorial } from '../context/tutorial';

const TAB_SCREENS = [
  { name: 'home',      title: '홈',       icon: 'home-outline'        } as const,
  { name: 'consult',   title: '매뉴얼',   icon: 'book-outline'        } as const,
  { name: 'qna',       title: 'Q&A',      icon: 'chatbubbles-outline' } as const,
  { name: 'community', title: '커뮤니티', icon: 'people-outline'      } as const,
  { name: 'profile',   title: '마이페이지', icon: 'person-outline'   } as const,
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={s.bar}>
      <View style={s.tabRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.title ?? route.name;
          const screen = TAB_SCREENS.find(t => t.name === route.name);
          const iconName = screen?.icon ?? ('ellipse-outline' as const);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={s.tab}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <View style={[s.item, isFocused && s.itemActive]}>
                <Ionicons name={iconName} size={24} color={isFocused ? '#3C6802' : '#6A7282'} />
                <Text style={[s.label, { color: isFocused ? '#3C6802' : '#6A7282' }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    paddingHorizontal: 19,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
  },
  tab: { alignItems: 'center', justifyContent: 'center' },
  item: {
    width: 58,
    height: 60,
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  itemActive: { backgroundColor: '#EFF4E1' },
  label: { fontSize: 10, fontWeight: '700', lineHeight: 14 },
});

export default function TabLayout() {
  const { visible, complete } = useTutorial();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
        backBehavior="none"
      >
        {TAB_SCREENS.map((screen) => (
          <Tabs.Screen
            key={screen.name}
            name={screen.name}
            options={{ title: screen.title }}
          />
        ))}
      </Tabs>
      {Platform.OS !== 'web' && <TutorialSlideshow visible={visible} onDone={complete} />}
    </View>
  );
}
