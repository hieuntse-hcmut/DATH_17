import {
    faDownload,
    faFile,
    faFileCode,
    faFileExcel,
    faFileImage,
    faFileLines,
    faFilePdf,
    faFilePowerpoint,
    faFileVideo,
    faFileWord,
    faFileZipper,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import type { Attachment } from "../services/courseDetail.type";

interface FileStyle {
    icon: IconDefinition;
    tone: string; // class màu nền + màu icon
}

const FALLBACK: FileStyle = {
    icon: faFile,
    tone: "bg-primary-soft text-primary",
};

const STYLES: Record<string, FileStyle> = {
    pdf: { icon: faFilePdf, tone: "bg-red-500/15 text-red-500" },
    doc: { icon: faFileWord, tone: "bg-blue-500/15 text-blue-500" },
    docx: { icon: faFileWord, tone: "bg-blue-500/15 text-blue-500" },
    ppt: { icon: faFilePowerpoint, tone: "bg-orange-500/15 text-orange-500" },
    pptx: { icon: faFilePowerpoint, tone: "bg-orange-500/15 text-orange-500" },
    xls: { icon: faFileExcel, tone: "bg-emerald-500/15 text-emerald-500" },
    xlsx: { icon: faFileExcel, tone: "bg-emerald-500/15 text-emerald-500" },
    csv: { icon: faFileExcel, tone: "bg-emerald-500/15 text-emerald-500" },
    zip: { icon: faFileZipper, tone: "bg-amber-500/15 text-amber-500" },
    rar: { icon: faFileZipper, tone: "bg-amber-500/15 text-amber-500" },
    "7z": { icon: faFileZipper, tone: "bg-amber-500/15 text-amber-500" },
    txt: { icon: faFileLines, tone: "bg-slate-500/15 text-slate-400" },
    md: { icon: faFileLines, tone: "bg-slate-500/15 text-slate-400" },
    py: { icon: faFileCode, tone: "bg-violet-500/15 text-violet-400" },
    js: { icon: faFileCode, tone: "bg-violet-500/15 text-violet-400" },
    ts: { icon: faFileCode, tone: "bg-violet-500/15 text-violet-400" },
    json: { icon: faFileCode, tone: "bg-violet-500/15 text-violet-400" },
    png: { icon: faFileImage, tone: "bg-pink-500/15 text-pink-500" },
    jpg: { icon: faFileImage, tone: "bg-pink-500/15 text-pink-500" },
    jpeg: { icon: faFileImage, tone: "bg-pink-500/15 text-pink-500" },
    gif: { icon: faFileImage, tone: "bg-pink-500/15 text-pink-500" },
    webp: { icon: faFileImage, tone: "bg-pink-500/15 text-pink-500" },
    svg: { icon: faFileImage, tone: "bg-pink-500/15 text-pink-500" },
    mp4: { icon: faFileVideo, tone: "bg-cyan-500/15 text-cyan-500" },
    mov: { icon: faFileVideo, tone: "bg-cyan-500/15 text-cyan-500" },
};

const styleFor = (filename: string): FileStyle => {
    const ext = filename.includes(".")
        ? filename.split(".").pop()!.toLowerCase()
        : "";
    return STYLES[ext] ?? FALLBACK;
};

export default function AttachmentCard({ file }: { file: Attachment }) {
    const { t } = useTranslation("courseDetail");
    const { icon, tone } = styleFor(file.filename);

    return (
        <a
            href={file.url}
            download={file.filename}
            aria-label={t("download", { name: file.filename })}
            className="group flex items-center gap-3 rounded-xl bg-surface-muted p-3 transition hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary"
        >
            <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tone}`}
            >
                <FontAwesomeIcon icon={icon} className="text-lg" aria-hidden />
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-fg">
                    {file.filename}
                </span>
                <span className="block truncate font-label text-xs text-fg-muted">
                    {file.sizeLabel}
                    {file.label ? ` • ${file.label}` : ""}
                </span>
            </span>

            <FontAwesomeIcon
                icon={faDownload}
                className="shrink-0 text-primary transition group-hover:scale-110"
                aria-hidden
            />
        </a>
    );
}
