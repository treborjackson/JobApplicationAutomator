import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const STATUS_COLOR: Record<string, string> = {
  pending:   'text-yellow-700 bg-yellow-50',
  interview: 'text-blue-700 bg-blue-50',
  offer:     'text-green-700 bg-green-50',
  rejected:  'text-red-600 bg-red-50',
  withdrawn: 'text-gray-500 bg-gray-50',
};

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 mx-1">
      <Text className="text-xs text-gray-400 mb-1">{label}</Text>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
    </View>
  );
}

export default function Dashboard() {
  const user = useAuthStore(s => s.user);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => api.get('/dashboard/recent').then(r => r.data),
  });

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="bg-brand-600 pt-14 pb-8 px-5">
        <Text className="text-white/70 text-sm mb-1">Welcome back,</Text>
        <Text className="text-white text-xl font-bold">{user?.full_name ?? '—'}</Text>
      </View>

      <View className="px-4 -mt-4">
        <View className="flex-row mb-4">
          <StatCard label="Applied" value={statsLoading ? '—' : (stats?.total_applied ?? 0)} color="text-brand-600" />
          <StatCard label="Interviews" value={statsLoading ? '—' : (stats?.interviews ?? 0)} color="text-emerald-600" />
          <StatCard label="Offers" value={statsLoading ? '—' : (stats?.offers ?? 0)} color="text-green-600" />
          <StatCard label="Rejected" value={statsLoading ? '—' : `${stats?.rejection_rate ?? 0}%`} color="text-red-500" />
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">Recent Applications</Text>
          </View>

          {recentLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#4f46e5" />
            </View>
          ) : !recent?.length ? (
            <Text className="px-4 py-8 text-sm text-gray-400 text-center">
              No applications yet. Search for jobs to get started.
            </Text>
          ) : (
            recent.map((app: any) => (
              <View key={app.id} className="px-4 py-3.5 border-b border-gray-50 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                    {app.job?.title ?? 'Unknown Role'}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{app.job?.company ?? '—'}</Text>
                </View>
                <View className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[app.status]?.split(' ')[1] ?? 'bg-gray-50'}`}>
                  <Text className={`text-xs font-medium capitalize ${STATUS_COLOR[app.status]?.split(' ')[0] ?? 'text-gray-500'}`}>
                    {app.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
