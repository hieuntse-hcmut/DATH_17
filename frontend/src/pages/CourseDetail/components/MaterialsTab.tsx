import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IMaterial } from '../services/courseDetail.type'
import { isVideoMaterial } from '../services/material.util'
import AttachmentCard from './AttachmentCard'

type Tab = 'docs' | 'discussion'

interface Props {
  materials?: IMaterial[]
  loading?: boolean
}

export default function MaterialsTab({ materials, loading }: Props) {
  const { t } = useTranslation('courseDetail')
  const [tab, setTab] = useState<Tab>('docs')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'docs', label: t('tabs.docs') },
    { key: 'discussion', label: t('tabs.discussion') },
  ]

  const docs = (materials ?? []).filter((m) => !isVideoMaterial(m))

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 rounded-xl bg-surface-muted p-1">
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
              tab === key ? 'bg-surface text-primary shadow-sm' : 'text-fg-muted hover:text-fg'
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
        hidden={tab !== 'docs'}
        className="mt-4 space-y-4"
      >
        {loading ? (
          <p className="p-6 text-center text-sm text-fg-subtle">...</p>
        ) : docs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-subtle">
            {t('docsEmpty')}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((m) => (
              <AttachmentCard key={m.id} material={m} />
            ))}
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        id="panel-discussion"
        aria-labelledby="tab-discussion"
        hidden={tab !== 'discussion'}
        className="mt-4"
      >
        {/* TODO: thảo luận */}
      </div>
    </div>
  )
}