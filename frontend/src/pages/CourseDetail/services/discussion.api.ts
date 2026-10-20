import type { DiscussionAuthor, DiscussionComment } from "./discussion.type";

export const CURRENT_USER: DiscussionAuthor = {
    id: "me",
    name: "Nguyễn Văn Minh",
};

const minutesAgo = (m: number) =>
    new Date(Date.now() - m * 60_000).toISOString();

const baseDiscussion = (): DiscussionComment[] => [
    {
        id: "d1",
        author: { id: "u1", name: "Đỗ Khánh Linh", tag: "K66-KTPM" },
        content:
            "Em đã thử áp dụng cách chuyển sang vòng lặp while như thầy Nam hướng dẫn và giảm được hoàn toàn lỗi `RecursionError` khi chạy với `N = 10000` ! Cảm ơn thầy nhiều ạ! 🎉",
        createdAt: minutesAgo(45),
        likes: 2,
        likedByMe: false,
        replies: [],
    },
    {
        id: "d2",
        author: { id: "u2", name: "Nguyễn Văn Minh", tag: "K66-KTPM" },
        content:
            "Thưa thầy, vậy trong các ngôn ngữ đại trên máy ảo JVM như Scala hay Kotlin thì compiler hỗ trợ tối ưu khóa gì để ép buộc kiểm tra đệ quy đuôi ngay lúc biên dịch ạ?",
        createdAt: minutesAgo(25),
        likes: 1,
        likedByMe: false,
        replies: [
            {
                id: "d2-1",
                author: { id: "u3", name: "Hoàng Quốc Bảo", tag: "Giảng viên" },
                content:
                    "Trong Kotlin có từ khóa `tailrec` đó bạn Minh ơi. Nếu hàm không thực sự là tail call thì compiler sẽ báo cảnh báo ngay.",
                createdAt: minutesAgo(10),
                likes: 0,
                likedByMe: false,
                replies: [],
            },
        ],
    },
];

// Bình luận dài để test cuộn
const NAMES = [
    "Trần Minh Anh",
    "Lê Quang Huy",
    "Phạm Thu Hà",
    "Vũ Đức Thịnh",
    "Ngô Bảo Châu",
    "Bùi Gia Hân",
];
const SAMPLES = [
    "Cho em hỏi `range(0, 10, 2)` thì số 10 có được in ra không ạ?",
    "Em chạy `for i in range(10, 0, -1)` thì đếm ngược được, mọi người thử xem nhé! 👍",
    "Thầy ơi, khi nào nên dùng `enumerate()` thay cho `range(len(...))` ạ?",
    "Bài này mình thấy **bước nhảy âm** là phần dễ nhầm nhất.",
    "Cảm ơn thầy, phần `range()` nâng cao giải thích rất dễ hiểu ạ!",
    "Có cách nào dùng `range` với số thực không ạ? Em thử `range(0, 1, 0.1)` thì báo lỗi.",
];

const longDiscussion = (): DiscussionComment[] => [
    ...baseDiscussion(),
    ...Array.from(
        { length: 12 },
        (_, i): DiscussionComment => ({
            id: `long-${i}`,
            author: {
                id: `ux${i}`,
                name: NAMES[i % NAMES.length],
                tag: "K66-KTPM",
            },
            content: SAMPLES[i % SAMPLES.length],
            createdAt: minutesAgo(60 + i * 37),
            likes: (i * 3) % 7,
            likedByMe: false,
            replies:
                i % 3 === 0
                    ? [
                          {
                              id: `long-${i}-r1`,
                              author: {
                                  id: "u3",
                                  name: "Hoàng Quốc Bảo",
                                  tag: "Giảng viên",
                              },
                              content:
                                  "Bạn thử chạy lại và in kết quả ra xem nhé, mình sẽ giải thích thêm trên lớp.",
                              createdAt: minutesAgo(30 + i * 37),
                              likes: 1,
                              likedByMe: false,
                              replies: [],
                          },
                      ]
                    : [],
        }),
    ),
];

// TODO: thay bằng getApi<DiscussionComment[]>(`/lessons/${lessonId}/discussions`)
export const getMockDiscussion = (lessonId: string): DiscussionComment[] => {
    if (lessonId === "l2-2") return longDiscussion();
    if (lessonId === "l2-3") return [];
    return baseDiscussion();
};
