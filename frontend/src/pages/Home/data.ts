import type { Course, CurrentLesson } from './services/home.type'

export const mockUser = { name: 'Minh', streak: 6, xp: 1420 }

export const mockCurrentLesson: CurrentLesson = {
  courseTitle: 'Lập trình Python cơ bản',
  chapter: 3,
  title: 'Bài 2: Vòng lặp for và hàm range() nâng cao',
  description:
    'Nắm vững kỹ thuật duyệt tuần tự danh sách lồng nhau, bước nhảy âm trong chuỗi và áp dụng vào bài toán thực tế.',
  position: '12:34',
  duration: '20:15',
  progress: 62,
  attachmentCount: 2,
  studiedHoursAgo: 2,
}

export const mockCourses: Course[] = [
  { id: '1', title: 'Lập trình Python cơ bản', instructor: 'TS. Nguyễn Thị Lan', status: 'inProgress', completedLessons: 14, totalLessons: 22, isCurrent: true },
  { id: '2', title: 'Cấu trúc dữ liệu & Giải thuật', instructor: 'ThS. Trần Hoàng Nam', status: 'inProgress', completedLessons: 6, totalLessons: 20 },
  { id: '3', title: 'Nhập môn Trí tuệ nhân tạo', instructor: 'PGS. Lê Quốc Tuấn', status: 'notStarted', completedLessons: 2, totalLessons: 25 },
  { id: '4', title: 'Toán rời rạc & Lý thuyết đồ thị', instructor: 'TS. Đặng Vũ Minh', status: 'completed', completedLessons: 18, totalLessons: 18 },
]
