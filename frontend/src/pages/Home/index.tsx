import { useState } from 'react';
import { useTranslation } from 'react-i18next'

import { useEnrollCourse, useGetCourse, useGetHealth } from '~/services/health.query'
import ThemeToggle from '~/components/ThemeToggle'


export default function Home() {
    const { t } = useTranslation();
    const [limit, setLimit] = useState(0);

    const { data: healthData, isLoading: isHealthLoading, isError: isHealthError } = useGetCourse();
    console.log('Health Data:', healthData, 'Loading:', isHealthLoading, 'Error:', isHealthError);
    const { mutate, error} = useEnrollCourse();
    
    return (
        <div className="px-16">
            <button onClick={() => mutate(2)}>click me</button>
            <div className="flex items-center">
                <h1 className="text-xl font-bold pr-4">Username: </h1>
                <h1 className="text-xl font-bold pr-10">{localStorage.getItem('username')}</h1>
                <ThemeToggle />
            </div>
            <div className="flex items-center gap-4">
                <h2>Example Data - Current limit: {limit} </h2>
                <button className="h-10 w-40 bg-black text-white" onClick={() => setLimit((prev) => prev + 5)}>Load More Data</button>
            </div>
        </div>
    )
}