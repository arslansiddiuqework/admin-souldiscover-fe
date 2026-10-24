/**
 * Admin Panel — TypeScript Types
 * ──────────────────────────────
 * Strictly typed interfaces matching the real backend DB schemas.
 * No `any` types allowed.
 */

// ── User (from backend User model) ───────────────────────────────────────────
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  aiName: string;
  aiBehavior: "supportive" | "friendly" | "motivational" | "calm";
  authProvider?: "local" | "google";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
  sessionCount: number;
  hasEmergencyContacts: boolean;
  emergencyContactCount: number;
  consentAccepted: boolean;
  lastEscalation: {
    riskLevel: RiskLevel;
    outcome: EscalationOutcome;
    createdAt: string;
  } | null;
}

// ── Chat Session ─────────────────────────────────────────────────────────────
export interface SessionListItem {
  _id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  startTime: string;
  status: "active" | "completed" | "archived";
  messageCount: number;
  duration: string;
  hasRisk: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    analysis?: MessageAnalysis;
    technique?: string;
    goal?: string;
    progress?: {
      emotionalState?: string;
      riskLevel?: number;
    };
    emotionMeta?: EmotionMeta | null;
    source?: "text" | "voice";
  };
}

export interface SessionDetail {
  session: {
    sessionId: string;
    userId: string;
    title: string;
    summary: string;
    startTime: string;
    status: string;
    messageCount: number;
  };
  user: {
    name: string;
    email: string;
    profileImage: string;
  } | null;
  messages: ChatMessage[];
}

export interface MessageAnalysis {
  emotionalState: string;
  themes: string[];
  riskLevel: number;
  recommendedApproach: string;
  progressIndicators: string[];
}

export interface EmotionMeta {
  emotion: "panic" | "stress" | "low" | "neutral" | "positive";
  intensity: number;
  suggestedActivity: "breathing" | "ocean" | "forest" | "zen" | null;
  autoTrigger: boolean;
  crisisRiskScore?: number;
  suicideRisk?: number;
  selfHarmRisk?: number;
  panicSeverity?: number;
  escalationRecommended?: boolean;
  escalationReason?: string;
  recommendedAction?: string;
}

// ── Emergency ────────────────────────────────────────────────────────────────
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EscalationOutcome = "initiated" | "completed" | "failed" | "blocked";

export interface EscalationLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImage?: string;
  sessionId: string;
  riskLevel: RiskLevel;
  crisisRiskScore: number;
  escalationReason: string;
  contactCalled?: string;
  contactPhone?: string;
  contactWhatsApp?: string;
  callSid?: string;
  smsBatchId?: string;
  channel?: string;
  provider?: string;
  deliveryStatus?: string;
  voiceStatus?: string;
  outcome: EscalationOutcome;
  error?: string;
  duration?: number;
  callStatus?: string;
  twilioErrorCode?: string;
  providerErrorCode?: string;
  createdAt: string;
}

export interface EmergencyStatus {
  system: {
    crisisEnabled: boolean;
    smsProvider?: string;
    smsConfigured?: boolean;
    textbeeConfigured?: boolean;
    voiceAvailable?: boolean;
    voiceStatus?: string;
    emergencySmsOperational?: boolean;
    emergencyFullyOperational?: boolean;
    /** @deprecated Twilio removed — always false */
    twilioConfigured: boolean;
    twilioPhone: string;
    twilioWhatsApp?: string;
    cooldownHours: number;
    maxPerDay: number;
  };
  stats: {
    totalEscalations: number;
    initiated: number;
    completed: number;
    failed: number;
    blocked: number;
    queued?: number;
    delivered?: number;
    totalContactRecords: number;
    usersWithConsent: number;
  };
  recentLogs: {
    riskLevel: RiskLevel;
    outcome: EscalationOutcome;
    contactCalled: string;
    createdAt: string;
  }[];
}

// ── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsMetrics {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalSessions: number;
  activeSessions: number;
  avgSessionMinutes: number;
  totalEscalations: number;
  escalationsThisWeek: number;
  totalActivities: number;
  totalMoodEntries: number;
  avgMoodScore: number;
  weeklyActiveUsers: number;
  weeklySessions: number;
  weeklyCompletedSessions: number;
  weeklyActivities: number;
  weeklyCompletedActivities: number;
  weeklyActivityCompletionRate: number;
  weeklyHighRiskSessions: number;
  weeklyMessageCount: number;
  avgMessagesPerSession: number;
  previousWeekAvgMoodScore: number;
  outcomeTrackedUsers: number;
  benefitedUsersThisWeek: number;
  notRecoveredUsersThisWeek: number;
  needsFollowUpUsers: number;
  averageMoodChange: number;
  recoveryRate: number;
  totalWellnessEnrollments: number;
  activeWellnessPlans: number;
  completedWellnessPlans: number;
  avgWellnessCompletionRate: number;
  totalConsultations: number;
  scheduledConsultations: number;
  completedConsultations: number;
  upcomingConsultations: number;
  totalAssessmentCompletions: number;
  assessmentCompletionsThisWeek: number;
  assessmentCompletionsThisMonth: number;
  assessmentInProgressSessions: number;
  assessmentAbandonedSessions: number;
}

export interface AnalyticsTrends {
  usersGrowth: { _id: string; count: number }[];
  sessionsPerDay: { _id: string; count: number }[];
  emergencyTrends: { _id: string; count: number }[];
  activityBreakdown: {
    _id: string;
    count: number;
    completedCount: number;
    totalMinutes: number;
  }[];
  wellnessByGoal: {
    _id: string;
    count: number;
    avgCompletion: number;
  }[];
  assessmentsBySlug: {
    slug: string;
    title: string;
    count: number;
  }[];
}

export interface AnalyticsAiUsage {
  dayKey: string;
  monthKey: string;
  globalDay: number;
  globalMonth: number;
  dailyLimit: number;
  monthlyLimit: number;
  messageSources: { source: string; count: number }[];
}

export interface AnalyticsResponse {
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  aiUsage?: AnalyticsAiUsage;
}

export interface AiUsageResponse {
  period: { dayKey: string; monthKey: string };
  limits: {
    globalDaily: number;
    globalMonthly: number;
    userMonthly: number;
  };
  usage: {
    globalDay: number;
    globalMonth: number;
    globalDayRemaining: number;
    globalMonthRemaining: number;
  };
  topUsers: {
    userId: string | null;
    periodKey: string;
    count: number;
    limit: number;
    remaining: number;
    name: string;
    email: string;
    profileImage: string;
    status: string;
  }[];
}

export interface EngagementResponse {
  window: { from: string; to: string };
  mood: {
    perDay: { date: string; count: number; avgScore: number }[];
    byLabel: { mood: string; count: number; avgScore: number }[];
    recent: {
      userId: string;
      name: string;
      email: string;
      profileImage: string;
      status: string;
      score: number;
      mood: string;
      source?: string;
      note?: string;
      timestamp: string;
    }[];
    needsAttention: {
      userId: string;
      name: string;
      email: string;
      profileImage: string;
      status: string;
      latestScore: number;
      latestMood: string;
      lowCount: number;
      lastAt: string;
    }[];
  };
  activities: {
    breakdown: {
      _id: string;
      count: number;
      completedCount: number;
      totalMinutes: number;
    }[];
    recent: {
      userId: string;
      name: string;
      email: string;
      profileImage: string;
      status: string;
      type: string;
      duration?: number;
      completed: boolean;
      timestamp: string;
      /** Activity display name from backend */
      activityName?: string;
    }[];
  };
  chat: {
    messageSources: { source: string; count: number }[];
  };
}

// ── Logs ─────────────────────────────────────────────────────────────────────
export interface SystemLog {
  _id: string;
  timestamp: string;
  category: "SYSTEM" | "AUTH" | "CRISIS" | "SECURITY" | "ADMIN";
  severity: "INFO" | "WARNING" | "CRITICAL";
  description: string;
  operator?: string;
  riskLevel?: RiskLevel;
  outcome?: EscalationOutcome;
  userId?: string;
  sessionId?: string;
  userProfileImage?: string;
  action?: string;
  email?: string;
  ip?: string;
}

// ── Admin Auth ───────────────────────────────────────────────────────────────
export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: "admin" | "superAdmin";
  permissions: string[];
  lastLogin: string;
  mfaEnabled?: boolean;
  mfaEnrollmentRequired?: boolean;
  recoveryCodesRemaining?: number;
}

export interface AdminLoginResponse {
  admin: AdminProfile;
  token: string;
  message: string;
}

export interface AdminMeResponse {
  authenticated: boolean;
  admin: AdminProfile;
}

// ── Pagination ───────────────────────────────────────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
