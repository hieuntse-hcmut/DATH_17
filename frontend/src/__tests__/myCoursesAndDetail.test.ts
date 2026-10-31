import { describe, it, expect } from 'vitest'

// Original normalize function from MyCoursesPage & UserList (has bug with uppercase 'Đ')
const buggyNormalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()

// Fixed normalize
const fixedNormalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

interface CourseItem {
  id: number
  title: string
  instructorName: string
  totalLesson: number
  completeLesson: number | null
  progressPercent: number | null
}

const sortCourses = (list: CourseItem[], sort: 'name' | 'progress') =>
  [...list].sort((a, b) => {
    const byName = a.title.localeCompare(b.title, 'vi')
    if (sort === 'name') return byName
    if (sort === 'progress') {
      const pa = a.progressPercent ?? 0
      const pb = b.progressPercent ?? 0
      return pb - pa || byName
    }
    return byName
  })

// Video progress threshold helper
function reachesThreshold(position: number, totalLength: number | null): boolean {
  if (totalLength === null || totalLength <= 0) return false
  return position * 100 >= totalLength * 90
}

describe('MyCourses & Course Detail Progress Logic Suite', () => {
  const sampleCourses: CourseItem[] = [
    { id: 1, title: 'Nhập môn Lập trình', instructorName: 'Nguyễn Văn Đạt', totalLesson: 10, completeLesson: 5, progressPercent: 50 },
    { id: 2, title: 'Cấu trúc Dữ liệu & Giải thuật', instructorName: 'Trần Thị Mai', totalLesson: 12, completeLesson: 12, progressPercent: 100 },
    { id: 3, title: 'Giải tích 1', instructorName: 'Lê Văn An', totalLesson: 8, completeLesson: 0, progressPercent: 0 },
    { id: 4, title: 'Khóa học Giảng viên tạo', instructorName: 'Giảng viên A', totalLesson: 5, completeLesson: null, progressPercent: null },
  ]

  it('TC-FE-MYCRS-001: [BUG CONFIRMED] buggyNormalize fails to convert uppercase Đ, while fixedNormalize succeeds', () => {
    // Demonstrating the bug in current codebase:
    expect(buggyNormalize('Nguyễn Văn Đạt')).toBe('nguyen van đat') // 'Đ' remains 'đ' instead of 'd'!
    // Fixed version produces expected 'd':
    expect(fixedNormalize('Nguyễn Văn Đạt')).toBe('nguyen van dat')
    expect(fixedNormalize('CẤU TRÚC DỮ LIỆU')).toBe('cau truc du lieu')
    expect(fixedNormalize('điểm số & đề cương')).toBe('diem so & de cuong')
  })

  it('TC-FE-MYCRS-002: Tab "learning" filters out 100% completed courses', () => {
    const learning = sampleCourses.filter((c) => c.progressPercent !== 100)
    expect(learning.length).toBe(3)
    expect(learning.find((c) => c.id === 2)).toBeUndefined()
  })

  it('TC-FE-MYCRS-003: Tab "completed" contains only 100% finished courses', () => {
    const completed = sampleCourses.filter((c) => c.progressPercent === 100)
    expect(completed.length).toBe(1)
    expect(completed[0].id).toBe(2)
  })

  it('TC-FE-MYCRS-004: Sort by "name" orders alphabetically in Vietnamese locale', () => {
    const sorted = sortCourses(sampleCourses, 'name')
    expect(sorted[0].title).toBe('Cấu trúc Dữ liệu & Giải thuật')
    expect(sorted[1].title).toBe('Giải tích 1')
    expect(sorted[2].title).toBe('Khóa học Giảng viên tạo')
    expect(sorted[3].title).toBe('Nhập môn Lập trình')
  })

  it('TC-FE-MYCRS-005: Sort by "progress" orders highest completion first', () => {
    const sorted = sortCourses(sampleCourses, 'progress')
    expect(sorted[0].progressPercent).toBe(100)
    expect(sorted[1].progressPercent).toBe(50)
  })

  it('TC-FE-MYCRS-006: Lecturer course with null progressPercent is handled without crash', () => {
    const lecturerCourse = sampleCourses.find((c) => c.id === 4)!
    expect(lecturerCourse.progressPercent).toBeNull()
    const sorted = sortCourses([lecturerCourse, sampleCourses[0]], 'progress')
    expect(sorted).toBeDefined()
    expect(sorted.length).toBe(2)
  })

  it('TC-FE-CRSDTL-001: Video progress threshold reaches 90% boundary exactly', () => {
    // 600 seconds total: 90% = 540s
    expect(reachesThreshold(539, 600)).toBe(false)
    expect(reachesThreshold(540, 600)).toBe(true)
    expect(reachesThreshold(550, 600)).toBe(true)
  })

  it('TC-FE-CRSDTL-002: Video with null or 0 totalLength never reaches completion', () => {
    expect(reachesThreshold(100, null)).toBe(false)
    expect(reachesThreshold(100, 0)).toBe(false)
    expect(reachesThreshold(0, 0)).toBe(false)
  })

  it('TC-FE-CRSDTL-003: Video furthest clamp logic does not exceed duration', () => {
    const duration = 600.5
    const furthest = 620
    const totalLength = Math.floor(duration) // 600
    const position = totalLength > 0 ? Math.min(Math.ceil(furthest), totalLength) : Math.ceil(furthest)
    expect(position).toBe(600)
  })

  it('TC-FE-CRSDTL-004: Video progress auto-save ignores non-advancing playback position', () => {
    const lastSent = new Map<number, number>()
    lastSent.set(10, 300) // previously sent 300s

    const currentPosition = 290 // user rewound
    const shouldSend = currentPosition > (lastSent.get(10) ?? 0)
    expect(shouldSend).toBe(false)

    const nextPosition = 305 // user progressed
    const shouldSendNext = nextPosition > (lastSent.get(10) ?? 0)
    expect(shouldSendNext).toBe(true)
  })
})
