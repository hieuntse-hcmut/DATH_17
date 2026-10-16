import { getApi, postApi } from '~/config/axiosClient'

export const getHealth = () => {
    return getApi<string>('/health')
}

export const getCourse = () => {
    return getApi<string>('/courses/1')
}

export const enrollCourse = async (id: number) => {
    return await postApi<string>(`/courses/${id}/enroll`)
}