import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faList,
    faMagnifyingGlass,
    faTableCellsLarge,
} from "@fortawesome/free-solid-svg-icons";
import type { CourseSort, CourseView } from "../services/myCourses.type";

export type CourseTab = "learning" | "completed";

interface Props {
    tab: CourseTab;
    onTabChange: (tab: CourseTab) => void;
    learningCount: number;
    completedCount: number;
    keyword: string;
    onKeywordChange: (value: string) => void;
    sort: CourseSort;
    onSortChange: (value: CourseSort) => void;
    view: CourseView;
    onViewChange: (value: CourseView) => void;
}

export default function CourseToolbar({
    tab,
    onTabChange,
    learningCount,
    completedCount,
    keyword,
    onKeywordChange,
    sort,
    onSortChange,
    view,
    onViewChange,
}: Props) {
    const { t } = useTranslation("myCourses");

    const tabs: { key: CourseTab; count: number }[] = [
        { key: "learning", count: learningCount },
        { key: "completed", count: completedCount },
    ];

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div
                role="tablist"
                className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1 lg:flex"
            >
                {tabs.map(({ key, count }) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            role="tab"
                            type="button"
                            aria-selected={active}
                            onClick={() => onTabChange(key)}
                            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                                active
                                    ? "bg-surface text-primary shadow-sm"
                                    : "text-fg-muted hover:text-fg"
                            }`}
                        >
                            {t(`tabs.${key}`)}{" "}
                            <span
                                className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] ${
                                    active
                                        ? "bg-primary-soft text-primary"
                                        : "bg-border text-fg-muted"
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
                {/* Search */}
                <label className="relative flex-1 lg:max-w-xs">
                    <span className="sr-only">{t("search.label")}</span>
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="text-[16px] pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
                        aria-hidden
                    />
                    <input
                        type="search"
                        value={keyword}
                        onChange={(e) => onKeywordChange(e.target.value)}
                        placeholder={t("search.placeholder")}
                        className="w-full rounded-xl border border-transparent bg-surface-muted py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-none"
                    />
                </label>

                <div className="flex items-center gap-2">
                    {/* Sort */}
                    <label className="relative flex-1 sm:flex-none">
                        <span className="sr-only">{t("sort.label")}</span>
                        <select
                            value={sort}
                            onChange={(e) =>
                                onSortChange(e.target.value as CourseSort)
                            }
                            className="w-full appearance-none rounded-xl border border-border bg-surface py-2 pl-3 pr-8 text-sm font-medium text-fg-muted focus:border-primary focus:outline-none"
                        >
                            <option value="recent">{t("sort.recent")}</option>
                            <option value="name">{t("sort.name")}</option>
                            <option value="progress">
                                {t("sort.progress")}
                            </option>
                        </select>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className="text-[16px] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle"
                            aria-hidden
                        />
                    </label>

                    {/* View toggle */}
                    <div className="hidden items-center gap-1 rounded-xl bg-surface-muted p-1 sm:flex">
                        {(
                            [
                                { key: "grid", icon: faTableCellsLarge },
                                { key: "list", icon: faList },
                            ] as const
                        ).map(({ key, icon }) => (
                            <button
                                key={key}
                                type="button"
                                aria-label={t(`view.${key}`)}
                                aria-pressed={view === key}
                                onClick={() => onViewChange(key)}
                                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                                    view === key
                                        ? "bg-primary-soft text-primary"
                                        : "text-fg-subtle hover:text-fg"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={icon}
                                    className="text-base"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
