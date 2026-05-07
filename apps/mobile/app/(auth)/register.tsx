import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const register = useAuthStore(s => s.register);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) return;
    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
    } catch (e: any) {
      Alert.alert('Registration failed', e?.response?.data?.detail ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="items-center mb-8">
            <View className="w-14 h-14 bg-brand-600 rounded-2xl items-center justify-center mb-3">
              <Text className="text-white text-2xl">💼</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">Create account</Text>
            <Text className="text-gray-500 text-sm mt-1">Start your job search journey</Text>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Full name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Jane Smith"
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-900"
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-900"
              />
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="8+ characters"
                secureTextEntry
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-900"
              />
            </View>
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-brand-600 rounded-xl py-3.5 items-center"
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-semibold text-sm">Create account</Text>
              }
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-4">
            <Text className="text-sm text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-sm text-brand-600 font-medium">Sign in</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
