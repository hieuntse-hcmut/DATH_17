import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardUser,
  faUserShield,
  faEye,
  faPenToSquare,
  faUsersSlash,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import type { IUser, UserRole } from "../services/userList.type";

interface UserTableProps {
  users: IUser[];
  isLoading: boolean;
  currentUserId?: number;
  onViewDetail: (user: IUser) => void;
  onOpenChangeRole: (user: IUser) => void;
  onResetFilters: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  currentUserId,
  onViewDetail,
  onOpenChangeRole,
  onResetFilters,
}) => {
  const { t } = useTranslation("userList");

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return {
          label: t("filters.roles.admin"),
          icon: faUserShield,
          color:
            "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      case "LECTURER":
        return {
          label: t("filters.roles.lecturer"),
          icon: faChalkboardUser,
          color:
            "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        };
      case "STUDENT":
      default:
        return {
          label: t("filters.roles.student"),
          icon: faUserGraduate,
          color:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
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
                <div className="h-10 w-10 rounded-full bg-surface-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded-sm bg-surface-muted" />
                  <div className="h-3 w-1/4 rounded-sm bg-surface-muted" />
                </div>
                <div className="h-6 w-20 rounded-full bg-surface-muted" />
                <div className="h-6 w-24 rounded-full bg-surface-muted" />
                <div className="h-8 w-16 rounded-lg bg-surface-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-fg-subtle">
          <FontAwesomeIcon icon={faUsersSlash} className="h-6 w-6" />
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
              <th className="py-3 px-4">{t("table.columns.user")}</th>
              <th className="py-3 px-4 hidden md:table-cell">{t("table.columns.email")}</th>
              <th className="py-3 px-4">{t("table.columns.role")}</th>
              <th className="py-3 px-4 hidden lg:table-cell">{t("table.columns.createdAt")}</th>
              <th className="py-3 px-4 text-right">{t("table.columns.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {users.map((user) => {
              const roleConfig = getRoleConfig(user.role);
              const isSelf = currentUserId !== undefined && user.id === currentUserId;
              const isOtherAdmin = user.role === "ADMIN" && !isSelf;
              const canEditRole = !isSelf && !isOtherAdmin;

              const tooltipText = isSelf
                ? t("table.selfTooltip")
                : isOtherAdmin
                ? t("table.otherAdminTooltip")
                : t("table.changeRole");

              return (
                <tr
                  key={user.id}
                  className="hover:bg-surface-muted/40 transition-colors group"
                >
                  {/* User info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-fg text-sm truncate">
                            {user.fullName}
                          </span>
                          {isSelf && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                              {t("table.you")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-fg-subtle">
                          <span className="font-mono">@{user.username}</span>
                          <span className="md:hidden truncate max-w-[140px]">
                            · {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 hidden md:table-cell text-xs text-fg-muted font-medium">
                    <a
                      href={`mailto:${user.email}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {user.email}
                    </a>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleConfig.color}`}
                    >
                      <FontAwesomeIcon icon={roleConfig.icon} className="h-3 w-3" />
                      <span>{roleConfig.label}</span>
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-4 hidden lg:table-cell text-xs text-fg-subtle">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(user)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
                        title={t("table.viewDetail")}
                      >
                        <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                      </button>

                      {/* Change role */}
                      {canEditRole ? (
                        <button
                          type="button"
                          onClick={() => onOpenChangeRole(user)}
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer shadow-2xs"
                          title={tooltipText}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                          <span className="hidden sm:inline">{t("table.changeRole")}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-muted/50 px-2.5 text-xs font-medium text-fg-subtle opacity-60 cursor-not-allowed"
                          title={tooltipText}
                        >
                          <FontAwesomeIcon icon={faLock} className="h-3 w-3" />
                          <span className="hidden sm:inline">{t("table.changeRole")}</span>
                        </button>
                      )}
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
