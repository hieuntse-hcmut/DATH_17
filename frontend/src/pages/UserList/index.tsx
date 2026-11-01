import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faHouse,
  faTriangleExclamation,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

import { useMe } from "~/services/me.query";
import { useToast } from "~/components/Toast";
import { getErrorMessage } from "~/utils/getErrorMessage";

import { useGetUsers, useUpdateUserRole } from "./services/userList.query";
import type { IUser, UserRole, UserStatus } from "./services/userList.type";
import { UserFilterToolbar } from "./components/UserFilterToolbar";
import { UserTable } from "./components/UserTable";
import { UserPagination } from "./components/UserPagination";
import { ChangeRoleModal } from "./components/ChangeRoleModal";
import { UserDetailModal } from "./components/UserDetailModal";

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

export default function UserList() {
  const { t } = useTranslation("userList");
  const toast = useToast();
  const { data: me, isLoading: isLoadingMe } = useMe();

  // Query and table state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt,desc");

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | "ALL">("ALL");

  // Modals state
  const [selectedUserForRole, setSelectedUserForRole] = useState<IUser | null>(null);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<IUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch paginated users from backend
  const {
    data: pageData,
    isLoading: isLoadingUsers,
    refetch,
    isError,
    error,
  } = useGetUsers({
    page,
    size: pageSize,
    sort: sortBy,
  });

  const updateRoleMutation = useUpdateUserRole();

  // Extract raw users
  const rawUsers: IUser[] = useMemo(() => {
    return pageData?.content ?? [];
  }, [pageData]);

  // Client-side search and filters applied on loaded data
  const filteredUsers = useMemo(() => {
    let list = [...rawUsers];

    // Filter by search query
    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter((u) => {
        const target = normalize(`${u.fullName} ${u.username} ${u.email}`);
        return target.includes(q);
      });
    }

    // Filter by role
    if (selectedRole !== "ALL") {
      list = list.filter((u) => u.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== "ALL") {
      list = list.filter((u) => u.status === selectedStatus);
    }

    // Client-side sort fallback if needed
    if (sortBy === "fullName,asc") {
      list.sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));
    } else if (sortBy === "fullName,desc") {
      list.sort((a, b) => b.fullName.localeCompare(a.fullName, "vi"));
    } else if (sortBy === "username,asc") {
      list.sort((a, b) => a.username.localeCompare(b.username));
    } else if (sortBy === "createdAt,asc") {
      list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortBy === "createdAt,desc") {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return list;
  }, [rawUsers, search, selectedRole, selectedStatus, sortBy]);

  // Handlers
  const handleResetFilters = () => {
    setSearch("");
    setSelectedRole("ALL");
    setSelectedStatus("ALL");
    setSortBy("createdAt,desc");
    setPage(0);
  };

  const handleOpenChangeRole = (user: IUser) => {
    setSelectedUserForRole(user);
    setIsChangeRoleOpen(true);
  };

  const handleCloseChangeRole = () => {
    if (updateRoleMutation.isPending) return;
    setIsChangeRoleOpen(false);
    setSelectedUserForRole(null);
  };

  const handleOpenDetail = (user: IUser) => {
    setSelectedUserForDetail(user);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedUserForDetail(null);
  };

  const handleSubmitChangeRole = async (newRole: UserRole) => {
    if (!selectedUserForRole) return;

    try {
      await updateRoleMutation.mutateAsync({
        userId: selectedUserForRole.id,
        role: newRole,
      });

      toast.show(
        t("messages.updateSuccess", { name: selectedUserForRole.fullName }),
        "success",
      );
      handleCloseChangeRole();
    } catch (err) {
      toast.show(
        getErrorMessage(err, t("messages.updateError")),
        "error",
      );
    }
  };

  // Check access permission
  const isUnauthorized = me && me.role !== "ADMIN";

  if (isUnauthorized) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <FontAwesomeIcon icon={faTriangleExclamation} className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-fg">
          {t("unauthorized.title")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-fg-muted">
          {t("unauthorized.desc")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors shadow-xs"
        >
          <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
          <span>{t("unauthorized.goHome")}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-2 text-xs text-fg-subtle"
      >
        <span className="text-fg-subtle">{t("breadcrumb.admin")}</span>
        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        <span className="font-semibold text-fg">{t("breadcrumb.userList")}</span>
      </nav>

      {/* Error state alert */}
      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5" />
            <span>
              {getErrorMessage(error, t("messages.fetchError"))}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer dark:border-red-800 dark:bg-red-900/60 dark:text-red-200"
          >
            <FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" />
            <span>{t("messages.retry")}</span>
          </button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <UserFilterToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        selectedRole={selectedRole}
        onRoleChange={(role) => {
          setSelectedRole(role);
          setPage(0);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSelectedStatus(status);
          setPage(0);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setPage(0);
        }}
        onReset={handleResetFilters}
      />

      {/* Users Data Table */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoadingUsers || isLoadingMe}
        currentUserId={me?.id}
        onViewDetail={handleOpenDetail}
        onOpenChangeRole={handleOpenChangeRole}
        onResetFilters={handleResetFilters}
      />

      {/* Pagination Bar */}
      <UserPagination
        currentPage={page}
        totalPages={pageData?.totalPages ?? 1}
        totalElements={pageData?.totalElements ?? filteredUsers.length}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
      />

      {/* Modal: Change Role */}
      <ChangeRoleModal
        user={selectedUserForRole}
        isOpen={isChangeRoleOpen}
        onClose={handleCloseChangeRole}
        onSubmit={handleSubmitChangeRole}
        isSubmitting={updateRoleMutation.isPending}
      />

      {/* Modal: User Details */}
      <UserDetailModal
        user={selectedUserForDetail}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onOpenChangeRole={handleOpenChangeRole}
        canChangeRole={
          Boolean(
            selectedUserForDetail &&
              me &&
              selectedUserForDetail.id !== me.id &&
              selectedUserForDetail.role !== "ADMIN",
          )
        }
      />
    </div>
  );
}
