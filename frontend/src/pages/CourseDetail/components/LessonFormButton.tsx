import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "~/components/Toast";
import { getErrorMessage } from "~/utils/getErrorMessage";
import {
    useAddNewLesson,
    useDeleteLesson,
    useUpdateLesson,
} from "../services/courseDetail.mutation";
import type { ILesson } from "../services/courseDetail.type";
import FormModal from "./FormModal";

type ContentType = "VIDEO" | "DOCUMENT";

interface Props {
    courseId?: number;
    chapterId: number;
    chapterTitle?: string;
    nextOrderIndex?: number; // dùng khi thêm
    isEdit?: boolean;
    lesson?: ILesson;
    onDeleted?: (lessonId: number) => void;
}

export default function LessonFormButton({
    courseId,
    chapterId,
    chapterTitle,
    nextOrderIndex = 0,
    isEdit = false,
    lesson,
    onDeleted,
}: Readonly<Props>) {
    const { t } = useTranslation("courseDetail");
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const canEdit = isEdit && !!lesson;

    const [title, setTitle] = useState("");
    const [contentType, setContentType] = useState<ContentType>("VIDEO");

    const add = useAddNewLesson(courseId, chapterId);
    const update = useUpdateLesson(courseId, chapterId, lesson?.id);
    const remove = useDeleteLesson(courseId, chapterId, lesson?.id);
    const pending = add.isPending || update.isPending || remove.isPending;

    const openModal = () => {
        setTitle(canEdit ? lesson.title : "");
        setContentType(canEdit ? (lesson.contentType as ContentType) : "VIDEO");
        setOpen(true);
    };
    const close = () => setOpen(false);

    const onError = (err: unknown) =>
        toast.error(getErrorMessage(err, t("notFound")));

    const handleSubmit = () => {
        const value = title.trim();
        if (!value) return;

        if (canEdit) {
            update.mutate(
                {
                    title: value,
                    contentType,
                    orderIndex: lesson.orderIndex,
                },
                {
                    onSuccess: () => {
                        toast.success(t("lesson.updated"));
                        close();
                    },
                    onError,
                },
            );
            return;
        }

        add.mutate(
            { title: value, contentType, orderIndex: nextOrderIndex },
            {
                onSuccess: () => {
                    toast.success(t("lesson.added"));
                    close();
                },
                onError,
            },
        );
    };

    const handleDelete = () => {
        if (!lesson) return;
        remove.mutate(undefined,
            {
                onSuccess: () => {
                    toast.success(t("lesson.deleted"));
                    close();
                    onDeleted?.(lesson.id);
                },
                onError,
            },
        );
    };

    const unchanged =
        canEdit &&
        title.trim() === lesson.title &&
        contentType === lesson.contentType;

    return (
        <>
            {canEdit ? (
                <button
                    type="button"
                    onClick={openModal}
                    title={t("lesson.edit")}
                    aria-label={t("lesson.edit")}
                    className="cursor-pointer rounded-lg p-1 text-xs text-fg-muted hover:bg-surface hover:text-primary"
                >
                    <FontAwesomeIcon icon={faPen} />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={openModal}
                    className="w-full cursor-pointer rounded-xl border border-dashed border-border px-3 py-2 text-sm text-link hover:bg-surface"
                >
                    {t("lesson.addButton")}
                </button>
            )}

            {open && (
                <FormModal
                    title={canEdit ? t("lesson.editTitle") : t("lesson.addTitle")}
                    subtitle={chapterTitle}
                    submitLabel={canEdit ? t("editChapter.save") : t("add")}
                    submitDisabled={!title.trim() || unchanged}
                    pending={pending}
                    confirmDeleteText={t("lesson.confirmDelete")}
                    onClose={close}
                    onSubmit={handleSubmit}
                    onDelete={canEdit ? handleDelete : undefined}
                >
                    <div className="space-y-1">
                        <label htmlFor="lesson-title" className="text-sm text-fg-muted">
                            {t("lesson.name")}
                        </label>
                        <input
                            id="lesson-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("lesson.placeholder")}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="lesson-type" className="text-sm text-fg-muted">
                            {t("lesson.type")}
                        </label>
                        <select
                            id="lesson-type"
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value as ContentType)}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary"
                        >
                            <option value="VIDEO">VIDEO</option>
                            <option value="DOCUMENT">DOCUMENT</option>
                        </select>
                    </div>
                </FormModal>
            )}
        </>
    );
}