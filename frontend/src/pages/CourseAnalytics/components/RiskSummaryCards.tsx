import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faUsers,
  faGraduationCap,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import type {
  CourseRiskSummaryResponse,
  CourseAnalyticsResponse,
} from "../services/courseAnalytics.type";

interface RiskSummaryCardsProps {
  riskSummary?: CourseRiskSummaryResponse;
  courseSummary?: CourseAnalyticsResponse;
}

export function RiskSummaryCards({
  riskSummary,
  courseSummary,
}: Readonly<RiskSummaryCardsProps>) {
  const { t } = useTranslation("courseAnalytics");

  const highCount = riskSummary?.highRiskCount ?? 0;
  const mediumCount = riskSummary?.mediumRiskCount ?? 0;
  const lowCount = riskSummary?.lowRiskCount ?? 0;
  const totalAssessed = highCount + mediumCount + lowCount;
  const avgScore = riskSummary?.averageRiskScore ?? 0;

  const highPct = totalAssessed > 0 ? (highCount / totalAssessed) * 100 : 0;
  const mediumPct = totalAssessed > 0 ? (mediumCount / totalAssessed) * 100 : 0;
  const lowPct = totalAssessed > 0 ? (lowCount / totalAssessed) * 100 : 0;

  const getScoreLevelBadge = (score: number) => {
    if (score >= 60) {
      return {
        label: t("status.high"),
        bg: "bg-red-500 text-red-600 dark:text-red-400 border-red-500",
      };
    }
    if (score >= 30) {
      return {
        label: t("status.medium"),
        bg: "bg-amber-500 text-amber-600 dark:text-amber-400 border-amber-500",
      };
    }
    return {
      label: t("status.low"),
      bg: "bg-emerald-500 text-emerald-600 dark:text-emerald-400 border-emerald-500",
    };
  };

  return (
    <div className="space-y-6">
      {/* Visual Risk Distribution Bar & Learning Progress Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Phân bố mức độ rủi ro (Visual Breakdown) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-fg">
              {t("cards.distributionTitle")}
            </h3>
            <p className="text-xs text-fg-subtle mt-0.5">
              Điểm trung bình của: {totalAssessed} sinh viên đã được đánh giá là {avgScore.toFixed(1)}%
            </p>

            {/* Distribution Bar */}
            <div className="mt-4 h-3.5 w-full rounded-full bg-surface-muted overflow-hidden flex">
              {avgScore > 0 && (
                <div
                  className={getScoreLevelBadge(avgScore).bg}
                  style={{ width: `${avgScore.toFixed(1)}%` }}
                />
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span>{t("status.high")}</span>
              </div>
              <div className="text-sm font-bold text-fg mt-1">
                {highCount}{" "}
                <span className="text-[11px] font-normal text-fg-subtle">
                  ({highPct.toFixed(0)}%)
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>{t("status.medium")}</span>
              </div>
              <div className="text-sm font-bold text-fg mt-1">
                {mediumCount}{" "}
                <span className="text-[11px] font-normal text-fg-subtle">
                  ({mediumPct.toFixed(0)}%)
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>{t("status.low")}</span>
              </div>
              <div className="text-sm font-bold text-fg mt-1">
                {lowCount}{" "}
                <span className="text-[11px] font-normal text-fg-subtle">
                  ({lowPct.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan tiến độ học tập của sinh viên trong khóa học */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-fg">
                Tổng quan tiến độ học tập của toàn khóa
              </h3>
              {courseSummary && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary-soft text-primary font-medium">
                  {courseSummary.activeEnrollments} sinh viên theo học
                </span>
              )}
            </div>
            <p className="text-xs text-fg-subtle mt-0.5">
              Thống kê tỷ lệ hoàn thành bài học và mức độ tiến bộ trung bình
            </p>

            {/* Metrics row */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50">
                <div className="flex items-center gap-2 text-xs text-fg-muted">
                  <FontAwesomeIcon icon={faUsers} className="text-primary" />
                  <span>{t("cards.activeStudents")}</span>
                </div>
                <div className="mt-2 text-xl font-bold text-fg">
                  {courseSummary ? courseSummary.activeEnrollments : totalAssessed}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50">
                <div className="flex items-center gap-2 text-xs text-fg-muted">
                  <FontAwesomeIcon icon={faBookOpen} className="text-secondary" />
                  <span>{t("cards.totalLessons")}</span>
                </div>
                <div className="mt-2 text-xl font-bold text-fg">
                  {courseSummary?.totalLessons ?? 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50">
                <div className="flex items-center gap-2 text-xs text-fg-muted">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-tertiary"
                  />
                  <span>{t("cards.completionRate")}</span>
                </div>
                <div className="mt-2 text-xl font-bold text-tertiary">
                  {courseSummary?.completionRate ?? 0}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/50">
                <div className="flex items-center gap-2 text-xs text-fg-muted">
                  <FontAwesomeIcon
                    icon={faChartSimple}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <span>{t("cards.avgProgress")}</span>
                </div>
                <div className="mt-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {courseSummary?.averageProgressPercent ?? 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown by progress status */}
          {courseSummary && (
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-fg-muted">{t("cards.completedStudents")}:</span>
                <span className="font-semibold text-fg">
                  {courseSummary.studentsCompleted}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-fg-muted">{t("cards.inProgressStudents")}:</span>
                <span className="font-semibold text-fg">
                  {courseSummary.studentsInProgress}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span className="text-fg-muted">{t("cards.notStartedStudents")}:</span>
                <span className="font-semibold text-fg">
                  {courseSummary.studentsNotStarted}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
