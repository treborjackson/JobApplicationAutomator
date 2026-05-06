import { MessageSquare } from 'lucide-react';

export default function InterviewCoach() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Interview Coach</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Interview coach UI coming soon.</p>
      </div>
    </div>
  );
}
