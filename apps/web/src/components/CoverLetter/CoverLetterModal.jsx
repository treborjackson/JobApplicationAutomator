import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { Copy, Check } from 'lucide-react';

export default function CoverLetterModal({ open, onClose, jobId, jobTitle, company }) {
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState(null);
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => axios.post('/cover-letters/generate', { job_listing_id: jobId }).then(r => r.data),
    onSuccess: (data) => {
      setCoverLetter(data);
      setContent(data.content);
    },
    onError: () => toast.error('Failed to generate cover letter. Make sure you have a resume uploaded.'),
  });

  const saveMutation = useMutation({
    mutationFn: () => axios.put(`/cover-letters/${coverLetter.id}`, { content }).then(r => r.data),
    onSuccess: () => {
      toast.success('Cover letter saved');
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] });
    },
    onError: () => toast.error('Failed to save'),
  });

  const handleOpen = () => {
    if (!coverLetter) generateMutation.mutate();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCoverLetter(null);
    setContent('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Cover Letter — ${jobTitle} at ${company}`} maxWidth="max-w-2xl">
      {generateMutation.isPending ? (
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Generating your cover letter with AI...</p>
        </div>
      ) : generateMutation.isError && !coverLetter ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-500 mb-4">Generation failed. Please upload a resume first.</p>
          <Button variant="secondary" onClick={() => generateMutation.mutate()}>Try Again</Button>
        </div>
      ) : (
        <>
          {!coverLetter && (
            <div className="py-8 text-center">
              <Button onClick={handleOpen} loading={generateMutation.isPending}>Generate Cover Letter</Button>
            </div>
          )}
          {coverLetter && (
            <div className="space-y-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={14}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleClose}>Close</Button>
                  <Button size="sm" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save Edits</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
