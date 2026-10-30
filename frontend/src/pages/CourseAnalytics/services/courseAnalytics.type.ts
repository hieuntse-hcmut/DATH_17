export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface CourseRiskSummaryResponse {
  courseId: number;
  averageRiskScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface StudentRiskResponse {
  studentId: number;
  username: string;
  fullName: string;
  email: string;
  riskScore: number;
  riskLevel: RiskLevel;
  assessedAt: string | null;
}

export interface CourseAnalyticsResponse {
  courseId: number;
  courseTitle: string;
  publicationState: string;
  enrollmentOpen: boolean;
  activeEnrollments: number;
  withdrawnEnrollments: number;
  removedEnrollments: number;
  totalEnrollments: number;
  newEnrollmentsLast7Days: number;
  totalLessons: number;
  studentsCompleted: number;
  studentsInProgress: number;
  studentsNotStarted: number;
  completionRate: number;
  averageProgressPercent: number;
}

export type RiskFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

export type RiskSort =
  | "risk_desc"
  | "risk_asc"
  | "name_asc"
  | "name_desc";
