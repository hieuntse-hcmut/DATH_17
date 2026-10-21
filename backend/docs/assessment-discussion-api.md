# Assessment and Discussion API (MVP)

All routes require a bearer JWT. `courseId`, `questionId`, and `quizId` are numeric IDs. Swagger UI at `/swagger-ui.html` lists the request and response schemas.

## Question bank and quizzes

Assigned lecturers (course creator or a row in `course_lecturers`) and admins can manage questions and quizzes.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/courses/{courseId}/questions` | List questions with answer keys |
| POST | `/api/courses/{courseId}/questions` | Create a question and its options |
| PUT | `/api/courses/{courseId}/questions/{questionId}` | Replace an unused question and its options |
| DELETE | `/api/courses/{courseId}/questions/{questionId}` | Delete an unused question |
| POST | `/api/courses/{courseId}/quizzes` | Create a draft quiz |
| POST | `/api/courses/{courseId}/quizzes/{quizId}/publish` | Publish a draft quiz |
| GET | `/api/courses/{courseId}/quizzes` | List quizzes |
| GET | `/api/courses/{courseId}/quizzes/{quizId}` | View a quiz |

An actively enrolled student can list and view published quizzes. The `correct` option field is omitted from student responses. A question already linked to a quiz cannot be edited or deleted, preserving the quiz's answer key.

Example question:

```json
{"content":"2 + 2?","type":"SINGLE_CHOICE","options":[{"content":"4","correct":true},{"content":"5","correct":false}]}
```

Types: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `SHORT_ANSWER`. Objective questions require at least two options and a valid correct option count. `SHORT_ANSWER` has no options.

Example draft quiz:

```json
{"title":"Week 1 quiz","maxAttempts":1,"durationMinutes":30,"questions":[{"questionId":123,"points":2}]}
```

`startTime` and `endTime` are optional ISO local date times. A quiz must use unique question IDs from its own course. Attempts and grading are outside this MVP's API surface.

## Course discussion

Active students enrolled in the course, assigned lecturers, and admins can read and post comments. Setting `parentId` creates a reply; omitting it creates a top-level question. Authors may edit or delete their own comments; assigned lecturers and admins may moderate them.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/courses/{courseId}/discussions` | List comments and replies in creation order |
| POST | `/api/courses/{courseId}/discussions` | Post a question or reply |
| PUT | `/api/courses/{courseId}/discussions/{id}` | Edit a comment |
| DELETE | `/api/courses/{courseId}/discussions/{id}` | Soft delete a comment |

Example reply:

```json
{"content":"Here is the answer.","parentId":456}
```

Deleting a comment preserves its row and replies, and displays `[deleted]` in place of the content. Replies must point to an active comment in the same course.
