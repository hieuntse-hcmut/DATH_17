import { getApi } from "../../../config/axiosClient";
import type { MyCourse } from "./myCourses.type";

/**
 * Đặt false khi backend đã có endpoint trả về danh sách khoá học của tôi
 * (map từ EnrollmentController -> MyEnrollmentResponse).
 */
const USE_MOCK = true;

const daysAgo = (d: number, hour = 20, minute = 15) => {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
};

const MOCK_COURSES: MyCourse[] = [
    {
        id: "py101",
        title: "Lập trình Python cơ bản",
        instructor: "TS. Nguyễn Thị Lan",
        department: "Khoa CNTT",
        credits: 3,
        semester: "II",
        lessonsDone: 14,
        lessonsTotal: 22,
        lastAccessedAt: daysAgo(1),
        status: "in_progress",
        nextLesson: {
            chapter: 3,
            lesson: 2,
            title: "Vòng lặp for và hàm range()",
        },
    },
    {
        id: "dsa201",
        title: "Cấu trúc dữ liệu & Giải thuật",
        instructor: "ThS. Trần Hoàng Nam",
        department: "Bộ môn Thuật toán",
        credits: 4,
        semester: "II",
        lessonsDone: 6,
        lessonsTotal: 20,
        lastAccessedAt: daysAgo(3),
        status: "in_progress",
        nextLesson: {
            chapter: 3,
            lesson: 1,
            title: "Cây nhị phân tìm kiếm (BST)",
        },
    },
    {
        id: "ai301",
        title: "Nhập môn Trí tuệ nhân tạo",
        instructor: "PGS. Lê Quốc Tuấn",
        department: "Lab AI & Data",
        credits: 3,
        semester: "II",
        lessonsDone: 2,
        lessonsTotal: 25,
        lastAccessedAt: daysAgo(7),
        status: "locked",
        unlock: {
            date: new Date(new Date().getFullYear(), 9, 20).toISOString(),
            chapter: 4,
        },
    },
    {
        id: "web101",
        title: "Lập trình Web căn bản",
        instructor: "ThS. Phạm Minh Châu",
        department: "Khoa CNTT",
        credits: 3,
        semester: "I",
        lessonsDone: 18,
        lessonsTotal: 18,
        lastAccessedAt: daysAgo(40),
        status: "completed",
    },
    {
        id: "db101",
        title: "Cơ sở dữ liệu",
        instructor: "TS. Đỗ Văn Hùng",
        department: "Khoa CNTT",
        credits: 3,
        semester: "I",
        lessonsDone: 24,
        lessonsTotal: 24,
        lastAccessedAt: daysAgo(55),
        status: "completed",
    },
];

export const fetchMyCourses = async (): Promise<MyCourse[]> => {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return MOCK_COURSES;
    }
    return getApi<MyCourse[]>("/enrollments/my");
};
