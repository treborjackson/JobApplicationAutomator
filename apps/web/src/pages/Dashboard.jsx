import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Briefcase, CheckCircle, XCircle, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Applied', value: 24, icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-50' },
  { label: 'Interviews', value: 6, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Offers', value: 2, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Rejection Rate', value: '33%', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
];

const applications = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Stripe', location: 'Remote', status: 'interview', date: 'May 4' },
  { id: 2, title: 'Full Stack Developer', company: 'Linear', location: 'San Francisco, CA', status: 'pending', date: 'May 3' },
  { id: 3, title: 'React Developer', company: 'Vercel', location: 'Remote', status: 'offer', date: 'May 1' },
  { id: 4, title: 'Software Engineer II', company: 'Notion', location: 'New York, NY', status: 'rejected', date: 'Apr 29' },
  { id: 5, title: 'Frontend Architect', company: 'Figma', location: 'Remote', status: 'interview', date: 'Apr 28' },
  { id: 6, title: 'UI Engineer', company: 'Loom', location: 'San Francisco, CA', status: 'pending', date: 'Apr 27' },
];

const statusConfig = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  interview: { label: 'Interview', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  offer:     { label: 'Offer',     classes: 'bg-green-50 text-green-700 border border-green-200' },
  rejected:  { label: 'Rejected',  classes: 'bg-red-50 text-red-600 border border-red-200' },
};

export default function Dashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <span className="text-sm text-gray-400">Last updated: just now</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`${bg} p-1.5 rounded-lg`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Applications table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Recent Applications</p>
          <Link to="/jobs" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Find more jobs <ArrowUpRight size={12} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Company</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Location</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{app.title}</td>
                <td className="px-5 py-3.5 text-gray-600">{app.company}</td>
                <td className="px-5 py-3.5 text-gray-500">{app.location}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status].classes}`}>
                    {statusConfig[app.status].label}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {app.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
