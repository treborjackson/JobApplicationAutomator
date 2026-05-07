import { Tabs } from 'expo-router';
import { View } from 'react-native';

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View className={`w-8 h-8 items-center justify-center rounded-xl ${focused ? 'bg-brand-100' : ''}`}>
      {children}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View className={`w-5 h-5 rounded ${focused ? 'bg-brand-600' : 'bg-gray-300'}`} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View className={`w-4 h-5 border-2 rounded ${focused ? 'border-brand-600' : 'border-gray-300'}`} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="interview"
        options={{
          title: 'Interview',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View className={`w-5 h-4 border-2 rounded-xl ${focused ? 'border-brand-600' : 'border-gray-300'}`} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View className={`w-5 h-4 border-2 rounded ${focused ? 'border-brand-600' : 'border-gray-300'}`} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <View className={`w-4 h-4 border-2 rounded-full ${focused ? 'border-brand-600' : 'border-gray-300'}`} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
