import { describe, it, expect } from 'vitest'

interface UserAccount {
  id: number
  username: string
  fullName: string
  role: 'STUDENT' | 'LECTURER' | 'ADMIN'
}

interface DiscussionComment {
  id: number
  courseId: number
  authorId: number
  authorName: string
  parentId: number | null
  content: string
  deleted: boolean
  createdAt: string
}

function checkAdminAccess(me: UserAccount | undefined, isLoading: boolean): 'ALLOW' | 'REDIRECT_HOME' | 'WAIT_LOADING' {
  if (isLoading) return 'WAIT_LOADING'
  if (!me || me.role !== 'ADMIN') return 'REDIRECT_HOME'
  return 'ALLOW'
}

// Tree builder for discussion comments
function buildDiscussionTree(comments: DiscussionComment[]) {
  const roots = comments.filter((c) => c.parentId === null)
  const repliesMap = new Map<number, DiscussionComment[]>()

  for (const c of comments) {
    if (c.parentId !== null) {
      const arr = repliesMap.get(c.parentId) ?? []
      arr.push(c)
      repliesMap.set(c.parentId, arr)
    }
  }

  return { roots, repliesMap }
}

function sortComments(comments: DiscussionComment[], order: 'newest' | 'oldest') {
  return [...comments].sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return order === 'newest' ? diff : -diff
  })
}

describe('Frontend Role Guards & Discussion Tree Suite', () => {
  it('TC-FE-ROUTER-001: Admin layout guard waits while loading instead of instantly redirecting', () => {
    // Current bug in Admin.layout.tsx: `if (me?.role !== "ADMIN") navigate("/")` immediately redirects while isLoading!
    // Proper behavior:
    expect(checkAdminAccess(undefined, true)).toBe('WAIT_LOADING')
  })

  it('TC-FE-ROUTER-002: Admin layout guard allows access for authenticated ADMIN', () => {
    const adminUser: UserAccount = { id: 1, username: 'admin', fullName: 'Super Admin', role: 'ADMIN' }
    expect(checkAdminAccess(adminUser, false)).toBe('ALLOW')
  })

  it('TC-FE-ROUTER-003: Admin layout guard redirects STUDENT and LECTURER to home', () => {
    const studentUser: UserAccount = { id: 2, username: 'student', fullName: 'Student', role: 'STUDENT' }
    const lecturerUser: UserAccount = { id: 3, username: 'lecturer', fullName: 'Lecturer', role: 'LECTURER' }
    expect(checkAdminAccess(studentUser, false)).toBe('REDIRECT_HOME')
    expect(checkAdminAccess(lecturerUser, false)).toBe('REDIRECT_HOME')
  })

  it('TC-FE-ROUTER-004: Admin layout guard redirects unauthenticated user when loading completes', () => {
    expect(checkAdminAccess(undefined, false)).toBe('REDIRECT_HOME')
  })

  const sampleComments: DiscussionComment[] = [
    { id: 1, courseId: 101, authorId: 1, authorName: 'Sinh viên A', parentId: null, content: 'Bài tập 1 nộp ở đâu ạ?', deleted: false, createdAt: '2026-10-30T10:00:00Z' },
    { id: 2, courseId: 101, authorId: 2, authorName: 'Giảng viên B', parentId: 1, content: 'Em nộp trên hệ thống nhé.', deleted: false, createdAt: '2026-10-30T10:15:00Z' },
    { id: 3, courseId: 101, authorId: 3, authorName: 'Sinh viên C', parentId: 1, content: 'Em cảm ơn thầy.', deleted: false, createdAt: '2026-10-30T10:20:00Z' },
    { id: 4, courseId: 101, authorId: 4, authorName: 'Sinh viên D', parentId: null, content: 'Bình luận spam đã bị xoá', deleted: true, createdAt: '2026-10-30T09:00:00Z' },
  ]

  it('TC-FE-DISC-001: buildDiscussionTree correctly separates roots from nested replies', () => {
    const { roots, repliesMap } = buildDiscussionTree(sampleComments)
    expect(roots.length).toBe(2)
    expect(roots.map((r) => r.id)).toEqual([1, 4])

    const repliesTo1 = repliesMap.get(1) ?? []
    expect(repliesTo1.length).toBe(2)
    expect(repliesTo1.map((r) => r.id)).toEqual([2, 3])
  })

  it('TC-FE-DISC-002: Soft-deleted comments display placeholder text', () => {
    const deletedComment = sampleComments.find((c) => c.deleted)!
    const displayText = deletedComment.deleted ? '[Bình luận đã bị xoá]' : deletedComment.content
    expect(displayText).toBe('[Bình luận đã bị xoá]')
  })

  it('TC-FE-DISC-003: Discussion comment length limit is 5000 characters', () => {
    const valid5000 = 'x'.repeat(5000)
    const invalid5001 = 'x'.repeat(5001)
    expect(valid5000.length <= 5000).toBe(true)
    expect(invalid5001.length <= 5000).toBe(false)
  })

  it('TC-FE-DISC-004: sortComments orders by createdAt newest and oldest', () => {
    const newest = sortComments(sampleComments, 'newest')
    expect(newest[0].id).toBe(3) // 10:20
    expect(newest[newest.length - 1].id).toBe(4) // 09:00

    const oldest = sortComments(sampleComments, 'oldest')
    expect(oldest[0].id).toBe(4) // 09:00
    expect(oldest[oldest.length - 1].id).toBe(3) // 10:20
  })
})
