import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartSimple,
  faCirclePlay,
  faHeadset,
  faPhone,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import slide1 from '~/assets/showcase/slide-1.jpg'
import slide2 from '~/assets/showcase/slide-2.jpg'

// Thứ tự phải khớp với mảng showcase.slider trong file dịch
const SLIDE_IMAGES = [slide1, slide2]

// Thứ tự phải khớp với mảng showcase.features trong file dịch
const FEATURE_STYLES = [
  { icon: faCirclePlay, box: 'bg-primary-soft text-primary' },
  { icon: faChartSimple, box: 'bg-primary-soft text-primary' },
  { icon: faShieldHalved, box: 'bg-tertiary-soft text-tertiary' },
]

const SLIDE_INTERVAL_MS = 5000

export default function AuthShowcase() {
  const { t } = useTranslation('auth')
  const slides = t('showcase.slider', { returnObjects: true })
  const features = t('showcase.features', { returnObjects: true })
  const phone = "1936 6767"

  const [current, setCurrent] = useState(0)

  // Tự chuyển slide, chỉ chạy khi có từ 2 slide trở lên
  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => setCurrent((i) => (i + 1) % slides.length), SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <aside className="hidden flex-col gap-6 bg-linear-to-br from-page to-primary-soft pb-[2vw] pt-[4vw] lg:flex px-[6.25vw]">
      <h2 className="text-3xl font-bold">{t('showcase.title')}</h2>

      {/* Slider */}
      <div className="rounded-3xl bg-surface shadow-lg shadow-primary/10">
        <div className="relative aspect-[16/5] overflow-hidden rounded-2xl">
          {slides.map((slide, i) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === current ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={i !== current}
            >
              <img
                src={SLIDE_IMAGES[i]}
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <p className="font-label text-xs font-semibold tracking-widest">{slide.title}</p>
                <p className="mt-1 text-xl leading-snug font-bold">{slide.description}</p>
              </div>
            </div>
          ))}

          {slides.length > 1 && (
            <div className="absolute right-4 bottom-4 flex gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tính năng nổi bật */}
      <ul className="space-y-4">
        {features.map((feature, i) => {
          const style = FEATURE_STYLES[i]
          return (
            <li
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl bg-surface p-4 shadow-sm"
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-xl ${style.box}`}
              >
                <FontAwesomeIcon icon={style.icon} />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-0.5 text-sm text-fg-muted">{feature.description}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Hỗ trợ: đẩy xuống đáy bằng mt-auto */}
      <div className="mt-auto flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
          <FontAwesomeIcon icon={faHeadset} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t('showcase.support.title')}</p>
          <p className="text-sm text-fg-muted">{t('showcase.support.description')}</p>
        </div>
        <a
          href={`tel:${phone.replace(/\D/g, '')}`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2.5 text-sm font-semibold text-link transition hover:bg-primary hover:text-on-primary"
        >
          <FontAwesomeIcon icon={faPhone} className="text-xs" />
          {phone}
        </a>
      </div>
    </aside>
  )
}