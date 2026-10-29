export type QuestionType = "SINGLE_CHOICE";

export interface QuizOption {
  id: number;
  content: string;
  correct?: boolean | null; // null với sinh viên
  orderIndex: number;
}

export interface IQuizOptionPayload {
  content: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: number;
  courseId: number;
  content: string;
  type: QuestionType;
  options: QuizOption[];
}

export interface IQuizQuestionPayload {
  content: string;
  type: QuestionType;
  options: IQuizOptionPayload[];
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

export interface IQuizQuestionItemPayload {
  question: IQuizQuestionPayload;
}

export interface QuizDetail {
  quiz: Quiz;
  questions: QuizQuestionItem[];
}

export interface IQuizCreatePayload {
  title: string;
  startTime: string | null; // ISO
  endTime: string | null;
  durationMinutes: number | null;
  maxAttempts: number;
  questions: { questionId: number; points: number }[];
}

/** id của option đã chọn */
export type AnswerValue = number;
export type AnswerMap = Record<number, AnswerValue>;
export type QuestionStatus = "flagged" | "answered" | "unanswered";

export const isAnswered = (v?: AnswerValue) => v !== undefined;

/** Phản hồi của POST .../attempts */
export interface AttemptStart {
  attemptId: number;
  attemptNumber?: number;
  remainingSeconds?: number | null;
  quiz: QuizDetail;
  savedAnswers?: Record<string, string>; // questionId -> JSON text của đáp án đã lưu
}

export interface AnswerResult {
  questionId: number;
  correct: boolean;
  score: number;
}

export interface AttemptResult {
  attemptId: number;
  status: string;
  score: number;
  totalPoints: number;
  answers: AnswerResult[];
}

export interface AttemptSummary {
  attemptId: number;
  quizId: number;
  attemptNumber: number;
  status: string; // IN_PROGRESS | GRADED
  score: number | null;
  totalPoints: number;
  startTime: string;
  submitTime: string | null;
}
