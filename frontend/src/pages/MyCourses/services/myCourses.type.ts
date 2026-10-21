export type CourseStatus = "in_progress" | "locked" | "completed";
export type CourseTab = "learning" | "completed";
export type CourseSort = "recent" | "name" | "progress";
export type CourseView = "grid" | "list";

export interface MyCourse {
    id: string;
    title: string;
    instructor: string;
    department: string;
    thumbnailUrl?: string | null;
    credits: number;
    semester: string;
    lessonsDone: number;
    lessonsTotal: number;
    lastAccessedAt: string;
    status: CourseStatus;
    nextLesson?: { chapter: number; lesson: number; title: string } | null;
    unlock?: { date: string; chapter: number } | null; // dùng cho status = locked
}

export interface CourseCardProps {
    course: MyCourse;
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