import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDiscussionComment,
  deleteDiscussionComment,
  getCourseDiscussions,
  updateDiscussionComment,
} from './discussion.api'
import type { DiscussionPayload } from './discussion.type'

const discussionQueryKey = (courseId: number) => ['discussions', courseId] as const

export const useGetCourseDiscussions = (courseId?: number) =>
  useQuery({
    queryKey: ['discussions', courseId],
    queryFn: courseId === undefined ? skipToken : () => getCourseDiscussions(courseId),
  })

export const useCreateDiscussionComment = (courseId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: DiscussionPayload ) => createDiscussionComment(courseId!, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: discussionQueryKey(courseId!) }),
  })
}

export const useUpdateDiscussionComment = (courseId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      id: number
      content: string
      parentId?: number
    }) => updateDiscussionComment(courseId!, payload.id, {
      content: payload.content,
      parentId: payload.parentId
    }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: discussionQueryKey(courseId!) }),
  })
}

export const useDeleteDiscussionComment = (courseId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteDiscussionComment(courseId!, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: discussionQueryKey(courseId!) }),
  })
}
