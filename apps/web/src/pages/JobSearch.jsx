import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, MapPin, DollarSign, Wifi, Bookmark, ExternalLink, SlidersHorizontal } from 'lucide-react';
import Button from '../components/Common/Button';
import { PageSpinner } from '../components/Common/Spinner';
import CoverLetterModal from '../components/CoverLetter/CoverLetterModal';

function MatchBadge({ score }) {
  if (score == null) return null;
  const color = score >= 85 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{score}% match</span>;
}

export default function JobSearch() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ query: '', location: '', remote_type: '' });
  const [submitted, setSubmitted] = useState(null);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [clModal, setClModal] = useState(null); // { jobId, jobTitle, company }

  const { data: jobs, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', 'search', submitted],
    queryFn: () => axios.get('/jobs/search', { params: submitted }).then(r => r.data),
    enabled: !!submitted,
  });

  const saveMutation = useMutation({
    mutationFn: (jobId) => axios.post(`/jobs/${jobId}/save`),
    onSuccess: (_, jobId) => {
      setSavedJobs(s => new Set([...s, jobId]));
      toast.success('Job saved');
      queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
    },
    onError: () => toast.error('Could not save job'),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!params.query.trim()) return;
    setSubmitted({ ...params });
  };

  const loading = isLoading || isFetching;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Search size={20} className="text-brand-600" />
        <h1 className="text-xl font-semibold text-gray-900">Job Search</h1>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={params.query}
            onChange={e => setParams(p => ({ ...p, query: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Job title or keyword"
          />
        </div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={params.location}
            onChange={e => setParams(p => ({ ...p, location: e.target.value }))}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none w-44"
            placeholder="Location"
          />
        </div>
        <select
          value={params.remote_type}
          onChange={e => setParams(p => ({ ...p, remote_type: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none"
        >
          <option value="">Any type</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>
        <Button type="submit" loading={loading}><Search size={14} /> Search</Button>
      </form>

      {loading && <div className="py-16"><PageSpinner /></div>}

      {!loading && jobs && (
        <>
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
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <MatchBadge score={job.match_score} />
                    </div>
                    <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{job.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                      {job.remote_type === 'remote' && <span className="flex items-center gap-1 text-emerald-600"><Wifi size={12} />Remote</span>}
                      {job.salary_min && <span className="flex items-center gap-1"><DollarSign size={12} />{(job.salary_min/1000).toFixed(0)}k{job.salary_max ? `–${(job.salary_max/1000).toFixed(0)}k` : '+'}</span>}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {job.posted_at && <span className="text-xs text-gray-400">{new Date(job.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => !savedJobs.has(job.id) && saveMutation.mutate(job.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${savedJobs.has(job.id) ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}
                        title="Save job"
                      >
                        <Bookmark size={14} fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} />
                      </button>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary"><ExternalLink size={12} /> Apply</Button>
                      </a>
                      <Button size="sm" onClick={() => setClModal({ jobId: job.id, jobTitle: job.title, company: job.company })}>
                        Generate Cover Letter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !jobs && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Enter a job title above and hit Search to find matching roles.</p>
        </div>
      )}

      {clModal && (
        <CoverLetterModal
          open={!!clModal}
          onClose={() => setClModal(null)}
          jobId={clModal.jobId}
          jobTitle={clModal.jobTitle}
          company={clModal.company}
        />
      )}
    </div>
  );
}
