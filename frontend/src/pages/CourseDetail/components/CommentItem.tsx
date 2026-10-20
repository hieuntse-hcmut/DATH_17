import { faEllipsis, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import type { DiscussionComment } from "../services/discussion.type";
import Avatar from "./Avatar";
import RichText from "./RichText";
import AttachmentCard from "./AttachmentCard";
interface Props {
    comment: DiscussionComment;
    rootId: string;
    replyingToId?: string;
    isReply?: boolean;
    onLike: (id: string) => void;
    onReply: (target: DiscussionComment, rootId: string) => void;
}

function formatTimeAgo(iso: string, locale: string, justNow: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
    if (minutes < 1) return justNow;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
    if (minutes < 60) return rtf.format(-minutes, "minute");
    if (minutes < 1440) return rtf.format(-Math.round(minutes / 60), "hour");
    return rtf.format(-Math.round(minutes / 1440), "day");
}

export default function CommentItem({
    comment,
    rootId,
    replyingToId,
    isReply = false,
    onLike,
    onReply,
}: Props) {
    const { t, i18n } = useTranslation("courseDetail");
    const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
    const replying = replyingToId === comment.id;

    return (
        <li className="list-none">
            <div className="flex gap-3">
                <Avatar author={comment.author} size={isReply ? 32 : 36} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2">
                            <span className="text-sm font-semibold text-fg">
                                {comment.author.name}
                            </span>
                            {comment.author.tag && (
                                <span className="rounded bg-primary-soft px-1.5 py-0.5 font-label text-[10px] font-semibold text-primary">
                                    {comment.author.tag}
                                </span>
                            )}
                            <span className="font-label text-xs text-fg-subtle">
                                {formatTimeAgo(
                                    comment.createdAt,
                                    locale,
                                    t("discussion.justNow"),
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            aria-label={t("discussion.options")}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-fg-subtle transition hover:bg-surface-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-primary"
                        >
                            <FontAwesomeIcon
                                icon={faEllipsis}
                                className="text-[14px]"
                                aria-hidden
                            />
                        </button>
                    </div>

                    <div className="mt-1">
                        {comment.content && <RichText text={comment.content} />}
                        {comment.attachments &&
                            comment.attachments.length > 0 && (
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {comment.attachments.map((f) => (
                                        <AttachmentCard key={f.id} file={f} />
                                    ))}
                                </div>
                            )}
                    </div>

                    <div className="mt-2 flex items-center gap-4 font-label text-xs">
                        <button
                            type="button"
                            onClick={() => onLike(comment.id)}
                            aria-pressed={comment.likedByMe}
                            className={`inline-flex items-center gap-1.5 transition hover:text-danger ${
                                comment.likedByMe
                                    ? "text-danger"
                                    : "text-fg-muted"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faHeart}
                                className="text-[12px]"
                                aria-hidden
                            />
                            {t("discussion.like", { count: comment.likes })}
                        </button>
                        <button
                            type="button"
                            onClick={() => onReply(comment, rootId)}
                            className={`font-medium transition hover:text-primary ${
                                replying ? "text-primary" : "text-fg-muted"
                            }`}
                        >
                            {replying
                                ? t("discussion.replying")
                                : t("discussion.reply")}
                        </button>
                    </div>
                </div>
            </div>

            {comment.replies.length > 0 && (
                <ul className="ml-4 mt-4 space-y-4 border-l-2 border-border pl-5 sm:ml-[18px]">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            rootId={rootId}
                            replyingToId={replyingToId}
                            isReply
                            onLike={onLike}
                            onReply={onReply}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
