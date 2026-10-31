import { useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChevronLeft,
  faClipboardQuestion,
  faClock,
  faClockRotateLeft,
  faPlay,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useMyAttempts, useQuizzes } from "./services/quiz.query";
import type { Quiz } from "./services/quiz.type";
import { useMe } from "~/services/me.query";

function window_(q: Quiz) {
  const now = Date.now();
  if (q.status !== "PUBLISHED") return "unavailable" as const;
  if (q.startTime && now < new Date(q.startTime).getTime())
    return "notOpen" as const;
  if (q.endTime && now > new Date(q.endTime).getTime())
    return "closed" as const;
  return "open" as const;
}

export default function QuizList() {
  const { t, i18n } = useTranslation("quiz");
  const courseId = Number(useParams().courseId);
  const { data, isLoading, isError } = useQuizzes(courseId);
  const { data: attempts } = useMyAttempts(courseId);
  const [openHistory, setOpenHistory] = useState<number | null>(null);
  const {data: me} = useMe();

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={`/courses/${courseId}/lessons`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-link"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        {t("list.backToCourse")}
      </Link>
      <h1 className="text-2xl font-bold text-fg">{t("list.title")}</h1>
      <p className="mt-1 text-fg-muted">{t("list.subtitle")}</p>

      {isLoading && <p className="mt-8 text-fg-muted">…</p>}
      {isError && <p className="mt-8 text-danger">{t("list.loadError")}</p>}
      {data && data.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-fg-muted">
          <FontAwesomeIcon icon={faClipboardQuestion} className="text-3xl" />
          {t("list.empty")}
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {data?.map((q) => {
          const state = window_(q);
          const mine = (attempts ?? []).filter((a) => a.quizId === q.id);
          const used = mine.length;
          const inProgress = mine.some((a) => a.status === "IN_PROGRESS");
          const outOfAttempts = !inProgress && used >= q.maxAttempts;
          const historyOpen = openHistory === q.id;

          return (
            <li
              key={q.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold text-fg">
                      {q.title}
                    </h2>
                    <span className="shrink-0 rounded-md bg-primary-soft px-2 py-0.5 font-label text-xs font-medium text-primary">
                      {t(`list.status.${q.status}`, { defaultValue: q.status })}
                    </span>
                  </div>
                  <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
                    {q.durationMinutes != null && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} />
                        {t("list.duration", { count: q.durationMinutes })}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faRotateRight} />
                      {t("list.attempts", { count: q.maxAttempts })}
                    </div>
                    {(q.startTime || q.endTime) && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCalendarDays} />
                        {q.startTime && (
                          <span>
                            {t("list.opensAt")} {fmt(q.startTime)}
                          </span>
                        )}
                        {q.startTime && q.endTime && <span>–</span>}
                        {q.endTime && (
                          <span>
                            {t("list.closesAt")} {fmt(q.endTime)}
                          </span>
                        )}
                      </div>
                    )}
                  </dl>
                </div>
                {me?.role === "LECTURER" ? (
                  <Link
                    to={`/courses/${courseId}/quizzes/${q.id}?edit`}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    {t("list.edit")}
                  </Link>
                ) : (state !== "open" ? (
                      <span className="shrink-0 rounded-lg bg-surface-muted px-5 py-2.5 text-center text-sm text-fg-subtle">
                        {state === "closed" ? t("list.closed") : t("list.notOpen")}
                      </span>
                    ) : outOfAttempts ? (
                      <span className="shrink-0 rounded-lg bg-surface-muted px-5 py-2.5 text-center text-sm text-fg-subtle">
                        {t("list.noAttemptsLeft")}
                      </span>
                    ) : (
                      <Link
                        to={`/courses/${courseId}/quizzes/${q.id}`}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        {inProgress ? t("list.continue") : t("list.start")}
                      </Link>
                    )
                )}
              </div>

              {used > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-fg-muted">
                      {t("list.attemptsUsed", { used, max: q.maxAttempts })}
                    </span>
                    <button
                      type="button"
                      aria-expanded={historyOpen}
                      onClick={() => setOpenHistory(historyOpen ? null : q.id)}
                      className="cursor-pointer flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-1.5 text-sm font-medium text-fg hover:brightness-95"
                    >
                      <FontAwesomeIcon icon={faClockRotateLeft} />
                      {historyOpen ? t("list.hideHistory") : t("list.history")}
                    </button>
                  </div>

                  {historyOpen && (
                    <ul className="mt-3 divide-y divide-border rounded-xl border border-border text-sm">
                      {[...mine].reverse().map((a) => (
                        <li
                          key={a.attemptId}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5"
                        >
                          <span className="font-medium text-fg">
                            {t("history.attempt", { n: a.attemptNumber })}
                          </span>
                          <span className="text-fg-muted">
                            {fmt(a.submitTime ?? a.startTime)}
                          </span>
                          <span className="font-label font-semibold text-fg">
                            {a.status === "IN_PROGRESS"
                              ? "—"
                              : t("history.score", {
                                  score: a.score ?? 0,
                                  total: a.totalPoints,
                                })}
                          </span>
                          <span className="rounded-md bg-primary-soft px-2 py-0.5 font-label text-xs text-primary">
                            {t(`history.status.${a.status}`, {
                              defaultValue: a.status,
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {
        me?.role === "LECTURER" && (
          <Link to={`/courses/${courseId}/quizzes/new`} className="flex justify-center w-full cursor-pointer rounded-xl border border-dashed border-border px-3 py-2 text-sm text-link hover:bg-surface">
            {t("edit.addNewQuiz")}
          </Link>
        )
      }
    </div>
  );
}
