import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Linking,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

function MatchBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color = score >= 85 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
  return (
    <View className={`px-2 py-0.5 rounded-full ${color.split(' ')[0]}`}>
      <Text className={`text-xs font-semibold ${color.split(' ')[1]}`}>{score}%</Text>
    </View>
  );
}

export default function Jobs() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const { data: jobs, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', 'search', submitted],
    queryFn: () => api.get('/jobs/search', { params: submitted }).then(r => r.data),
    enabled: !!submitted,
  });

  const saveMutation = useMutation({
    mutationFn: (jobId: string) => api.post(`/jobs/${jobId}/save`),
    onSuccess: (_, jobId) => {
      setSaved(s => new Set([...s, jobId]));
      queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    setSubmitted({ query: query.trim(), location: location.trim() });
  };

  const loading = isLoading || isFetching;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-brand-600 pt-14 pb-4 px-4">
        <Text className="text-white text-lg font-bold mb-3">Job Search</Text>
        <View className="bg-white rounded-xl px-3 py-2 mb-2">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Job title or keyword"
            placeholderTextColor="#9ca3af"
            className="text-sm text-gray-900"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 bg-white rounded-xl px-3 py-2">
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
              placeholderTextColor="#9ca3af"
              className="text-sm text-gray-900"
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-white rounded-xl px-5 py-2 items-center justify-center"
          >
            <Text className="text-brand-600 font-semibold text-sm">Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#4f46e5" size="large" />
        </View>
      )}

      {!loading && !submitted && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-400 text-sm text-center">Enter a job title above and tap Search to find matching roles.</Text>
        </View>
      )}

      {!loading && jobs && (
        <FlatList
          data={jobs}
          keyExtractor={j => j.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListHeaderComponent={
            <Text className="text-xs text-gray-400 mb-1">{jobs.length} results — sorted by match score</Text>
          }
          renderItem={({ item: job }) => (
            <View className="bg-white rounded-2xl border border-gray-100 p-4">
              <View className="flex-row items-start justify-between mb-1">
                <Text className="text-sm font-semibold text-gray-900 flex-1 mr-2" numberOfLines={2}>
                  {job.title}
                </Text>
                <MatchBadge score={job.match_score} />
              </View>
              <Text className="text-xs font-medium text-gray-700 mb-0.5">{job.company}</Text>
              <Text className="text-xs text-gray-400 mb-3">{job.location}{job.remote_type === 'remote' ? ' · Remote' : ''}</Text>
              <Text className="text-xs text-gray-500 mb-3 leading-relaxed" numberOfLines={2}>{job.description}</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => !saved.has(job.id) && saveMutation.mutate(job.id)}
                  className={`flex-1 py-2 rounded-xl border items-center ${saved.has(job.id) ? 'border-brand-300 bg-brand-50' : 'border-gray-200'}`}
                >
                  <Text className={`text-xs font-medium ${saved.has(job.id) ? 'text-brand-600' : 'text-gray-500'}`}>
                    {saved.has(job.id) ? '✓ Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => job.url && Linking.openURL(job.url)}
                  className="flex-1 py-2 rounded-xl bg-brand-600 items-center"
                >
                  <Text className="text-xs font-medium text-white">Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
