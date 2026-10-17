export type CourseStatus = 'ACTIVE'
export type PublicationState = 'PUBLISHED'

export interface Enrollment {
  courseDescription: string
  courseId: number
  courseTitle: string
  enrolledAt: string
  enrollmentId: number
  publicationState: PublicationState
  status: CourseStatus
}

export interface CurrentLesson {
  courseTitle: string
  chapter: number
  title: string
  description: string
  thumbnail?: string
  position: string
  duration: string
  progress: number
  attachmentCount: number
  studiedHoursAgo: number
}
