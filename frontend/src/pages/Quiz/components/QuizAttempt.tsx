import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBlocker, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faCircleCheck,
  faMinus,
  faPaperPlane,
  faTableCells,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  useQuizzes,
  useSaveAnswers,
  useStartAttempt,
  useSubmitAttempt,
} from "../services/quiz.query";
import { isAnswered } from "../services/quiz.type";
import type {
  AnswerMap,
  AnswerValue,
  AttemptResult,
  AttemptStart,
  QuestionStatus,
} from "../services/quiz.type";
import QuestionCard from "./QuestionCard";
import QuestionPalette from "./QuestionPalette";
import QuizTimer from "./QuizTimer";
import SubmitDialog from "./SubmitDialog";

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
  const courseId = Number(params.courseId);
  const quizId = Number(params.quizId);
  const backTo = `/courses/${courseId}/quizzes`;

  const [started, setStarted] = useState(false);
  const { data: quizzes } = useQuizzes(courseId);
  const info = quizzes?.find((q) => q.id === quizId);
  const attempt = useStartAttempt(courseId, quizId, started);

  useEffect(() => {
    if (attempt.isError) exitFullscreen();
  }, [attempt.isError]);

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
}

interface SavedState {
  current?: number;
  answers?: AnswerMap;
  flags?: number[];
}

function QuizRunner({ data, courseId, quizId, backTo }: RunnerProps) {
  const { t } = useTranslation("quiz");
  const storeKey = `quiz-attempt:${data.attemptId}`;

  const items = useMemo(
    () => [...data.quiz.questions].sort((a, b) => a.orderIndex - b.orderIndex),
    [data],
  );
  const total = items.length;

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
    () => !fsSupported() || !!document.fullscreenElement,
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
    if (result) return;
    try {
      sessionStorage.setItem(
        storeKey,
        JSON.stringify({ current, answers, flags: [...flags] }),
      );
    } catch {
      /* bỏ qua */
    }
  }, [storeKey, result, current, answers, flags]);
  // Tự động lưu lên máy chủ sau 1 giây kể từ lần chọn cuối
  useEffect(() => {
    if (result) return;
    const id = window.setTimeout(() => {
      if (submittingRef.current) return;
      saveMutate({ attemptId: data.attemptId, answers });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [answers, result, data.attemptId, saveMutate]);
  // Chặn Back/Forward và mọi điều hướng trong ứng dụng cho tới khi nộp bài
  const blocker = useBlocker(!result);
  useEffect(() => {
    if (blocker.state === "blocked") blocker.reset();
  }, [blocker]);

  // Cảnh báo khi đóng tab / tải lại
  useEffect(() => {
    if (result) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [result]);

  // Theo dõi thoát toàn màn hình
  useEffect(() => {
    if (result || !fsSupported()) return;
    const onChange = () => setFsOk(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [result]);

  const jump = (i: number) => {
    setCurrent(i);
    setSheetOpen(false);
  };

  /* ----- Màn hình kết quả ----- */
  if (result) {
    const graded = result.answers.filter((a) => a.correct !== null);
    const correctCount = graded.filter((a) => a.correct).length;
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
            graded: graded.length,
          })}
        </p>
        {result.pendingCount > 0 && (
          <p className="text-sm text-fg-muted">
            {t("result.pending", { count: result.pendingCount })}
          </p>
        )}

        <div className="w-full rounded-2xl border border-border bg-surface p-5 text-left">
          <h2 className="mb-3 font-label text-sm font-semibold text-fg">
            {t("result.detail")}
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {items.map((it, i) => {
              const r = result.answers.find(
                (a) => a.questionId === it.question.id,
              );
              const state =
                r?.correct === true
                  ? "ok"
                  : r?.correct === false
                    ? "bad"
                    : "wait";
              const cls =
                state === "ok"
                  ? "border-tertiary/30 bg-tertiary-soft text-tertiary"
                  : state === "bad"
                    ? "border-danger/30 bg-danger/10 text-danger"
                    : "border-transparent bg-surface-muted text-fg-muted";
              const label =
                state === "ok"
                  ? t("result.correct")
                  : state === "bad"
                    ? t("result.wrong")
                    : t("result.waiting");
              return (
                <div
                  key={it.question.id}
                  title={label}
                  aria-label={`${i + 1}: ${label}`}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg border font-label text-sm font-semibold ${cls}`}
                >
                  {i + 1}
                  <FontAwesomeIcon
                    icon={
                      state === "ok"
                        ? faCheck
                        : state === "bad"
                          ? faXmark
                          : faMinus
                    }
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
              <span className="hidden sm:inline">{t("attempt.submit")}</span>
              <span className="sm:hidden">
                {t("attempt.submit").split(" ")[0]}
              </span>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <div>
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
          />

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
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-tertiary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {t("attempt.submit")}
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
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
          className="fixed inset-x-4 top-16 z-[65] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-danger px-4 py-3 text-sm text-on-primary shadow-lg"
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
        <div className="fixed inset-0 z-[70] grid place-items-center bg-fg/40">
          <p className="rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-fg">
            {t("attempt.submitting")}
          </p>
        </div>
      )}

      {/* Thoát toàn màn hình: che kín nội dung (đồng hồ vẫn chạy phía sau) */}
      {!fsOk && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-page p-6 text-center">
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
