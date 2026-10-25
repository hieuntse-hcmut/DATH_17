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
import {
  useGetMaterials,
  usePostCompleteLesson,
} from "./services/courseDetail.query"; // chỉnh lại đường dẫn cho đúng
import type { IMaterial } from "./services/courseDetail.type";
import { getSentPosition, saveProgress } from "./services/progress.api";
import { isVideoMaterial } from "./services/material.util";
export default function CourseDetailPage() {
  const { t } = useTranslation("courseDetail");
  const navigate = useNavigate();
  const params = useParams();

  const courseId = params.courseId ? Number(params.courseId) : undefined;
  const lessonId = params.lessonId ? Number(params.lessonId) : undefined;
  const { data, isLoading } = useCourseTocWithProgress(courseId);

  const [tocOpen, setTocOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const { mutate: completeLesson, isPending } = usePostCompleteLesson();

  const chapters = data?.chapters;
  const progressSummary = data?.progressSummary;

  // Danh sách bài học phẳng để điều hướng prev/next
  const flat = useMemo(
    () =>
      chapters?.flatMap((c) => c.lessons.map((l) => ({ ...l, chapter: c }))) ??
      [],
    [chapters],
  );

  // Bài hiện tại: theo URL -> bài học dở (resume) -> bài chưa hoàn thành đầu tiên -> bài đầu
  const current =
    flat.find((l) => l.id === lessonId) ??
    flat.find((l) => l.id === progressSummary?.resumeLessonId) ??
    flat.find((l) => !l.completed) ??
    flat[0];

  const { data: materials, isLoading: materialsLoading } = useGetMaterials(
    courseId,
    current?.chapterId,
    current?.id,
  );

  const { canUnderstoodClick, videoUrl, videoTitle } = useMemo(() => {
    const video = materials?.find(isVideoMaterial);
    // Bài video (theo contentType hoặc có file video) phải xem đủ mới được hoàn thành
    const isVideoLesson = current?.contentType === "VIDEO" || !!video;
    return {
      canUnderstoodClick: !isVideoLesson,
      videoUrl: video?.fileUrl,
      videoTitle: video?.title,
    };
  }, [materials, current?.contentType]);

  // Mục lục desktop: đứng yên theo màn hình
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

  if (isLoading || !data || !progressSummary) {
    return <div className="p-8 text-center text-fg-muted">...</div>;
  }

  if (!current) {
    return <div className="p-8 text-center text-fg-muted">{t("notFound")}</div>;
  }

  const index = flat.findIndex((l) => l.id === current.id);

  const goTo = (id: number) => {
    navigate(`/courses/${progressSummary.courseId}/lessons/${id}`);
    setTocOpen(false);
  };

  // Bài vừa bấm "đã hiểu" ở FE nhưng server chưa ghi nhận
  const extraDone = [...completedIds].filter(
    (id) => !flat.find((l) => l.id === id)?.completed,
  ).length;
  const completedCount = progressSummary.completedLessons + extraDone;

  const panel = (
    <CurriculumPanel
      chapters={chapters!}
      currentLessonId={current.id}
      completedIds={completedIds}
      completedCount={completedCount}
      totalLessons={progressSummary.totalLessons}
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
          {progressSummary.courseTitle}
        </Link>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <span className="text-fg-muted">
          {current.chapter.title.split(":")[0]}
        </span>
        <span className="truncate font-semibold text-fg">{current.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Cột chính */}
        <section className="overflow-hidden border-border bg-surface lg:rounded-2xl lg:border lg:shadow-sm">
          <VideoPlayer
            key={current.id}
            videoUrl={videoUrl}
            title={videoTitle ?? current.title}
            startAt={Math.max(
              current.lastPosition,
              getSentPosition(current.id),
            )}
            onOpenToc={() => setTocOpen(true)}
            onProgress={(p) => {
              const lessonId = current.id;
              saveProgress(lessonId, p.furthest, p.duration)
                .then((res) => {
                  if (res?.completed) {
                    setCompletedIds((prev) =>
                      prev.has(lessonId) ? prev : new Set(prev).add(lessonId),
                    );
                  }
                })
                .catch(() => {
                  // lỗi mạng: bỏ qua, 5 giây sau sẽ gửi lại
                });
            }}
          />

          <div className="space-y-5 p-4 sm:p-6">
            <h1 className="text-xl font-bold leading-snug text-fg sm:text-3xl">
              {current.title}
            </h1>

            <MaterialsTab
              key={current.id}
              materials={materials}
              loading={materialsLoading}
            />

            {/* Action bar: cố định đáy ở mobile, nằm cuối card ở desktop */}
            <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-surface/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
              <LessonActions
                hasPrev={index > 0}
                hasNext={index < flat.length - 1}
                understood={canUnderstoodClick}
                onPrev={() => goTo(flat[index - 1].id)}
                onNext={() => goTo(flat[index + 1].id)}
                onUnderstood={() => {
                  completeLesson(current.id);

                  return setCompletedIds((prev) =>
                    new Set(prev).add(current.id),
                  );
                }}
              />
            </div>
          </div>
        </section>

        {/* Mục lục: desktop, cố định theo màn hình */}
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

      {/* Mục lục: bottom sheet mobile */}
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
