// Define an interface for a user profile
export interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  role: "therapist" | "patient";
}

// Define a proper interface for a session document
export interface Session {
  id: string;
  sessionDate: Date;
  therapist: string;
  therapistId: string;

  summary: string;
  shortSummary?: string;

  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;
  goals: string[];
  warnings: string[];
  transcript: string;

  journalingPrompt: string;
  journalingResponse: string;
  patientId: string;

  status: string;
  patientName?: string;
}

// Interface for notification
export interface Notification {
  id: string;
  type:
    | "message"
    | "appointment"
    | "reminder"
    | "system"
    | "session"
    | "journal";
  title: string;
  message?: string;
  description?: string;
  date: Date;
  read: boolean;
  patientId?: string;
  patientName?: string;
}

// Interface for patient note
export interface PatientNote {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  title: string;
  content: string;
  sessionId?: string;
  type: "session" | "observation" | "journal";
}

// Interface for patient metrics
export interface PatientMetric {
  patientId: string;
  patientName: string;
  sessionsCompleted: number;
  progressScore: number;
  journalEntries: number;
  riskLevel: "low" | "medium" | "high";
}

// Interface for mood entry
export interface MoodEntry {
  date: Date;
  value: number;
  notes: string;
}

// Interface for motivational quote
export interface Quote {
  text: string;
  author: string;
}

// Interface for therapy goal
export interface TherapyGoal {
  id: string;
  title: string;
  progress: number;
  color: string;
}

// Interface for wellness resource
export interface WellnessResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
}

export interface JournalEntry {
  id: number;
  date: string;
  time: string;
  therapist: string;
  summary: string;
  detailedNotes: string;
  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;
  goals: string[];
  warnings: string[];
}

export interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}
