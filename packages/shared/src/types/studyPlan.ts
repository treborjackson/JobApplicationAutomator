export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'principal';

export interface StudyResource {
  type: 'video' | 'article' | 'book' | 'course';
  title: string;
  url: string;
}

export interface StudyTopic {
  title: string;
  description: string;
  estimated_hours: number;
  resources: StudyResource[];
  practice: string;
  done: boolean;
}

export interface StudyWeek {
  week: number;
  theme: string;
  topics: StudyTopic[];
}

export interface StudyPlan {
  id: string;
  user_id: string;
  role_title: string;
  seniority_level: SeniorityLevel;
  duration_weeks: 1 | 2 | 4 | 8 | 12;
  topics: StudyTopic[];
  progress_pct: number;
  generated_at: string;
  last_updated_at: string;
  weekly_hours_required?: number;
  overview?: string;
  weeks?: StudyWeek[];
  final_project?: string;
  interview_readiness_milestones?: string[];
}

export interface GenerateStudyPlanParams {
  role_title: string;
  seniority_level: SeniorityLevel;
  duration_weeks: 1 | 2 | 4 | 8 | 12;
  current_skills?: string[];
}
