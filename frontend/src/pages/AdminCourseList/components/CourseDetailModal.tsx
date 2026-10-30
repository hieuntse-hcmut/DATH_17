import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBookOpen,
  faCalendarDays,
  faGraduationCap,
  faCircleCheck,
  faClock,
  faBoxArchive,
  faLockOpen,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import type { ICourseResponse, PublicationState } from "../services/adminCourse.type";

interface CourseDetailModalProps {
  course: ICourseResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (course: ICourseResponse) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onAction,
}) => {
  const { t } = useTranslation("adminCourseList");

  if (!isOpen || !course) return null;

  const handleAction = () => {
    if (onAction) {
      onAction(course);
    } else {
      alert("Đây là action");
    }
  };

  const getStatusBadge = (state: PublicationState) => {
    switch (state) {
      case "PUBLISHED":
        return {
          label: t("table.status.published"),
          icon: faCircleCheck,
          className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "DRAFT":
        return {
          label: t("table.status.draft"),
          icon: faClock,
          className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "ARCHIVED":
      default:
        return {
          label: t("table.status.archived"),
          icon: faBoxArchive,
          className:
            "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
        };
    }
  };

  const statusBadge = getStatusBadge(course.publicationState);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-fg">
              {t("detailModal.title")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col gap-4">
          {/* Course Title & ID */}
          <div className="rounded-xl bg-surface-muted/60 p-4 border border-border">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-surface border border-border text-primary">
                ID #{course.id}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.className}`}
                >
                  <FontAwesomeIcon icon={statusBadge.icon} className="h-3 w-3" />
                  <span>{statusBadge.label}</span>
                </span>
                {course.enrollmentOpen ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                    <FontAwesomeIcon icon={faLockOpen} className="h-3 w-3" />
                    <span>{t("table.enrollment.open")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <FontAwesomeIcon icon={faLock} className="h-3 w-3" />
                    <span>{t("table.enrollment.closed")}</span>
                  </span>
                )}
              </div>
            </div>
            <h4 className="text-base font-bold text-fg mt-2">{course.title}</h4>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">
              {t("detailModal.description")}
            </label>
            <div className="mt-1 rounded-xl border border-border bg-surface-muted/40 p-3 text-sm text-fg leading-relaxed">
              {course.description || (
                <span className="italic text-fg-subtle">
                  {t("detailModal.noDescription")}
                </span>
              )}
            </div>
          </div>

          {/* Key-Value Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Created By */}
            <div className="rounded-xl border border-border p-3 flex flex-col gap-1 bg-surface">
              <span className="text-fg-subtle flex items-center gap-1.5">
                <FontAwesomeIcon icon={faGraduationCap} className="h-3 w-3" />
                {t("detailModal.createdBy")}
              </span>
              <span className="font-semibold text-fg font-mono">
                User #{course.createdBy}
              </span>
            </div>

            {/* Publication State */}
            <div className="rounded-xl border border-border p-3 flex flex-col gap-1 bg-surface">
              <span className="text-fg-subtle">
                {t("detailModal.publicationState")}
              </span>
              <span className="font-semibold text-fg">{course.publicationState}</span>
            </div>

            {/* Created At */}
            <div className="rounded-xl border border-border p-3 flex flex-col gap-1 bg-surface">
              <span className="text-fg-subtle flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendarDays} className="h-3 w-3" />
                {t("detailModal.createdAt")}
              </span>
              <span className="font-semibold text-fg">{formatDate(course.createdAt)}</span>
            </div>

            {/* Updated At */}
            <div className="rounded-xl border border-border p-3 flex flex-col gap-1 bg-surface">
              <span className="text-fg-subtle flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendarDays} className="h-3 w-3" />
                {t("detailModal.updatedAt")}
              </span>
              <span className="font-semibold text-fg">{formatDate(course.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-fg hover:bg-surface-muted transition-colors cursor-pointer"
          >
            {t("detailModal.close")}
          </button>

          {/* Action button in Modal as well */}
          <button
            type="button"
            onClick={handleAction}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
          >
            {/* TODO */}
            <span>{t("detailModal.actionBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
