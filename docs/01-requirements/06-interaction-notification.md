# Interaction & Notification

## 1. Overview
- This module provides an interaction channel (per-lesson discussion/forum) and a notification system for important events: new content, submission deadlines, grading results, discussion replies, and intervention alerts from the Learning Analytics module (07).

## 2. Actors
- Student
- Lecturer
- Admin

## 3. Functional Requirements
### FR-INT-001 - Post a Question/Comment on a Lesson
- Description: A student can post a question/comment attached to a specific lesson.
- Priority: Must-have

### FR-INT-002 - Reply to a Discussion Thread
- Description: A student or lecturer can reply to an existing question/comment.
- Priority: Must-have

### FR-INT-003 - Report Inappropriate Content
- Description: Any user can report a post/comment as inappropriate, along with a reason.
- Priority: Must-have

### FR-INT-004 - Moderate Reported Content
- Description: The lecturer (within their own course) or Admin (system-wide) reviews reported content and hides/deletes it or dismisses the report.
- Priority: Should-have

### FR-INT-005 - Notify on New Content / Deadline / Grading Result
- Description: The system sends notifications when a lecturer posts new content, when a submission deadline is approaching, and when a submission has been graded.
- Priority: Must-have

### FR-INT-006 - Notification on Forum Reply
- Description: When someone replies to a thread that a user follows/has posted in, that user receives a notification.
- Priority: Should-have

### FR-INT-007 - Lecturer Sends Targeted Intervention Notification
- Description: From the Learning Analytics dashboard (07), the lecturer can send a direct reminder/support message to at-risk students; the message is delivered through the notification system.
- Priority: Should-have

### FR-INT-008 - Manage Notifications
- Description: Users can view their list of notifications and mark them as read.
- Priority: Should-have

## 4. Use Cases
### UC-INT-001 - Ask a Question in the Lesson Forum
- Related Requirements: FR-INT-001
- Primary Actor: Student
- Preconditions: The student is enrolled in the course.
- Trigger: The student clicks "Ask a Question" on the lesson page.
- Main Flow: 1. The student writes the question.
2. The system validates and saves the post.
3. The system notifies the lecturer.
- Alternative Flows: The student attaches an image/code snippet.
- Exception Flows: Empty content → validation error.
- Postconditions: A new discussion thread is created.

### UC-INT-002 - Reply to a Discussion
- Related Requirements: FR-INT-002, FR-INT-006
- Primary Actor: Student, Lecturer
- Preconditions: The thread already exists.
- Trigger: The user submits a reply.
- Main Flow: 1. The user writes the reply.
2. The system validates and saves the reply.
3. The system pushes a notification to thread participants.
- Exception Flows: The thread has been deleted/hidden → reject with a notice. Empty content → validation error.
- Postconditions: The reply is saved; a notification is sent.

### UC-INT-003 - Report Inappropriate Content
- Related Requirements: FR-INT-003
- Primary Actor: Student, Lecturer
- Preconditions: The post/comment exists.
- Trigger: The user clicks "Report".
- Main Flow: 1. The user selects a reason for the report.
2. The system records the report and flags the content for moderation.
3. The system confirms that the report has been submitted.
- Alternative Flows: The post automatically transitions to a pending-hide state if it receives ≥ 5 reports from different users (BR-INT-002).
- Exception Flows: A user reports the same post multiple times → the duplicate report is ignored.
- Postconditions: The report is recorded and becomes available in the moderation queue.

### UC-INT-004 - Moderate Reported Content
- Related Requirements: FR-INT-004
- Primary Actor: Lecturer, Admin
- Preconditions: At least one reported post/comment exists. A Lecturer may moderate only content in their own course; Admin may moderate system-wide.
- Trigger: The actor opens the moderation queue and selects reported content.
- Main Flow: 1. The system displays the report details and reported content.
2. The actor reviews the content and report reason.
3. The actor chooses to hide/delete the content or dismiss the report.
4. The system applies the moderation decision and updates the report status.
- Exception Flows: The content no longer exists → the system closes the report without applying another content action.
- Postconditions: The moderation decision is recorded and the content/report status is updated.

### UC-INT-005 - View Notifications
- Related Requirements: FR-INT-008
- Primary Actor: Student, Lecturer, Admin
- Preconditions: The user is logged in.
- Trigger: The user opens the notification center.
- Main Flow: 1. The system retrieves the user's notifications.
2. The system displays the notification list with read/unread status.
3. The user opens a notification.
4. The system displays or navigates to the related content and marks the notification as read.
- Postconditions: The selected notification's read/unread status is updated.

## 5. Business Rules
### BR-INT-001 - Notification Trigger List
- Description: Minimum trigger set: new content, upcoming deadline (e.g., 24h before), grading completed, forum reply, moderation action, intervention message.

### BR-INT-002 - Auto-hide Threshold
- Description: A post automatically transitions to a pending-hide state once it receives ≥ 5 reports from different users.

### BR-INT-003 - Posting Rate Limit
- Description: A user may create at most N posts/replies per minute (e.g., 5) to limit spam.
