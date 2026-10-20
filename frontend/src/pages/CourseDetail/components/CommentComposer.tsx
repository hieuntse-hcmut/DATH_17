import {
    faBold,
    faCode,
    faFile,
    faItalic,
    faLink,
    faPaperclip,
    faPaperPlane,
    faUnderline,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../services/courseDetail.type";
import type { DiscussionAuthor } from "../services/discussion.type";
import Avatar from "./Avatar";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

const formatFileSize = (bytes: number) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

interface Props {
    user: DiscussionAuthor;
    replyingName?: string;
    onCancelReply: () => void;
    onSubmit: (text: string, attachments: Attachment[]) => void;
}

export default function CommentComposer({
    user,
    replyingName,
    onCancelReply,
    onSubmit,
}: Props) {
    const { t } = useTranslation("courseDetail");
    const [text, setText] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState("");
    const ref = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Bọc phần đang chọn trong textarea bằng ký tự Markdown
    const wrap = (before: string, after = before, fallback = "") => {
        const el = ref.current;
        if (!el) return;
        const { selectionStart: s, selectionEnd: e } = el;
        const selected = text.slice(s, e) || fallback;
        setText(text.slice(0, s) + before + selected + after + text.slice(e));
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(
                s + before.length,
                s + before.length + selected.length,
            );
        });
    };

    // Chèn liên kết: bôi đen sẵn phần URL để gõ luôn
    const insertLink = () => {
        const el = ref.current;
        if (!el) return;
        const { selectionStart: s, selectionEnd: e } = el;
        const selected = text.slice(s, e);

        if (/^https?:\/\/\S+$/.test(selected)) {
            setText(
                text.slice(0, s) + `[${selected}](${selected})` + text.slice(e),
            );
            requestAnimationFrame(() => el.focus());
            return;
        }

        const label =
            selected || t("discussion.linkText", { defaultValue: "liên kết" });
        const url = "https://";
        setText(text.slice(0, s) + `[${label}](${url})` + text.slice(e));
        const urlStart = s + label.length + 3; // sau "[label]("
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(urlStart, urlStart + url.length);
        });
    };

    const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = ""; // cho phép chọn lại cùng một tệp
        const valid = picked.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);
        const merged = [...files, ...valid];

        if (valid.length < picked.length)
            setError(t("discussion.fileTooLarge", { max: MAX_SIZE_MB }));
        else if (merged.length > MAX_FILES)
            setError(t("discussion.tooManyFiles", { max: MAX_FILES }));
        else setError("");

        setFiles(merged.slice(0, MAX_FILES));
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setError("");
    };

    const submit = () => {
        const value = text.trim();
        if (!value && files.length === 0) return;
        // TODO: upload tệp lên server, dùng URL server trả về thay cho blob URL
        const attachments: Attachment[] = files.map((f, i) => ({
            id: `local-file-${Date.now()}-${i}`,
            filename: f.name,
            sizeLabel: formatFileSize(f.size),
            url: URL.createObjectURL(f),
        }));
        onSubmit(value, attachments);
        setText("");
        setFiles([]);
        setError("");
    };

    const tools: { icon: IconDefinition; label: string; run: () => void }[] = [
        {
            icon: faBold,
            label: t("discussion.tools.bold"),
            run: () => wrap("**"),
        },
        {
            icon: faItalic,
            label: t("discussion.tools.italic"),
            run: () => wrap("*"),
        },
        {
            icon: faUnderline,
            label: t("discussion.tools.underline"),
            run: () => wrap("__"),
        },
        {
            icon: faCode,
            label: t("discussion.tools.code"),
            run: () => wrap("`"),
        },
        { icon: faLink, label: t("discussion.tools.link"), run: insertLink },
        {
            icon: faPaperclip,
            label: t("discussion.tools.attach"),
            run: () => fileRef.current?.click(),
        },
    ];

    const canSubmit = !!text.trim() || files.length > 0;

    return (
        <div className="border-t border-border bg-surface p-4">
            {replyingName && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-primary-soft px-3 py-1.5 font-label text-xs text-primary">
                    <span>
                        {t("discussion.replyingTo", { name: replyingName })}
                    </span>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        aria-label={t("discussion.cancelReply")}
                        className="grid h-5 w-5 place-items-center rounded-full hover:bg-primary/20"
                    >
                        <FontAwesomeIcon
                            icon={faXmark}
                            className="text-[12px]"
                            aria-hidden
                        />
                    </button>
                </div>
            )}

            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar author={user} size={28} />
                    <span className="truncate text-sm font-semibold text-fg">
                        {user.name}
                    </span>
                </div>
                <div className="flex items-center gap-0.5 rounded-lg bg-surface-muted p-1">
                    {tools.map(({ icon, label, run }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={run}
                            aria-label={label}
                            title={label}
                            className="grid h-7 w-7 place-items-center rounded-md text-fg-muted transition hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                        >
                            <FontAwesomeIcon
                                icon={icon}
                                className="text-[13px]"
                                aria-hidden
                            />
                        </button>
                    ))}
                </div>
            </div>

            <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                onChange={handleFiles}
            />

            {files.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <li
                            key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                            className="flex max-w-full items-center gap-2 rounded-lg bg-surface-muted px-2.5 py-1.5 font-label text-xs text-fg"
                        >
                            <FontAwesomeIcon
                                icon={faFile}
                                className="text-primary"
                                aria-hidden
                            />
                            <span className="max-w-[160px] truncate">
                                {f.name}
                            </span>
                            <span className="text-fg-subtle">
                                {formatFileSize(f.size)}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                aria-label={t("discussion.removeFile", {
                                    name: f.name,
                                })}
                                className="grid h-5 w-5 place-items-center rounded-full text-fg-muted hover:bg-primary/20 hover:text-fg"
                            >
                                <FontAwesomeIcon
                                    icon={faXmark}
                                    className="text-[11px]"
                                    aria-hidden
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {error && (
                <p role="alert" className="mb-2 font-label text-xs text-danger">
                    {error}
                </p>
            )}

            <div className="flex items-end gap-3">
                <textarea
                    ref={ref}
                    value={text}
                    rows={2}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                            submit();
                    }}
                    placeholder={t("discussion.placeholder")}
                    className="min-h-14 flex-1 resize-none rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-none"
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 font-label text-sm font-semibold text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {t("discussion.post")}
                    <FontAwesomeIcon
                        icon={faPaperPlane}
                        className="text-[13px]"
                        aria-hidden
                    />
                </button>
            </div>
        </div>
    );
}
