import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "~/components/Toast";
import { getErrorMessage } from "~/utils/getErrorMessage";
import {
    useAddMaterial,
    useDeleteMaterial,
    useUpdateMaterial,
    useUpdateLesson,
} from "../services/courseDetail.mutation";
import FormModal from "./FormModal";
import type { IMaterial, ILessonPayload } from "../services/courseDetail.type";
import { getYouTubeId, getYouTubeDuration } from "../services/youtube";

const FILE_TYPES = ["PDF", "VIDEO", "DOCX", "IMAGE", "PPTX"];

interface Props {
    courseId?: number;
    chapterId?: number;
    lessonId?: number;
    lessonTitle?: string;
    orderIndex?: number | null;
    isEdit?: boolean;
    material?: IMaterial;
}

export default function MaterialFormButton({
    courseId,
    chapterId,
    lessonId,
    lessonTitle,
    orderIndex,
    isEdit = false,
    material,
}: Readonly<Props>) {
    const { t } = useTranslation("courseDetail");
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const canEdit = isEdit && !!material;

    const [title, setTitle] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [fileType, setFileType] = useState(FILE_TYPES[0]);
    const [isResolving, setIsResolving] = useState(false);

    const add = useAddMaterial(courseId, chapterId, lessonId);
    const update = useUpdateMaterial(courseId, chapterId, lessonId, material?.id);
    const remove = useDeleteMaterial(courseId, chapterId, lessonId, material?.id);
    const updateLesson = useUpdateLesson(courseId, chapterId, lessonId);
    const pending =
        isResolving ||
        add.isPending ||
        update.isPending ||
        remove.isPending ||
        updateLesson.isPending;

    // Giá trị đã trim, dùng chung cho validate, so sánh và payload
    const trimmedTitle = title.trim();
    const trimmedUrl = fileUrl.trim();
    const payload = { title: trimmedTitle, fileUrl: trimmedUrl, fileType };

    const openModal = () => {
        setTitle(canEdit ? material.title : "");
        setFileUrl(canEdit ? material.fileUrl : "");
        setFileType(canEdit ? material.fileType : FILE_TYPES[0]);
        setOpen(true);
    };
    const close = () => setOpen(false);

    const onError = (err: unknown) =>
        toast.error(getErrorMessage(err, t("notFound")));

    const handleSubmit = async () => {
        if (pending) return;

        // Chỉ lấy duration khi thêm mới hoặc URL thay đổi
        let totalLength: number | null = null;
        const urlChanged = !canEdit || trimmedUrl !== material.fileUrl;
        const videoId = urlChanged ? getYouTubeId(trimmedUrl) : "";
        if (videoId) {
            setIsResolving(true);
            try {
                totalLength = await getYouTubeDuration(videoId);
            } finally {
                setIsResolving(false);
            }
        }

        const onSuccess = (message: string) => () => {
            toast.success(message);
            // Cập nhật độ dài lesson sau khi material đã lưu thành công
            if (totalLength) {
                updateLesson.mutate({ title: lessonTitle, totalLength, orderIndex } as ILessonPayload, { onError });
            }
            close();
        };

        if (canEdit) {
            update.mutate(payload, {
                onSuccess: onSuccess(t("material.updated")),
                onError,
            });
            return;
        }

        add.mutate(payload, {
            onSuccess: onSuccess(t("material.added")),
            onError,
        });
    };

    const handleDelete = () => {
        if (!material) return;
        remove.mutate(undefined, {
            onSuccess: () => {
                toast.success(t("material.deleted"));
                close();
            },
            onError,
        });
    };

    const unchanged =
        canEdit &&
        trimmedTitle === material.title &&
        trimmedUrl === material.fileUrl &&
        fileType === material.fileType;

    const inputCls =
        "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

    return (
        <>
            {canEdit ? (
                <button
                    type="button"
                    onClick={openModal}
                    title={t("material.edit")}
                    aria-label={t("material.edit")}
                    className="cursor-pointer rounded-lg p-2 text-xs text-fg-muted hover:bg-surface-muted hover:text-primary"
                >
                    <FontAwesomeIcon icon={faPen} />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={openModal}
                    className="cursor-pointer w-full rounded-xl border border-dashed border-border px-3 py-2 text-sm text-link hover:bg-surface"
                >
                    {t("material.addButton")}
                </button>
            )}

            {open && (
                <FormModal
                    title={canEdit ? t("material.editTitle") : t("material.addTitle")}
                    subtitle={lessonTitle}
                    submitLabel={canEdit ? t("editChapter.save") : t("add")}
                    submitDisabled={!trimmedTitle || !trimmedUrl || unchanged}
                    pending={pending}
                    confirmDeleteText={t("material.confirmDelete")}
                    onClose={close}
                    onSubmit={handleSubmit}
                    onDelete={canEdit ? handleDelete : undefined}
                >
                    <div className="space-y-1">
                        <label htmlFor="material-title" className="text-sm text-fg-muted">
                            {t("material.name")}
                        </label>
                        <input
                            id="material-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="material-url" className="text-sm text-fg-muted">
                            {t("material.url")}
                        </label>
                        <input
                            id="material-url"
                            type="url"
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="https://..."
                            className={inputCls}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="material-type" className="text-sm text-fg-muted">
                            {t("material.type")}
                        </label>
                        <select
                            id="material-type"
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            className={inputCls}
                        >
                            {FILE_TYPES.map((ft) => (
                                <option key={ft} value={ft}>
                                    {ft}
                                </option>
                            ))}
                        </select>
                    </div>
                </FormModal>
            )}
        </>
    );
}