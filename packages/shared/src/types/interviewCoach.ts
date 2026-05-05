export type InterviewType =
  | 'behavioral'
  | 'technical'
  | 'system_design'
  | 'hr';

export interface InterviewMessage {
  role: 'assistant' | 'user';
  content: string;
  feedback?: string;
  score?: number;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  job_listing_id?: string;
  role_title: string;
  interview_type: InterviewType;
  messages: InterviewMessage[];
  overall_score?: number;
  tips_generated?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
}

export interface AnswerFeedback {
  score: number;
  feedback: string;
  improvement: string;
  model_answer_hint: string;
  next_question: string;
}

export interface InterviewTips {
  categories: {
    title: string;
    tips: string[];
    example_answers?: string[];
  }[];
}
