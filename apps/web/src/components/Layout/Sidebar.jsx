import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  BookOpen,
  Settings,
  Briefcase,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/jobs',       label: 'Job Search',       icon: Search },
  { to: '/interview',  label: 'Interview Coach',  icon: MessageSquare },
  { to: '/study',      label: 'Study Plan',       icon: BookOpen },
  { to: '/settings',   label: 'Settings',         icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <Briefcase className="text-brand-600" size={22} />
        <span className="font-semibold text-gray-900 text-sm leading-tight">
          Job Application<br />Automator
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
