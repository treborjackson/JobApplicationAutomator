import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageSquare, Send, Star, ChevronRight, Lightbulb } from 'lucide-react';
import Button from '../components/Common/Button';

const TYPES = ['behavioral', 'technical', 'system_design', 'hr'];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? 'order-2' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}>
          {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
        </div>
        {isUser && msg.score != null && (
          <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
              <Star size={12} fill="currentColor" /> Score: {msg.score}/10
            </div>
            {msg.feedback && <p className="text-emerald-700 mb-1">{msg.feedback}</p>}
            {msg.improvement && (
              <p className="text-amber-600 flex items-start gap-1">
                <Lightbulb size={11} className="mt-0.5 shrink-0" />{msg.improvement}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewCoach() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [type, setType] = useState('behavioral');
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startMutation = useMutation({
    mutationFn: () => axios.post('/interview/session/start', { interview_type: type, role_title: role }).then(r => r.data),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setMessages([{ role: 'assistant', content: data.opening_message }]);
    },
    onError: () => toast.error('Failed to start session'),
  });

  const answerMutation = useMutation({
    mutationFn: (answer) => axios.post(`/interview/session/${sessionId}/answer`, { answer }).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: data.user_answer,
          score: data.score,
          feedback: data.feedback,
          improvement: data.improvement,
        },
        { role: 'assistant', content: data.next_question ?? data.closing_message ?? '' },
      ]);
    },
    onError: () => toast.error('Failed to submit answer'),
  });

  const completeMutation = useMutation({
    mutationFn: () => axios.post(`/interview/session/${sessionId}/complete`).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Session complete!\n\nOverall score: ${data.overall_score}/10\n\n${data.summary ?? ''}`,
      }]);
      setSessionId(null);
    },
    onError: () => toast.error('Failed to complete session'),
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || answerMutation.isPending) return;
    setInput('');
    answerMutation.mutate(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleEnd = () => {
    if (sessionId) completeMutation.mutate();
    else { setSessionId(null); setMessages([]); }
  };

  if (!sessionId && messages.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Interview Coach</h1>
        </div>
        <div className="max-w-xl bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Start a Mock Interview</h2>
          <p className="text-sm text-gray-500 mb-6">AI-powered coaching with real-time feedback and scoring.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role title</label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview type</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-2 rounded-lg border text-sm capitalize transition-colors ${
                      type === t ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => startMutation.mutate()} loading={startMutation.isPending} className="w-full justify-center mt-2">
              Start Interview <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900">Interview Coach</h1>
          <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full capitalize">{type.replace('_', ' ')}</span>
          <span className="text-xs text-gray-400">— {role}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={handleEnd} loading={completeMutation.isPending}>
          End Session
        </Button>
      </div>

      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-y-auto p-4">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {answerMutation.isPending && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {sessionId && (
        <div className="mt-3 flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer… (Enter to send)"
            rows={2}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <Button className="px-4 self-end" onClick={handleSend} loading={answerMutation.isPending}>
            <Send size={15} />
          </Button>
        </div>
      )}
    </div>
  );
}
