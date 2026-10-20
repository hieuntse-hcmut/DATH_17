import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import CurriculumPanel from "./components/CurriculumPanel";
import LessonActions from "./components/LessonActions";
import LessonTabs from "./components/LessonTabs";
import VideoPlayer from "./components/VideoPlayer";
import { useCourseDetailQuery } from "./services/courseDetail.query";

export default function CourseDetailPage() {
    const { t } = useTranslation("courseDetail");
    const navigate = useNavigate();
    const { courseId = "python-basic", lessonId } = useParams();
    const { data: course, isLoading } = useCourseDetailQuery(courseId);

    const [tocOpen, setTocOpen] = useState(false); // bottom sheet (mobile)
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

    // Danh sách bài học phẳng (bỏ chương khóa) để điều hướng prev/next
    const flat = useMemo(
        () =>
            course?.chapters
                .filter((c) => !c.locked)
                .flatMap((c) => c.lessons.map((l) => ({ ...l, chapter: c }))) ??
            [],
        [course],
    );
    const asideRef = useRef<HTMLElement>(null);
    const [asideTop, setAsideTop] = useState(16);

    // Đo vị trí ban đầu của mục lục để nó đứng yên đúng chỗ khi cuộn
    useLayoutEffect(() => {
        const measure = () => {
            const el = asideRef.current;
            if (!el || el.offsetParent === null) return;
            // vị trí của cột mục lục so với đầu trang (không phụ thuộc đang cuộn tới đâu)
            setAsideTop(
                Math.round(el.getBoundingClientRect().top + window.scrollY),
            );
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [course]);
    if (isLoading || !course) {
        return <div className="p-8 text-center text-fg-muted">...</div>;
    }

    const current =
        flat.find((l) => l.id === lessonId) ??
        flat.find((l) => l.status === "current") ??
        flat[0];

    if (!current) {
        return (
            <div className="p-8 text-center text-fg-muted">{t("notFound")}</div>
        );
    }

    const index = flat.findIndex((l) => l.id === current.id);
    const goTo = (id: string) => {
        navigate(`/courses/${course.id}/lessons/${id}`);
        setTocOpen(false);
    };

    const extraDone = [...completedIds].filter(
        (id) => flat.find((l) => l.id === id)?.status !== "completed",
    ).length;
    const completedCount = course.completedLessons + extraDone;
    const percent = Math.round((completedCount / course.totalLessons) * 100);

    const panel = (
        <CurriculumPanel
            chapters={course.chapters}
            currentLessonId={current.id}
            completedIds={completedIds}
            completedCount={completedCount}
            totalLessons={course.totalLessons}
            defaultOpenChapterId={current.chapter.id}
            onSelectLesson={goTo}
        />
    );

    return (
        <div className="mx-auto w-full max-w-[1280px] px-0 pb-28 sm:px-4 lg:pb-8">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-0">
                <Link
                    to="/my-courses"
                    className="flex items-center gap-1.5 font-medium text-link"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    {course.title}
                </Link>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="text-fg-muted">
                    {current.chapter.title.split(":")[0]}
                </span>
                <span className="truncate font-semibold text-fg">
                    {current.title}
                </span>
            </nav>

            {/* Thanh tiến độ (mobile) */}
            <div className="flex items-center gap-3 px-4 pb-3 font-label text-xs text-fg-muted sm:px-0 lg:hidden">
                <span className="truncate text-primary">{course.title}</span>
                <span className="whitespace-nowrap">
                    {t("completion", { percent })}
                </span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-primary-soft">
                    <div
                        className="h-full bg-primary"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Cột chính */}
                <section className="overflow-hidden border-border bg-surface lg:rounded-2xl lg:border lg:shadow-sm">
                    <VideoPlayer
                        videoUrl={current.videoUrl}
                        title={current.title}
                        onOpenToc={() => setTocOpen(true)}
                    />

                    <div className="space-y-5 p-4 sm:p-6">
                        <h1 className="text-xl font-bold leading-snug text-fg sm:text-3xl">
                            {current.title}
                        </h1>

                        <LessonTabs key={current.id} lesson={current} />

                        {/* Action bar: cố định đáy ở mobile, nằm cuối card ở desktop */}
                        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
                            <LessonActions
                                hasPrev={index > 0}
                                hasNext={index < flat.length - 1}
                                understood={
                                    completedIds.has(current.id) ||
                                    current.status === "completed"
                                }
                                onPrev={() => goTo(flat[index - 1].id)}
                                onNext={() => goTo(flat[index + 1].id)}
                                onUnderstood={() =>
                                    setCompletedIds((prev) =>
                                        new Set(prev).add(current.id),
                                    )
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* Mục lục: desktop */}
                {/* Mục lục: desktop, cố định theo màn hình */}
                <aside ref={asideRef} className="hidden lg:block">
                    <div
                        className="fixed w-[340px] overflow-y-auto"
                        style={{
                            top: asideTop,
                            maxHeight: `calc(100vh - ${asideTop}px - 1rem)`,
                        }}
                    >
                        {panel}
                    </div>
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

            {/* Mục lục: bottom sheet mobile */}
            {tocOpen && (
                <div className="fixed inset-0 z-30 lg:hidden">
                    <button
                        type="button"
                        aria-label={t("close")}
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setTocOpen(false)}
                    />
                    <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface p-3">
                        {panel}
                    </div>
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
