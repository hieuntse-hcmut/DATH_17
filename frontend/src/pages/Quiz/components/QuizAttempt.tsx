import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faCircleCheck,
  faPaperPlane,
  faTableCells,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  useQuizzes,
  useSaveAnswers,
  useStartAttempt,
  useSubmitAttempt,
  useGetQuizByIndex,
} from "../services/quiz.query";
import {
  useCreateQuestion,
  useCreateQuiz,
  usePublishQuestion,
} from "../services/quiz.mutation";
import { isAnswered } from "../services/quiz.type";
import type {
  AnswerMap,
  AnswerValue,
  AttemptResult,
  AttemptStart,
  QuestionStatus,
  QuizQuestionItem,
} from "../services/quiz.type";
import QuestionCard from "./QuestionCard";
import QuestionPalette from "./QuestionPalette";
import QuizTimer from "./QuizTimer";
import SubmitDialog from "./SubmitDialog";
import { useMe } from "~/services/me.query";

const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* ---------------------------------------------------------- tạo câu hỏi nháp */

const makeDraftItem = (
  courseId: number,
  draftId: number,
): QuizQuestionItem => ({
  orderIndex: 0,
  points: 1,
  question: {
    id: draftId,
    courseId,
    content: "Đây là câu hỏi mẫu",
    type: "SINGLE_CHOICE",
    options: [0, 1, 2, 3].map((i) => ({
      id: -(i + 1),
      content: `Đây là đáp án ${i}`,
      correct: false,
      orderIndex: i,
    })),
  },
});

/* ---------------------------------------------------------- fullscreen */

const fsSupported = () =>
  typeof document !== "undefined" &&
  !!document.documentElement.requestFullscreen &&
  document.fullscreenEnabled !== false;

const enterFullscreen = async () => {
  if (!fsSupported() || document.fullscreenElement) return;
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // bị từ chối: lớp phủ trong lúc làm bài sẽ yêu cầu lại
  }
};

const exitFullscreen = () => {
  if (document.fullscreenElement)
    void document.exitFullscreen().catch(() => {});
};

/* ---------------------------------------------------------- trang chính */

export default function QuizAttempt() {
  const { t } = useTranslation("quiz");
  const params = useParams();
  const [searchParams] = useSearchParams();
  const courseId = Number(params.courseId);
  const isNew = params.quizId === "new";
  const quizId = isNew ? 0 : Number(params.quizId);
  const isEditMode = isNew || searchParams.has("edit");
  const backTo = `/courses/${courseId}/quizzes`;

  const { data: me, isLoading: meLoading } = useMe();
  const canEdit = isEditMode && me?.role === "LECTURER";

  const [started, setStarted] = useState(false);
  const { data: quizzes } = useQuizzes(courseId);
  const info = quizzes?.find((q) => q.id === quizId);
  const attempt = useStartAttempt(courseId, quizId, started && !isEditMode);
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizByIndex(
    courseId,
    quizId,
    canEdit && !isNew,
  );

  useEffect(() => {
    if (attempt.isError) exitFullscreen();
  }, [attempt.isError]);

  // 0) Chế độ thêm/sửa: chỉ giảng viên, màn hình bình thường, KHÔNG fullscreen
  if (isEditMode) {
    const editData = useMemo<AttemptStart>(() => {
      return {
        attemptId: -1,
        quiz: quiz ?? {
          quiz: {
            id: 0,
            courseId,
            title: t("edit.createTitle", "Bài kiểm tra mới"),
            status: "DRAFT",
            startTime: null,
            endTime: null,
            durationMinutes: null,
            maxAttempts: 1,
          },
          questions: [],
        },
      };
    }, [canEdit, isNew, quiz, courseId, t]);

    if (meLoading || isQuizLoading) {
      return <p className="p-10 text-center text-fg-muted">…</p>;
    }
    if (!canEdit) {
      return (
        <div className="p-10 text-center">
          <p className="text-danger">{t("edit.forbidden", "Chặn")}</p>
          <Link to={backTo} className="mt-3 inline-block text-link underline">
            {t("attempt.back")}
          </Link>
        </div>
      );
    }

    return (
      <QuizRunner
        key={`edit-${quizId}`}
        data={editData}
        courseId={courseId}
        quizId={quizId}
        backTo={backTo}
        editMode={isEditMode}
        isNew={isNew}
      />
    );
  }

  // 1) Màn hình giới thiệu: bấm nút là cử chỉ người dùng để bật toàn màn hình
  if (!started) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold text-fg">
          {info?.title ?? t("attempt.windowTitle")}
        </h1>
        {info && (
          <p className="text-sm text-fg-muted">
            {info.durationMinutes != null
              ? t("list.duration", { count: info.durationMinutes })
              : t("intro.noLimit")}
            {" · "}
            {t("list.attempts", { count: info.maxAttempts })}
          </p>
        )}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-label text-sm font-semibold text-fg">
            {t("intro.rules")}
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-fg-muted">
            <li>{t("intro.ruleFullscreen")}</li>
            <li>{t("intro.ruleTimer")}</li>
            <li>{t("intro.ruleLeave")}</li>
            <li>{t("intro.ruleAuto")}</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={async () => {
            await enterFullscreen(); // gọi ngay trong sự kiện click
            setStarted(true);
          }}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover"
        >
          {t("intro.start")}
        </button>
        <Link to={backTo} className="text-center text-sm text-link underline">
          {t("attempt.back")}
        </Link>
      </div>
    );
  }

  // 2) Lỗi (chưa mở, đã đóng, hết lượt...) -> hiện message từ server
  if (attempt.isError) {
    return (
      <div className="p-10 text-center">
        <p className="text-danger">
          {(attempt.error as Error | null)?.message || t("attempt.loadError")}
        </p>
        <Link to={backTo} className="mt-3 inline-block text-link underline">
          {t("attempt.back")}
        </Link>
      </div>
    );
  }

  if (!attempt.data) {
    return <p className="p-10 text-center text-fg-muted">…</p>;
  }

  return (
    <QuizRunner
      key={attempt.data.attemptId}
      data={attempt.data}
      courseId={courseId}
      quizId={quizId}
      backTo={backTo}
    />
  );
}

/* ---------------------------------------------------------- làm bài */

interface RunnerProps {
  data: AttemptStart;
  courseId: number;
  quizId: number;
  backTo: string;
  editMode?: boolean;
  isNew?: boolean;
}

interface SavedState {
  current?: number;
  answers?: AnswerMap;
  flags?: number[];
}

function QuizRunner({
  data,
  courseId,
  quizId,
  backTo,
  editMode = false,
  isNew = false,
}: Readonly<RunnerProps>) {
  const { t } = useTranslation("quiz");
  const storeKey = `quiz-attempt:${data.attemptId}`;

  const draftSeq = useRef(-1);
  const nextDraftId = () => --draftSeq.current;

  const buildItems = (
    data: AttemptStart,
    editMode: boolean,
    courseId: number,
  ): QuizQuestionItem[] => {
    const list = [...data.quiz.questions].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    return editMode && list.length === 0
      ? [makeDraftItem(courseId, nextDraftId())]
      : list;
  };

  const [items, setItems] = useState<QuizQuestionItem[]>(() =>
    buildItems(data, editMode, courseId),
  );

  // Server trả dữ liệu mới (sau khi lưu/xóa + invalidate) thì đồng bộ lại
  useEffect(() => {
    setItems(buildItems(data, editMode, courseId));
  }, [data, editMode, courseId]);

  const total = items.length;

  const handleEdit = useCallback((newItem: QuizQuestionItem, idx: number) => {
    setItems((list) => list.map((it, i) => (i === idx ? newItem : it)));
  }, []);

  // Khôi phục tiến độ: localStorage (tức thì) hoặc đáp án đã lưu trên máy chủ
  const saved = useMemo<SavedState | null>(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      return raw ? (JSON.parse(raw) as SavedState) : null;
    } catch {
      return null;
    }
  }, [storeKey]);

  const serverAnswers = useMemo<AnswerMap>(() => {
    const out: AnswerMap = {};
    for (const [qid, json] of Object.entries(data.savedAnswers ?? {})) {
      try {
        out[Number(qid)] = JSON.parse(json) as AnswerValue;
      } catch {
        /* bỏ qua */
      }
    }
    return out;
  }, [data.savedAnswers]);

  const [current, setCurrent] = useState(() =>
    Math.min(saved?.current ?? 0, Math.max(total - 1, 0)),
  );
  const [answers, setAnswers] = useState<AnswerMap>(
    () => saved?.answers ?? serverAnswers,
  );
  const [flags, setFlags] = useState<Set<number>>(
    () => new Set(saved?.flags ?? []),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expired, setExpired] = useState(false);
  // const [submitError, setSubmitError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [fsOk, setFsOk] = useState(
    () => editMode || !fsSupported() || !!document.fullscreenElement,
  );

  const { mutate: submitMutate, isPending } = useSubmitAttempt(
    courseId,
    quizId,
  );
  const { mutate: saveMutate } = useSaveAnswers(courseId, quizId);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittingRef = useRef(false);

  const statuses: QuestionStatus[] = items.map((it) =>
    flags.has(it.question.id)
      ? "flagged"
      : isAnswered(answers[it.question.id])
        ? "answered"
        : "unanswered",
  );
  const answeredCount = items.filter((it) =>
    isAnswered(answers[it.question.id]),
  ).length;

  const finish = useCallback(
    (reason: "manual" | "expired") => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setConfirmOpen(false);
      // setSubmitError(false);
      setSubmitError(null);
      if (reason === "expired") setExpired(true);
      submitMutate(
        { attemptId: data.attemptId, answers: answersRef.current },
        {
          onSuccess: (res) => {
            try {
              sessionStorage.removeItem(storeKey);
            } catch {
              /* bỏ qua */
            }
            setResult(res);
            exitFullscreen();
          },
          // onError: () => {
          //   submittingRef.current = false;
          //   setSubmitError(true);
          // },
          onError: (err) => {
            console.error("submit failed", err);
            submittingRef.current = false;
            setSubmitError((err as Error)?.message || t("attempt.submitError"));
          },
        },
      );
    },
    [data.attemptId, storeKey, submitMutate],
  );
  const onExpire = useCallback(() => finish("expired"), [finish]);

  // Lưu tạm đáp án để tải lại trang không mất
  useEffect(() => {
    if (result || editMode) return;
    try {
      sessionStorage.setItem(
        storeKey,
        JSON.stringify({ current, answers, flags: [...flags] }),
      );
    } catch {
      /* bỏ qua */
    }
  }, [storeKey, result, current, answers, flags, editMode]);
  // Tự động lưu lên máy chủ sau 1 giây kể từ lần chọn cuối
  useEffect(() => {
    if (result || editMode) return;
    const id = window.setTimeout(() => {
      if (submittingRef.current) return;
      saveMutate({ attemptId: data.attemptId, answers });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [answers, result, data.attemptId, saveMutate, editMode]);
  // Chặn Back/Forward và mọi điều hướng trong ứng dụng cho tới khi nộp bài
  const blocker = useBlocker(!result && !editMode);
  useEffect(() => {
    if (blocker.state === "blocked") blocker.reset();
  }, [blocker]);

  // Cảnh báo khi đóng tab / tải lại
  useEffect(() => {
    if (result || editMode) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [result]);

  // Theo dõi thoát toàn màn hình
  useEffect(() => {
    if (result || editMode || !fsSupported()) return;
    const onChange = () => setFsOk(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [result]);

  const jump = (i: number) => {
    setCurrent(i);
    setSheetOpen(false);
  };

  const navigate = useNavigate();
  const prefill = editMode && !isNew;
  const q = data.quiz.quiz;

  const [title, setTitle] = useState(() => (prefill ? q.title : ""));
  const [startTime, setStartTime] = useState(() =>
    prefill ? toLocalInput(q.startTime) : "",
  );
  const [endTime, setEndTime] = useState(() =>
    prefill ? toLocalInput(q.endTime) : "",
  );
  const [duration, setDuration] = useState<number | "">(() =>
    prefill ? (q.durationMinutes ?? "") : "",
  );
  const [maxAttempts, setMaxAttempts] = useState(() =>
    prefill ? q.maxAttempts : 1,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const { mutate: publishMutate } = usePublishQuestion(courseId, quizId);

  const createQuestion = useCreateQuestion(courseId);
  const createQuiz = useCreateQuiz(courseId);

  const toIso = (v: string) => (v ? new Date(v).toISOString() : null);

  const handleSave = async () => {
    setSaveError(null);

    try {
      // Bước 1: tạo các câu nháp, lấy id thật
      const resolved: QuizQuestionItem[] = [];
      for (const it of items) {
        if (it.question.id > 0) {
          resolved.push(it);
          continue;
        }
        const created = await createQuestion.mutateAsync({
          content: it.question.content.trim(),
          type: it.question.type,
          options: it.question.options.map((o) => ({
            content: o.content.trim(),
            correct: !!o.correct,
          })),
        });
        resolved.push({
          ...it,
          question: { ...it.question, id: created.id },
        });
      }
      // Giữ id thật: nếu bước 2 lỗi, bấm Lưu lại sẽ không tạo trùng câu hỏi
      setItems(resolved);

      // Bước 2: tạo quiz
      await createQuiz.mutateAsync({
        title: title.trim(),
        startTime: toIso(startTime),
        endTime: toIso(endTime),
        durationMinutes: duration === "" ? null : duration,
        maxAttempts,
        questions: resolved.map((it) => ({
          questionId: it.question.id,
          points: it.points,
        })),
      });
      navigate(backTo);
    } catch (e) {
      alert(t("edit.errSaveAlert"));
      setSaveError((e as Error)?.message || t("edit.errSave"));
    }
  };

  const handlePublish = () => {
    publishMutate(undefined, {
      onSuccess: () => {
        navigate(backTo);
        alert(t("edit.publishSuccess"));
      },
    });
  };
  /* ----- Màn hình kết quả ----- */
  if (result) {
    const correctCount = result.answers.filter((a) => a.correct).length;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-6 text-center">
        <FontAwesomeIcon
          icon={faCircleCheck}
          className="text-5xl text-tertiary"
        />
        <h1 className="text-xl font-bold text-fg">{t("result.title")}</h1>
        {expired && <p className="text-sm text-danger">{t("done.expired")}</p>}
        <p className="text-3xl font-bold text-primary">
          {t("result.score", {
            score: result.score,
            total: result.totalPoints,
          })}
        </p>
        <p className="text-fg-muted">
          {t("result.correctCount", {
            correct: correctCount,
            total,
          })}
        </p>

        <div className="w-full rounded-2xl border border-border bg-surface p-5 text-left">
          <h2 className="mb-3 font-label text-sm font-semibold text-fg">
            {t("result.detail")}
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {items.map((it, i) => {
              const r = result.answers.find(
                (a) => a.questionId === it.question.id,
              );
              const ok = r?.correct === true;
              const cls = ok
                ? "border-tertiary/30 bg-tertiary-soft text-tertiary"
                : "border-danger/30 bg-danger/10 text-danger";
              const label = ok ? t("result.correct") : t("result.wrong");
              return (
                <div
                  key={it.question.id}
                  title={label}
                  aria-label={`${i + 1}: ${label}`}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg border font-label text-sm font-semibold ${cls}`}
                >
                  {i + 1}
                  <FontAwesomeIcon
                    icon={ok ? faCheck : faXmark}
                    className="text-[10px]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <Link
          to={backTo}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
        >
          {t("done.back")}
        </Link>
      </div>
    );
  }

  const item = items[current];
  if (!item) return null;
  const qid = item.question.id;
  const isLast = current === total - 1;

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;

    setItems((list) =>
      list
        .filter((_, i) => i !== idx)
        .map((it, i) => ({ ...it, orderIndex: i })),
    );

    setCurrent((c) => {
      if (idx < c) return c - 1;
      return Math.min(c, items.length - 2);
    });
  };

  return (
    <div className="min-h-screen bg-page pb-28 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-fg sm:text-base">
              {data.quiz.quiz.title}
            </h1>
            <p className="hidden text-xs text-fg-muted sm:block">
              {t("attempt.windowTitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              isNew ? (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-lg cursor-pointer bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:bg-primary-hover sm:px-4"
                >
                  {t("edit.done")}
                </button>
              ) : data.quiz.quiz.status === "DRAFT" ? (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 rounded-lg cursor-pointer bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:bg-primary-hover sm:px-4"
                >
                  {t("edit.publish")}
                </button>
              ) : (
                <button
                  onClick={() => navigate(backTo)}
                  className="flex items-center gap-2 rounded-lg cursor-pointer bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:bg-primary-hover sm:px-4"
                >
                  Quay lại
                </button>
              )
            ) : (
              <>
                {data.remainingSeconds != null && (
                  <QuizTimer
                    totalSeconds={data.remainingSeconds}
                    onExpire={onExpire}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:bg-primary-hover sm:px-4"
                >
                  <span className="hidden sm:inline">
                    {t("attempt.submit")}
                  </span>
                  <span className="sm:hidden">
                    {t("attempt.submit").split(" ")[0]}
                  </span>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <div>
          {editMode && (
            <section className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-fg sm:col-span-2">
                {t("edit.title")}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-lg border border-border bg-page px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm text-fg">
                {t("edit.startTime", "Bắt đầu")}
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-lg border border-border bg-page px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm text-fg">
                {t("edit.endTime", "Kết thúc")}
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-lg border border-border bg-page px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm text-fg">
                {t("edit.duration", "Thời lượng (phút)")}
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="rounded-lg border border-border bg-page px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm text-fg">
                {t("edit.maxAttempts", "Số lượt làm")}
                <input
                  type="number"
                  min={1}
                  value={maxAttempts}
                  onChange={(e) =>
                    setMaxAttempts(Math.max(1, Number(e.target.value)))
                  }
                  className="rounded-lg border border-border bg-page px-3 py-2"
                />
              </label>
            </section>
          )}
          {item && (
            <QuestionCard
              item={item}
              index={current}
              total={total}
              flagged={flags.has(qid)}
              value={answers[qid]}
              onChange={(v) => setAnswers((a) => ({ ...a, [qid]: v }))}
              onToggleFlag={() =>
                setFlags((f) => {
                  const n = new Set(f);
                  if (n.has(qid)) n.delete(qid);
                  else n.add(qid);
                  return n;
                })
              }
              onEdit={handleEdit}
              editMode={editMode}
              onRemoveQuestion={removeItem}
            />
          )}

          {/* Điều hướng: dính đáy trên mobile */}
          <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3 lg:static lg:mt-5 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
              className="flex items-center gap-2 rounded-lg bg-surface-muted px-4 py-2.5 text-sm font-medium text-fg disabled:opacity-40 lg:border lg:border-border"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {t("attempt.prev")}
            </button>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label={t("palette.mobileTitle", { total })}
              className="flex size-10 items-center justify-center rounded-lg bg-surface-muted text-fg-muted lg:hidden"
            >
              <FontAwesomeIcon icon={faTableCells} />
            </button>
            <span className="hidden font-label text-xs text-link lg:inline">
              {t("attempt.showAll", { total })}
            </span>

            {isLast ? (
              editMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setItems((list) => [
                      ...list,
                      makeDraftItem(courseId, nextDraftId()),
                    ]);
                    setCurrent(items.length);
                  }}
                  className="cursor-pointer flex items-center gap-2 rounded-lg bg-tertiary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Thêm câu hỏi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="cursor-pointer flex items-center gap-2 rounded-lg bg-tertiary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  {t("attempt.submit")}
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
              >
                {t("attempt.next")}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            )}
          </nav>
        </div>

        {/* Bảng câu hỏi - desktop */}
        <aside className="hidden self-start rounded-2xl border border-border bg-surface shadow-sm lg:sticky lg:top-24 lg:block">
          <QuestionPalette
            statuses={statuses}
            answeredCount={answeredCount}
            flaggedCount={flags.size}
            currentIndex={current}
            onJump={jump}
          />
        </aside>
      </main>

      {/* Bottom sheet - mobile */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label={t("palette.close")}
            className="absolute inset-0 bg-fg/40"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface shadow-2xl">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
            <QuestionPalette
              statuses={statuses}
              answeredCount={answeredCount}
              flaggedCount={flags.size}
              currentIndex={current}
              onJump={jump}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </div>
      )}

      {confirmOpen && (
        <SubmitDialog
          answered={answeredCount}
          total={total}
          flagged={flags.size}
          pending={isPending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => finish("manual")}
        />
      )}

      {/* Nộp thất bại: cho thử lại */}
      {submitError && (
        <div
          role="alert"
          className="fixed inset-x-4 top-16 z-65 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-danger px-4 py-3 text-sm text-on-primary shadow-lg"
        >
          <span>{submitError}</span>{" "}
          <button
            type="button"
            onClick={() => finish(expired ? "expired" : "manual")}
            className="rounded-lg bg-white/20 px-3 py-1 font-semibold hover:bg-white/30"
          >
            {t("attempt.retry")}
          </button>
        </div>
      )}

      {isPending && (
        <div className="fixed inset-0 z-70 grid place-items-center bg-fg/40">
          <p className="rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-fg">
            {t("attempt.submitting")}
          </p>
        </div>
      )}

      {/* Thoát toàn màn hình: che kín nội dung (đồng hồ vẫn chạy phía sau) */}
      {!fsOk && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center gap-3 bg-page p-6 text-center">
          <h2 className="text-xl font-bold text-fg">{t("fullscreen.title")}</h2>
          <p className="max-w-sm text-sm text-fg-muted">
            {t("fullscreen.body")}
          </p>
          <button
            type="button"
            onClick={() => void enterFullscreen()}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
          >
            {t("fullscreen.back")}
          </button>
        </div>
      )}
    </div>
  );
}
