import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import Button from '../components/Common/Button';

export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8 text-center">
        <Briefcase size={40} className="text-brand-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Let's set up your profile. The full onboarding wizard is coming in the next step.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="justify-center">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
