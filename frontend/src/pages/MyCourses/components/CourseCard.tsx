import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCalendarDays,
    faCircleCheck,
    faCircleInfo,
    faCirclePlay,
    faClock,
    faEllipsisVertical,
    faGraduationCap,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import type { CourseView, MyCourse } from "../services/myCourses.type";
import { useNavigate } from "react-router";
interface Props {
    course: MyCourse;
    layout: CourseView;
}

const GRADIENTS = [
    "from-indigo-500 to-violet-600",
    "from-sky-500 to-indigo-600",
    "from-fuchsia-500 to-indigo-600",
    "from-emerald-500 to-sky-600",
];

const pickGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++)
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export default function CourseCard({ course, layout }: Props) {
    const { t, i18n } = useTranslation("myCourses");
    const navigate = useNavigate();
    const goToCourse = () => navigate(`/courses/${course.id}/lessons`);
    const isGrid = layout === "grid";
    const percent = course.lessonsTotal
        ? Math.round((course.lessonsDone / course.lessonsTotal) * 100)
        : 0;

    const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

    const formatLastAccessed = () => {
        const date = new Date(course.lastAccessedAt);
        const time = date.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
        });
        const diffDays = Math.round(
            (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
        );
        if (diffDays <= 0) return t("time.today", { time });
        if (diffDays === 1) return t("time.yesterday", { time });
        return new Intl.RelativeTimeFormat(locale, {
            numeric: "always",
        }).format(-diffDays, "day");
    };

    const formatShortDate = (iso: string) =>
        new Date(iso).toLocaleDateString(locale, {
            day: "2-digit",
            month: "2-digit",
        });

    const isCompleted = course.status === "completed";
    const isLocked = course.status === "locked";

    const badge = isLocked ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white">
            <FontAwesomeIcon
                icon={faLock}
                className="text-[12px]"
                aria-hidden
            />{" "}
            {t("card.locked")}
        </span>
    ) : (
        <span
            className={`rounded-md px-2 py-1 text-[11px] font-semibold text-white ${
                isCompleted ? "bg-tertiary" : "bg-primary"
            }`}
        >
            {t(
                isCompleted
                    ? "card.completedSemester"
                    : "card.learningSemester",
                {
                    semester: course.semester,
                },
            )}
        </span>
    );

    return (
        <article
            className={`flex overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md ${
                isGrid ? "flex-col" : "flex-col sm:flex-row"
            }`}
        >
            {/* Thumbnail */}
            <div
                className={`relative shrink-0 ${
                    isGrid ? "h-36 w-full" : "h-36 w-full sm:h-auto sm:w-64"
                }`}
            >
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${pickGradient(
                            course.id,
                        )}`}
                    >
                        <FontAwesomeIcon
                            icon={faGraduationCap}
                            className="text-[48px] text-white/70"
                            aria-hidden
                        />
                    </div>
                )}
                <div className="absolute left-3 top-3">{badge}</div>
                <button
                    type="button"
                    aria-label={t("card.options")}
                    className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-primary"
                >
                    <FontAwesomeIcon
                        icon={faEllipsisVertical}
                        className="text-[16px]"
                        aria-hidden
                    />
                </button>
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[11px] font-medium text-white">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 backdrop-blur">
                        <FontAwesomeIcon
                            icon={faClock}
                            className="text-[12px]"
                            aria-hidden
                        />{" "}
                        {formatLastAccessed()}
                    </span>
                    <span className="rounded-full bg-black/45 px-2 py-0.5 backdrop-blur">
                        {t("card.credits", { count: course.credits })}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                    <h3 className="text-lg font-bold leading-snug text-fg">
                        {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                            {course.instructor
                                .split(" ")
                                .slice(-1)[0]
                                ?.charAt(0)}
                        </span>
                        <div className="min-w-0 text-sm leading-tight">
                            <p className="font-medium text-fg">
                                {course.instructor}
                            </p>
                            <p className="mt-0.5 text-xs text-fg-subtle">
                                {course.department}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="rounded-lg bg-surface-muted px-3 py-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-fg-muted">
                            {t("card.progress")}
                            {!isGrid && (
                                <span className="ml-1 text-fg-subtle">
                                    (
                                    {t("card.lessonsCount", {
                                        done: course.lessonsDone,
                                        total: course.lessonsTotal,
                                    })}
                                    )
                                </span>
                            )}
                        </span>
                        <span
                            className={`font-bold ${isLocked ? "text-amber-500" : "text-primary"}`}
                        >
                            {percent}%
                            {isGrid && (
                                <span className="ml-1 font-normal text-fg-subtle">
                                    ({course.lessonsDone}/{course.lessonsTotal})
                                </span>
                            )}
                        </span>
                    </div>
                    <div
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border"
                    >
                        <div
                            className={`h-full rounded-full ${
                                isCompleted
                                    ? "bg-tertiary"
                                    : isLocked
                                      ? "bg-amber-500"
                                      : "bg-primary"
                            }`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>

                {/* Next lesson / unlock plan */}
                {course.status === "in_progress" && course.nextLesson && (
                    <div className="flex gap-3 rounded-lg border-l-4 border-primary bg-primary-soft/60 px-3 py-2">
                        <FontAwesomeIcon
                            icon={faCirclePlay}
                            className="text-[18px] mt-0.5 shrink-0 text-primary"
                            aria-hidden
                        />
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
                                {t("card.nextLesson")}
                            </p>
                            <p className="text-sm font-semibold text-fg">
                                {t("card.nextLessonValue", {
                                    chapter: course.nextLesson.chapter,
                                    lesson: course.nextLesson.lesson,
                                    title: course.nextLesson.title,
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {isLocked && course.unlock && (
                    <div className="flex gap-3 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-700 dark:text-amber-300">
                        <FontAwesomeIcon
                            icon={faCalendarDays}
                            className="text-[18px] mt-0.5 shrink-0"
                            aria-hidden
                        />
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide">
                                {t("card.unlockPlan")}
                            </p>
                            <p className="text-sm">
                                {t("card.unlockText", {
                                    chapter: course.unlock.chapter,
                                    date: formatShortDate(course.unlock.date),
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-tertiary">
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="text-[16px]"
                            aria-hidden
                        />{" "}
                        {t("tabs.completed")}
                    </p>
                )}

                {/* CTA */}
                <div className="mt-auto">
                    {isLocked ? (
                        <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-primary"
                        >
                            <FontAwesomeIcon
                                icon={faCircleInfo}
                                className="text-[16px]"
                                aria-hidden
                            />{" "}
                            {t("card.overview")}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={goToCourse}
                            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                isCompleted
                                    ? "border border-border bg-surface text-fg hover:bg-surface-muted"
                                    : "bg-primary text-on-primary hover:bg-primary-hover"
                            }`}
                        >
                            {t(isCompleted ? "card.review" : "card.continue")}
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                className="text-[16px]"
                                aria-hidden
                            />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
