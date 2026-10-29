export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

export interface QuizOption {
  id: number;
  content: string;
  correct?: boolean | null; // null với sinh viên
  orderIndex: number;
}

export interface QuizQuestion {
  id: number;
  courseId: number;
  content: string;
  type: QuestionType;
  options: QuizOption[]; // rỗng với SHORT_ANSWER
}

export interface Quiz {
  id: number;
  courseId: number;
  title: string;
  status: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null; // null = không giới hạn
  maxAttempts: number;
}

export interface QuizQuestionItem {
  question: QuizQuestion;
  orderIndex: number;
  points: number;
}

export interface QuizDetail {
  quiz: Quiz;
  questions: QuizQuestionItem[];
}

/** SINGLE/TRUE_FALSE: number · MULTIPLE: number[] · SHORT_ANSWER: string */
export type AnswerValue = number | number[] | string;
export type AnswerMap = Record<number, AnswerValue>;
export type QuestionStatus = "flagged" | "answered" | "unanswered";

export const isAnswered = (v?: AnswerValue) =>
  v === undefined
    ? false
    : typeof v === "string"
      ? v.trim() !== ""
      : Array.isArray(v)
        ? v.length > 0
        : true;

/** Phản hồi của POST .../attempts */
export interface AttemptStart {
  attemptId: number;
  attemptNumber: number;
  remainingSeconds: number | null;
  quiz: QuizDetail;
  savedAnswers: Record<string, string>; // questionId -> JSON text của đáp án đã lưu
}

export interface AnswerResult {
  questionId: number;
  correct: boolean | null; // null = chờ giảng viên chấm
  score: number | null;
}

export interface AttemptResult {
  attemptId: number;
  status: string;
  score: number;
  totalPoints: number;
  pendingCount: number;
  answers: AnswerResult[];
}

export interface AttemptSummary {
  attemptId: number;
  quizId: number;
  attemptNumber: number;
  status: string; // IN_PROGRESS | SUBMITTED | GRADED
  score: number | null;
  totalPoints: number;
  startTime: string;
  submitTime: string | null;
}
