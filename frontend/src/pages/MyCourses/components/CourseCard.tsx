import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCircleInfo,
    faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import type { CourseCardProps } from "../services/myCourses.type";
import { useNavigate } from "react-router";

const GRADIENTS = [
    "from-indigo-500 to-violet-600",
    "from-sky-500 to-indigo-600",
    "from-fuchsia-500 to-indigo-600",
    "from-emerald-500 to-sky-600",
];

const pickGradient = (id: number) => {
    const index = Math.abs(Math.trunc(id)) % GRADIENTS.length;
    return GRADIENTS[index];
};

export default function CourseCard({ course, layout }: Readonly<CourseCardProps>) {
    const { t } = useTranslation("myCourses");
    const navigate = useNavigate();
    const goToCourse = () => navigate(`/courses/${course.id}/lessons`);
    const isGrid = layout === "grid";
    const percent = course.progressPercent

    // const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

    // const formatShortDate = (iso: string) =>
    //     new Date(iso).toLocaleDateString(locale, {
    //         day: "2-digit",
    //         month: "2-digit",
    //     });

    const isCompleted = false; // course.status === "completed";
    const isLocked = false; // course.status === "locked";

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
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                    <h3 className="text-lg font-bold leading-snug text-fg">
                        {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                            {course.instructorName
                                .split(" ")
                                .slice(-1)[0]
                                ?.charAt(0)}
                        </span>
                        <div className="min-w-0 text-sm leading-tight">
                            <p className="font-medium text-fg">
                                {course.instructorName}
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
                                        done: course.completeLesson,
                                        total: course.totalLesson,
                                    })}
                                    )
                                </span>
                            )}
                        </span>
                        <span
                            className={`font-bold ${isLocked ? "text-amber-500" : "text-primary"}`}
                        >
                            {percent?.toFixed(2)}%
                            {isGrid && (
                                <span className="ml-1 font-normal text-fg-subtle">
                                    ({course.completeLesson}/{course.totalLesson})
                                </span>
                            )}
                        </span>
                    </div>
                    <div
                        role="progress"
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
                {/* {course.status === "in_progress" && course.nextLesson && (
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
                )} */}

                {/* {isLocked && course.unlock && (
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
                )} */}

                {/* {isCompleted && (
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-tertiary">
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="text-[16px]"
                            aria-hidden
                        />{" "}
                        {t("tabs.completed")}
                    </p>
                )} */}

                {/* CTA */}
                <div className="mt-auto">
                    {isLocked ? (
                        <button
                            type="button"
                            className=" cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-primary"
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
                            className={` cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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
