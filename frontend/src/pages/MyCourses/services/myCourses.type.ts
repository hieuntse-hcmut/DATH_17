export type CourseStatus = 'in_progress' | 'locked' | 'completed';

export interface MyCourse {
  id: string;
  title: string;
  instructor: string;
  department: string;
  thumbnailUrl?: string | null;
  credits: number;
  semester: string; // vd: "II"
  lessonsDone: number;
  lessonsTotal: number;
  lastAccessedAt: string; // ISO date
  status: CourseStatus;
  nextLesson?: { chapter: number; lesson: number; title: string } | null;
  unlock?: { date: string; chapter: number } | null; // dùng cho status = locked
}

export type CourseSort = 'recent' | 'name' | 'progress';
export type CourseView = 'grid' | 'list';
