import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faCircleCheck,
    faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import CourseCard from "./components/CourseCard";
import CourseToolbar, { type CourseTab } from "./components/CourseToolbar";
import PromoBanner from "./components/PromoBanner";
import { useMyCourses } from "./services/myCourses.query";
import type {
    CourseSort,
    CourseView,
    MyCourse,
} from "./services/myCourses.type";

const normalize = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .toLowerCase();

const sortCourses = (list: MyCourse[], sort: CourseSort) =>
    [...list].sort((a, b) => {
        if (sort === "name") return a.title.localeCompare(b.title);
        if (sort === "progress") {
            const pa = a.lessonsTotal ? a.lessonsDone / a.lessonsTotal : 0;
            const pb = b.lessonsTotal ? b.lessonsDone / b.lessonsTotal : 0;
            return pb - pa;
        }
        return (
            new Date(b.lastAccessedAt).getTime() -
            new Date(a.lastAccessedAt).getTime()
        );
    });

export default function MyCoursesPage() {
    const { t } = useTranslation("myCourses");
    const { data = [], isLoading, isError, refetch } = useMyCourses();

    const [tab, setTab] = useState<CourseTab>("learning");
    const [keyword, setKeyword] = useState("");
    const [sort, setSort] = useState<CourseSort>("recent");
    const [view, setView] = useState<CourseView>("grid");

    const { learning, completed, totalCredits } = useMemo(() => {
        const learning = data.filter((c) => c.status !== "completed");
        const completed = data.filter((c) => c.status === "completed");
        return {
            learning,
            completed,
            totalCredits: learning.reduce((sum, c) => sum + c.credits, 0),
        };
    }, [data]);

    const visible = useMemo(() => {
        const source = tab === "learning" ? learning : completed;
        const q = normalize(keyword.trim());
        const filtered = q
            ? source.filter((c) =>
                  normalize(
                      `${c.title} ${c.instructor} ${c.department}`,
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
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-fg md:text-3xl">
                        {t("title")}
                    </h1>
                    <p className="mt-1 max-w-xl text-sm text-fg-muted">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-soft px-3 py-1.5 text-xs font-semibold text-tertiary">
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="text-[14px]"
                            aria-hidden
                        />{" "}
                        {t("totalCredits", { count: totalCredits })}
                    </span>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        <FontAwesomeIcon
                            icon={faCirclePlus}
                            className="text-[16px]"
                            aria-hidden
                        />{" "}
                        {t("register")}
                    </button>
                </div>
            </header>

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

            <PromoBanner />
        </div>
    );
}
