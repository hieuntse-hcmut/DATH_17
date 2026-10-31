import { describe, it, expect } from 'vitest'

// Quiz helpers
const pad = (n: number) => String(n).padStart(2, '0')
const formatTime = (totalSeconds: number) => `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`
const isUrgent = (totalSeconds: number) => totalSeconds <= 60

type AnswerMap = Record<number, number>
const isAnswered = (answers: AnswerMap, qId: number) => answers[qId] !== undefined && answers[qId] !== null

interface NotificationItem {
  id: number
  type: string
  title: string
  read: boolean
  link?: string
}

function filterNotifications(list: NotificationItem[], tab: 'all' | 'courses' | 'discussion' | 'unread') {
  return list.filter((item) => {
    if (tab === 'courses') {
      return ['ENROLLED_BY_STAFF', 'REMOVED_FROM_COURSE', 'COURSE_COMPLETED', 'NEW_CONTENT'].includes(item.type)
    }
    if (tab === 'discussion') return item.type === 'FORUM_REPLY'
    if (tab === 'unread') return !item.read
    return true
  })
}

const formatBadge = (unreadCount: number) => (unreadCount > 99 ? '99+' : String(unreadCount))

describe('Quiz Runner, Notifications & Admin Pagination Suite', () => {
  it('TC-FE-QUIZ-001: formatTime formats standard minutes and seconds with leading zero', () => {
    expect(formatTime(3600)).toBe('60:00')
    expect(formatTime(75)).toBe('01:15')
    expect(formatTime(5)).toBe('00:05')
    expect(formatTime(0)).toBe('00:00')
  })

  it('TC-FE-QUIZ-002: isUrgent marks <= 60 seconds as urgent', () => {
    expect(isUrgent(61)).toBe(false)
    expect(isUrgent(60)).toBe(true)
    expect(isUrgent(15)).toBe(true)
    expect(isUrgent(0)).toBe(true)
  })

  it('TC-FE-QUIZ-003: isAnswered tracks answered vs unanswered questions in AnswerMap', () => {
    const answers: AnswerMap = { 101: 1, 102: 0 }
    expect(isAnswered(answers, 101)).toBe(true)
    expect(isAnswered(answers, 102)).toBe(true)
    expect(isAnswered(answers, 103)).toBe(false)
  })

  it('TC-FE-QUIZ-004: Updating an answer preserves other questions in AnswerMap', () => {
    let answers: AnswerMap = { 101: 1, 102: 2 }
    answers = { ...answers, 103: 3 }
    expect(answers[101]).toBe(1)
    expect(answers[102]).toBe(2)
    expect(answers[103]).toBe(3)
  })

  const sampleNotifications: NotificationItem[] = [
    { id: 1, type: 'ENROLLED_BY_STAFF', title: 'Đã vào lớp', read: false },
    { id: 2, type: 'NEW_CONTENT', title: 'Bài học mới', read: true },
    { id: 3, type: 'FORUM_REPLY', title: 'Phản hồi bình luận', read: false },
    { id: 4, type: 'COURSE_COMPLETED', title: 'Hoàn thành khóa học', read: true },
    { id: 5, type: 'FORUM_REPLY', title: 'Câu hỏi mới', read: true },
  ]

  it('TC-FE-NOTIF-001: Tab "all" includes all notifications', () => {
    const filtered = filterNotifications(sampleNotifications, 'all')
    expect(filtered.length).toBe(5)
  })

  it('TC-FE-NOTIF-002: Tab "courses" filters course-related notification types', () => {
    const filtered = filterNotifications(sampleNotifications, 'courses')
    expect(filtered.length).toBe(3)
    expect(filtered.map((n) => n.id)).toEqual([1, 2, 4])
  })

  it('TC-FE-NOTIF-003: Tab "discussion" filters forum replies only', () => {
    const filtered = filterNotifications(sampleNotifications, 'discussion')
    expect(filtered.length).toBe(2)
    expect(filtered.map((n) => n.id)).toEqual([3, 5])
  })

  it('TC-FE-NOTIF-004: Tab "unread" filters notifications where read is false', () => {
    const filtered = filterNotifications(sampleNotifications, 'unread')
    expect(filtered.length).toBe(2)
    expect(filtered.map((n) => n.id)).toEqual([1, 3])
  })

  it('TC-FE-NOTIF-005: formatBadge formats large count as 99+ and standard counts as number strings', () => {
    expect(formatBadge(0)).toBe('0')
    expect(formatBadge(5)).toBe('5')
    expect(formatBadge(99)).toBe('99')
    expect(formatBadge(100)).toBe('99+')
    expect(formatBadge(1500)).toBe('99+')
  })

  it('TC-FE-USER-001: Pagination boundary calculations (first page, last page, clamp)', () => {
    const totalElements = 45
    const pageSize = 10
    const totalPages = Math.ceil(totalElements / pageSize) // 5 pages (0 to 4)

    expect(totalPages).toBe(5)
    const canPrev = (page: number) => page > 0
    const canNext = (page: number) => page < totalPages - 1

    expect(canPrev(0)).toBe(false)
    expect(canNext(0)).toBe(true)
    expect(canPrev(2)).toBe(true)
    expect(canNext(4)).toBe(false)
  })
})
