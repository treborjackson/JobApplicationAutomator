import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function StudyPlan() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(new Set([0]));
  const [modalVisible, setModalVisible] = useState(false);
  const [genRole, setGenRole] = useState('');

  const { data: plan, isLoading } = useQuery({
    queryKey: ['studyPlan'],
    queryFn: () => api.get('/study-plan/').then(r => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: (role: string) => api.post('/study-plan/generate', { role_title: role }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlan'] });
      setModalVisible(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ planId, weekIndex, topicIndex, done }: any) =>
      api.put(`/study-plan/${planId}/topic/${topicIndex}`, { done, week_index: weekIndex }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studyPlan'] }),
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  const allTopics = plan?.weeks?.flatMap((w: any) => w.topics) ?? [];
  const doneCount = allTopics.filter((t: any) => t.done).length;
  const pct = allTopics.length ? Math.round((doneCount / allTopics.length) * 100) : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-brand-600 pt-14 pb-4 px-4 flex-row items-center justify-between">
        <Text className="text-white text-lg font-bold">Study Plan</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-white/20 rounded-lg px-3 py-1.5">
          <Text className="text-white text-xs font-medium">⚡ Generate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {!plan ? (
          <View className="bg-white rounded-2xl border border-gray-100 p-10 items-center">
            <Text className="text-gray-400 text-sm mb-4 text-center">No study plan yet.</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-brand-600 rounded-xl px-6 py-3">
              <Text className="text-white font-semibold text-sm">Generate Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <Text className="font-semibold text-gray-900 text-base mb-1">{plan.role_title}</Text>
              <Text className="text-xs text-gray-400 mb-2 capitalize">{plan.seniority} · {plan.duration_weeks} weeks</Text>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <View className="h-full bg-brand-600 rounded-full" style={{ width: `${pct}%` }} />
              </View>
              <Text className="text-xs text-gray-400">{doneCount} of {allTopics.length} topics · {pct}% complete</Text>
            </View>

            {(plan.weeks ?? []).map((week: any, wi: number) => {
              const isOpen = expanded.has(wi);
              const weekDone = week.topics.filter((t: any) => t.done).length;
              return (
                <View key={wi} className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
                  <TouchableOpacity
                    onPress={() => setExpanded(s => { const n = new Set(s); isOpen ? n.delete(wi) : n.add(wi); return n; })}
                    className="flex-row items-center justify-between px-4 py-3.5"
                  >
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-xs text-gray-400 uppercase font-medium">Week {week.week ?? wi + 1}</Text>
                      <Text className="text-sm font-semibold text-gray-900 flex-1" numberOfLines={1}>{week.theme}</Text>
                    </View>
                    <Text className="text-xs text-gray-400">{weekDone}/{week.topics.length}</Text>
                  </TouchableOpacity>

                  {isOpen && week.topics.map((topic: any, ti: number) => {
                    const globalIndex = (plan.weeks?.slice(0, wi).flatMap((w: any) => w.topics).length ?? 0) + ti;
                    return (
                      <View key={ti} className="border-t border-gray-50 px-4 py-3 flex-row items-start gap-3">
                        <TouchableOpacity
                          className="mt-0.5"
                          onPress={() => toggleMutation.mutate({ planId: plan.id, weekIndex: wi, topicIndex: globalIndex, done: !topic.done })}
                        >
                          <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${topic.done ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                            {topic.done && <Text className="text-white text-xs">✓</Text>}
                          </View>
                        </TouchableOpacity>
                        <View className="flex-1">
                          <Text className={`text-sm font-medium mb-0.5 ${topic.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {topic.title}
                          </Text>
                          <Text className="text-xs text-gray-400 leading-relaxed">{topic.description}</Text>
                          {topic.practice && (
                            <Text className="text-xs text-amber-600 mt-1">Practice: {topic.practice}</Text>
                          )}
                        </View>
                        <Text className="text-xs text-gray-300">{topic.estimated_hours}h</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Generate Study Plan</Text>
            <Text className="text-sm text-gray-600 mb-2">Target role</Text>
            <TextInput
              value={genRole}
              onChangeText={setGenRole}
              placeholder="e.g. Senior Frontend Engineer"
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 mb-4"
            />
            <TouchableOpacity
              onPress={() => generateMutation.mutate(genRole)}
              disabled={!genRole.trim() || generateMutation.isPending}
              className="bg-brand-600 rounded-xl py-4 items-center mb-3"
            >
              {generateMutation.isPending
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-semibold">Generate</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="items-center py-2">
              <Text className="text-gray-400 text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
