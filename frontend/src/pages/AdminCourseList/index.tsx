import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faGraduationCap,
  faHouse,
  faTriangleExclamation,
  faRotateRight,
  faCircleCheck,
  faClock,
  faBoxArchive,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";

import { useMe } from "~/services/me.query";
import { useGetCourses } from "./services/adminCourse.query";
import type {
  ICourseResponse,
  PublicationFilter,
  EnrollmentFilter,
  CourseSortOption,
} from "./services/adminCourse.type";
import { CourseFilterToolbar } from "./components/CourseFilterToolbar";
import { CourseTable } from "./components/CourseTable";
import { CoursePagination } from "./components/CoursePagination";
import { CourseDetailModal } from "./components/CourseDetailModal";

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

export default function AdminCourseList() {
  const { t } = useTranslation("adminCourseList");
  const { data: me } = useMe();

  // Query courses from backend /api/courses
  const {
    data: allCourses = [],
    isLoading,
    isRefetching,
    refetch,
    isError,
    error,
  } = useGetCourses();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedPublication, setSelectedPublication] = useState<PublicationFilter>("ALL");
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentFilter>("ALL");
  const [sortBy, setSortBy] = useState<CourseSortOption>("createdAt,desc");

  // Pagination states (client-side pagination)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [selectedCourseForDetail, setSelectedCourseForDetail] =
    useState<ICourseResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Client-side filtering & sorting
  const filteredCourses = useMemo(() => {
    let list = [...allCourses];

    // Filter by search query (id, title, description)
    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter((course) => {
        const titleNorm = normalize(course.title || "");
        const descNorm = normalize(course.description || "");
        const idStr = String(course.id);
        return titleNorm.includes(q) || descNorm.includes(q) || idStr.includes(q);
      });
    }

    // Filter by publication state
    if (selectedPublication !== "ALL") {
      list = list.filter((c) => c.publicationState === selectedPublication);
    }

    // Filter by enrollment status
    if (selectedEnrollment === "OPEN") {
      list = list.filter((c) => c.enrollmentOpen);
    } else if (selectedEnrollment === "CLOSED") {
      list = list.filter((c) => !c.enrollmentOpen);
    }

    // Client-side sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case "createdAt,asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "createdAt,desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "title,asc":
          return a.title.localeCompare(b.title, "vi");
        case "title,desc":
          return b.title.localeCompare(a.title, "vi");
        case "id,asc":
          return a.id - b.id;
        case "id,desc":
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return list;
  }, [allCourses, search, selectedPublication, selectedEnrollment, sortBy]);

  // Client-side paginated subset
  const totalElements = filteredCourses.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const paginatedCourses = useMemo(() => {
    const start = page * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, page, pageSize]);

  // Filter and pagination handlers
  const handleResetFilters = () => {
    setSearch("");
    setSelectedPublication("ALL");
    setSelectedEnrollment("ALL");
    setSortBy("createdAt,desc");
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleOpenDetail = (course: ICourseResponse) => {
    setSelectedCourseForDetail(course);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCourseForDetail(null);
  };

  /**
   * Action button handler requested by user:
   * alert("Đây là action")
   */
  const handleAction = (_course: ICourseResponse) => {
    alert("Đây là action");
  };

  // Check access permission: only ADMIN allowed
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
        <span>{t("breadcrumb.admin")}</span>
        <FontAwesomeIcon icon={faChevronRight} className="h-2.5 w-2.5 text-fg-subtle/60" />
        <span className="font-semibold text-fg">{t("breadcrumb.courses")}</span>
      </nav>

      {/* Filter and Search Toolbar */}
      <CourseFilterToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        selectedPublication={selectedPublication}
        onPublicationChange={(v) => {
          setSelectedPublication(v);
          setPage(0);
        }}
        selectedEnrollment={selectedEnrollment}
        onEnrollmentChange={(v) => {
          setSelectedEnrollment(v);
          setPage(0);
        }}
        sortBy={sortBy}
        onSortChange={(v) => {
          setSortBy(v);
          setPage(0);
        }}
        onReset={handleResetFilters}
      />

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <FontAwesomeIcon icon={faTriangleExclamation} className="h-6 w-6 text-red-600 dark:text-red-400" />
          <h3 className="mt-2 text-sm font-bold text-fg">
            {t("error.title")}
          </h3>
          <p className="mt-1 text-xs text-fg-muted">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" />
            <span>{t("error.retry")}</span>
          </button>
        </div>
      )}

      {/* Courses Table */}
      <CourseTable
        courses={paginatedCourses}
        isLoading={isLoading}
        onViewDetail={handleOpenDetail}
        onAction={handleAction}
        onResetFilters={handleResetFilters}
      />

      {/* Pagination Controls */}
      <CoursePagination
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourseForDetail}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onAction={handleAction}
      />
    </div>
  );
}
