import { BookOpen } from 'lucide-react';

export default function StudyPlan() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Study Plan</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Study plan UI coming soon.</p>
      </div>
    </div>
  );
}
