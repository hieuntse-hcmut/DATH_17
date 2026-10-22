export interface IChapter {
  id: number
  courseId: number
  title: string
  orderIndex: number
}

export interface ILesson {
  id: number
  chapterId: number
  title: string
  orderIndex: number
}

export interface IMaterial {
  id: number
  lessonId: number
  title: string
  fileUrl: string
  fileType: string
}

export interface IPostCompleteLesson {
  lessonId: number
  courseId: number
  completed: boolean
  lastPosition: number
  courseCompletedLessons: number
  courseTotalLessons: number
  courseProgressPercent: number
}

export interface IChapterWithLessons extends IChapter {
  lessons: ILesson[]
  totalLessons?: number;
  completedLessons?: number;
}

export interface ILessonProgress {
  lessonId: number
  lessonTitle: string
  contentType: 'VIDEO' | 'DOCUMENT' | string
  chapterId: number
  chapterTitle: string
  completed: boolean
  lastPosition: number
  lastAccessedAt: string
}

export interface ICourseProgressSummary {
  courseId: number
  courseTitle: string
  studentId: number
  totalLessons: number
  completedLessons: number
  progressPercent: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | string
  resumeLessonId: number
  resumeLessonTitle: string
  resumePosition: number
}

export interface ICourseProgress extends ICourseProgressSummary {
  lessons: ILessonProgress[]
}

export interface ILessonWithProgress extends ILesson {
  completed: boolean
  lastPosition: number
  contentType?: string
}

export interface IChapterWithProgress extends IChapter {
  lessons: ILessonWithProgress[]
  totalLessons: number
  completedLessons: number
  isCompleted: boolean
}

export interface ICourseTocWithProgress {
  chapters: IChapterWithProgress[]
  progressSummary: ICourseProgressSummary
}
