import { useQuery } from '@tanstack/react-query';

import { getExample } from '~/services/example.api';

export const useGetExample = (params?: Record<string, unknown>, options?: any) => {
    return useQuery({
        queryKey: ['example', params],
        queryFn: () => getExample(params),
        ...options
    });
}