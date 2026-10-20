import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CURRENT_USER, getMockDiscussion } from "../services/discussion.api";
import type { DiscussionComment } from "../services/discussion.type";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";
import type { Attachment } from "../services/courseDetail.type";

type Sort = "newest" | "oldest" | "popular";

interface ReplyTarget {
    rootId: string;
    targetId: string;
    name: string;
}

const mapTree = (
    list: DiscussionComment[],
    fn: (c: DiscussionComment) => DiscussionComment,
): DiscussionComment[] =>
    list.map((c) => fn({ ...c, replies: mapTree(c.replies, fn) }));

export default function DiscussionPanel({ lessonId }: { lessonId: string }) {
    const { t } = useTranslation("courseDetail");
    const [comments, setComments] = useState<DiscussionComment[]>(() =>
        getMockDiscussion(lessonId),
    );
    const [sort, setSort] = useState<Sort>("newest");
    const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

    const sorted = useMemo(() => {
        const arr = [...comments];
        if (sort === "newest")
            arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        if (sort === "oldest")
            arr.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        if (sort === "popular") arr.sort((a, b) => b.likes - a.likes);
        return arr;
    }, [comments, sort]);

    const toggleLike = (id: string) =>
        setComments((prev) =>
            mapTree(prev, (c) =>
                c.id === id
                    ? {
                          ...c,
                          likedByMe: !c.likedByMe,
                          likes: c.likes + (c.likedByMe ? -1 : 1),
                      }
                    : c,
            ),
        );

    const post = (content: string, attachments: Attachment[]) => {
        const item: DiscussionComment = {
            id: `local-${Date.now()}`,
            author: CURRENT_USER,
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedByMe: false,
            attachments,
            replies: [],
        };
        // TODO: gọi API tạo bình luận rồi invalidate query
        if (replyTo) {
            setComments((prev) =>
                prev.map((c) =>
                    c.id === replyTo.rootId
                        ? { ...c, replies: [...c.replies, item] }
                        : c,
                ),
            );
            setReplyTo(null);
        } else {
            setComments((prev) => [item, ...prev]);
        }
    };

    const sortOptions: { value: Sort; label: string }[] = [
        { value: "newest", label: t("discussion.sort.newest") },
        { value: "oldest", label: t("discussion.sort.oldest") },
        { value: "popular", label: t("discussion.sort.popular") },
    ];

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
                <h2 className="text-base font-bold text-fg">
                    {t("discussion.title")}
                </h2>
                <label className="flex items-center gap-1.5 font-label text-xs text-fg-muted">
                    <span className="hidden sm:inline">
                        {t("discussion.sortBy")}
                    </span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as Sort)}
                        className="rounded-md border border-border bg-surface px-2 py-1 font-medium text-fg focus:border-primary focus:outline-none"
                    >
                        {sortOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </label>
            </header>

            <div className="max-h-[480px] overflow-y-auto px-4 py-5 sm:px-5">
                {sorted.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-subtle">
                        {t("discussionEmpty")}
                    </p>
                ) : (
                    <ul className="space-y-6">
                        {sorted.map((c) => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                rootId={c.id}
                                replyingToId={replyTo?.targetId}
                                onLike={toggleLike}
                                onReply={(target, rootId) =>
                                    setReplyTo({
                                        rootId,
                                        targetId: target.id,
                                        name: target.author.name,
                                    })
                                }
                            />
                        ))}
                    </ul>
                )}
            </div>

            <CommentComposer
                user={CURRENT_USER}
                replyingName={replyTo?.name}
                onCancelReply={() => setReplyTo(null)}
                onSubmit={post}
            />
        </div>
    );
}
