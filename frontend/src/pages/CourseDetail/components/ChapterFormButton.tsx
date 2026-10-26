import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
    useAddNewChapter,
    useDeleteChapter,
    useUpdateChapter,
} from "../services/courseDetail.mutation";
import { useToast } from "~/components/Toast";
import { getErrorMessage } from "~/utils/getErrorMessage";
import FormModal from "./FormModal";

interface Props {
    courseId?: number;
    courseTitle?: string;
    nextOrderIndex?: number;
    isEdit?: boolean;
    chapter?: { id: number; title: string; orderIndex: number };
}

export default function ChapterFormButton({
    courseId,
    courseTitle,
    nextOrderIndex = 0,
    isEdit = false,
    chapter,
}: Readonly<Props>) {
    const toast = useToast();
    const { t } = useTranslation("courseDetail");
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");

    const add = useAddNewChapter(courseId);
    const update = useUpdateChapter(courseId, chapter?.id);
    const remove = useDeleteChapter(courseId, chapter?.id);

    const pending = add.isPending || update.isPending || remove.isPending;
    const canEdit = isEdit && !!chapter;

    const openModal = () => {
        // sửa: điền sẵn tên hiện tại; thêm: để trống
        setTitle(canEdit ? chapter.title : "");
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
                { title: value, orderIndex: chapter.orderIndex },
                {
                    onSuccess: () => {
                        toast.success(t("editChapter.success"));
                        close();
                    },
                    onError,
                },
            );
            return;
        }

        add.mutate(
            { title: value, orderIndex: nextOrderIndex },
            {
                onSuccess: () => {
                    toast.success(t("addCourse.success"));
                    close();
                },
                onError,
            },
        );
    };

    const handleDelete = () => {
        remove.mutate(undefined, {
            onSuccess: () => {
                toast.success(t("editChapter.deleted"));
                close();
            },
            onError,
        });
    };

    return (
        <>
            {canEdit ? (
                <button
                    type="button"
                    onClick={openModal}
                    aria-label={t("editChapter.button")}
                    title={t("editChapter.button")}
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
                    {t("addCourse.button")}
                </button>
            )}

            {open && (
                <FormModal
                    title={
                        canEdit
                            ? t("editChapter.title")
                            : t("addCourse.addChapterTitle")
                    }
                    subtitle={courseTitle}
                    submitLabel={canEdit ? t("editChapter.save") : t("add")}
                    submitDisabled={
                        !title.trim() ||
                        (canEdit && title.trim() === chapter.title)
                    }
                    pending={pending}
                    confirmDeleteText={t("editChapter.confirmDelete")}
                    onClose={close}
                    onSubmit={handleSubmit}
                    onDelete={canEdit ? handleDelete : undefined}
                >
                    <div className="space-y-1">
                        <label
                            htmlFor="chapter-title"
                            className="text-sm text-fg-muted"
                        >
                            {t("addCourse.chapterName")}
                        </label>
                        <input
                            id="chapter-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("addCourse.chapterPlaceholder")}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary"
                        />
                    </div>
                </FormModal>
            )}
        </>
    );
}