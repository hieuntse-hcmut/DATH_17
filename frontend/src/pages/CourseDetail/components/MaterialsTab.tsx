import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ILesson, IMaterial } from "../services/courseDetail.type";
import AttachmentCard from "./AttachmentCard";
import CodeBlock from "./CodeBlock";
import MaterialFormButton from "./MaterialFormButton";

type Tab = "docs" | "discussion";

interface Props {
    courseId?: number;
    chapterId?: number;
    lessonId?: number;
    lessonTitle?: string;
    isEdit?: boolean;
    materials?: IMaterial[];
    isStudent: boolean
}

export default function MaterialsTab({
    courseId,
    chapterId,
    lessonId,
    lessonTitle,
    isEdit = false,
    materials,
    isStudent
}: Readonly<Props>) {
    const { t } = useTranslation("courseDetail");
    const [tab, setTab] = useState<Tab>("docs");

    const tabs: { key: Tab; label: string }[] = [
        { key: "docs", label: t("tabs.docs") },
        { key: "discussion", label: t("tabs.discussion") },
    ];

    // const hasAttachments = !!lesson.attachments?.length;
    // const docsEmpty = !lesson.note && !lesson.code && !hasAttachments;
    const docsEmpty = true;

    return (
        <div>
            <div
                role="tablist"
                className="grid grid-cols-2 rounded-xl bg-surface-muted p-1"
            >
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        id={`tab-${key}`}
                        aria-selected={tab === key}
                        aria-controls={`panel-${key}`}
                        onClick={() => setTab(key)}
                        className={`rounded-lg py-2 font-label text-sm font-medium transition ${
                            tab === key
                                ? "bg-surface text-primary shadow-sm"
                                : "text-fg-muted hover:text-fg"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div
                role="tabpanel"
                id="panel-docs"
                aria-labelledby="tab-docs"
                hidden={tab !== "docs"}
                className="mt-4 space-y-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-subtle"
            >
                {docsEmpty && (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-subtle">
                        {t("docsEmpty")}
                    </p>
                )}
                {/* {lesson.note && (
                    <p className="text-sm text-fg-muted">{lesson.note}</p>
                )}
                {hasAttachments && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {lesson.attachments!.map((f) => (
                            <AttachmentCard key={f.id} file={f} />
                        ))}
                    </div>
                )}
                {lesson.code && (
                    <CodeBlock
                        filename={lesson.code.filename}
                        content={lesson.code.content}
                    />
                )} */}
                <MaterialFormButton
                    courseId={courseId}
                    chapterId={chapterId}
                    lessonId={lessonId}
                    lessonTitle={lessonTitle}
                    material={materials?.[0]}
                    isEdit={true}
                />
            </div>

            <div
                role="tabpanel"
                id="panel-discussion"
                aria-labelledby="tab-discussion"
                hidden={tab !== "discussion"}
                className="mt-4"
            >
                {/* TODO check type material with BE*/}
            </div>
        </div>
    );
}
