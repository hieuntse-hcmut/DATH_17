import {
    faBookOpen,
    faChevronDown,
    faChevronUp,
    faCircleCheck,
    faCirclePlay,
    faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type {
    IChapterWithProgress,
    ILessonWithProgress,
} from "../services/courseDetail.type";

interface Props {
    chapters: IChapterWithProgress[];
    currentLessonId: number;
    completedIds: Set<number>;
    completedCount: number;
    totalLessons: number;
    defaultOpenChapterId?: number;
    onSelectLesson: (lessonId: number) => void;
}

// 600 -> "10:00"
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
};

function ProgressRing({
    done,
    total,
    label,
    size = 18,
}: {
    done: number;
    total: number;
    label: string;
    size?: number;
}) {
    const stroke = 2.5;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const ratio = total ? Math.min(done / total, 1) : 0;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={label}
            className="shrink-0 -rotate-90 text-primary"
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                strokeWidth={stroke}
                className="stroke-primary/20"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - ratio)}
                className="transition-[stroke-dashoffset] duration-300"
            />
        </svg>
    );
}

function LessonRow({
    lesson,
    active,
    completed,
    onClick,
}: {
    lesson: ILessonWithProgress;
    active: boolean;
    completed: boolean;
    onClick: () => void;
}) {
    const { t } = useTranslation("courseDetail");
    const isDocument = lesson.contentType === "DOCUMENT";
    const isVideo = lesson.contentType === "VIDEO";
    const ref = useRef<HTMLButtonElement>(null);

    const typeLabel = t(`contentType.${lesson.contentType}`, {
        defaultValue: isDocument ? "Tài liệu" : isVideo ? "Video" : "",
    });

    // Cuộn bài đang học vào tầm nhìn trong vùng cuộn của mục lục
    useEffect(() => {
        if (!active) return;
        const frame = requestAnimationFrame(() => {
            const el = ref.current;
            const box = el?.closest<HTMLElement>("[data-toc-scroll]");
            if (!el || !box) return;
            const b = box.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            if (r.top < b.top)
                box.scrollBy({ top: r.top - b.top - 8, behavior: "smooth" });
            else if (r.bottom > b.bottom)
                box.scrollBy({
                    top: r.bottom - b.bottom + 8,
                    behavior: "smooth",
                });
        });
        return () => cancelAnimationFrame(frame);
    }, [active]);

    if (active) {
        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                className="w-full rounded-xl border border-primary/30 bg-surface p-3 text-left shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={isDocument ? faFileLines : faCirclePlay}
                        className="text-primary"
                    />
                    <span className="rounded bg-primary px-1.5 py-0.5 font-label text-[10px] font-bold text-on-primary">
                        {t("status.current")}
                    </span>
                    {isVideo && lesson.lastPosition > 0 && (
                        <span className="font-label text-xs text-fg-muted">
                            {formatTime(lesson.lastPosition)}
                        </span>
                    )}
                </div>
                <p className="mt-2 text-sm font-semibold text-primary">
                    {lesson.title}
                </p>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-start gap-2.5 rounded-xl p-3 text-left transition hover:bg-surface"
        >
            <span className="mt-0.5 w-4 text-center">
                {completed ? (
                    <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="text-tertiary"
                    />
                ) : isDocument ? (
                    <FontAwesomeIcon
                        icon={faFileLines}
                        className="text-primary"
                    />
                ) : (
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-fg-subtle" />
                )}
            </span>
            <span className="min-w-0">
                <span className="block text-sm text-fg">{lesson.title}</span>
                <span
                    className={`mt-0.5 block font-label text-xs ${
                        isDocument ? "text-primary" : "text-fg-subtle"
                    }`}
                >
                    {completed
                        ? `${typeLabel} • ${t("status.completed")}`
                        : typeLabel}
                </span>
            </span>
        </button>
    );
}

export default function CurriculumPanel({
    chapters,
    currentLessonId,
    completedIds,
    completedCount,
    totalLessons,
    defaultOpenChapterId,
    onSelectLesson,
}: Props) {
    const { t } = useTranslation("courseDetail");
    const [openId, setOpenId] = useState<number | undefined>(
        defaultOpenChapterId,
    );
    const percent = totalLessons
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    useEffect(() => {
        setOpenId(defaultOpenChapterId);
    }, [currentLessonId, defaultOpenChapterId]);

    return (
        <div className="rounded-2xl border border-border bg-surface-muted p-4">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-fg">
                    <FontAwesomeIcon
                        icon={faBookOpen}
                        className="text-primary"
                    />
                    {t("toc")}
                </h2>
                <span className="rounded-full bg-surface px-2.5 py-0.5 font-label text-xs text-fg-muted">
                    {t("lessonsCount", { count: totalLessons })}
                </span>
            </div>

            <div className="space-y-2">
                {chapters.map((chapter) => {
                    // Gộp bài đã hoàn thành từ server và bài vừa bấm "đã hiểu" ở FE
                    const done = chapter.lessons.filter(
                        (l) => l.completed || completedIds.has(l.id),
                    ).length;
                    const total = chapter.totalLessons;
                    const allDone = total > 0 && done >= total;
                    const open = openId === chapter.id;

                    return (
                        <div
                            key={chapter.id}
                            className={`rounded-xl ${open ? "bg-primary-soft" : ""}`}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenId(open ? undefined : chapter.id)
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-fg"
                            >
                                {allDone ? (
                                    <FontAwesomeIcon
                                        icon={faCircleCheck}
                                        className="text-tertiary"
                                        aria-hidden
                                    />
                                ) : (
                                    <ProgressRing
                                        done={done}
                                        total={total}
                                        label={t("chapterProgress", {
                                            done,
                                            total,
                                        })}
                                    />
                                )}
                                <span className="flex-1 truncate">
                                    {chapter.title}
                                </span>
                                <span className="font-label text-xs text-fg-muted">
                                    {t("chapterProgress", { done, total })}
                                </span>
                                <FontAwesomeIcon
                                    icon={open ? faChevronUp : faChevronDown}
                                    className="text-xs text-fg-muted"
                                />
                            </button>

                            {open && (
                                <div className="space-y-1 px-1 pb-2">
                                    {chapter.lessons.map((lesson) => (
                                        <LessonRow
                                            key={lesson.id}
                                            lesson={lesson}
                                            active={
                                                lesson.id === currentLessonId
                                            }
                                            completed={
                                                lesson.completed ||
                                                completedIds.has(lesson.id)
                                            }
                                            onClick={() =>
                                                onSelectLesson(lesson.id)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                <span className="font-label text-xs font-semibold text-fg">
                    {percent}%
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-soft">
                    <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className="font-label text-xs text-fg-muted">
                    {completedCount}/{totalLessons}
                </span>
            </div>
        </div>
    );
}