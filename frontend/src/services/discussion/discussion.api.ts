import axios from 'axios'
import type { DiscussionComment, DiscussionInput } from './discussion.type'

const discussionTestApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

export const getCourseDiscussions = async (courseId: number) => {
  const response = await discussionTestApi.get<DiscussionComment[]>(
    `/courses/${courseId}/discussions`,
  )
  return response.data
}

export const createDiscussionComment = async (
  courseId: number,
  input: DiscussionInput,
) => {
  const response = await discussionTestApi.post<DiscussionComment>(
    `/courses/${courseId}/discussions`,
    input,
  )
  return response.data
}

export const updateDiscussionComment = async (
  courseId: number,
  id: number,
  content: string,
) => {
  const response = await discussionTestApi.put<DiscussionComment>(
    `/courses/${courseId}/discussions/${id}`,
    { content },
  )
  return response.data
}

export const deleteDiscussionComment = async (courseId: number, id: number) => {
  await discussionTestApi.delete(`/courses/${courseId}/discussions/${id}`)
}
