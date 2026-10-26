import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faCirclePlus} from "@fortawesome/free-solid-svg-icons";

import CourseCard from "./components/CourseCard";
import CourseToolbar from "./components/CourseToolbar";
import { useGetMyCourses } from "./services/myCourses.query";
import type {
    CourseSort,
    CourseView,
    ICourse,
    CourseTab
} from "./services/myCourses.type";

const normalize = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .toLowerCase();

const toTime = (value: unknown): number => {
    if (!value) return 0;
    const time = new Date(value as string).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const sortCourses = (list: ICourse[], sort: CourseSort) =>
    [...list].sort((a, b) => {
        const byName = a.title.localeCompare(b.title, "vi");

        if (sort === "name") return byName;

        if (sort === "progress") {
            return (b.progressPercent - a.progressPercent) || byName;
        }

        // recent: ưu tiên lastAccessedAt, nếu chưa học thì dùng enrolledAt
        // const ta = toTime(a.lastAccessedAt) || toTime(a.enrolledAt);
        // const tb = toTime(b.lastAccessedAt) || toTime(b.enrolledAt);
        // return (tb - ta) || byName;
        return byName;
    });

export default function MyCoursesPage() {
    const { t } = useTranslation("myCourses");
    const { data, isLoading, isError, refetch } = useGetMyCourses({
        staleTime: 30_000
    });

    const [tab, setTab] = useState<CourseTab>("learning");
    const [keyword, setKeyword] = useState("");
    const [sort, setSort] = useState<CourseSort>("name");
    const [view, setView] = useState<CourseView>("grid");

    const { learning, completed } = useMemo(() => {
        const courses = Array.isArray(data) ? data : [];
        return {
            learning: courses.filter((c) => c.progressPercent !== 100),
            completed: courses.filter((c) => c.progressPercent === 100),
        };
    }, [data]);

    const visible = useMemo(() => {
        const source = tab === "learning" ? learning : completed;
        const q = normalize(keyword.trim());
        const filtered = q
            ? source.filter((c) =>
                  normalize(
                      `${c.title} ${c.instructorName}`,
                  ).includes(q),
              )
            : source;
        return sortCourses(filtered, sort);
    }, [tab, learning, completed, keyword, sort]);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
            {/* Breadcrumb */}
            <nav
                aria-label="breadcrumb"
                className="hidden items-center gap-1 text-xs text-fg-subtle md:flex"
            >
                <span>{t("breadcrumb.study")}</span>
                <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-[12px]"
                    aria-hidden
                />
                <span className="font-medium text-fg-muted">
                    {t("breadcrumb.current")}
                </span>
            </nav>

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-fg md:text-3xl">
                        {t("title")}
                    </h1>
                    <p className="mt-1 max-w-xl text-sm text-fg-muted">
                        {t("subtitle")}
                    </p>
                </div>
                {/* <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <FontAwesomeIcon
                        icon={faCirclePlus}
                        className="text-[16px]"
                        aria-hidden
                    />{" "}
                    {t("register")}
                </button> */}
                {/* TODO */}
            </div>

            <CourseToolbar
                tab={tab}
                onTabChange={setTab}
                learningCount={learning.length}
                completedCount={completed.length}
                keyword={keyword}
                onKeywordChange={setKeyword}
                sort={sort}
                onSortChange={setSort}
                view={view}
                onViewChange={setView}
            />

            {/* Content */}
            {isLoading ? (
                <div
                    className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                    aria-busy="true"
                >
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-96 animate-pulse rounded-2xl border border-border bg-surface-muted"
                        />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-10 text-center">
                    <p className="text-sm text-fg-muted">{t("error.load")}</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover"
                    >
                        {t("error.retry")}
                    </button>
                </div>
            ) : visible.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                    <p className="text-sm text-fg-muted">
                        {keyword.trim()
                            ? t("empty.search", { keyword: keyword.trim() })
                            : t(
                                  tab === "learning"
                                      ? "empty.learning"
                                      : "empty.completed",
                              )}
                    </p>
                    {!keyword.trim() && tab === "learning" && (
                        <button
                            type="button"
                            className="rounded-lg bg-primary-soft px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                        >
                            {t("empty.cta")}
                        </button>
                    )}
                </div>
            ) : (
                <div
                    className={
                        view === "grid"
                            ? "grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3"
                            : "flex flex-col gap-4"
                    }
                >
                    {visible.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            layout={view}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
