import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'

const getYoutubeId = (url?: string) => {
  if (!url) return ''
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return m?.[1] ?? ''
}

interface Props {
  videoUrl?: string
  title: string
  onOpenToc: () => void
}

export default function VideoPlayer({ videoUrl, title, onOpenToc }: Props) {
  const { t } = useTranslation('courseDetail')
  const id = getYoutubeId(videoUrl)

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {id ? (
        <iframe
          key={id}
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : null}

      {/* Nút mở mục lục: chỉ hiện ở mobile (theo Figma) */}
      <button
        type="button"
        onClick={onOpenToc}
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 font-label text-xs font-medium text-white backdrop-blur lg:hidden"
      >
        <FontAwesomeIcon icon={faBookOpen} />
        {t('toc')}
      </button>
    </div>
  )
}
