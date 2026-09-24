# Course Content Requirements

## 1. Overview
- Module Description: Allows learning materials to be organized into a structured hierarchy such as courses, chapters and lessons. It also enables students to access learning content and interact with educational materials.
- Scope: Covers the creation, updating, and structuring of learning
content, supporting multiple formats including documents, videos,
and other supported resources. It also includes permission-based
access for students participating in a course, lesson quiz management,
and quiz attempt recording. Live video-conferencing infrastructure
and learning progress tracking are outside the initial scope.

## 2. Actors
- Lecturer: Responsible for organizing course content, managing learning activities and delivering learning materials.
- Student: A learner participating in the course who accesses learning materials and interacts with learning content.

## 3. Functional Requirements

### FR-CONTENT-001 - Hierarchical Content Organztion
- Description: The system must allow lecturers to organize educational materials into a structed hierarchy consisting of courses, chapters, and lessons.
- Priority: High

### FR-CONTENT-002 - Chapter Management
- Description: The system must allow lecturers to create, update and organize chapters as the major organizational sections of a course.
- Priority: High

### FR-CONTENT-003 - Lesson Management
- Description: The system must allow lecturers to created update and manage individual learning lessons contained within a chapter.
- Priority: High

### FR-CONTENT-004 - Multi-Format Learning Materials Support
- Description: The system must support the storage and attachment of various educational resources to lessons, including documents, videos, and other supported educational formats.
- Priority: High

### FR-CONTENT-005 - Student Learning Content Access
- Description: The system must allow enrolled students to access, view and interact with learning content and materials published in their courses.
- Priority: High

### FR-CONTENT-006 – Lesson Quiz Management
- Description: The system must allow lecturers to create, update, organize, and associate quizzes with lessons.
- Priority: High

### FR-CONTENT-007 – Quiz Attempt Recording
- Description: The system must allow students to take quizzes associated with lessons and record their attempts and available results.
- Priority: High

## 4. Use Cases

### UC-CONTENT-001 - Create Chapter
- Related Requirements: FR-CONTENT-001, FR-CONTENT-002
- Description: The System allows lecturers to create a new chapter within a course to organize educational content into a hierarchical structure.
- Preconditions:
    * The lecturer is authenticated.
    * The lecturer is assigned to manage the target course.
    * Te target course is exists.
- Trigger: The lecturer chooses to create a new chapter.
- Main Flow:
    1. The lecturer navigates to the course content management interface.
    2. The lecturer selects the option to create a new chapter.
    3. The system displays a new chapter creation form.
    4. The lecturer enters the chapter title and optional metadata.
    5. The lecturer submits the chapter details.
    6. The system validates the submitted information.
    7. The system creates the chapter and associates it with the selected course.
    8. The system saves the chapter in the database.
    9. The system displays the newly created chapter in the course hierarchy.
- Alternative Flows:
    * A1 - Cancel Creation: The lecturer cancels the creation process. The system discards unsaved information and returns to the course content interface.
    * A2 - Specify Initial Position: The lecturer selects an initial position for the chapter. The system stores the chapter at the specified position.
- Exception Flows:
    * E1 - Missing Chapter Title: The system displays a validation error and requests a valid title.
    * E2 - Unauthorized Access: The system rejects the operation if the lecturer does not have permission to manage the course.
- Postconditions:
    * A new chapter is stored in the database.
    * The chapter is associated with the target course.
    * The course hierarchy displays the new chapter.

### UC-CONTENT-002 - Update Chapter
- Related Requirements: FR-CONTENT-002
- Description: The system allows lecturers to update the details of an existing chapter within a course.
- Preconditions:
    * The lecturer is authenticated.
    * The lecturer has permission to manage the target course.
    * The target chapter is exists.
- Trigger: The lecturer chooses to edit an existing chapter.
- Main Flow:
    1. The lecturer navigates to the course content management interface.
    2. The lecturer selects an existing chapter.
    3. The lecturer selects the edit chapter option.
    4. The system retrieves and displays the current chapter details.
    5. The lecturer modifies the chapter title or supported metadata.
    6. The lecturer submits the updated informaion.
    7. The system validates the updated details.
    8. The system updates the chapter in the database.
    9. The system displays the updated chapter informaion.
- Alternative Flows:
    * A1 - Cancel Update: The lecturer cancels the editing process. The system retains the origianl chapter details.
    * A2 - No changes: The lecturer submits without modifying any information. The system retains the existing details.
- Exception Flows:
    * E1 - Invalid Chapter Details: The system displays a validation error and requests correction.
    * E2 - Chapter Not Found: The system informs the lecturer that the selected chapter does not exist.
    * E3 - Unauthorized Access: The system rejects the update operation if the lecrurer lacks permission.
- Postconditions:
    * The chapter details are updated in the database.
    * The updated information is displayed in the course hierarchy.

### UC-CONTENT-003 - Organize Chapters
- Related Requirements: FR-CONTENT-001, FR-CONTENT-002
- Description: The system allows lecturers to organize the order and structural arrangement of chapters within a course.
- Preconditions:
    * The lecturer is authenticated.
    * The lecturer has permission to manage the target course.
    * The target course contains existing chapters.
- Trigger: The lecturer chooses to rearrange chapters within the course hierarchy.
- Main Flow:
    1. The lecturer navigates to the course content management interface.
    2. The system displays the existing chapters in their current order.
    3. The lecturer selects a chapter to rearrange.
    4. The lecturer changes the chapter's position in the hierarchy.
    5. The system validates the requested arrangement.
    6. The system updates the chapter ordering.
    7. The system saves the updated structure in te database.
    8. The system displays the revised chapter hierarchy.
- Alternative Flows:
    * A1 - Move Chapter Up: The lecturer moves a chapter to an earlier position.
    * A2 - Move Chapter Down: The lecturer moves a chapter to a later position.
    * A3 - Cancel Reordering: The lecturer cancels the arrangement before saving. The system retains the previous ordering.
- Exception Flows:
    * E1 - Invalid Chapter Position: The system rejects an invalid ordering request.
    * E2 - Concurrent Modification: Another update has changed the chapter structure. The system informs the lecturer and requests a refresh or retry.
- Postconditions:
    * The chapter ordering is updated and stored in the database.
    * The course hierarchy reflects the new chapter sequence.

### UC-CONTENT-004 - Create Lesson
- Related Requirements: FR-CONTENT-001, FR-CONTENT-003
- Description: The system allows lecturers to create a lesson within an existing chapter to provide a specific learning unit.
- Preconditions:
    * The lecturer is authenticated.
    * The lecterer has permission to manage the target course.
    * The target course exists and belongs to the target course.
- Trigger: The lecturer chooses to create a new lesson within a chapter.
- Main Flow:
    1. The lecturer navigates to the course content management interface.
    2. The lecturer selects an existing chapter.
    3. The lecturer chooses the option to create a new lesson.
    4. The system displays the lesson creation form.
    5. The lecturer enters the lesson title and learning unit details.
    6. The lecturer submits the lesson information.
    7. The system validates the submitted details.
    8. The system creates the lesson and associates it with the selected chapter.
    9. The system saves the lesson in the database.
    10. The system displays the newly created lesson within the chapter.
- Alternative Flows: 
    * A1 -Cancel Creation: The lecturer cancels the creation process. The system discards unsaved information.
    * A2 – Specify Lesson Position: The lecturer selects an initial position for the lesson. The system stores the lesson at the specified position.
- Exception Flows:
    * E1 – Missing Lesson Title: The system displays an error and requests a valid title.
    * E2 – Invalid Chapter: The system rejects the request if the target chapter does not exist.
    * E3 – Unauthorized Access: The system rejects the operation if the lecturer lacks permission.
- Postconditions:
    * A new lesson is stored in the database.
    * The lesson is associated with the selected chapter.
    * The lesson is displayed in the chapter hierarchy.

### UC-CONTENT-005 - Update Lesson
- Related Requirements: FR-CONTENT-003
- Description: The system allows lecturers to update the details of an existing lesson within a chapter.
- Preconditions:
    * The lecturer is authenticated.
    * The lecturer has permission to manage the target course.
    * The target lesson exists.
- Trigger: The lecturer chooses to edit an existing lesson.
- Main Flow:
    1. The lecturer navigates to the course content management interface.
    2. The lecturer selects a chapter and an existing lesson.
    3. The lecturer chooses the edit lesson option.
    4. The system retrieves and displays the current lesson details.
    5. The lecturer modifies the lesson title or supported learning content.
    6. The lecturer modifies the lesson title or supported learning content.
    7. The system validates the updated details. 
    8. The system updates the lesson in the database.
    9. The system displays the updated lesson information.
- Alternative Flows:
    * A1 – Cancel Update: The lecturer cancels the editing process. The system retains the original lesson information.
    * A2 – Change Lesson Position: The lecturer changes the lesson's position within the chapter, if reordering is supported.
- Exception Flows:
    * E1 – Invalid Lesson Details: The system displays a validation error.
    * E2 – Lesson Not Found: The system informs the lecturer that the selected lesson does not exist.
    * E3 – Unauthorized Access: The system rejects the update operation if the lecturer lacks permission.
- Postconditions:
    * The lesson details are updated in the database.
    * The updated lesson information is displayed within the chapter.

### UC-CONTENT-006 – Manage Learning Materials
- Related Requirements: FR-CONTENT-003, FR-CONTENT-004
- Description: The system allows lecturers to attach, update, and remove supported educational materials associated with a lesson.
- Preconditions:
    * The lecturer is authenticated.
    * The lecturer has permission to manage the target course.
    * The lecturer has permission to manage the target course.
    * The target lesson exists.
- Trigger: The lecturer chooses to manage educational materials for a lesson.
- Main Flow:
    1. The lecturer navigates to the target lesson.
    2. The lecturer selects the option to manage learning materials.
    3. The lecturer selects the option to manage learning materials.
    4. The lecturer chooses to upload or attach a new educational resource.
    5. The lecturer selects a supported document, video, or other educational format.
    6. The system validates the material format and relevant constraints.
    7. The system stores the material or its reference.
    8. The system associates the material with the selected lesson.
    9. The system displays the updated list of learning materials.
- Alternative Flows:
    * A1 – Update Material: The lecturer replaces a material or updates its metadata.
    * A2 – Remove Material: The lecturer selects an existing material for removal. The system asks for confirmation and removes its lesson association.
    * A3 – Attach External Video: The lecturer provides a supported external video reference. The system validates and stores the reference.
- Exception Flows:
    * E1 – Unsupported File Format: The system rejects an unsupported file and displays an error message.
    * E2 – File Size Exceeded: The system rejects a file that exceeds the configured size limit.
    * E3 – Upload Failure: The system informs the lecturer that the upload failed and allows retrying.
    * E4 – Invalid External Reference: The system rejects an invalid or unsupported external video link.
- Postconditions:
    * The selected learning materials are associated with the lesson.
    * Material updates are stored in the database or supported storage system.
    * The updated material list is displayed.

### UC-CONTENT-007 – Browse Course Content
- Related Requirements: FR-CONTENT-001, FR-CONTENT-005
- Description: The system allows enrolled students to browse the hierarchical structure of a course, including its chapters and lessons.
- Preconditions:
    * The student is authenticated.
    * The student is enrolled in the target course.
    * The course is available to the student.
- Trigger: The student selects an enrolled course to access its learning content.
- Main Flow:
    1. The student navigates to the enrolled course.
    2. The system verifies the student's enrollment and access permissions.
    3. The system retrieves the course hierarchy.
    4. The system displays the course's chapters and lessons.
    5. The student selects a chapter to expand or view its lessons.
    6. The system displays the lessons belonging to the selected chapter.
    7. The student selects a lesson to access its content.
- Alternative Flows:
    * A1 – Expand or Collapse Chapter: The student expands or collapses a chapter to navigate the course structure.
    * A2 – Navigate Between Chapters: The student selects a different chapter from the course hierarchy.
- Exception Flows:
    * E1 – Access Denied: The system denies access if the student is not enrolled or does not have the required permissions.
    * E2 – Course Not Available: The system informs the student that the course is not currently accessible.
- Postconditions:
    * The student can view the available course hierarchy.
    * The student can select a lesson for further content access.

### UC-CONTENT-008 – View and Interact with Learning Content
- Related Requirements: FR-CONTENT-004, FR-CONTENT-005
- Description: The system allows enrolled students to view and interact with educational content and supported learning materials published within a lesson.
- Preconditions:
    * The student is authenticated.
    * The student is authenticated.
    * The target lesson exists and is available.
    * The lesson contains published learning content or materials.
- Trigger: The student selects a lesson to study.
- Main Flow:
    1. The student selects a lesson from the course hierarchy.
    2. The system verifies the student's access permissions.
    3. The system retrieves the lesson details and associated learning materials.
    4. The system displays the lesson content.
    5. The student views the lesson content.
    6. The student opens or plays supported educational materials.
    7. The system provides the relevant content interaction features.
    8. The student finishes viewing or interacting with the lesson.
- Alternative Flows:
    * A1 – View Document: The student opens a supported document. The system displays or provides access to the document.
    * A2 – Play Video: The student selects a video. The system provides the video player or supported video reference.
    * A3 – Open External Material: The student selects an external learning resource. The system provides the supported resource link.
- Exception Flows:
    * E1 – Access Denied: The system denies access if the student is not authorized to view the lesson.
    * E2 – Material Unavailable: The system informs the student when an associated learning material cannot be retrieved.
    * E3 – Unsupported Content: The system informs the student when a material cannot be displayed using the supported access method.
- Postconditions: 
    * The student has accessed the lesson content.
    * The student has been provided with the available supported learning materials.

### UC-CONTENT-009 – Manage Lesson Quizzes
- Related Requirements: FR-CONTENT-003, FR-CONTENT-006
- Description: The system allows lecturers to create, update, and organize quizzes associated with a lesson.
- Preconditions:   
    * The lecturer is authenticated.
    * The lecturer has permission to manage the target course.
    * The target lesson exists.
- Trigger: The lecturer chooses to manage quizzes for a lesson.
- Main Flow:
    1. The lecturer selects a lesson.
    2. The lecturer opens the quiz management interface.
    3. The lecturer chooses to create a new quiz.
    4. The system displays the quiz configuration form.
    5. The lecturer enters the quiz title, instructions, and relevant settings.
    6. The lecturer adds questions and configures their answer options.
    7. The lecturer submits the quiz details.
    8. The system validates the quiz information.
    9. The system saves the quiz and associates it with the selected lesson.
    10. The system displays the quiz within the lesson content.
- Alternative Flows:
    * A1 – Update Quiz: The lecturer modifies the quiz title, instructions, settings, or questions.
    * A2 – Reorder Questions: The lecturer changes the order of questions within the quiz.
    * A3 – Remove Quiz: The lecturer removes a quiz if the feature and permissions allow it.
- Exception Flows:
    * E1 – Invalid Quiz Configuration: The system rejects missing or invalid quiz information.
    * E2 – Missing Questions: The system prevents publication if the quiz requires at least one question and none is provided.
    * E3 – Unauthorized Access: The system denies the operation if the lecturer lacks permission.
- Postconditions: 
    * The quiz is stored and associated with the selected lesson.
    * The quiz configuration is available for supported student access.

### UC-CONTENT-010 – Take Lesson Quiz
- Related Requirements: FR-CONTENT-005, FR-CONTENT-007
- Description: The system allows students to take a quiz associated with a lesson and records the quiz attempt and available result.
- Preconditions:
    * The student is authenticated.
    * The student is enrolled in the course.
    * The quiz is published and accessible.
    * The quiz belongs to the selected lesson.
- Trigger: The student chooses to take a lesson quiz.
- Main Flow:
    1. The student opens the lesson.
    2. The student selects the available quiz.
    3. The system displays the quiz questions and instructions.
    4. The student answers the questions.
    5. The student submits the quiz.
    6. The system validates the submission.
    7. The system evaluates automatically gradable answers.
    8. The system records the quiz attempt and result.
    9. The system updates the relevant lesson progress or completion status, if configured.
    10. The system displays the result according to the quiz policy.
- Alternative Flows:
    * A1 – Retake Quiz: The student retakes the quiz if the configured attempt limit permits it.
    * A2 – Save Attempt: The student saves an unfinished attempt if supported.
    * A3 – Manual Grading: The system records answers requiring lecturer grading.
- Exception Flows:
    * E1 – Quiz Unavailable: The system denies access to an unpublished or closed quiz.
    * E2 – Submission Failure: The system cannot save the attempt.
    * E3 – Invalid Submission: The system rejects the submission if it does not meet the required conditions.
- Postconditions:
    * The quiz attempt is recorded.
    * The available result is stored.
    * Lesson progress may be updated according to the configured rules.

## 5. Business Rules

### BR-CONTENT-001 - Hierarchical Content Structure
-  Each lesson must belong to one chapter, and each chapter must belong to one course.
- The system must maintain the hierarchy of Course → Chapter → Lesson.
- A lesson cannot exist without an associated chapter, and a chapter cannot exist without an associated course.

### BR-CONTENT-002 - Content Management Authorization
- Only lecturers assigned to a course and authorized to manage that course may create, update, organize, or remove its chapters, lessons, learning materials, and quizzes.
- Students may access published course content but may not modify the course structure or learning materials.

### BR-CONTENT-003 - Chapter and Lesson Ordering
- Chapters within a course and lessons within a chapter must have an identifiable order.
- The system must preserve the configured order when displaying course content to students.
- Reordering content must not change the association between a chapter and its course or between a lesson and its chapter.

### BR-CONTENT-004 - Supported Learning Material Formats
- The system may only accept learning materials in supported formats and within the configured file size limits.
- Each learning material must be associated with at least one lesson.
- Unsupported file formats or invalid external material references must be rejected.

### BR-CONTENT-005 - Course Content Access
- Only authenticated students enrolled in and authorized to access a course may view its available learning content.
- Students may access only content that has been published or made available to them.
- Users without the required permissions must not be allowed to access restricted course content.

### BR-CONTENT-006 - Quiz Association
- Each quiz must be associated with one lesson.
- Only lecturers authorized to manage the relevant course may create, update, organize, or remove quizzes.
- A quiz must contain the required configuration and questions before it can be published, where applicable.
- Students may access only quizzes that are published and available to them.

### BR-CONTENT-011 - Quiz Attempt Recording
- Each student's quiz attempt must be recorded separately.
- The system must record the available result after a quiz is submitted and evaluated.
- Students may retake a quiz only when the configured quiz policy allows additional attempts.
- Quiz attempts must be associated with the relevant student and quiz.

### BR-CONTENT-012 - Content Availability and Updates
- Learning content must be available to students only when it satisfies the configured publication and access conditions.
- Updating or removing learning materials must not grant unauthorized access to the affected content.
- The system must handle unavailable or deleted learning materials without falsely reporting that the material was successfully accessed or completed.