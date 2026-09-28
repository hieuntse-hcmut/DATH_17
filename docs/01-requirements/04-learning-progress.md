# Learning Progress Requirements

## Overview

- This module tracks a student's learning progress within a course: marking lessons as complete, saving the last accessed position, and displaying a progress bar.
- It is also the most important source of behavioral data (`LearningActivity`) for the Learning Analytics module (07) — every learning event must be logged with enough detail for module 07 to compute a risk score.

## Actors

- Student
- Lecturer (view-only, cannot edit)

## Functional Requirements

### FR-PROG-001 — Mark Lesson as Complete
**Description:** The system automatically marks a lesson as complete once it reaches a threshold percentage based on content type: video (furthest second watched / total duration), PDF/slide (furthest page reached / total pages), quiz (submitted at least once). Plain-text content, which has no "page/second" measure, uses a manual "Mark as done" button.
**Priority:** Must-have

### FR-PROG-002 — Save and Resume Last Position
**Description:** The system saves the last lesson/position the student accessed in the course and allows them to resume exactly at that position on their next visit.
**Priority:** Must-have

### FR-PROG-003 — Display Course Progress
**Description:** The system calculates and displays the progress percentage (progress bar) for each enrolled course, based on the number of completed lessons out of the total required lessons.
**Priority:** Must-have

### FR-PROG-004 — List In-Progress and Completed Courses
**Description:** The "My Courses" page displays a list of in-progress and completed (100%) courses, sorted by most recent access.
**Priority:** Must-have

### FR-PROG-005 — Record Learning Activity Events
**Description:** The system records discrete learning activity events (login, viewing a lesson, completing a lesson, video/PDF viewing progress, submission time) into the `LearningActivity` store for consumption by the Learning Analytics module. Video and PDF share the same event schema, differing only in the unit of measurement:

The `current` value is always the **furthest position reached** (max second / max page), not the current position at the time the event is sent — this prevents students from rewinding a video or flipping back pages from skewing the actual completion percentage.
**Priority:** Must-have (prerequisite for module 07)

### FR-PROG-006 — Lecturer Views Student Progress
**Description:** The lecturer can view aggregated progress for the whole class as well as detailed per-lesson progress for each student.
**Priority:** Should-have

## Use Cases

### UC-PROG-001 — Resume Learning from Last Position
**Related Requirements:** FR-PROG-001, FR-PROG-002
**Primary Actor:** Student
**Preconditions:** The student is enrolled in the course and has previously accessed at least one lesson.
**Trigger:** The student opens an enrolled course.

**Main Flow:**
1. The student opens the course.
2. The system retrieves the last accessed position.
3. The system takes the student back to that exact position ("Continue Learning").
4. The student continues learning; when the completion threshold is reached, the system marks the lesson as complete and records a `LearningActivity` event.

**Alternative Flows:** The student chooses to study a different lesson instead of resuming.
**Exception Flows:** No prior progress exists → open the course's first lesson.
**Postconditions:** `LearningProgress` is updated; a `LearningActivity` event is recorded.

### UC-PROG-002 — View My Progress Dashboard
**Related Requirements:** FR-PROG-003, FR-PROG-004
**Primary Actor:** Student
**Preconditions:** The user is logged in.
**Trigger:** The user visits the "My Courses" page.

**Main Flow:**
1. The system retrieves all courses the student is enrolled in.
2. The system calculates the completion percentage for each course.
3. The system displays them grouped as In Progress / Completed, each with a progress bar.

**Exception Flows:** No courses enrolled → display an empty state suggesting the course catalogue.
**Postconditions:** None (read-only).

### UC-PROG-003 — System Records a Learning Activity Event
**Related Requirements:** FR-PROG-005
**Primary Actor:** System
**Preconditions:** The student performs a trackable action (login, viewing a lesson, video progress tick, submitting an assignment).
**Trigger:** The student opens or closes the application.

**Main Flow:**
1. When the student logs into the application, the login timestamp is recorded into a payload variable.
2. When the student logs out or closes the window, the event is saved with its type, timestamp, `courseId`, `lessonId` (if applicable), viewing duration, PDF reading progress, quiz score, etc., into the payload.
3. The payload is saved into `LearningActivity`.
4. The event becomes available for the next Learning Analytics aggregation cycle.

**Alternative Flows:** None.
**Exception Flows:** Logging fails → retry or place into a queue.
**Postconditions:** A `LearningActivity` record is created.

## Business Rules

### BR-PROG-001 — Completion Criteria by Content Type
A common formula applies to content with continuously measurable progress: `completedPercent = value.current / value.total` (video: seconds; PDF: pages). A lesson is considered complete when `completedPercent` ≥ 90%. Quizzes require at least one submission. Plain-text content (no pages/duration) uses the manual "Mark as done" button.

### BR-PROG-002 — Progress Percentage Formula
Course progress % = (number of completed lessons / total required lessons) × 100. Optional/non-required lessons are not counted in the denominator.

### BR-PROG-003 — Resume Granularity
For video, the resume position is stored at the second level (`value.current`); for PDF, at the page level (`value.current`); for all other content types (plain text), resume is at the lesson level.

### BR-PROG-004 — Activity Logging Throttling
High-frequency events (e.g., video progress) are throttled to at most one write every 15–30 seconds.