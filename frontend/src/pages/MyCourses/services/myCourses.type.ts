export type CourseTab = "learning" | "completed";
export type CourseSort = "recent" | "name" | "progress";
export type CourseView = "grid" | "list";

export interface ICourseProgress {
    courseId: number
    courseTitle: string
    instructorName: string
    totalLessons: number
    completedLessons: number
    progressPercent: number
    status: string
    enrolledAt: string
    lastAccessedAt: any
    lastLessonId: any
    lastLessonTitle: any
}

export interface CourseCardProps {
    course: ICourseProgress;
    layout: CourseView;
}

export interface CourseToolbarProps {
    tab: CourseTab;
    onTabChange: (tab: CourseTab) => void;
    learningCount: number;
    completedCount: number;
    keyword: string;
    onKeywordChange: (value: string) => void;
    sort: CourseSort;
    onSortChange: (value: CourseSort) => void;
    view: CourseView;
    onViewChange: (value: CourseView) => void;
}