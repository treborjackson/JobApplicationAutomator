import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4 shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User size={16} />
        <span>{user?.full_name || user?.email || 'User'}</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
}
