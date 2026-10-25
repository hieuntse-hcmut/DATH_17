import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import CurriculumPanel from "./components/CurriculumPanel";
import LessonActions from "./components/LessonActions";
import MaterialsTab from "./components/MaterialsTab";
import VideoPlayer from "./components/VideoPlayer";
import { useCourseTocWithProgress } from "./services/useCourseProgress";
import { useGetCourse, useGetMaterials } from "./services/courseDetail.query";
import { usePostCompleteLesson } from "./services/courseDetail.mutation";
import type { IMaterial } from "./services/courseDetail.type";
import { useMe } from "~/services/me.query";

export default function CourseDetailPage() {
    const { t } = useTranslation("courseDetail");
    const navigate = useNavigate();
    const params = useParams();
    const { data: me, isLoading: isMeLoading } = useMe();

    const courseId = params.courseId ? Number(params.courseId) : undefined;
    const lessonId = params.lessonId ? Number(params.lessonId) : undefined;

    const isStudent = me?.role === "STUDENT";
    const { data, isLoading } = useCourseTocWithProgress(courseId, isStudent);
    const { data: course} = useGetCourse(courseId, isStudent)
    // --- State (phải khai báo trước mọi early return) ---
    const [tocOpen, setTocOpen] = useState(false);
    const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
    const { mutate: completeLesson } = usePostCompleteLesson();

    const chapters = data?.chapters;
    const progressSummary = data?.progressSummary; // undefined với non-student

    // Danh sách bài học phẳng; chuẩn hóa `completed` để không lỗi kiểu
    const flat = useMemo(
        () =>
            chapters?.flatMap((c) =>
                c.lessons.map((l) => ({
                    ...l,
                    completed: "completed" in l ? Boolean(l.completed) : false,
                    chapter: c,
                })),
            ) ?? [],
        [chapters],
    );

    const current =
        flat.find((l) => l.id === lessonId) ??
        flat.find((l) => l.id === progressSummary?.resumeLessonId) ??
        flat.find((l) => !l.completed) ??
        flat[0];

    const { data: materials } = useGetMaterials(
        courseId,
        current?.chapterId,
        current?.id,
    );

    const { canUnderstoodClick, videoUrl, videoTitle } = useMemo(() => {
        const video = materials?.find((m: IMaterial) =>
            m.fileType?.toLowerCase().includes("video"),
        );
        return {
            canUnderstoodClick: !video,
            videoUrl: video?.fileUrl,
            videoTitle: video?.title,
        };
    }, [materials]);

    const asideRef = useRef<HTMLElement>(null);
    const [asideTop, setAsideTop] = useState(16);

    useLayoutEffect(() => {
        const measure = () => {
            const el = asideRef.current;
            if (!el || el.offsetParent === null) return;
            setAsideTop(Math.round(el.getBoundingClientRect().top + window.scrollY));
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [data]);

    // --- Early returns (sau tất cả hooks) ---
    if (isMeLoading || isLoading || !data || !chapters) {
        return <div className="p-8 text-center text-fg-muted">...</div>;
    }

    if (!current) {
        return <div className="p-8 text-center text-fg-muted">{t("notFound")}</div>;
    }

    const index = flat.findIndex((l) => l.id === current.id);

    const goTo = (id: number) => {
        navigate(`/courses/${courseId}/lessons/${id}`);
        setTocOpen(false);
    };

    // Bài vừa bấm "đã hiểu" ở FE nhưng server chưa ghi nhận
    const extraDone = [...completedIds].filter(
        (id) => !flat.find((l) => l.id === id)?.completed,
    ).length;
    const completedCount = (progressSummary?.completedLessons ?? 0) + extraDone;
    const totalLessons = progressSummary?.totalLessons ?? flat.length;

    const panel = (
        <CurriculumPanel
            chapters={chapters}
            currentLessonId={current.id}
            completedIds={completedIds}
            completedCount={completedCount}
            totalLessons={totalLessons}
            defaultOpenChapterId={current.chapter.id}
            onSelectLesson={goTo}
            isStudent={isStudent}
            courseId={courseId}
            courseTitle={course?.title}
        />
    );

    const handleUnderstood = () => {
        completeLesson(current.id);
        setCompletedIds((prev) => new Set(prev).add(current.id));
    };

    return (
        <div className="mx-auto w-full max-w-[1280px] px-0 pb-28 sm:px-4 lg:pb-8">
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-0">
                <Link
                    to="/my-courses"
                    className="flex items-center gap-1.5 font-medium text-link"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    {progressSummary?.courseTitle || course?.title}
                </Link>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="text-fg-muted">
                    {current.chapter.title.split(":")[0]}
                </span>
                <span className="truncate font-semibold text-fg">{current.title}</span>
            </nav>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <section className="overflow-hidden border-border bg-surface lg:rounded-2xl lg:border lg:shadow-sm">
                    <VideoPlayer
                        videoUrl={videoUrl}
                        title={videoTitle}
                        onOpenToc={() => setTocOpen(true)}
                    />

                    <div className="space-y-5 p-4 sm:p-6">
                        <h1 className="text-xl font-bold leading-snug text-fg sm:text-3xl">
                            {current.title}
                        </h1>

                        <MaterialsTab 
                            key={current.id}
                            courseId={courseId}
                            chapterId={current.chapterId}
                            lessonId={lessonId}
                            lessonTitle={"TODO"}
                            isStudent={true}
                            materials={materials}
                        />

                        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-surface/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
                            <LessonActions
                                hasPrev={index > 0}
                                hasNext={index < flat.length - 1}
                                understood={canUnderstoodClick}
                                onPrev={() => goTo(flat[index - 1].id)}
                                onNext={() => goTo(flat[index + 1].id)}
                                onUnderstood={handleUnderstood}
                            />
                        </div>
                    </div>
                </section>

                <aside ref={asideRef} className="hidden lg:block">
                    <div
                        data-toc-scroll
                        className="fixed w-[340px] overflow-y-auto"
                        style={{
                            top: asideTop,
                            maxHeight: `calc(100vh - ${asideTop}px - 1rem)`,
                        }}
                    >
                        {panel}
                    </div>
                </aside>
            </div>

            {tocOpen && (
                <div className="fixed inset-0 z-30 lg:hidden">
                    <button
                        type="button"
                        aria-label={t("close")}
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setTocOpen(false)}
                    />
                    <div
                        data-toc-scroll
                        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface p-3"
                    >
                        {panel}
                    </div>
                </div>
            )}
        </div>
    );
}

// TODO: add stale time for all