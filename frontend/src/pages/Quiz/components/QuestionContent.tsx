import { useMemo } from 'react'

interface Props {
  content: string
}

type Part = { kind: 'text'; value: string } | { kind: 'code'; lang: string; value: string }

/** Tách nội dung câu hỏi: văn bản thường + khối ```lang ... ``` */
function parse(content: string): Part[] {
  const parts: Part[] = []
  const re = /```(\w+)?\n([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    if (m.index > last) parts.push({ kind: 'text', value: content.slice(last, m.index) })
    parts.push({ kind: 'code', lang: m[1] ?? 'code', value: m[2].replace(/\n$/, '') })
    last = m.index + m[0].length
  }
  if (last < content.length) parts.push({ kind: 'text', value: content.slice(last) })
  return parts
}

export default function QuestionContent({ content }: Props) {
  const parts = useMemo(() => parse(content), [content])

  return (
    <div className="space-y-4">
      {parts.map((p, i) =>
        p.kind === 'text' ? (
          <p key={i} className="whitespace-pre-line text-lg font-semibold leading-snug text-fg">
            {p.value.trim()}
          </p>
        ) : (
          <div key={i} className="overflow-hidden rounded-xl bg-[#1e2338] text-[#e6e9f5] shadow-sm">
            <div className="flex items-center justify-between bg-[#2a3050] px-4 py-2">
              <span className="flex gap-1.5" aria-hidden>
                <i className="size-2.5 rounded-full bg-[#ff5f57]" />
                <i className="size-2.5 rounded-full bg-[#febc2e]" />
                <i className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="font-label text-xs text-[#9aa3c7]">{p.lang}</span>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed">
              <code>{p.value}</code>
            </pre>
          </div>
        ),
      )}
    </div>
  )
}
