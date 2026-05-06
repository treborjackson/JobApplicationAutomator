import { useParams } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Briefcase size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Application Detail</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Application ID: {id}</p>
      </div>
    </div>
  );
}
