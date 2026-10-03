import { useQuery } from '@tanstack/react-query';

import { getExample } from '~/services/example.api';
import type { IPostExample } from '~/services/example.type';

export const useGetExample = (params?: Record<string, unknown>, options?: any) => {
    return useQuery<IPostExample[]>({
        queryKey: ['example', params],
        queryFn: () => getExample(params),
        ...options
    });
}