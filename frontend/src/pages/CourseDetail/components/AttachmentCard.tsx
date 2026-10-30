import {
  faDownload,
  faFile,
  faFileExcel,
  faFileImage,
  faFileLines,
  faFilePdf,
  faFilePowerpoint,
  faFileWord,
  faFileZipper,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import type { IMaterial } from '../services/courseDetail.type'

type Kind = 'pdf' | 'word' | 'ppt' | 'excel' | 'zip' | 'text' | 'image' | 'other'

const STYLES: Record<Kind, { icon: IconDefinition; tone: string; label: string }> = {
  pdf: { icon: faFilePdf, tone: 'bg-red-500/15 text-red-500', label: 'PDF' },
  word: { icon: faFileWord, tone: 'bg-blue-500/15 text-blue-500', label: 'Word' },
  ppt: { icon: faFilePowerpoint, tone: 'bg-orange-500/15 text-orange-500', label: 'PowerPoint' },
  excel: { icon: faFileExcel, tone: 'bg-emerald-500/15 text-emerald-500', label: 'Excel' },
  zip: { icon: faFileZipper, tone: 'bg-amber-500/15 text-amber-500', label: 'ZIP' },
  text: { icon: faFileLines, tone: 'bg-slate-500/15 text-slate-400', label: 'Text' },
  image: { icon: faFileImage, tone: 'bg-pink-500/15 text-pink-500', label: 'Image' },
  other: { icon: faFile, tone: 'bg-primary-soft text-primary', label: '' },
}

const EXT_KIND: Record<string, Kind> = {
  pdf: 'pdf', doc: 'word', docx: 'word', ppt: 'ppt', pptx: 'ppt',
  xls: 'excel', xlsx: 'excel', csv: 'excel', zip: 'zip', rar: 'zip', '7z': 'zip',
  txt: 'text', md: 'text', png: 'image', jpg: 'image', jpeg: 'image', gif: 'image',
  webp: 'image', svg: 'image',
}

const kindOf = (m: IMaterial): Kind => {
  const type = (m.fileType ?? '').toLowerCase()
  if (type.includes('word')) return 'word'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'ppt'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'excel'
  const typeExt = type.split(/[/.]/).pop() ?? ''
  const urlExt = m.fileUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase() ?? ''
  return EXT_KIND[typeExt] ?? EXT_KIND[urlExt] ?? 'other'
}

export default function AttachmentCard({ material }: { material: IMaterial }) {
  const { t } = useTranslation('courseDetail')
  const { icon, tone, label } = STYLES[kindOf(material)]

  return (
    <a
      href={material.fileUrl}
      target="_blank"
      rel="noreferrer noopener"
      download
      aria-label={t('download', { name: material.title })}
      className="group w-full flex items-center gap-3 rounded-xl bg-surface-muted p-3 transition hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tone}`}>
        <FontAwesomeIcon icon={icon} className="text-lg" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="w-full block truncate text-sm font-semibold text-fg">{material.title}</span>
        <span className="w-full block truncate font-label text-xs text-fg-muted">
          {label || material.fileType}
        </span>
      </span>
      <FontAwesomeIcon
        icon={faDownload}
        className="shrink-0 h-11 w-11 text-primary transition group-hover:scale-110"
        aria-hidden
      />
    </a>
  )
}