import { useTranslation } from "react-i18next";
import AuthShowcase from "~/pages/Auth/components/AuthShowcase"

export default function Home() {
    const { t } = useTranslation("home");

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">

            <section aria-labelledby="my-courses">
                <AuthShowcase needClassname={false}/>
            </section>
        </div>
    );
}
