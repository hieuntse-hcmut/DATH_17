import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import type {
  CourseSortOption,
  EnrollmentFilter,
  PublicationFilter,
} from "../services/adminCourse.type";

interface CourseFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedPublication: PublicationFilter;
  onPublicationChange: (value: PublicationFilter) => void;
  selectedEnrollment: EnrollmentFilter;
  onEnrollmentChange: (value: EnrollmentFilter) => void;
  sortBy: CourseSortOption;
  onSortChange: (value: CourseSortOption) => void;
  onReset: () => void;
}

export const CourseFilterToolbar: React.FC<CourseFilterToolbarProps> = ({
  search,
  onSearchChange,
  selectedPublication,
  onPublicationChange,
  selectedEnrollment,
  onEnrollmentChange,
  sortBy,
  onSortChange,
  onReset,
}) => {
  const { t } = useTranslation("adminCourseList");

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedPublication !== "ALL" ||
    selectedEnrollment !== "ALL" ||
    sortBy !== "createdAt,desc";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xs">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-fg-subtle">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-surface-muted py-2 pl-10 pr-9 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-fg-subtle hover:text-fg transition-colors cursor-pointer"
              title={t("filters.clearSearch")}
            >
              <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action buttons: Reset & Refresh */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-fg-muted hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faFilter} className="h-3 w-3 text-fg-subtle" />
              <span>{t("filters.reset")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Sort selects */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60 text-xs">
        <span className="text-fg-subtle font-medium">{t("filters.filterBy")}</span>

        {/* Publication state filter */}
        <select
          value={selectedPublication}
          onChange={(e) => onPublicationChange(e.target.value as PublicationFilter)}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">{t("filters.publication.all")}</option>
          <option value="PUBLISHED">{t("filters.publication.published")}</option>
          <option value="DRAFT">{t("filters.publication.draft")}</option>
          <option value="ARCHIVED">{t("filters.publication.archived")}</option>
        </select>

        {/* Enrollment filter */}
        <select
          value={selectedEnrollment}
          onChange={(e) => onEnrollmentChange(e.target.value as EnrollmentFilter)}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">{t("filters.enrollment.all")}</option>
          <option value="OPEN">{t("filters.enrollment.open")}</option>
          <option value="CLOSED">{t("filters.enrollment.closed")}</option>
        </select>

        <span className="ml-auto hidden lg:inline text-fg-subtle font-medium">
          {t("filters.sortBy")}
        </span>

        {/* Sort select */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as CourseSortOption)}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ml-auto lg:ml-0"
        >
          <option value="createdAt,desc">{t("filters.sortOptions.newest")}</option>
          <option value="createdAt,asc">{t("filters.sortOptions.oldest")}</option>
          <option value="title,asc">{t("filters.sortOptions.titleAsc")}</option>
          <option value="title,desc">{t("filters.sortOptions.titleDesc")}</option>
          <option value="id,asc">{t("filters.sortOptions.idAsc")}</option>
          <option value="id,desc">{t("filters.sortOptions.idDesc")}</option>
        </select>
      </div>
    </div>
  );
};
