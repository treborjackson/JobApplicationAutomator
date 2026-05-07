import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

const TYPES = ['behavioral', 'technical', 'system_design', 'hr'] as const;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  score?: number;
  feedback?: string;
  improvement?: string;
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-xs rounded-2xl px-4 py-3 ${isUser ? 'bg-brand-600 rounded-tr-sm' : 'bg-white border border-gray-200 rounded-tl-sm'}`}>
        <Text className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
          {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
        </Text>
      </View>
      {isUser && msg.score != null && (
        <View className="mt-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 max-w-xs">
          <Text className="text-xs font-semibold text-emerald-700 mb-0.5">Score: {msg.score}/10</Text>
          {msg.feedback && <Text className="text-xs text-emerald-700 mb-0.5">{msg.feedback}</Text>}
          {msg.improvement && <Text className="text-xs text-amber-600">{msg.improvement}</Text>}
        </View>
      )}
    </View>
  );
}

export default function Interview() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [type, setType] = useState<typeof TYPES[number]>('behavioral');
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length) listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const startMutation = useMutation({
    mutationFn: () => api.post('/interview/session/start', { interview_type: type, role_title: role }).then(r => r.data),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setMessages([{ role: 'assistant', content: data.opening_message }]);
    },
  });

  const answerMutation = useMutation({
    mutationFn: (answer: string) => api.post(`/interview/session/${sessionId}/answer`, { answer }).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: data.user_answer, score: data.score, feedback: data.feedback, improvement: data.improvement },
        { role: 'assistant', content: data.next_question ?? data.closing_message ?? '' },
      ]);
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/interview/session/${sessionId}/complete`).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Session complete!\n\nOverall score: ${data.overall_score}/10\n\n${data.summary ?? ''}`,
      }]);
      setSessionId(null);
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || answerMutation.isPending) return;
    setInput('');
    answerMutation.mutate(text);
  };

  if (!sessionId && messages.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-brand-600 pt-14 pb-6 px-4">
          <Text className="text-white text-lg font-bold">Interview Coach</Text>
          <Text className="text-white/70 text-sm mt-1">AI-powered coaching with real-time feedback</Text>
        </View>
        <View className="px-4 pt-6">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Role title</Text>
          <TextInput
            value={role}
            onChangeText={setRole}
            className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 mb-4"
          />
          <Text className="text-sm font-medium text-gray-700 mb-2">Interview type</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                className={`px-4 py-2 rounded-xl border ${type === t ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}
              >
                <Text className={`text-sm capitalize ${type === t ? 'text-brand-700 font-medium' : 'text-gray-600'}`}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="bg-brand-600 rounded-xl py-4 items-center"
          >
            {startMutation.isPending
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold">Start Interview</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View className="bg-brand-600 pt-14 pb-4 px-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold">Interview Coach</Text>
          <Text className="text-white/70 text-xs capitalize">{type.replace('_', ' ')} · {role}</Text>
        </View>
        <TouchableOpacity
          onPress={() => completeMutation.mutate()}
          disabled={completeMutation.isPending || !sessionId}
          className="bg-white/20 rounded-lg px-3 py-1.5"
        >
          <Text className="text-white text-xs font-medium">End</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <Bubble msg={item} />}
        ListFooterComponent={answerMutation.isPending ? (
          <View className="items-start mb-3">
            <View className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <ActivityIndicator size="small" color="#9ca3af" />
            </View>
          </View>
        ) : null}
      />

      {sessionId && (
        <View className="flex-row gap-2 px-4 pb-4 pt-2 bg-white border-t border-gray-100">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your answer…"
            placeholderTextColor="#9ca3af"
            multiline
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 max-h-24"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={answerMutation.isPending}
            className="bg-brand-600 rounded-xl w-10 items-center justify-center self-end mb-0.5"
            style={{ height: 40 }}
          >
            <Text className="text-white text-lg">↑</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
