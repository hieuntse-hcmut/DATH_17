import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFlag } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import type { AnswerValue, QuizQuestionItem } from "../services/quiz.type";
import QuestionContent from "./QuestionContent";

interface Props {
  item: QuizQuestionItem;
  index: number;
  total: number;
  value?: AnswerValue;
  flagged: boolean;
  onChange: (value: AnswerValue) => void;
  onToggleFlag: () => void;
}

const letter = (i: number) => String.fromCharCode(65 + i);

export default function QuestionCard({
  item,
  index,
  total,
  value,
  flagged,
  onChange,
  onToggleFlag,
}: Props) {
  const { t } = useTranslation("quiz");
  const options = [...item.question.options].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  const type = item.question.type;
  const multi = type === "MULTIPLE_CHOICE";
  const selectedIds = Array.isArray(value)
    ? value
    : typeof value === "number"
      ? [value]
      : [];

  const pick = (id: number) => {
    if (multi) {
      onChange(
        selectedIds.includes(id)
          ? selectedIds.filter((x) => x !== id)
          : [...selectedIds, id],
      );
    } else {
      onChange(id);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3 font-label text-sm">
          <span className="rounded-md bg-primary-soft px-2.5 py-1 font-semibold text-primary">
            {t("attempt.questionOf", { current: index + 1, total })}
          </span>
          <span className="text-fg-muted">
            {t("attempt.points", { count: item.points })}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleFlag}
          aria-pressed={flagged}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            flagged
              ? "border-danger/40 bg-danger/10 text-danger"
              : "border-border text-fg-muted hover:bg-surface-muted"
          }`}
        >
          <FontAwesomeIcon
            icon={faFlag}
            className={flagged ? "" : "opacity-60"}
          />{" "}
          {flagged ? t("attempt.flagged") : t("attempt.flag")}
        </button>
      </header>

      <QuestionContent content={item.question.content} />

      {type === "SHORT_ANSWER" ? (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("attempt.shortPlaceholder")}
          rows={4}
          className="mt-6 w-full rounded-xl border border-border bg-surface-muted p-4 text-sm text-fg focus-visible:outline-2 focus-visible:outline-primary"
        />
      ) : (
        <>
          {multi && (
            <p className="mt-4 text-xs text-fg-muted">
              {t("attempt.multiHint")}
            </p>
          )}
          <ul className="mt-4 space-y-3" role={multi ? "group" : "radiogroup"}>
            {options.map((opt, i) => {
              const selected = selectedIds.includes(opt.id);
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    role={multi ? "checkbox" : "radio"}
                    aria-checked={selected}
                    onClick={() => pick(opt.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                      selected
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-transparent bg-surface-muted hover:border-border"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center border-2 ${
                        multi ? "rounded-md" : "rounded-full"
                      } ${selected ? "border-primary bg-primary text-on-primary" : "border-fg-subtle"}`}
                    >
                      {selected && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-[10px]"
                        />
                      )}
                    </span>
                    <span className="flex-1 font-mono text-sm">
                      <span className="mr-2 font-semibold">{letter(i)}.</span>
                      {opt.content}
                    </span>
                    {selected && (
                      <span className="rounded bg-primary px-2 py-0.5 font-label text-xs font-medium text-on-primary lg:hidden">
                        {t("attempt.selected")}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
