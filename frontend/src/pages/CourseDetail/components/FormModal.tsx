import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface Props {
    title: string;
    subtitle?: string;
    submitLabel: string;
    submitDisabled?: boolean;
    pending?: boolean;
    confirmDeleteText?: string;
    onClose: () => void;
    onSubmit: () => void;
    onDelete?: () => void;
    children: ReactNode;
}

export default function FormModal({
    title,
    subtitle,
    submitLabel,
    submitDisabled,
    pending,
    confirmDeleteText,
    onClose,
    onSubmit,
    onDelete,
    children,
}: Props) {
    const { t } = useTranslation("courseDetail");
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!pending && !submitDisabled) onSubmit();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />
            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-md space-y-4 rounded-2xl bg-surface p-5 shadow-xl"
            >
                <div>
                    <h2 className="text-lg font-semibold text-fg">{title}</h2>
                    {subtitle && (
                        <p className="truncate text-sm text-fg-muted">{subtitle}</p>
                    )}
                </div>

                {children}

                {onDelete && confirming && (
                    <div className="space-y-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        <p>{confirmDeleteText}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={pending}
                                onClick={() => setConfirming(false)}
                                className="cursor-pointer rounded-lg px-3 py-1.5 text-fg-muted hover:bg-surface"
                            >
                                {t("close")}
                            </button>
                            <button
                                type="button"
                                disabled={pending}
                                onClick={onDelete}
                                className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white disabled:opacity-50"
                            >
                                {t("editChapter.confirm")}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    {onDelete && !confirming ? (
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => setConfirming(true)}
                            className="cursor-pointer rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            {t("editChapter.delete")}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={pending}
                            className="cursor-pointer rounded-lg px-4 py-2 text-sm text-fg-muted hover:bg-surface-muted"
                        >
                            {t("close")}
                        </button>
                        <button
                            type="submit"
                            disabled={pending || submitDisabled}
                            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </div>
            </form>
        </div>,
        document.body,
    );
}