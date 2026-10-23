export interface DiscussionComment {
  id: number
  courseId: number
  authorId: number
  authorName: string
  parentId: number | null
  content: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface DiscussionInput {
  content: string
  parentId?: number
}
