import React from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

interface UserPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation("userList");

  if (totalElements === 0) return null;

  const from = currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      if (start > 1) pages.push("ellipsis");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) pages.push("ellipsis");

      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
      {/* Item summary */}
      <div className="flex items-center gap-3 text-xs text-fg-muted">
        <span>
          {t("pagination.showing")}{" "}
          <strong className="text-fg">{from}</strong> -{" "}
          <strong className="text-fg">{to}</strong> {t("pagination.of")}{" "}
          <strong className="text-fg">{totalElements}</strong>{" "}
          {t("pagination.users")}
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-border">
          <label htmlFor="pageSizeSelect" className="text-fg-subtle">
            {t("pagination.perPage")}
          </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center justify-center gap-1">
        {/* First page */}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:bg-surface-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40 transition-colors"
          title={t("pagination.firstPage")}
        >
          <FontAwesomeIcon icon={faAnglesLeft} className="h-3 w-3" />
        </button>

        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:bg-surface-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40 transition-colors"
          title={t("pagination.prevPage")}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
        </button>

        {/* Number buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-6 items-center justify-center text-xs text-fg-subtle"
              >
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-on-primary shadow-xs"
                  : "border border-border text-fg hover:bg-surface-muted"
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:bg-surface-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40 transition-colors"
          title={t("pagination.nextPage")}
        >
          <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
        </button>

        {/* Last page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:bg-surface-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40 transition-colors"
          title={t("pagination.lastPage")}
        >
          <FontAwesomeIcon icon={faAnglesRight} className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
