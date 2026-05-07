import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/authStore';

function SettingsRow({ label, value, onPress, destructive }: {
  label: string; value?: string; onPress?: () => void; destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 border-b border-gray-50"
      disabled={!onPress}
    >
      <Text className={`text-sm ${destructive ? 'text-red-500' : 'text-gray-800'}`}>{label}</Text>
      {value && <Text className="text-sm text-gray-400">{value}</Text>}
    </TouchableOpacity>
  );
}

export default function Settings() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-brand-600 pt-14 pb-6 px-4">
        <Text className="text-white text-lg font-bold">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-5 pb-2">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account</Text>
        </View>
        <View className="bg-white rounded-2xl border border-gray-100 mx-4 overflow-hidden">
          <SettingsRow label="Name" value={user?.full_name ?? '—'} />
          <SettingsRow label="Email" value={user?.email ?? '—'} />
        </View>

        <View className="px-4 pt-5 pb-2">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider">App</Text>
        </View>
        <View className="bg-white rounded-2xl border border-gray-100 mx-4 overflow-hidden">
          <SettingsRow label="Version" value="1.0.0" />
          <SettingsRow label="Notifications" value="Enabled" />
        </View>

        <View className="px-4 pt-5 pb-2">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wider">Session</Text>
        </View>
        <View className="bg-white rounded-2xl border border-gray-100 mx-4 overflow-hidden">
          <SettingsRow label="Sign out" onPress={handleLogout} destructive />
        </View>
      </ScrollView>
    </View>
  );
}
