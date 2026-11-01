import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import type { UserRole, UserStatus } from "../services/userList.type";

interface UserFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedRole: UserRole | "ALL";
  onRoleChange: (role: UserRole | "ALL") => void;
  selectedStatus: UserStatus | "ALL";
  onStatusChange: (status: UserStatus | "ALL") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export const UserFilterToolbar: React.FC<UserFilterToolbarProps> = ({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onReset,
}) => {
  const { t } = useTranslation("userList");

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedRole !== "ALL" ||
    selectedStatus !== "ALL" ||
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

        {/* Action buttons: Refresh & Reset */}
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

      {/* Filter and Sort selectors */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-border/60">
        <span className="text-xs font-medium text-fg-subtle">
          {t("filters.filterBy")}
        </span>

        {/* Role select */}
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole | "ALL")}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">{t("filters.roles.all")}</option>
          <option value="STUDENT">{t("filters.roles.student")}</option>
          <option value="LECTURER">{t("filters.roles.lecturer")}</option>
          <option value="ADMIN">{t("filters.roles.admin")}</option>
        </select>

        {/* Status select */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as UserStatus | "ALL")}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">{t("filters.statuses.all")}</option>
          <option value="ACTIVE">{t("filters.statuses.active")}</option>
          <option value="INACTIVE">{t("filters.statuses.inactive")}</option>
        </select>

        <span className="ml-auto hidden text-xs font-medium text-fg-subtle sm:inline">
          {t("filters.sortBy")}
        </span>

        {/* Sort select */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="createdAt,desc">{t("filters.sortOptions.newest")}</option>
          <option value="createdAt,asc">{t("filters.sortOptions.oldest")}</option>
          <option value="fullName,asc">{t("filters.sortOptions.nameAsc")}</option>
          <option value="fullName,desc">{t("filters.sortOptions.nameDesc")}</option>
          <option value="username,asc">{t("filters.sortOptions.usernameAsc")}</option>
        </select>
      </div>
    </div>
  );
};
