import type { DiscussionComment, DiscussionPayload } from './discussion.type'
import { getApi, postApi, putApi, deleteApi } from '~/config/axiosClient'

export const getCourseDiscussions = (courseId: number) => getApi<DiscussionComment[]>(`/courses/${courseId}/discussions`)

export const createDiscussionComment = (
  courseId: number,
  payload: DiscussionPayload,
) => 
  postApi<DiscussionComment>(`/courses/${courseId}/discussions`, payload)

export const updateDiscussionComment = (
  courseId: number,
  id: number,
  payload: DiscussionPayload
) => 
  putApi<DiscussionComment>(`/courses/${courseId}/discussions/${id}`, payload)

export const deleteDiscussionComment = (courseId: number, id: number) => deleteApi(`/courses/${courseId}/discussions/${id}`)
