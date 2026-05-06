import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle2, Circle, ExternalLink, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import Button from '../components/Common/Button';
import { PageSpinner } from '../components/Common/Spinner';
import Modal from '../components/Common/Modal';

function ProgressRing({ pct }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width="100" height="100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#4f46e5" strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
      <text x="50" y="50" dominantBaseline="middle" textAnchor="middle"
        fill="#111827" fontSize="16" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function StudyPlan() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(new Set([1]));
  const [genModal, setGenModal] = useState(false);
  const [genRole, setGenRole] = useState('');

  const { data: plan, isLoading } = useQuery({
    queryKey: ['studyPlan'],
    queryFn: () => axios.get('/study-plan/').then(r => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: (role) => axios.post('/study-plan/generate', { role_title: role }).then(r => r.data),
    onSuccess: () => {
      toast.success('Study plan generated!');
      queryClient.invalidateQueries({ queryKey: ['studyPlan'] });
      setGenModal(false);
    },
    onError: () => toast.error('Failed to generate plan'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ planId, weekIndex, topicIndex, done }) =>
      axios.put(`/study-plan/${planId}/topic/${topicIndex}`, { done, week_index: weekIndex }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studyPlan'] }),
    onError: () => toast.error('Failed to update topic'),
  });

  if (isLoading) return <div className="py-16"><PageSpinner /></div>;

  if (!plan) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Study Plan</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">No study plan yet. Generate one to get started.</p>
          <Button onClick={() => setGenModal(true)}><Zap size={14} /> Generate Plan</Button>
        </div>
        <GenerateModal open={genModal} onClose={() => setGenModal(false)} role={genRole} setRole={setGenRole} onSubmit={() => generateMutation.mutate(genRole)} loading={generateMutation.isPending} />
      </div>
    );
  }

  const allTopics = plan.weeks?.flatMap(w => w.topics) ?? [];
  const done = allTopics.filter(t => t.done).length;
  const progressPct = allTopics.length ? Math.round((done / allTopics.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Study Plan</h1>
        </div>
        <Button size="sm" onClick={() => setGenModal(true)}><Zap size={14} /> Generate New Plan</Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex items-center gap-6">
        <ProgressRing pct={progressPct} />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900 text-lg">{plan.role_title}</h2>
          <p className="text-sm text-gray-500 mb-1 capitalize">{plan.seniority} · {plan.duration_weeks} weeks</p>
          <p className="text-sm text-gray-600">{plan.overview}</p>
          <p className="text-xs text-gray-400 mt-2">{done} of {allTopics.length} topics completed</p>
        </div>
      </div>

      <div className="space-y-3">
        {(plan.weeks ?? []).map((week, wi) => {
          const isOpen = expanded.has(week.week ?? wi);
          const weekDone = week.topics.filter(t => t.done).length;
          const weekKey = week.week ?? wi;
          return (
            <div key={weekKey} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(s => { const n = new Set(s); isOpen ? n.delete(weekKey) : n.add(weekKey); return n; })}
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Week {week.week ?? wi + 1}</span>
                  <span className="font-semibold text-gray-900">{week.theme}</span>
                </div>
                <span className="text-xs text-gray-400">{weekDone}/{week.topics.length} done</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {week.topics.map((topic, ti) => {
                    const globalIndex = (plan.weeks?.slice(0, wi).flatMap(w => w.topics).length ?? 0) + ti;
                    return (
                      <div key={ti} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <button
                            className="mt-0.5 shrink-0"
                            onClick={() => toggleMutation.mutate({ planId: plan.id, weekIndex: wi, topicIndex: globalIndex, done: !topic.done })}
                          >
                            {topic.done
                              ? <CheckCircle2 size={18} className="text-brand-600" fill="currentColor" />
                              : <Circle size={18} className="text-gray-300" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm font-medium ${topic.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{topic.title}</p>
                              <span className="text-xs text-gray-400 shrink-0">{topic.estimated_hours}h</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                            {topic.resources?.length > 0 && (
                              <div className="flex items-center gap-3 mt-2">
                                {topic.resources.map((res, ri) => (
                                  <a key={ri} href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                                    <ExternalLink size={10} /> {res.title}
                                  </a>
                                ))}
                              </div>
                            )}
                            {topic.practice && <p className="text-xs text-amber-600 mt-1">Practice: {topic.practice}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <GenerateModal open={genModal} onClose={() => setGenModal(false)} role={genRole} setRole={setGenRole} onSubmit={() => generateMutation.mutate(genRole)} loading={generateMutation.isPending} />
    </div>
  );
}

function GenerateModal({ open, onClose, role, setRole, onSubmit, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Generate Study Plan" maxWidth="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Target role</label>
          <input
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={loading} disabled={!role.trim()}>
            <Zap size={14} /> Generate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
