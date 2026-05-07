import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const { hydrate, hydrated, user } = useAuthStore();

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      router.replace('/(tabs)/');
    } else {
      router.replace('/(auth)/login');
    }
  }, [hydrated, user]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
