import { useState } from 'react';
import { Search, MapPin, DollarSign, Wifi, Bookmark, ExternalLink, SlidersHorizontal } from 'lucide-react';
import Button from '../components/Common/Button';

const jobs = [
  {
    id: 1, title: 'Senior Frontend Engineer', company: 'Stripe', location: 'Remote', remote_type: 'remote',
    salary_min: 160000, salary_max: 220000, match_score: 94,
    description: 'Build and maintain high-quality UI components for our payments platform. Work with React, TypeScript, and GraphQL at scale.',
    posted_at: '2 days ago',
  },
  {
    id: 2, title: 'Staff Software Engineer', company: 'Linear', location: 'San Francisco, CA', remote_type: 'hybrid',
    salary_min: 200000, salary_max: 280000, match_score: 87,
    description: 'Lead technical design and implementation of core product features. Drive engineering excellence across the team.',
    posted_at: '3 days ago',
  },
  {
    id: 3, title: 'React Developer', company: 'Vercel', location: 'Remote', remote_type: 'remote',
    salary_min: 140000, salary_max: 190000, match_score: 82,
    description: 'Join our developer experience team to build tools that make web development faster and more enjoyable.',
    posted_at: '1 day ago',
  },
  {
    id: 4, title: 'Frontend Architect', company: 'Figma', location: 'New York, NY', remote_type: 'hybrid',
    salary_min: 175000, salary_max: 240000, match_score: 79,
    description: 'Define and implement the architecture of our design tool frontend. Mentor engineers and drive best practices.',
    posted_at: '5 days ago',
  },
  {
    id: 5, title: 'UI Engineer', company: 'Loom', location: 'Remote', remote_type: 'remote',
    salary_min: 130000, salary_max: 170000, match_score: 71,
    description: 'Create delightful user experiences for our video communication platform used by millions.',
    posted_at: '1 week ago',
  },
];

function MatchBadge({ score }) {
  const color = score >= 85 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{score}% match</span>;
}

export default function JobSearch() {
  const [query, setQuery] = useState('Frontend Engineer');
  const [saved, setSaved] = useState(new Set([3]));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Search size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Job Search</h1>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Job title or keyword"
          />
        </div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none w-44" placeholder="Location" />
        </div>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none">
          <option>Any type</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
        <Button><Search size={14} /> Search</Button>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{jobs.length} results — sorted by match score</p>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <MatchBadge score={job.match_score} />
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">{job.company}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                  {job.remote_type === 'remote' && <span className="flex items-center gap-1 text-emerald-600"><Wifi size={12} />Remote</span>}
                  <span className="flex items-center gap-1"><DollarSign size={12} />{(job.salary_min/1000).toFixed(0)}k–{(job.salary_max/1000).toFixed(0)}k</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-gray-400">{job.posted_at}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSaved(s => { const n = new Set(s); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n; })}
                    className={`p-1.5 rounded-lg border transition-colors ${saved.has(job.id) ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}
                  >
                    <Bookmark size={14} fill={saved.has(job.id) ? 'currentColor' : 'none'} />
                  </button>
                  <Button size="sm" variant="secondary"><ExternalLink size={12} /> Apply</Button>
                  <Button size="sm">Generate Cover Letter</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
