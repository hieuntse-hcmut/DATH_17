import { getApi } from "~/config/axiosClient";
import type {
  CourseAnalyticsResponse,
  CourseRiskSummaryResponse,
  StudentRiskResponse,
} from "./courseAnalytics.type";

export const getCourseRiskSummary = (courseId: number) =>
  getApi<CourseRiskSummaryResponse>(
    `/analytics/courses/${courseId}/risk-summary`
  );

export const getStudentRisks = (courseId: number) =>
  getApi<StudentRiskResponse[]>(
    `/analytics/courses/${courseId}/students/risk`
  );

export const getCourseSummary = (courseId: number) =>
  getApi<CourseAnalyticsResponse>(
    `/analytics/courses/${courseId}/summary`
  );
