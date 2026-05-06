import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LayoutDashboard, TrendingUp, Briefcase, CheckCircle, XCircle, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageSpinner } from '../components/Common/Spinner';

const statusConfig = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  interview: { label: 'Interview', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  offer:     { label: 'Offer',     classes: 'bg-green-50 text-green-700 border border-green-200' },
  rejected:  { label: 'Rejected',  classes: 'bg-red-50 text-red-600 border border-red-200' },
  withdrawn: { label: 'Withdrawn', classes: 'bg-gray-50 text-gray-500 border border-gray-200' },
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => axios.get('/dashboard/stats').then(r => r.data),
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => axios.get('/dashboard/recent').then(r => r.data),
  });

  const statCards = [
    { label: 'Total Applied',   value: stats?.total_applied ?? '—', icon: Briefcase,     color: 'text-brand-600',   bg: 'bg-brand-50' },
    { label: 'Interviews',      value: stats?.interviews ?? '—',    icon: TrendingUp,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Offers',          value: stats?.offers ?? '—',        icon: CheckCircle,   color: 'text-green-600',   bg: 'bg-green-50' },
    { label: 'Rejection Rate',  value: stats ? `${stats.rejection_rate}%` : '—', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`${bg} p-1.5 rounded-lg`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {statsLoading ? <span className="text-gray-300">—</span> : value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Recent Applications</p>
          <Link to="/jobs" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Find more jobs <ArrowUpRight size={12} />
          </Link>
        </div>

        {recentLoading ? (
          <div className="p-8 flex justify-center"><PageSpinner /></div>
        ) : !recent?.length ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">No applications yet. Search for jobs to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Role', 'Company', 'Location', 'Status', 'Applied'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(app => (
                <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{app.job?.title ?? 'Unknown Role'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{app.job?.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{app.job?.location ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status]?.classes ?? ''}`}>
                      {statusConfig[app.status]?.label ?? app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
