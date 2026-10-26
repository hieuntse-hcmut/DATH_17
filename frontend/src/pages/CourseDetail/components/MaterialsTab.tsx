import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IMaterial } from "../services/courseDetail.type";
import { isVideoMaterial } from "../services/material.util";
import AttachmentCard from "./AttachmentCard";
import MaterialFormButton from "./MaterialFormButton";
import Discuss from "~/components/Discuss";

type Tab = "docs" | "discussion";

interface Props {
    courseId?: number;
    chapterId?: number;
    lessonId?: number;
    lessonTitle?: string;
    materials?: IMaterial[];
    loading?: boolean;
    isStudent: boolean;
}

export default function MaterialsTab({
    courseId,
    chapterId,
    lessonId,
    lessonTitle,
    materials,
    loading,
    isStudent,
}: Readonly<Props>) {
    const { t } = useTranslation("courseDetail");
    const [tab, setTab] = useState<Tab>("docs");

    const tabs: { key: Tab; label: string }[] = [
        { key: "docs", label: t("tabs.docs") },
        { key: "discussion", label: t("tabs.discussion") },
    ];

    const canManage =
        !isStudent && chapterId !== undefined && lessonId !== undefined;

    const all = materials ?? [];

    // Học viên: chỉ tài liệu (video đã có player).
    // Lecturer/admin: tất cả, video xếp đầu để dễ sửa.
    const items = canManage
        ? [
              ...all.filter((m) => isVideoMaterial(m)),
              ...all.filter((m) => !isVideoMaterial(m)),
          ]
        : all.filter((m) => !isVideoMaterial(m));

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
                className="mt-4 space-y-4"
            >
                {loading ? (
                    <p className="p-6 text-center text-sm text-fg-subtle">
                        ...
                    </p>
                ) : items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-subtle">
                        {t("docsEmpty")}
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((m) => (
                            <div key={m.id} className="relative flex items-start gap-1">
                                <div className="min-w-0 flex-1">
                                    <AttachmentCard material={m} />
                                </div>
                                {canManage && (
                                    <div className="absolute -right-2 -top-2 rounded-full bg-border">
                                        <MaterialFormButton
                                            isEdit
                                            courseId={courseId}
                                            chapterId={chapterId}
                                            lessonId={lessonId}
                                            lessonTitle={lessonTitle}
                                            material={m}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {canManage && (
                    <MaterialFormButton
                        courseId={courseId}
                        chapterId={chapterId}
                        lessonId={lessonId}
                        lessonTitle={lessonTitle}
                    />
                )}
            </div>

            <div
                role="tabpanel"
                id="panel-discussion"
                aria-labelledby="tab-discussion"
                hidden={tab !== "discussion"}
                className="mt-4"
            >
                <Discuss courseId={courseId} />
            </div>
        </div>
    );
}