import { Settings as SettingsIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <p className="text-sm font-medium text-gray-700 mb-1">Account</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
    </div>
  );
}
