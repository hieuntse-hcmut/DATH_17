import { useMutation, useQuery } from '@tanstack/react-query';

import { enrollCourse, getCourse, getHealth } from '~/services/health.api';
import type { IPostExample } from '~/services/example.type';

export const useGetHealth = (options?: any) => {
    return useQuery<IPostExample[]>({
        queryKey: ['health'],
        queryFn: () => getHealth(),
        ...options
    });
}

export const useGetCourse = (options?: any) => {
    return useQuery<IPostExample[]>({
        queryKey: ['courses'],
        queryFn: () => getCourse(),
        ...options
    });
}

export const useEnrollCourse = () => {
    return useMutation({
        mutationFn: (id: number) => enrollCourse(id),
        onSuccess: (mess) => {
            console.log(mess)
        }
    })
}