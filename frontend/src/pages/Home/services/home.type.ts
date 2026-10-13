export type CourseStatus = 'inProgress' | 'notStarted' | 'completed'

export interface Course {
  id: string
  title: string
  instructor: string
  thumbnail?: string
  status: CourseStatus
  completedLessons: number
  totalLessons: number
  isCurrent?: boolean
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
