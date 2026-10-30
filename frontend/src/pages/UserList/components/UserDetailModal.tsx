import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUser,
  faEnvelope,
  faCalendarDays,
  faShieldHalved,
  faIdBadge,
  faCircleCheck,
  faCircleXmark,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { IUser } from "../services/userList.type";

interface UserDetailModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChangeRole: (user: IUser) => void;
  canChangeRole: boolean;
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

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onOpenChangeRole,
  canChangeRole,
}) => {
  const { t } = useTranslation("userList");

  if (!isOpen || !user) return null;

  const roleBadge = (() => {
    switch (user.role) {
      case "ADMIN":
        return {
          label: t("filters.roles.admin"),
          color:
            "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      case "LECTURER":
        return {
          label: t("filters.roles.lecturer"),
          color:
            "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        };
      case "STUDENT":
      default:
        return {
          label: t("filters.roles.student"),
          color:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
    }
  })();

  const isActive = user.status === "ACTIVE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-fg">
            {t("detailModal.title")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/5">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <h4 className="mt-3 text-base font-bold text-fg">{user.fullName}</h4>
          <span className="text-xs font-mono text-fg-subtle">@{user.username}</span>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadge.color}`}
            >
              <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
              {roleBadge.label}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              <FontAwesomeIcon
                icon={isActive ? faCircleCheck : faCircleXmark}
                className="h-3 w-3"
              />
              {isActive ? t("table.active") : t("table.inactive")}
            </span>
          </div>
        </div>

        {/* Info list */}
        <div className="mt-6 space-y-3 rounded-xl bg-surface-muted p-4 border border-border/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-fg-subtle flex items-center gap-2">
              <FontAwesomeIcon icon={faIdBadge} className="h-3.5 w-3.5" />
              {t("detailModal.accountId")}
            </span>
            <span className="font-mono font-semibold text-fg">#{user.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-fg-subtle flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
              {t("detailModal.username")}
            </span>
            <span className="font-semibold text-fg font-mono">{user.username}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-fg-subtle flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" />
              {t("detailModal.email")}
            </span>
            <span className="font-medium text-fg truncate max-w-[200px]" title={user.email}>
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-fg-subtle flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="h-3.5 w-3.5" />
              {t("detailModal.createdAt")}
            </span>
            <span className="font-medium text-fg">{formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-fg-muted hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
          >
            {t("detailModal.close")}
          </button>

          {canChangeRole && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChangeRole(user);
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
              <span>{t("detailModal.changeRole")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
