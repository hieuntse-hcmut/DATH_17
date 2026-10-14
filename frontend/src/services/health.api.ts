import { getApi } from '~/config/axiosClient'

export const getHealth = () => {
    return getApi<string>('/health')
}