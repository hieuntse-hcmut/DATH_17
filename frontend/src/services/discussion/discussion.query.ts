import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDiscussionComment,
  deleteDiscussionComment,
  getCourseDiscussions,
  updateDiscussionComment,
} from './discussion.api'
import type { DiscussionInput } from './discussion.type'

const discussionQueryKey = (courseId: number) => ['discussions', courseId] as const

export const useGetCourseDiscussions = (courseId?: number) =>
  useQuery({
    queryKey: ['discussions', courseId],
    queryFn: courseId === undefined ? skipToken : () => getCourseDiscussions(courseId),
  })

export const useCreateDiscussionComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, input }: { courseId: number; input: DiscussionInput }) =>
      createDiscussionComment(courseId, input),
    onSuccess: (_comment, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: discussionQueryKey(courseId) }),
  })
}

export const useUpdateDiscussionComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseId,
      id,
      content,
    }: {
      courseId: number
      id: number
      content: string
    }) => updateDiscussionComment(courseId, id, content),
    onSuccess: (_comment, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: discussionQueryKey(courseId) }),
  })
}

export const useDeleteDiscussionComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, id }: { courseId: number; id: number }) =>
      deleteDiscussionComment(courseId, id),
    onSuccess: (_result, { courseId }) =>
      queryClient.invalidateQueries({ queryKey: discussionQueryKey(courseId) }),
  })
}
