import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import GreetingHeader from "./components/GreetingHeader";
import ContinueLearningCard from "./components/ContinueLearningCard";
import CourseCard from "./components/CourseCard";
import { useGetEnrollMe } from "./services/home.query";
import { mockCurrentLesson, mockCourses } from "./data";

export default function Home() {
    const { t } = useTranslation("home");
    const { data: enrollMeList } = useGetEnrollMe();

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
            <GreetingHeader name={"test"} />

            <ContinueLearningCard lesson={mockCurrentLesson} />

            <section aria-labelledby="my-courses">
                <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <h2
                            id="my-courses"
                            className="text-xl font-bold text-fg"
                        >
                            {t("courses.title")}
                        </h2>
                        <p className="text-sm text-fg-muted">
                            {t("courses.subtitle", {
                                count: mockCourses.length,
                            })}
                        </p>
                    </div>
                    <a
                        href="#"
                        className="flex items-center gap-1 text-sm font-semibold text-link hover:underline"
                    >
                        {t("courses.viewAll")}
                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-sm"
                        />{" "}
                    </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {enrollMeList &&
                        typeof enrollMeList !== "string" &&
                        enrollMeList?.map((c) => (
                            <CourseCard key={c.enrollmentId} course={c} />
                        ))}
                </div>
            </section>
        </div>
    );
}
