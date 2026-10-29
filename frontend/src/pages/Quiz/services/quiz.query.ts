import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quizApi, getQuizByIndex } from "./quiz.api";
import type { AnswerMap } from "./quiz.type";

export const quizKeys = {
  list: (courseId: number) => ["quizzes", courseId] as const,
  attempts: (courseId: number) => ["quizAttempts", courseId] as const,
  attempt: (courseId: number, quizId: number) =>
    ["quizAttempt", courseId, quizId] as const,
};

export const useQuizzes = (courseId: number) =>
  useQuery({
    queryKey: quizKeys.list(courseId),
    queryFn: () => quizApi.list(courseId),
    enabled: Number.isFinite(courseId),
  });

export const useMyAttempts = (courseId: number) =>
  useQuery({
    queryKey: quizKeys.attempts(courseId),
    queryFn: () => quizApi.myAttempts(courseId),
    enabled: Number.isFinite(courseId),
  });

/**
 * POST nhưng dùng useQuery để React Query gộp các lần gọi trùng (StrictMode).
 * gcTime: 0 => rời trang là bỏ cache, vào lại sẽ hỏi server số giây còn lại.
 */
export const useStartAttempt = (
  courseId: number,
  quizId: number,
  enabled: boolean,
) => 
  useQuery({
    queryKey: quizKeys.attempt(courseId, quizId),
    queryFn: () => quizApi.start(courseId, quizId),
    enabled: enabled && Number.isFinite(courseId) && Number.isFinite(quizId),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useSaveAnswers = (courseId: number, quizId: number) =>
  useMutation({
    mutationFn: (v: { attemptId: number; answers: AnswerMap }) =>
      quizApi.saveAnswers(courseId, quizId, v.attemptId, v.answers),
  });

export const useSubmitAttempt = (courseId: number, quizId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { attemptId: number; answers: AnswerMap }) =>
      quizApi.submit(courseId, quizId, v.attemptId, v.answers),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: quizKeys.attempts(courseId) }),
  });
};

export const useGetQuizByIndex = (courseId: number, quizId: number, enabled?: boolean) => {
  return useQuery({
    queryKey: ["quizzes", quizId],
    queryFn: () => getQuizByIndex(courseId, quizId),
    enabled: enabled,
  })
}
