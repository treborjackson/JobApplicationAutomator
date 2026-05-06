import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Upload, CheckCircle2, FileText, Search, MessageSquare, BookOpen, ArrowRight, ChevronRight } from 'lucide-react';
import Button from '../components/Common/Button';

const STEPS = [
  { id: 'welcome',     label: 'Welcome',        icon: Briefcase },
  { id: 'resume',      label: 'Upload Resume',   icon: Upload },
  { id: 'preferences', label: 'Job Preferences', icon: Search },
  { id: 'done',        label: 'All Set',         icon: CheckCircle2 },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((s, i) => {
        const idx = STEPS.findIndex(x => x.id === current);
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              done ? 'bg-brand-600 text-white' : active ? 'bg-brand-100 text-brand-700 border-2 border-brand-500' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mx-1 transition-colors ${done ? 'bg-brand-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [prefs, setPrefs] = useState({ desired_role: '', preferred_locations: '', remote_preference: 'any', min_salary: '' });
  const fileRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return axios.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      setResumeUploaded(true);
      toast.success('Resume uploaded!');
    },
    onError: () => toast.error('Upload failed. Please try a PDF or DOCX file under 5 MB.'),
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setResumeFile(f); uploadMutation.mutate(f); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setResumeFile(f); uploadMutation.mutate(f); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8">
        <StepIndicator current={step} />

        {step === 'welcome' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to JobBot!</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Let's get your profile set up so we can find the best matching jobs, generate tailored cover letters, and help you ace your interviews.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8 text-left">
              {[
                { icon: FileText, label: 'AI Cover Letters', desc: 'Generated from your resume' },
                { icon: Search, label: 'Smart Job Search', desc: 'With match scoring' },
                { icon: MessageSquare, label: 'Interview Coach', desc: 'Real-time AI feedback' },
                { icon: BookOpen, label: 'Study Plans', desc: 'Personalized prep' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                  <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setStep('resume')} className="w-full justify-center">
              Let's get started <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {step === 'resume' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Upload your resume</h2>
            <p className="text-sm text-gray-500 mb-6">We'll use it to match you with jobs and generate cover letters. PDF or DOCX, up to 5 MB.</p>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => !resumeUploaded && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                resumeUploaded ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
              {resumeUploaded ? (
                <>
                  <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">{resumeFile?.name}</p>
                  <p className="text-xs text-green-500 mt-1">Uploaded successfully</p>
                </>
              ) : uploadMutation.isPending ? (
                <>
                  <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Uploading…</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Drop your resume here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep('welcome')} className="flex-1 justify-center">Back</Button>
              <Button
                onClick={() => setStep('preferences')}
                disabled={!resumeUploaded}
                className="flex-1 justify-center"
              >
                Continue <ChevronRight size={16} />
              </Button>
            </div>
            {!resumeUploaded && (
              <button onClick={() => setStep('preferences')} className="w-full text-xs text-gray-400 hover:text-gray-600 mt-3 text-center">
                Skip for now
              </button>
            )}
          </div>
        )}

        {step === 'preferences' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Job preferences</h2>
            <p className="text-sm text-gray-500 mb-6">Help us surface the most relevant opportunities for you.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Desired role</label>
                <input
                  value={prefs.desired_role}
                  onChange={e => setPrefs(p => ({ ...p, desired_role: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred locations</label>
                <input
                  value={prefs.preferred_locations}
                  onChange={e => setPrefs(p => ({ ...p, preferred_locations: e.target.value }))}
                  placeholder="e.g. New York, Remote"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work preference</label>
                <div className="flex gap-2">
                  {['remote', 'hybrid', 'onsite', 'any'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setPrefs(p => ({ ...p, remote_preference: opt }))}
                      className={`flex-1 py-2 rounded-lg border text-xs capitalize transition-colors ${
                        prefs.remote_preference === opt ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum salary (USD/year)</label>
                <input
                  type="number"
                  value={prefs.min_salary}
                  onChange={e => setPrefs(p => ({ ...p, min_salary: e.target.value }))}
                  placeholder="e.g. 120000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep('resume')} className="flex-1 justify-center">Back</Button>
              <Button onClick={() => setStep('done')} className="flex-1 justify-center">
                Finish setup <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Your profile is ready. Head to the dashboard to start exploring jobs, generate cover letters, and prep for interviews.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/jobs')} className="w-full justify-center">
                <Search size={15} /> Search for Jobs
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')} className="w-full justify-center">
                Go to Dashboard <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
