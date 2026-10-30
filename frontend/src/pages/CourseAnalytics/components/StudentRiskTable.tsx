import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPaperPlane,
  faTriangleExclamation,
  faCircleCheck,
  faCircleExclamation,
  faUser,
  faArrowDownWideShort,
} from "@fortawesome/free-solid-svg-icons";
import type {
  RiskFilter,
  RiskSort,
  StudentRiskResponse,
} from "../services/courseAnalytics.type";

interface StudentRiskTableProps {
  students?: StudentRiskResponse[];
  isLoading?: boolean;
}

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

export function StudentRiskTable({
  students = [],
  isLoading,
}: Readonly<StudentRiskTableProps>) {
  const { t, i18n } = useTranslation("courseAnalytics");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RiskFilter>("ALL");
  const [sort, setSort] = useState<RiskSort>("risk_desc");

  // Handler for notifying low risk students (as required: alert TODO)
  // const handleNotifyLowRisk = () => {
  //   alert("TODO");
  // };

  // Handler for notifying high risk students
  // const handleNotifyHighRisk = () => {
  //   alert("TODO");
  // };

  // Handler for individual student notification
  const handleNotifyStudent = () => {
    alert("TODO");
  };

  // Format date helper
  const formatDate = (isoString: string | null) => {
    if (!isoString) return t("students.assessedNever");
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  // Count low and high risk students
  // const lowRiskCount = useMemo(
  //   () => students.filter((s) => s.riskLevel === "LOW").length,
  //   [students]
  // );
  // const highRiskCount = useMemo(
  //   () => students.filter((s) => s.riskLevel === "HIGH").length,
  //   [students]
  // );

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    let list = [...students];

    // Filter by risk level
    if (filter !== "ALL") {
      list = list.filter((s) => s.riskLevel === filter);
    }

    // Search query
    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter((s) => {
        const full = normalize(`${s.fullName} ${s.username} ${s.email}`);
        return full.includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case "risk_desc":
          return (b.riskScore ?? 0) - (a.riskScore ?? 0);
        case "risk_asc":
          return (a.riskScore ?? 0) - (b.riskScore ?? 0);
        case "name_asc":
          return (a.fullName ?? "").localeCompare(b.fullName ?? "", "vi");
        case "name_desc":
          return (b.fullName ?? "").localeCompare(a.fullName ?? "", "vi");
        default:
          return 0;
      }
    });

    return list;
  }, [students, filter, search, sort]);

  // Risk Level styling helpers
  const getRiskBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return {
          label: t("status.high"),
          icon: faTriangleExclamation,
          className:
            "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        };
      case "MEDIUM":
        return {
          label: t("status.medium"),
          icon: faCircleExclamation,
          className:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "LOW":
      default:
        return {
          label: t("status.low"),
          icon: faCircleCheck,
          className:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 60) return "bg-red-500";
    if (score >= 30) return "bg-amber-400";
    return "bg-emerald-500";
  };

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
      {/* Header & Action Bar */}
      <div className="p-5 border-b border-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-fg">
              {t("students.title")}
            </h2>
            <p className="text-xs text-fg-muted mt-0.5">
              {t("students.countSummary", {
                shown: filteredStudents.length,
                total: students.length,
              })}
            </p>
        </div>

        {/* Filter Toolbar: Search, Risk Level Tabs, Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-fg-subtle"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("students.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface-muted/50 text-fg placeholder:text-fg-subtle focus:bg-surface focus:border-primary focus:outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Risk Level Filter */}
            <div className="flex items-center rounded-xl border border-border bg-surface-muted/50 p-0.5 text-xs">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilter(lvl)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    filter === lvl
                      ? "bg-surface text-primary shadow-xs font-semibold"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {lvl === "ALL" && t("students.filterAll")}
                  {lvl === "HIGH" && t("students.filterHigh")}
                  {lvl === "MEDIUM" && t("students.filterMedium")}
                  {lvl === "LOW" && t("students.filterLow")}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as RiskSort)}
                aria-label={t("students.sortRiskDesc")}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-xl border border-border bg-surface text-fg focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="risk_desc">{t("students.sortRiskDesc")}</option>
                <option value="risk_asc">{t("students.sortRiskAsc")}</option>
                <option value="name_asc">{t("students.sortNameAsc")}</option>
                <option value="name_desc">{t("students.sortNameDesc")}</option>
              </select>
              <FontAwesomeIcon
                icon={faArrowDownWideShort}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-fg-subtle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-muted/30 text-fg-muted font-semibold">
              <th className="py-3 px-4">{t("students.colStudent")}</th>
              <th className="py-3 px-4 hidden md:table-cell">
                {t("students.colEmail")}
              </th>
              <th className="py-3 px-4">{t("students.colRiskScore")}</th>
              <th className="py-3 px-4">{t("students.colRiskLevel")}</th>
              <th className="py-3 px-4 hidden lg:table-cell">
                {t("students.colAssessedAt")}
              </th>
              <th className="py-3 px-4 text-right">
                {t("students.colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-fg-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách sinh viên...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-fg-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-3xl text-fg-subtle/50"
                    />
                    <p className="font-medium text-fg">
                      {students.length === 0
                        ? t("students.noRiskData")
                        : t("students.empty")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const badge = getRiskBadge(student.riskLevel);
                const score = student.riskScore ?? 0;
                const scoreColor = getScoreBarColor(score);

                return (
                  <tr
                    key={student.studentId}
                    className="hover:bg-surface-muted/40 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {student.fullName ? student.fullName.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-fg truncate">
                            {student.fullName || student.username}
                          </p>
                          <p className="text-[11px] text-fg-subtle truncate">
                            @{student.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-fg-muted hidden md:table-cell">
                      <span className="truncate block max-w-[200px]" title={student.email}>
                        {student.email || "-"}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-fg w-10">
                          {score.toFixed(1)}
                        </span>
                        <div className="w-20 h-2 rounded-full bg-surface-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreColor}`}
                            style={{
                              width: `${Math.min(100, Math.max(0, score))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.className}`}
                      >
                        <FontAwesomeIcon icon={badge.icon} className="text-[10px]" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Last Assessed */}
                    <td className="py-3 px-4 text-fg-subtle hidden lg:table-cell">
                      {formatDate(student.assessedAt)}
                    </td>

                    {/* Action: Send notification button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={handleNotifyStudent}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-fg font-medium text-xs transition cursor-pointer"
                        title={t("students.notifyIndividual")}
                      >
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          className="text-[11px] text-primary"
                        />
                        <span className="hidden sm:inline">
                          {t("students.notifyIndividual")}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
