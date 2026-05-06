import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {['Total Applied', 'Interviews', 'Offers', 'Rejection Rate'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">—</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Recent Applications</p>
        <p className="text-sm text-gray-400">No applications yet. Search for jobs to get started.</p>
      </div>
    </div>
  );
}
