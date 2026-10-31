import { useTranslation } from "react-i18next";

interface Props {
  answered: number;
  total: number;
  flagged: number;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SubmitDialog({
  answered,
  total,
  flagged,
  pending,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation("quiz");
  const unanswered = total - answered;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <h2 id="submit-title" className="text-lg font-bold text-fg">
          {t("confirm.title")}
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          {t("confirm.body", { answered, total })}
        </p>
        {unanswered > 0 && (
          <p className="mt-1 text-sm text-danger">
            {t("confirm.unansweredWarn", { count: unanswered })}
          </p>
        )}
        {flagged > 0 && (
          <p className="mt-1 text-sm text-danger">
            {t("confirm.flaggedWarn", { count: flagged })}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="cursor-pointer disabled:cursor-not-allowed rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-fg hover:brightness-95 disabled:opacity-50"
          >
            {t("confirm.cancel")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="cursor-pointer disabled:cursor-not-allowed rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50"
          >
            {t("confirm.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
