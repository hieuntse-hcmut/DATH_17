export interface DiscussionAuthor {
    id: string;
    name: string;
    avatarUrl?: string;
    tag?: string; // ví dụ: "K66-KTPM"
}

export interface DiscussionComment {
    id: string;
    author: DiscussionAuthor;
    content: string; // Markdown nhẹ: **đậm**, *nghiêng*, __gạch chân__, `code`, [text](url)
    createdAt: string; // ISO
    likes: number;
    likedByMe: boolean;
    replies: DiscussionComment[];
}
import type { Attachment } from "./courseDetail.type";

export interface DiscussionAuthor {
    id: string;
    name: string;
    avatarUrl?: string;
    tag?: string;
}

export interface DiscussionComment {
    id: string;
    author: DiscussionAuthor;
    content: string;
    createdAt: string;
    likes: number;
    likedByMe: boolean;
    attachments?: Attachment[];
    replies: DiscussionComment[];
}
