export interface ResumeExperience {
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  graduation_year: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  raw_text: string;
  parsed_skills: string[];
  parsed_experience: ResumeExperience[];
  parsed_education: ResumeEducation[];
  parsed_achievements: string[];
  uploaded_at: string;
  updated_at: string;
}
