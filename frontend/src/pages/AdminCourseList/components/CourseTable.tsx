import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faEye,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { ICourseResponse } from "../services/adminCourse.type";

interface CourseTableProps {
  courses: ICourseResponse[];
  isLoading: boolean;
  onViewDetail: (course: ICourseResponse) => void;
  onAction?: (course: ICourseResponse) => void;
  onResetFilters: () => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  isLoading,
  onViewDetail,
  onAction,
  onResetFilters,
}) => {
  const { t } = useTranslation("adminCourseList");

  const handleAction = (course: ICourseResponse) => {
    if (onAction) {
      onAction(course);
    } else {
      alert("Đây là action");
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-6 w-1/4 rounded-lg bg-surface-muted" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="h-8 w-12 rounded-md bg-surface-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded-sm bg-surface-muted" />
                  <div className="h-3 w-1/2 rounded-sm bg-surface-muted" />
                </div>
                <div className="h-6 w-20 rounded-full bg-surface-muted" />
                <div className="h-6 w-24 rounded-full bg-surface-muted" />
                <div className="h-8 w-20 rounded-lg bg-surface-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-fg-subtle">
          <FontAwesomeIcon icon={faBookOpen} className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-fg">
          {t("table.emptyTitle")}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-fg-muted">
          {t("table.emptyDesc")}
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-fg hover:bg-surface-muted transition-colors cursor-pointer"
        >
          {t("table.resetFilterBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-muted/50 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
              <th className="py-3 px-4 w-16">{t("table.columns.id")}</th>
              <th className="py-3 px-4 min-w-[240px]">{t("table.columns.course")}</th>
              <th className="py-3 px-4 text-right min-w-[170px]">{t("table.columns.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {courses.map((course) => {

              return (
                <tr
                  key={course.id}
                  className="hover:bg-surface-muted/40 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-fg-subtle">
                    #{course.id}
                  </td>

                  {/* Course Title & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(course)}
                        className="text-left font-semibold text-fg hover:text-primary transition-colors cursor-pointer line-clamp-1"
                      >
                        {course.title}
                      </button>
                      <p className="text-xs text-fg-muted line-clamp-1">
                        {course.description || "—"}
                      </p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(course)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
                        title={t("table.viewDetail")}
                      >
                        <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                      </button>

                      {/* Action Button: triggers alert("Đây là action") */}
                      <button
                        type="button"
                        onClick={() => handleAction(course)}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer shadow-2xs"
                        title={t("table.actionTooltip")}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                        <span>{t("table.action")}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
