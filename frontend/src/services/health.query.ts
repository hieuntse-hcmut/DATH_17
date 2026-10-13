import { useQuery } from '@tanstack/react-query';

import { getHealth } from '~/services/health.api';
import type { IPostExample } from '~/services/example.type';

export const useGetHealth = (options?: any) => {
    return useQuery<IPostExample[]>({
        queryKey: ['health'],
        queryFn: () => getHealth(),
        ...options
    });
}