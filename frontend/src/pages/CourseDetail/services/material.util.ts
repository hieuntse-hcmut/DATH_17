import type { IMaterial } from "./courseDetail.type";

export const isVideoMaterial = (m: IMaterial) =>
  !!m.fileType?.toLowerCase().includes("video") || /youtu\.?be/.test(m.fileUrl);
