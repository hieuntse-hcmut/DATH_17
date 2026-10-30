import { useMemo, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFlag, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import type { AnswerValue, QuizQuestionItem } from "../services/quiz.type";

interface Props {
  item: QuizQuestionItem;
  index: number;
  total: number;
  value?: AnswerValue;
  flagged: boolean;
  onChange: (value: AnswerValue) => void;
  onToggleFlag: () => void;
  onEdit?: (item: QuizQuestionItem, idx: number) => void;
  editMode?: boolean;
  onRemoveQuestion?: (idx: number) => void;
}

const letter = (i: number) => String.fromCharCode(65 + i);

type Part =
  | { kind: "text"; value: string }
  | { kind: "code"; lang: string; value: string };

/** Tách nội dung câu hỏi: văn bản thường + khối ```lang ... ``` */
function parse(content: string): Part[] {
  const parts: Part[] = [];
  const re = /```(\w+)?\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    if (m.index > last)
      parts.push({ kind: "text", value: content.slice(last, m.index) });
    parts.push({
      kind: "code",
      lang: m[1] ?? "code",
      value: m[2].replace(/\n$/, ""),
    });
    last = m.index + m[0].length;
  }
  if (last < content.length)
    parts.push({ kind: "text", value: content.slice(last) });
  return parts;
}

/* ------------------------------------------------ sửa tại chỗ bằng icon bút */

interface InlineEditProps {
  value: string;
  onCommit: (v: string) => void;
  onDelete?: () => void | undefined;
  deleteLabel?: string;
  enabled: boolean;
  multiline?: boolean;
  numeric?: boolean;
  label: string;
  children: ReactNode;
}

function InlineEdit({
  value, onCommit, onDelete, deleteLabel,
  enabled, multiline, numeric, label, children,
}: Readonly<InlineEditProps>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!enabled) return <>{children}</>;

  if (!editing) {
    return (
      <span className="inline-flex justify-between items-start gap-2 w-full">
        {children}
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={label}
            title={label}
            onClick={(e) => {
              e.stopPropagation();
              setDraft(value);
              setEditing(true);
            }}
            className="mt-1 shrink-0 cursor-pointer text-xs text-fg-muted hover:text-primary"
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          {onDelete && (
            <button
              type="button"
              aria-label={deleteLabel}
              title={deleteLabel}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="mt-1 shrink-0 cursor-pointer text-xs text-fg-muted hover:text-primary"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </span>
    );
  }

  const commit = () => {
    onCommit(draft);
    setEditing(false);
  };
  const cls =
    "w-full rounded-lg border border-primary bg-page px-3 py-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-primary";
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setEditing(false);
    if (e.key === "Enter" && !multiline) commit();
  };

  return multiline ? (
    <textarea
      rows={5}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={cls}
    />
  ) : (
    <input
      type={numeric ? "number" : "text"}
      min={numeric ? 0 : undefined}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={numeric ? `${cls} w-24` : cls}
    />
  );
}

/* ------------------------------------------------------------- component */

export default function QuestionCard({
  item,
  index,
  total,
  value,
  flagged,
  onChange,
  onToggleFlag,
  onEdit,
  editMode = false,
  onRemoveQuestion
}: Readonly<Props>) {
  const { t } = useTranslation("quiz");
  const options = [...item.question.options].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const parts = useMemo(
    () => parse(item.question.content),
    [item.question.content],
  );

  // Các hàm sửa: luôn tạo object mới rồi báo lên cha
  const emit = (next: QuizQuestionItem) => onEdit?.(next, index);

  const setContent = (content: string) =>
    emit({ ...item, question: { ...item.question, content } });

  const setOptionContent = (id: number, content: string) =>
    emit({
      ...item,
      question: {
        ...item.question,
        options: item.question.options.map((o) =>
          o.id === id ? { ...o, content } : o,
        ),
      },
    });

  const setCorrect = (id: number) =>
    emit({
      ...item,
      question: {
        ...item.question,
        options: item.question.options.map((o) => ({
          ...o,
          correct: o.id === id,
        })),
      },
    });
  
    const MIN_OPTIONS = 2;

  const addOption = () => {
    // id âm, nhỏ hơn mọi id hiện có => không trùng với option cũ hay option nháp khác
    const newId = Math.min(0, ...item.question.options.map((o) => o.id)) - 1;
    const nextOrder =
      Math.max(-1, ...item.question.options.map((o) => o.orderIndex)) + 1;
    emit({
      ...item,
      question: {
        ...item.question,
        options: [
          ...item.question.options,
          { id: newId, content: "", correct: false, orderIndex: nextOrder },
        ],
      },
    });
  };

  const removeOption = (id: number) => {
    if (item.question.options.length <= MIN_OPTIONS) return;
    const removed = item.question.options.find((o) => o.id === id);
    // sắp xếp lại orderIndex cho liền mạch
    let rest = item.question.options
      .filter((o) => o.id !== id)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((o, i) => ({ ...o, orderIndex: i }));
    // xóa đúng đáp án đang đúng => đáp án đầu tiên làm đáp án đúng mới
    if (removed?.correct && !rest.some((o) => o.correct)) {
      rest = rest.map((o, i) => ({ ...o, correct: i === 0 }));
    }
    emit({ ...item, question: { ...item.question, options: rest } });
  };

  

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3 font-label text-sm">
          <span className="rounded-md bg-primary-soft px-2.5 py-1 font-semibold text-primary">
            {t("attempt.questionOf", { current: index + 1, total })}
          </span>
          {!editMode && (
            <span className="text-fg-muted">
              {t("attempt.points", { count: item.points })}
            </span>
          )}
        </div>

        {!editMode && (
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
        )}
      </header>

      {/* Nội dung câu hỏi */}
      <InlineEdit
        enabled={editMode}
        multiline
        value={item.question.content}
        onCommit={setContent}
        label={t("edit.questionText")}
        onDelete={() => onRemoveQuestion?.(index)}
      >
        <div className="space-y-4">
          {parts.length === 0 && editMode && (
            <p className="text-lg italic text-fg-muted">
              {t("edit.questionText")}
            </p>
          )}
          {parts.map((p, i) =>
            p.kind === "text" ? (
              <p
                key={i}
                className="whitespace-pre-line text-lg font-semibold leading-snug text-fg"
              >
                {p.value.trim()}
              </p>
            ) : (
              <div
                key={i}
                className="overflow-hidden rounded-xl bg-[#1e2338] text-[#e6e9f5] shadow-sm"
              >
                <div className="flex items-center justify-between bg-[#2a3050] px-4 py-2">
                  <span className="flex gap-1.5" aria-hidden>
                    <i className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <i className="size-2.5 rounded-full bg-[#febc2e]" />
                    <i className="size-2.5 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="font-label text-xs text-[#9aa3c7]">
                    {p.lang}
                  </span>
                </div>
                <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed">
                  <code>{p.value}</code>
                </pre>
              </div>
            ),
          )}
        </div>
      </InlineEdit>

      {/* Đáp án */}
      <ul className="mt-4 space-y-3" role="radiogroup">
        {options.map((opt, i) => {
          // Chế độ sửa: tick = đáp án đúng; chế độ làm bài: đáp án sinh viên chọn
          const selected = editMode ? !!opt.correct : value === opt.id;
          const choose = () => (editMode ? setCorrect(opt.id) : onChange(opt.id));

          return (
            <li key={opt.id}>
              <div
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onClick={choose}
                onKeyDown={(e) => {
                  // chỉ xử lý khi focus ở chính hàng, không nuốt phím trong ô nhập
                  if (e.target !== e.currentTarget) return;
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    choose();
                  }
                }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  selected
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-transparent bg-surface-muted hover:border-border"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected
                      ? "border-primary bg-primary text-on-primary"
                      : "border-fg-subtle"
                  }`}
                >
                  {selected && (
                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  )}
                </span>

                <div
                  className="flex-1 font-mono text-sm"
                  onClick={(e) => editMode && e.stopPropagation()}
                >
                  <InlineEdit
                    enabled={editMode}
                    value={opt.content}
                    onCommit={(v) => setOptionContent(opt.id, v)}
                    label={t("edit.edit")}
                    onDelete={() => removeOption(opt.id)}
                    deleteLabel={t("edit.delete")}
                  >
                    <span>
                      <span className="mr-2 font-semibold">{letter(i)}.</span>
                      {opt.content || <span className="italic opacity-60">…</span>}
                    </span>
                  </InlineEdit>
                </div>
                {selected && !editMode && (
                  <span className="rounded bg-primary px-2 py-0.5 font-label text-xs font-medium text-on-primary lg:hidden">
                    {t("attempt.selected")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
        {editMode && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-fg-muted hover:bg-surface-muted hover:text-primary"
          >
            {t("edit.addOption")}
          </button>
        )}
      </ul>
    </section>
  );
}