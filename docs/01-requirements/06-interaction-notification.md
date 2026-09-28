# Interaction & Notification

## Overview

- This module provides an interaction channel (per-lesson discussion/forum) and a notification system for important events: new content, submission deadlines, grading results, discussion replies, and intervention alerts from the Learning Analytics module (07).

## Actors

- Student
- Lecturer
- Admin

## Functional Requirements

### FR-INT-001 — Post a Question/Comment on a Lesson
**Description:** A student can post a question/comment attached to a specific lesson.
**Priority:** Must-have

### FR-INT-002 — Reply to a Discussion Thread
**Description:** A student or lecturer can reply to an existing question/comment.
**Priority:** Must-have

### FR-INT-003 — Report Inappropriate Content
**Description:** Any user can report a post/comment as inappropriate, along with a reason.
**Priority:** Must-have

### FR-INT-004 — Moderate Reported Content
**Description:** The lecturer (within their own course) or Admin (system-wide) reviews reported content and hides/deletes it or dismisses the report.
**Priority:** Should-have

### FR-INT-005 — Notify on New Content / Deadline / Grading Result
**Description:** The system sends notifications when a lecturer posts new content, when a submission deadline is approaching, and when a submission has been graded.
**Priority:** Must-have

### FR-INT-006 — Notification on Forum Reply
**Description:** When someone replies to a thread that a user follows/has posted in, that user receives a notification.
**Priority:** Should-have

### FR-INT-007 — Lecturer Sends Targeted Intervention Notification
**Description:** From the Learning Analytics dashboard (07), the lecturer can send a direct reminder/support message to at-risk students; the message is delivered through the notification system.
**Priority:** Should-have

### FR-INT-008 — Manage Notifications
**Description:** Users can view their list of notifications and mark them as read.
**Priority:** Should-have

## Use Cases

### UC-INT-001 — Ask a Question in the Lesson Forum
**Related Requirements:** FR-INT-001
**Primary Actor:** Student
**Preconditions:** The student is enrolled in the course.
**Trigger:** The student clicks "Ask a Question" on the lesson page.

**Main Flow:**
1. The student writes the question.
2. The system validates and saves the post.
3. The system notifies the lecturer.

**Alternative Flows:** The student attaches an image/code snippet.
**Exception Flows:** Empty content → validation error.
**Postconditions:** A new discussion thread is created.

### UC-INT-002 — Reply to a Discussion
**Related Requirements:** FR-INT-002, FR-INT-006
**Primary Actor:** Student, Lecturer
**Preconditions:** The thread already exists.
**Trigger:** The user submits a reply.

**Main Flow:**
1. The user writes the reply.
2. The system validates and saves the reply.
3. The system pushes a notification to thread participants.

**Exception Flows:** The thread has been deleted/hidden → reject with a notice. Empty content → validation error.
**Postconditions:** The reply is saved; a notification is sent.

### UC-INT-003 — Report Inappropriate Content
**Related Requirements:** FR-INT-003, FR-INT-004
**Primary Actor:** Student/Lecturer
**Preconditions:** The post exists.
**Trigger:** The user clicks "Report".

**Main Flow:**
1. The user selects a reason.
2. The system records the report and flags the post.
3. The lecturer/Admin reviews it via the moderation queue.

**Alternative Flows:** The post is automatically hidden if the number of reports exceeds the threshold (≥5) (BR-INT-003).
**Exception Flows:** A user reports the same post multiple times → the duplicate report is ignored.
**Postconditions:** The report is recorded; the post's status may change to "hidden".

### UC-INT-004 — Receive and View Notifications
**Related Requirements:** FR-INT-005, FR-INT-008
**Primary Actor:** Student, Lecturer
**Preconditions:** The user is logged in.
**Trigger:** A triggering event occurs elsewhere in the system.

**Main Flow:**
1. The system creates a notification record.
2. The notification is delivered in-app.
3. The user opens their notification inbox and it is marked as read when they open the content.

**Postconditions:** The notification's read/unread status is updated.

## Business Rules

### BR-INT-001 — Notification Trigger List
Minimum trigger set: new content, upcoming deadline (e.g., 24h before), grading completed, forum reply, moderation action, intervention message.

### BR-INT-002 — Auto-hide Threshold
A post automatically transitions to a pending-hide state once it receives ≥ 5 reports from different users.

### BR-INT-003 — Posting Rate Limit
A user may create at most N posts/replies per minute (e.g., 5) to limit spam.