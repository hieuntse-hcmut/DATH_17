import { useState } from 'react';
import { useTranslation } from 'react-i18next'

import { useGetExample } from '~/services/example.query'
import ThemeToggle from '~/components/ThemeToggle'


export default function Home() {
    const { t } = useTranslation();
    const [limit, setLimit] = useState(0);

    const { data, isLoading, isError } = useGetExample(
        {
            _limit: limit},
        {
            staleTime: 60_000,
        }
    );

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error occurred</div>;

    return (
        <div className="px-16">
            <div className="flex justify-between ">
                <h1 className="text-xl font-bold">{t('nav.about')}</h1>
                <ThemeToggle />
            </div>
            <div className="flex items-center gap-4">
                <h2>Example Data - Current limit: {limit} </h2>
                <button className="h-10 w-40 bg-black text-white" onClick={() => setLimit((prev) => prev + 5)}>Load More Data</button>
            </div>
            <ul>
                {data && data.map((item: any) => (
                    <li key={item.id}>{item.title}</li>
                ))}
            </ul>
        </div>
    )
}