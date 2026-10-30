import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUserGraduate,
  faChalkboardUser,
  faUserShield,
  faTriangleExclamation,
  faSpinner,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { IUser, UserRole } from "../services/userList.type";

interface ChangeRoleModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: UserRole) => Promise<void>;
  isSubmitting: boolean;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation("userList");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const roleOptions: {
    role: UserRole;
    title: string;
    desc: string;
    icon: typeof faUserGraduate;
  }[] = [
    {
      role: "STUDENT",
      title: t("changeRoleModal.roles.student.title"),
      desc: t("changeRoleModal.roles.student.desc"),
      icon: faUserGraduate,
    },
    {
      role: "LECTURER",
      title: t("changeRoleModal.roles.lecturer.title"),
      desc: t("changeRoleModal.roles.lecturer.desc"),
      icon: faChalkboardUser,
    },
    {
      role: "ADMIN",
      title: t("changeRoleModal.roles.admin.title"),
      desc: t("changeRoleModal.roles.admin.desc"),
      icon: faUserShield,
    },
  ];

  const isRoleChanged = selectedRole !== null && selectedRole !== user.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !isRoleChanged) return;
    await onSubmit(selectedRole);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-fg">
              {t("changeRoleModal.title")}
            </h3>
            <p className="text-xs text-fg-muted mt-0.5">
              {t("changeRoleModal.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* User preview */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-muted p-3.5 border border-border/80">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-base">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-fg text-sm truncate">
                {user.fullName}
              </span>
              <span className="text-xs text-fg-subtle font-mono">
                (@{user.username})
              </span>
            </div>
            <div className="text-xs text-fg-muted truncate">{user.email}</div>
          </div>
        </div>

        {/* Role options form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              {t("changeRoleModal.selectNewRole")}
            </label>

            <div className="space-y-2">
              {roleOptions.map((opt) => {
                const isSelected = selectedRole === opt.role;
                const isCurrent = user.role === opt.role;

                return (
                  <label
                    key={opt.role}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                        : "border-border bg-surface hover:bg-surface-muted/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.role}
                      checked={isSelected}
                      onChange={() => setSelectedRole(opt.role)}
                      disabled={isSubmitting}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-fg flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={opt.icon}
                            className={`h-3.5 w-3.5 ${
                              opt.role === "ADMIN"
                                ? "text-purple-600 dark:text-purple-400"
                                : opt.role === "LECTURER"
                                ? "text-sky-600 dark:text-sky-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          />
                          {opt.title}
                        </span>

                        {isCurrent && (
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-fg-subtle border border-border">
                            {t("changeRoleModal.current")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-fg-muted leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Admin warning alert */}
          {selectedRole === "ADMIN" && user.role !== "ADMIN" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
              />
              <div>
                <span className="font-semibold">{t("changeRoleModal.securityWarning")}</span>{" "}
                {t("changeRoleModal.adminNotice")}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-fg-muted hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
            >
              {t("changeRoleModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={!isRoleChanged || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="h-3.5 w-3.5 animate-spin" />
                  <span>{t("changeRoleModal.saving")}</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
                  <span>{t("changeRoleModal.save")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
