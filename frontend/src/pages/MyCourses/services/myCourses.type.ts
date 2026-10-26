export type CourseTab = "learning" | "completed";
export type CourseSort = "name" | "progress"; // Tạm thời ko có "recent"
export type CourseView = "grid" | "list";

export interface ICourse {
    id: number
    title: string
    instructorName: string
    totalLesson: number
    completeLesson: number
    progressPercent: number
}

export interface CourseCardProps {
    course: ICourse;
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