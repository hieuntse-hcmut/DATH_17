import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCompass,
    faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
    onExplore?: () => void;
}

export default function PromoBanner({ onExplore }: Props) {
    const { t } = useTranslation("myCourses");

    return (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-lg">
            {/* Desktop / tablet */}
            <div className="hidden items-center justify-between gap-8 p-8 md:flex">
                <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold">
                        <FontAwesomeIcon
                            icon={faWandMagicSparkles}
                            className="text-[12px]"
                            aria-hidden
                        />{" "}
                        {t("banner.badge")}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold leading-snug">
                        {t("banner.title")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {t("banner.description")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onExplore}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    {t("banner.cta")}{" "}
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-[16px]"
                        aria-hidden
                    />
                </button>
            </div>

            {/* Mobile */}
            <div className="flex flex-col items-center gap-3 p-6 text-center md:hidden">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                    <FontAwesomeIcon
                        icon={faCompass}
                        className="text-[20px]"
                        aria-hidden
                    />
                </span>
                <h2 className="text-lg font-bold">{t("banner.mobileTitle")}</h2>
                <p className="text-sm text-white/80">
                    {t("banner.mobileDescription")}
                </p>
                <button
                    type="button"
                    onClick={onExplore}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    {t("banner.mobileCta")}{" "}
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-[16px]"
                        aria-hidden
                    />
                </button>
            </div>
        </section>
    );
}
