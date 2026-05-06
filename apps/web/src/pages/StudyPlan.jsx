import { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, ExternalLink, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import Button from '../components/Common/Button';

const plan = {
  role: 'Senior Frontend Engineer',
  seniority: 'senior',
  duration_weeks: 4,
  progress_pct: 35,
  overview: 'A focused 4-week plan to sharpen system design, advanced React patterns, and interview readiness for senior-level frontend roles.',
  weeks: [
    {
      week: 1, theme: 'Advanced React & TypeScript',
      topics: [
        { title: 'React Performance Optimization', description: 'useMemo, useCallback, virtualization, code splitting.', estimated_hours: 4, done: true, resources: [{ type: 'article', title: 'React Docs — Performance', url: '#' }], practice: 'Profile a slow component and cut render time by 50%.' },
        { title: 'TypeScript Generics & Utility Types', description: 'Advanced generics, conditional types, mapped types.', estimated_hours: 3, done: true, resources: [{ type: 'course', title: 'Total TypeScript', url: '#' }], practice: 'Rewrite 3 any-typed functions with proper generics.' },
        { title: 'Advanced Custom Hooks', description: 'Composable hook patterns, testing hooks with react-testing-library.', estimated_hours: 3, done: false, resources: [{ type: 'article', title: 'Patterns.dev — Hooks', url: '#' }], practice: 'Build a useDebounce, usePrevious, and useLocalStorage hook.' },
      ],
    },
    {
      week: 2, theme: 'System Design for Frontend',
      topics: [
        { title: 'Component Architecture & Design Systems', description: 'Atomic design, token-based theming, Storybook.', estimated_hours: 4, done: false, resources: [{ type: 'book', title: 'Designing Design Systems', url: '#' }], practice: 'Build a 5-component mini design system with dark mode.' },
        { title: 'State Management Patterns', description: 'Zustand vs Jotai vs Redux Toolkit — when to use what.', estimated_hours: 3, done: false, resources: [{ type: 'video', title: 'Theo — State Management 2024', url: '#' }], practice: 'Migrate a useContext app to Zustand.' },
        { title: 'Web Performance & Core Web Vitals', description: 'LCP, FID, CLS — measure, diagnose, fix.', estimated_hours: 4, done: false, resources: [{ type: 'article', title: 'web.dev/performance', url: '#' }], practice: 'Achieve a Lighthouse score of 95+ on a sample app.' },
      ],
    },
    {
      week: 3, theme: 'Testing & DevOps',
      topics: [
        { title: 'React Testing Library & Jest', description: 'Unit and integration tests, mocking, coverage.', estimated_hours: 4, done: false, resources: [{ type: 'course', title: 'Testing JavaScript — Kent C. Dodds', url: '#' }], practice: 'Get 80% test coverage on a real component.' },
      ],
    },
    {
      week: 4, theme: 'Interview Prep & Capstone',
      topics: [
        { title: 'Behavioral Interview Prep', description: 'STAR stories for leadership, conflict, failure, impact.', estimated_hours: 3, done: false, resources: [{ type: 'article', title: 'STAR Method Guide', url: '#' }], practice: 'Record and review 5 mock answers.' },
      ],
    },
  ],
};

function ProgressRing({ pct }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width="100" height="100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#4f46e5" strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
      <text x="50" y="50" dominantBaseline="middle" textAnchor="middle"
        className="rotate-90" fill="#111827" fontSize="16" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function StudyPlan() {
  const [expanded, setExpanded] = useState(new Set([1]));
  const allTopics = plan.weeks.flatMap(w => w.topics);
  const done = allTopics.filter(t => t.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Study Plan</h1>
        </div>
        <Button size="sm"><Zap size={14} /> Generate New Plan</Button>
      </div>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex items-center gap-6">
        <ProgressRing pct={plan.progress_pct} />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900 text-lg">{plan.role}</h2>
          <p className="text-sm text-gray-500 mb-1 capitalize">{plan.seniority} · {plan.duration_weeks} weeks</p>
          <p className="text-sm text-gray-600">{plan.overview}</p>
          <p className="text-xs text-gray-400 mt-2">{done} of {allTopics.length} topics completed</p>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-3">
        {plan.weeks.map(week => {
          const isOpen = expanded.has(week.week);
          const weekDone = week.topics.filter(t => t.done).length;
          return (
            <div key={week.week} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(s => { const n = new Set(s); isOpen ? n.delete(week.week) : n.add(week.week); return n; })}
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Week {week.week}</span>
                  <span className="font-semibold text-gray-900">{week.theme}</span>
                </div>
                <span className="text-xs text-gray-400">{weekDone}/{week.topics.length} done</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {week.topics.map((topic, ti) => (
                    <div key={ti} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <button className="mt-0.5 shrink-0">
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
                          <div className="flex items-center gap-3 mt-2">
                            {topic.resources.map((r, ri) => (
                              <a key={ri} href={r.url} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                                <ExternalLink size={10} /> {r.title}
                              </a>
                            ))}
                          </div>
                          <p className="text-xs text-amber-600 mt-1">Practice: {topic.practice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
