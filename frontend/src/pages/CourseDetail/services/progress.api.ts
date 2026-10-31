import { putApi } from "~/config/axiosClient";
import type { IPostCompleteLesson } from "./courseDetail.type";

// Vị trí cuối đã gửi theo từng bài trong phiên làm việc này
const lastSent = new Map<number, number>();

// Dùng làm startAt khi quay lại bài vừa xem (dữ liệu server chưa kịp refetch)
export const getSentPosition = (lessonId: number) =>
  lastSent.get(lessonId) ?? 0;

export const saveProgress = async (
  lessonId: number,
  furthest: number,
  duration: number,
): Promise<IPostCompleteLesson | undefined> => {
  const totalLength = Math.floor(duration);
  // ceil + floor để 90% phía client luôn >= 90% phía server
  const position =
    totalLength > 0
      ? Math.min(Math.ceil(furthest), totalLength)
      : Math.ceil(furthest);

  const prev = lastSent.get(lessonId);
  if (prev !== undefined && position <= prev) return undefined; // chưa có tiến triển
  lastSent.set(lessonId, position);

  try {
    return await putApi<IPostCompleteLesson>(`/lessons/${lessonId}/progress`, {
      position,
      ...(totalLength > 0 && { totalLength }),
    });
  } catch (err) {
    // lỗi thì trả về mốc cũ để lần sau (5 giây) gửi lại
    if (prev === undefined) lastSent.delete(lessonId);
    else lastSent.set(lessonId, prev);
    throw err;
  }
};
export const resetProgressCache = () => lastSent.clear();
