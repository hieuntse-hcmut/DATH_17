import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faRotateRight,
  faShieldHalved,
  faBookOpen,
  faClipboardQuestion,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

import { useMe } from "~/services/me.query";
import {
  useCourseRiskSummary,
  useStudentRisks,
  useCourseSummary,
} from "./services/courseAnalytics.query";
import { RiskSummaryCards } from "./components/RiskSummaryCards";
import { StudentRiskTable } from "./components/StudentRiskTable";

export default function CourseAnalyticsPage() {
  const { t } = useTranslation("courseAnalytics");
  const params = useParams();
  const courseId = params.courseId ? Number(params.courseId) : 0;

  const { data: me, isLoading: isLoadingMe } = useMe();

  // Queries
  const {
    data: riskSummary,
    isLoading: isLoadingRiskSummary,
    isRefetching: isRefetchingRiskSummary,
    refetch: refetchRiskSummary,
  } = useCourseRiskSummary(courseId, Boolean(courseId));

  const {
    data: studentRisks,
    isLoading: isLoadingStudents,
    isRefetching: isRefetchingStudents,
    refetch: refetchStudents,
  } = useStudentRisks(courseId, Boolean(courseId));

  const {
    data: courseSummary,
    isLoading: isLoadingCourseSummary,
    isRefetching: isRefetchingCourseSummary,
    refetch: refetchCourseSummary,
  } = useCourseSummary(courseId, Boolean(courseId));

  const handleRefresh = () => {
    refetchRiskSummary();
    refetchStudents();
    refetchCourseSummary();
  };

  const isRefreshing =
    isRefetchingRiskSummary ||
    isRefetchingStudents ||
    isRefetchingCourseSummary;

  const isInitialLoading =
    isLoadingMe ||
    (isLoadingRiskSummary && isLoadingStudents && isLoadingCourseSummary);

  // Check role: Only lecturer / admin should view analytics
  const isStudent = me?.role === "STUDENT";

  if (isLoadingMe) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-fg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (isStudent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-surface p-8 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <FontAwesomeIcon icon={faShieldHalved} className="text-2xl" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-fg">
            Truy cập bị từ chối
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            {t("permissionDenied")}
          </p>
          <div className="mt-6">
            <Link
              to={`/courses/${courseId}/lessons`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              <span>{t("backToCourse")}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const courseTitle =
    courseSummary?.courseTitle ||
    `Khóa học #${courseId}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-fg-subtle"
      >
        <Link
          to="/my-courses"
          className="hover:text-primary transition-colors font-medium"
        >
          {t("breadcrumbs.myCourses")}
        </Link>
        <FontAwesomeIcon
          icon={faChevronRight}
          className="text-[10px]"
          aria-hidden
        />
        <Link
          to={`/courses/${courseId}/lessons`}
          className="hover:text-primary transition-colors font-medium max-w-[200px] truncate"
          title={courseTitle}
        >
          {courseTitle}
        </Link>
        <FontAwesomeIcon
          icon={faChevronRight}
          className="text-[10px]"
          aria-hidden
        />
        <span className="font-semibold text-fg">
          {t("breadcrumbs.analytics")}
        </span>
      </nav>

      {/* Main Content */}
      {isInitialLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-fg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">{t("loading")}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Risk Summary & Learning Progress Overview */}
          <section>
            <RiskSummaryCards
              riskSummary={riskSummary}
              courseSummary={courseSummary}
            />
          </section>

          {/* Student Risk List & Notification Actions */}
          <section className="pt-2">
            <StudentRiskTable
              students={studentRisks}
              isLoading={isLoadingStudents}
            />
          </section>
        </>
      )}
    </div>
  );
}
