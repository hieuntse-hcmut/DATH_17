import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p,
})

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" /></svg>
)
export const FlameIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3c1 3-3 5-3 9a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 4 4 4 7a8 8 0 0 1-16 0c0-5 5-6 8-11Z" /></svg>
)
export const TrophyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /></svg>
)
export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const FileIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5" /></svg>
)
export const CheckCircleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
)
export const RefreshIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" /></svg>
)
export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
)
