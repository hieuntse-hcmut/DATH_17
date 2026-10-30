import { getApi, postApi, putApi } from "../../../config/axiosClient";
import type {
  AnswerMap,
  AttemptResult,
  AttemptStart,
  AttemptSummary,
  Quiz,
  QuizDetail
} from "./quiz.type";

export const quizApi = {
  list: (courseId: number) => getApi<Quiz[]>(`/courses/${courseId}/quizzes`),

  /** Lịch sử các lượt làm của sinh viên hiện tại trong khóa học */
  myAttempts: (courseId: number) =>
    getApi<AttemptSummary[]>(`/courses/${courseId}/my-attempts`),

  /** Bắt đầu lượt mới hoặc tiếp tục lượt đang làm dở */
  start: (courseId: number, quizId: number) =>
    postApi<AttemptStart>(`/courses/${courseId}/quizzes/${quizId}/attempts`),

  /** Tự động lưu đáp án */
  saveAnswers: (
    courseId: number,
    quizId: number,
    attemptId: number,
    answers: AnswerMap,
  ) =>
    putApi<void>(
      `/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/answers`,
      { answers },
    ),

  submit: (
    courseId: number,
    quizId: number,
    attemptId: number,
    answers: AnswerMap,
  ) =>
    postApi<AttemptResult>(
      `/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/submit`,
      { answers },
    ),
};

export const getQuizByIndex = (courseId: number, quizId: number) => getApi<QuizDetail>(`/courses/${courseId}/quizzes/${quizId}`)
