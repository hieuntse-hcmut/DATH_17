export type LessonKind = "video" | "quiz";
export type LessonStatus = "completed" | "current" | "todo";

export interface Lesson {
    id: string;
    title: string;
    kind: LessonKind;
    duration: string; // "15:20"
    quizQuestions?: number;
    status: LessonStatus;
    videoUrl?: string;
    note?: string;
    code?: { filename: string; content: string };
}

export interface Chapter {
    id: string;
    title: string;
    locked: boolean;
    totalLessons: number;
    lessons: Lesson[];
}

export interface CourseDetail {
    id: string;
    title: string;
    chapters: Chapter[];
    completedLessons: number;
    totalLessons: number;
}
export interface Attachment {
    id: string;
    filename: string;
    sizeLabel: string;
    label?: string;
    url: string;
}

export interface Lesson {
    id: string;
    title: string;
    kind: LessonKind;
    duration: string;
    quizQuestions?: number;
    status: LessonStatus;
    videoUrl?: string;
    note?: string;
    code?: { filename: string; content: string };
    attachments?: Attachment[];
}
