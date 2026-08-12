export type AppStage = 'landing' | 'registration' | 'arena' | 'scenario' | 'interview' | 'result';

export interface StudentInfo {
  fullName: string;
  classGroup: '9ºA' | '9ºB' | '9ºC' | '9ºD' | '';
  phone: string;
  guardianName: string;
}

export type CareerPath = 'regular' | 'administracao' | 'eletromecanica';

export interface ChoiceOption {
  id: string;
  category: 'gestao' | 'tecnica' | 'pesquisa';
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  xpValue: number;
  careerWeight: Record<CareerPath, number>;
}

export interface ScenarioQuestion {
  id: number;
  title: string;
  context: string;
  situation: string;
  options: ChoiceOption[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
}

export interface ProgramDetail {
  duration: string;
  workload: string;
  certification: string;
  curriculum: {
    year1: string[];
    year2: string[];
    year3: string[];
  };
  careerOutlook: {
    overview: string;
    entryRoles: string[];
    salaryRange: string;
    higherEducation: string[];
  };
  highlights: string[];
}

export interface CareerResult {
  path: CareerPath;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  colorScheme: {
    primary: string;
    gradient: string;
    accent: string;
    border: string;
    bgLight: string;
    text: string;
  };
  skills: string[];
  careerOpportunities: string[];
  recommendedSubjects: string[];
  matchPercentage: number;
  whyThisChoice: string;
  programDetails?: ProgramDetail;
}

export interface UserAnswers {
  studentInfo?: StudentInfo;
  scenarioSelections: { questionId: number; choiceId: string; category: string }[];
  chatHistory: ChatMessage[];
  scores: Record<CareerPath, number>;
}

export interface GamificationState {
  xp: number;
  level: number;
  streakDays: number;
  soundEnabled: boolean;
  unlockedBadges: string[];
}
