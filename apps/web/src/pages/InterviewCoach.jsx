import { useState } from 'react';
import { MessageSquare, Send, Star, ChevronRight, Lightbulb } from 'lucide-react';
import Button from '../components/Common/Button';

const TYPES = ['behavioral', 'technical', 'system_design', 'hr'];

const mockMessages = [
  {
    role: 'assistant',
    content: "Hi! I'm your AI interview coach. I'll be conducting a behavioral interview for a Senior Frontend Engineer role today.\n\nLet's start with Question 1:\n\n**Tell me about a time you had to deliver a complex feature under a tight deadline. What was the situation, and how did you manage it?**",
  },
  {
    role: 'user',
    content: "At my last job, we had two weeks to ship a redesigned checkout flow before a major sale event. I broke the work into daily milestones, coordinated daily syncs with design and backend, and flagged scope risks early. We shipped on time with only minor post-launch fixes.",
    score: 8,
    feedback: "Strong answer! You clearly used the STAR method and demonstrated ownership and communication skills.",
    improvement: "Consider adding specific metrics — e.g. 'reduced cart abandonment by 12%' — to make the impact concrete.",
  },
  {
    role: 'assistant',
    content: "Great answer! You demonstrated clear ownership and proactive communication. Score: **8/10**\n\n**Question 2:**\n\nDescribe a situation where you disagreed with a technical decision made by your team. How did you handle it?",
  },
];

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
        {isUser && msg.score !== undefined && (
          <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
              <Star size={12} fill="currentColor" /> Score: {msg.score}/10
            </div>
            <p className="text-emerald-700 mb-1">{msg.feedback}</p>
            <p className="text-amber-600 flex items-start gap-1"><Lightbulb size={11} className="mt-0.5 shrink-0" />{msg.improvement}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewCoach() {
  const [started, setStarted] = useState(false);
  const [type, setType] = useState('behavioral');
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [input, setInput] = useState('');

  if (!started) {
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
            <Button onClick={() => setStarted(true)} className="w-full justify-center mt-2">
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
        <Button variant="secondary" size="sm" onClick={() => setStarted(false)}>End Session</Button>
      </div>

      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-y-auto p-4">
        {mockMessages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button className="px-4"><Send size={15} /></Button>
      </div>
    </div>
  );
}
