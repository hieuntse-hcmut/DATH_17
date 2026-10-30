import { useQuery } from "@tanstack/react-query";
import {
  getCourseRiskSummary,
  getStudentRisks,
  getCourseSummary,
} from "./courseAnalytics.api";

export const courseAnalyticsKeys = {
  all: ["courseAnalytics"] as const,
  riskSummary: (courseId: number) =>
    ["courseAnalytics", "riskSummary", courseId] as const,
  studentRisks: (courseId: number) =>
    ["courseAnalytics", "studentRisks", courseId] as const,
  summary: (courseId: number) =>
    ["courseAnalytics", "summary", courseId] as const,
};

export const useCourseRiskSummary = (courseId: number, enabled = true) =>
  useQuery({
    queryKey: courseAnalyticsKeys.riskSummary(courseId),
    queryFn: () => getCourseRiskSummary(courseId),
    enabled: enabled && Number.isFinite(courseId),
    staleTime: 30_000,
  });

export const useStudentRisks = (courseId: number, enabled = true) =>
  useQuery({
    queryKey: courseAnalyticsKeys.studentRisks(courseId),
    queryFn: () => getStudentRisks(courseId),
    enabled: enabled && Number.isFinite(courseId),
    staleTime: 30_000,
  });

export const useCourseSummary = (courseId: number, enabled = true) =>
  useQuery({
    queryKey: courseAnalyticsKeys.summary(courseId),
    queryFn: () => getCourseSummary(courseId),
    enabled: enabled && Number.isFinite(courseId),
    staleTime: 30_000,
  });
