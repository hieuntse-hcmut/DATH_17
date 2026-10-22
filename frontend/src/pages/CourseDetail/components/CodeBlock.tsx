import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  filename: string
  content: string
}

export default function CodeBlock({ filename, content }: Props) {
  const { t } = useTranslation('courseDetail')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    // Code block luôn tối ở cả light/dark theme (giống Figma)
    <div className="overflow-hidden rounded-xl bg-[#1e293b] text-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <i className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          <span className="font-mono text-xs text-slate-400">{filename}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 font-label text-xs font-medium text-on-primary transition hover:bg-primary-hover"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
        {content.split('\n').map((line, i) => (
          <div key={i} className={line.trim().startsWith('#') ? 'text-emerald-400' : undefined}>
            {line || '\u00A0'}
          </div>
        ))}
      </pre>
    </div>
  )
}
