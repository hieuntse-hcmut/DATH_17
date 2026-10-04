import { getApi } from '~/config/axiosClient';

export const getExample = (params?: Record<string, unknown>) => {
    const url = "posts"
    return getApi(`/${url}`, params);
}
