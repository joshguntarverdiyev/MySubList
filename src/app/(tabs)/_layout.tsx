import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type IconName = React.ComponentProps<typeof Ionicons>['name']

function tabIcon(name: IconName, focused: boolean) {
  return <Ionicons name={name} size={22} color={focused ? '#7C4DFF' : '#9CA3AF'} />
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C4DFF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderRadius: 30,
          marginHorizontal: 20,
          marginBottom: insets.bottom + 8,
          height: 72,
          paddingBottom: insets.bottom > 0 ? 0 : 8,
          position: 'absolute',
          shadowColor: '#7C4DFF',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 30,
          elevation: 10,
          borderWidth: 1,
          borderColor: '#EFE9FF',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 6,
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => tabIcon('home', focused),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => tabIcon('calendar-outline', focused),
        }}
      />
      <Tabs.Screen
        name="advisor"
        options={{
          title: 'AI Advisor',
          tabBarIcon: ({ focused }) => tabIcon('chatbubble-outline', focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => tabIcon('person-outline', focused),
        }}
      />
    </Tabs>
  )
}
