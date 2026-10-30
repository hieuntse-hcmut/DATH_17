import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { IQuizCreatePayload, QuizDetail, IQuizQuestionPayload, QuizQuestion } from "./quiz.type";
import { api } from "~/config/axiosClient";

export const useCreateQuiz = (courseId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IQuizCreatePayload) =>
      api.post<QuizDetail>(`/courses/${courseId}/quizzes`, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes", courseId] }),
  });
};

export const useCreateQuestion = (courseId: number) =>
  useMutation({
    mutationFn: (p: IQuizQuestionPayload) =>
      api.post<QuizQuestion>(`/courses/${courseId}/questions`, p),
  });

export const usePublishQuestion = (courseId: number, quizId: number) =>
  useMutation({
    mutationFn: () =>
      api.post<QuizDetail>(`/courses/${courseId}/quizzes/${quizId}/publish`),
  });