import { getApi } from "~/config/axiosClient";
import type { CourseDetail } from "./courseDetail.type";

const USE_MOCK = true; // đổi false khi backend có endpoint

// Video YouTube dùng làm data test
export const TEST_VIDEO_ID = "2QNutWLmG_4";
export const TEST_VIDEO_URL = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;

const mockCourse: CourseDetail = {
    id: "python-basic",
    title: "Lập trình Python cơ bản",
    completedLessons: 14,
    totalLessons: 22,
    chapters: [
        {
            id: "c1",
            title: "Chương 1: Giới thiệu",
            locked: false,
            totalLessons: 3,
            lessons: [
                {
                    id: "l1-1",
                    title: "Bài 1: Cài đặt môi trường",
                    kind: "video",
                    duration: "10:05",
                    status: "completed",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l1-2",
                    title: "Bài 2: Hello World",
                    kind: "video",
                    duration: "08:40",
                    status: "completed",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l1-3",
                    title: "Bài 3: Biến và kiểu dữ liệu",
                    kind: "video",
                    duration: "12:10",
                    status: "completed",
                    videoUrl: TEST_VIDEO_URL,
                },
            ],
        },
        {
            id: "c2",
            title: "Chương 2: Cấu trúc điều khiển",
            locked: false,
            totalLessons: 4,
            lessons: [
                {
                    id: "l2-1",
                    title: "Bài 1: Cấu trúc rẽ nhánh if-elif-else",
                    kind: "video",
                    duration: "15:20",
                    status: "completed",
                    videoUrl: TEST_VIDEO_URL,
                    attachments: [
                        {
                            id: "att-1",
                            filename: "test.pdf",
                            sizeLabel: "2.4 MB",
                            label: "Bài giảng chính",
                            url: "/mock/test.pdf",
                        },
                        {
                            id: "att-2",
                            filename: "bai_tap.docx",
                            sizeLabel: "36 KB",
                            label: "Bài tập",
                            url: "/mock/bai_tap.docx",
                        },
                        {
                            id: "att-3",
                            filename: "slide_vong_lap.pptx",
                            sizeLabel: "28 KB",
                            label: "Slide bài giảng",
                            url: "/mock/slide_vong_lap.pptx",
                        },
                        {
                            id: "att-4",
                            filename: "bang_diem.xlsx",
                            sizeLabel: "5 KB",
                            label: "Dữ liệu mẫu",
                            url: "/mock/bang_diem.xlsx",
                        },
                        {
                            id: "att-5",
                            filename: "source_code.zip",
                            sizeLabel: "1 KB",
                            label: "Mã nguồn",
                            url: "/mock/source_code.zip",
                        },
                        {
                            id: "att-6",
                            filename: "ghi_chu.txt",
                            sizeLabel: "1 KB",
                            label: "Ghi chú",
                            url: "/mock/ghi_chu.txt",
                        },
                    ],
                },
                {
                    id: "l2-2",
                    title: "Bài 2: Vòng lặp for và hàm range() nâng cao trong Python",
                    kind: "video",
                    duration: "20:15",
                    status: "current",
                    videoUrl: TEST_VIDEO_URL,
                    note: "Đây là ghi chú cực quan trọng luonn đó nha",
                    code: {
                        filename: "demo_range_step.py",
                        content: `# Ví dụ 1: Duyệt qua các số chẵn trong khoảng từ 0 đến 8
for i in range(0, 10, 2):
    print(f"Bước nhảy hiện tại: {i}")

# Output terminal:
# Bước nhảy hiện tại: 0
# Bước nhảy hiện tại: 2 ... Bước nhảy hiện tại: 8`,
                    },
                },
                {
                    id: "l2-3",
                    title: "Bài 3: Vòng lặp while và kiểm soát ngắt loop",
                    kind: "video",
                    duration: "14:00",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l2-4",
                    title: "Bài 4: Kiểm tra trắc nghiệm vòng lặp",
                    kind: "quiz",
                    duration: "15",
                    quizQuestions: 10,
                    status: "todo",
                },
            ],
        },
        {
            id: "c3",
            title: "Chương 3: Cấu trúc dữ liệu",
            locked: false,
            totalLessons: 8,
            lessons: [
                {
                    id: "l3-1",
                    title: "Bài 1: List và các thao tác cơ bản",
                    kind: "video",
                    duration: "18:30",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-2",
                    title: "Bài 2: Slicing và sắp xếp list",
                    kind: "video",
                    duration: "14:45",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-3",
                    title: "Bài 3: Tuple và tính bất biến",
                    kind: "video",
                    duration: "11:20",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-4",
                    title: "Bài 4: Dictionary và cách duyệt key-value",
                    kind: "video",
                    duration: "19:10",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-5",
                    title: "Bài 5: Set và các phép toán tập hợp",
                    kind: "video",
                    duration: "13:05",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-6",
                    title: "Bài 6: List comprehension",
                    kind: "video",
                    duration: "16:40",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-7",
                    title: "Bài 7: Cấu trúc dữ liệu lồng nhau",
                    kind: "video",
                    duration: "17:25",
                    status: "todo",
                    videoUrl: TEST_VIDEO_URL,
                },
                {
                    id: "l3-8",
                    title: "Bài 8: Kiểm tra trắc nghiệm cấu trúc dữ liệu",
                    kind: "quiz",
                    duration: "20",
                    quizQuestions: 12,
                    status: "todo",
                },
            ],
        },
        {
            id: "c4",
            title: "Chương 4: Xử lý ngoại lệ",
            locked: true,
            totalLessons: 6,
            lessons: [],
        },
    ],
};

export const fetchCourseDetail = async (
    courseId: string,
): Promise<CourseDetail> => {
    if (USE_MOCK) {
        return new Promise((resolve) =>
            setTimeout(() => resolve(mockCourse), 300),
        );
    }
    // interceptor đã bóc sẵn body.data cho request GET; baseURL đã có /api
    return getApi<CourseDetail>(`/courses/${courseId}/curriculum`);
};
