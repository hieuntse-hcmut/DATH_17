# Assessment Requirements

## 1. Overview
- Module Description: Manages assessment-related activities in the Smart Campus platform, including question banks, assessment configuration, online assessment attempts, automatic grading for objective questions, manual grading for essay questions, and release of assessment results and feedback.
- Scope: Covers question management, assessment creation and publication, assessment attempts, grading, scores, attempt history, feedback, and assessment-level performance information. Course and content management belong to their respective modules. Enrollment determines whether a Student participates in a course. Learning Analytics owns risk-indicator extraction, weighted-sum risk-score calculation, risk classification, risk factors, and early-warning functionality.
- Cross-module note: Assessment results and attempt data are made available to Learning Analytics as input data. This module does not calculate or expose academic risk scores or risk levels.

## 2. Actors
- Student: Takes available assessments and views released scores, attempt history, answer details, and Lecturer feedback when permitted.
- Lecturer: Manages question banks and assessments for assigned courses, reviews submissions, manually grades essay responses, releases results, and views assessment-level performance information.
- Administrator: Performs authorized system-level administration and oversight. Assessment actions remain subject to the same course- and role-based authorization rules defined by User Access.

## 3. Functional Requirements
### FR-ASSESSMENT-001 - Manage Question Bank

- Description: The system must allow an authorized Lecturer to create, view, update, delete, search, and categorize questions for assigned courses. Supported question types must include multiple-choice, true/false, and essay questions. Questions may be categorized by topic and difficulty.
- Priority: Must-have

### FR-ASSESSMENT-002 - Create and Configure Assessment

- Description: The system must allow an authorized Lecturer to create and configure an assessment for an assigned course, including title, description, start and end times, duration, maximum attempts, optional access password, grading method, question selection, and question/option shuffling.
- Priority: Must-have

### FR-ASSESSMENT-003 - Manage Assessment Publication

- Description: The system must allow an authorized Lecturer to save an assessment as Draft, publish it for eligible Students, and update its configuration subject to assessment-state and attempt-history constraints.
- Priority: Must-have

### FR-ASSESSMENT-004 - Take Assessment

- Description: The system must allow an eligible Student with an ACTIVE enrollment to start and complete an available assessment within its configured time and attempt limits. The system must periodically save responses and automatically submit the current responses when the time limit expires.
- Priority: Must-have

### FR-ASSESSMENT-005 - Record Assessment Attempt

- Description: The system must record each assessment attempt with the Student, assessment, attempt number, start time, submission time, responses, attempt status, and resulting score information. Submitted attempt data must remain available for authorized historical reporting and Learning Analytics.
- Priority: Must-have

### FR-ASSESSMENT-006 - Automatically Grade Objective Questions

- Description: The system must automatically grade submitted multiple-choice and true/false responses using their configured answer keys and point values.
- Priority: Must-have

### FR-ASSESSMENT-007 - Manually Grade Essay Questions

- Description: The system must allow an authorized Lecturer to review submitted essay responses, assign scores within the configured point limits, add feedback, save grading progress, and finalize the assessment result.
- Priority: Must-have

### FR-ASSESSMENT-008 - View Assessment Results and Feedback

- Description: The system must allow a Student to view released results for their own assessment attempts, including final score, attempt history, answer details, and Lecturer feedback according to the configured result-release policy. Risk scores, risk levels, risk factors, and contributing risk indicators must not be exposed through assessment results.
- Priority: Must-have

### FR-ASSESSMENT-009 - View Assessment Performance

- Description: The system should allow an authorized Lecturer to view assessment-level performance information for an assigned course, such as number of submissions, completion rate, and score statistics. Authorized Administrators may access permitted system-level assessment information.
- Priority: Should-have

## 4. Use Cases
### UC-ASSESSMENT-001 - Manage Question Bank

- Related Requirements: FR-ASSESSMENT-001
- Primary Actor: Lecturer
- Preconditions: -   The Lecturer is authenticated and assigned to the target course.
- Trigger: The Lecturer opens the question bank for an assigned course.
- Main Flow: 1.  The system verifies the Lecturer's permission for the course.
    2.  The system displays the course question bank.
    3.  The Lecturer chooses to create or edit a question.
    4.  The Lecturer enters the question content, question type, answer information, point value, topic, and difficulty where applicable.
    5.  The system validates the submitted question data.
    6.  The system saves the question and displays the updated question bank.
- Alternative Flows: -   **A1 - Delete Question:** The Lecturer selects a question for deletion. The system checks whether deletion is permitted under BR-ASSESSMENT-006 and removes it when safe.
    -   **A2 - Search or Filter:** The Lecturer searches or filters questions by supported attributes such as topic, difficulty, or question type.
    -   **A3 - Cancel Change:** The Lecturer cancels before saving; no question data is changed.
- Exception Flows: -   **E1 - Invalid Question Data:** The system identifies missing or invalid information and requests correction.
    -   **E2 - Unauthorized Course:** The system denies access when the Lecturer is not assigned to the course.
    -   **E3 - Question Cannot Be Deleted:** The system preserves a question whose deletion would invalidate historical submitted attempts and informs the Lecturer.
- Postconditions: -   The question bank reflects successful changes without modifying historical assessment-attempt data.

### UC-ASSESSMENT-002 - Create and Configure Assessment

- Related Requirements: FR-ASSESSMENT-002, FR-ASSESSMENT-003
- Primary Actor: Lecturer
- Preconditions: -   The Lecturer is authenticated and assigned to the target course.
    -   The target course exists.
- Trigger: The Lecturer selects **Create Assessment** for the course.
- Main Flow: 1.  The system displays the assessment configuration form.
    2.  The Lecturer enters the assessment title, description, availability period, duration, maximum attempts, and grading configuration.
    3.  The Lecturer selects questions from the course question bank.
    4.  The Lecturer configures optional settings such as an access password and question/option shuffling.
    5.  The system validates the assessment configuration and total point values.
    6.  The Lecturer selects **Save and Publish**.
    7.  The system stores the assessment with `PUBLISHED` status.
    8.  The system confirms successful publication.
- Alternative Flows: -   **A1 - Save as Draft:** The Lecturer selects **Save as Draft**; the system stores the assessment with `DRAFT` status and does not make it available to Students.
    -   **A2 - Edit Draft:** The Lecturer opens an existing Draft assessment, changes its configuration, and saves it.
    -   **A3 - Cancel:** The Lecturer cancels before saving; no new assessment is created.
- Exception Flows: -   **E1 - No Questions Selected:** The system rejects publication until at least one valid question is included.
    -   **E2 - Invalid Configuration:** The system identifies invalid dates, duration, attempt limits, point values, or other configuration and requests correction.
    -   **E3 - Unauthorized Course:** The system denies the operation.
- Postconditions: -   A valid assessment is stored as `DRAFT` or `PUBLISHED`.

### UC-ASSESSMENT-003 - Take Assessment

- Related Requirements: FR-ASSESSMENT-004, FR-ASSESSMENT-005, FR-ASSESSMENT-006
- Primary Actor: Student
- Preconditions: -   The Student is authenticated with an active account.
    -   The Student has an ACTIVE enrollment in the course.
    -   The assessment is `PUBLISHED` and within its configured availability period.
    -   The Student has not exceeded the maximum number of attempts.
- Trigger: The Student selects **Start Assessment**.
- Main Flow: 1.  The system verifies enrollment, assessment availability, and remaining attempts.
    2.  The system displays the assessment overview, including duration, question count, remaining attempts, and instructions.
    3.  The Student confirms that they want to start.
    4.  The system creates a new assessment attempt, records its start time, and starts the server-authoritative assessment timer.
    5.  The system displays the assessment questions according to the configured ordering and shuffling rules.
    6.  The Student selects or enters responses.
    7.  The system periodically saves the Student's responses.
    8.  The Student selects **Submit Assessment**.
    9.  The system displays a submission confirmation.
    10. The Student confirms submission.
    11. The system records the submission time and final responses.
    12. The system automatically grades objective questions.
    13. If no manual grading is required, the system updates the attempt to `GRADED`; otherwise, it updates the attempt to `AWAITING_GRADING`.
    14. The system confirms successful submission.
- Alternative Flows: -   **A1 - Password-Protected Assessment:** Before creating the attempt, the system requests and validates the configured assessment password.
    -   **A2 - Resume Active Attempt:** If the Student returns to an existing valid in-progress attempt, the system restores saved responses and the remaining server-authoritative time.
    -   **A3 - Essay Questions Present:** The system grades objective questions but withholds the final result until required manual grading is finalized.
- Exception Flows: -   **E1 - Time Expired:** The system stops further response editing and automatically submits the latest saved responses.
    -   **E2 - Maximum Attempts Reached:** The system denies creation of another attempt.
    -   **E3 - Assessment Not Available:** The system denies access when the assessment is not published or is outside its availability period.
    -   **E4 - No ACTIVE Enrollment:** The system denies the attempt.
    -   **E5 - Temporary Connection Loss:** The client preserves unsynchronized responses locally where supported and synchronizes them when connectivity returns while the attempt remains valid; server time remains authoritative.
- Postconditions: -   A submitted attempt and its responses are stored.
    -   Objective responses are graded automatically.
    -   Assessment attempt and result data are available to authorized modules, including Learning Analytics, without this module calculating a risk score.

### UC-ASSESSMENT-004 - Grade Essay Assessment

- Related Requirements: FR-ASSESSMENT-007, FR-ASSESSMENT-008
- Primary Actor: Lecturer
- Preconditions: -   The Lecturer is authenticated and assigned to the course.
    -   At least one submitted assessment attempt contains an essay response awaiting grading.
- Trigger: The Lecturer opens a submission with `AWAITING_GRADING` status.
- Main Flow: 1.  The system verifies the Lecturer's course permission.
    2.  The system displays submissions awaiting manual grading.
    3.  The Lecturer selects a Student submission.
    4.  The system displays the essay questions and submitted responses.
    5.  The Lecturer assigns scores and enters feedback.
    6.  The Lecturer selects **Finalize Grading**.
    7.  The system validates all manually assigned scores against their configured point limits.
    8.  The system calculates the final assessment score.
    9.  The system stores the scores and feedback and changes the attempt status to `GRADED`.
    10. The result becomes available according to the configured result-release policy.
- Alternative Flows: -   **A1 - Save Grading Draft:** The Lecturer saves current grading progress without finalizing; the attempt remains pending final grading.
- Exception Flows: -   **E1 - Invalid Score:** The system rejects a score outside the allowed range and requests correction.
    -   **E2 - Unauthorized Course:** The system denies access to the submission.
    -   **E3 - Attempt Already Finalized:** The system prevents an unauthorized overwrite of a finalized result.
- Postconditions: -   On successful finalization, essay scores, feedback, and the final assessment score are stored.
    -   Finalized assessment data become available to Learning Analytics as input data; risk calculation remains the responsibility of Learning Analytics.

### UC-ASSESSMENT-005 - View Assessment Result

- Related Requirements: FR-ASSESSMENT-008
- Primary Actor: Student
- Preconditions: -   The Student is authenticated.
    -   The Student owns the requested assessment attempt.
    -   The result is available under the assessment's result-release policy.
- Trigger: The Student selects a completed assessment or assessment attempt.
- Main Flow: 1.  The system verifies that the requested attempt belongs to the Student.
    2.  The system checks the result-release policy.
    3.  The system retrieves the released assessment result.
    4.  The system displays the final score and attempt information.
    5.  The system displays answer details and Lecturer feedback when the release policy permits.
- Alternative Flows: -   **A1 - Multiple Attempts:** The Student selects a previous attempt and the system displays its released result.
    -   **A2 - Limited Result Release:** The system displays only the information permitted by the configured release policy.
- Exception Flows: -   **E1 - Result Not Yet Released:** The system informs the Student that the result is not yet available.
    -   **E2 - Unauthorized Attempt:** The system denies access to another Student's result.
- Postconditions: -   No assessment data is changed.
    -   No risk score, risk level, risk factor, or contributing risk indicator is exposed to the Student.

### UC-ASSESSMENT-006 - View Assessment Performance

- Related Requirements: FR-ASSESSMENT-009
- Primary Actor: Lecturer, Administrator
- Preconditions: -   The actor is authenticated and authorized for the requested assessment information.
    -   Assessment attempt data exists.
- Trigger: The actor opens assessment performance information.
- Main Flow: 1.  The system verifies the actor's authorization.
    2.  The system retrieves authorized assessment attempts and results.
    3.  The system calculates assessment-level descriptive statistics such as submission count, completion rate, and score distribution or averages.
    4.  The system displays the assessment performance information.
- Alternative Flows: -   **A1 - Filter Results:** The actor applies supported course, assessment, or attempt filters and the system refreshes the displayed statistics.
- Exception Flows: -   **E1 - No Assessment Data:** The system displays an empty state.
    -   **E2 - Unauthorized Request:** The system denies access.
- Postconditions: -   No assessment data is modified.

## 5. Business Rules
### BR-ASSESSMENT-001 - Assessment Availability

- Description: A Student may start an assessment only when it is `PUBLISHED`, the current server time is within its configured availability period, the Student has an ACTIVE enrollment in the course, and the Student has not reached the maximum number of attempts.

### BR-ASSESSMENT-002 - Time Limit

- Description: The assessment timer is based on server-authoritative time. When the configured duration expires, the system must prevent further response changes and submit the latest stored responses.

### BR-ASSESSMENT-003 - Maximum Attempt Limit

- Description: A Student may create no more than the configured maximum number of attempts for an assessment. The assessment configuration must define how multiple attempts contribute to the official result when multiple attempts are allowed, such as highest, average, or latest attempt.

### BR-ASSESSMENT-004 - Periodic Response Saving

- Description: During an active assessment attempt, the system must periodically persist Student responses. Temporary client-side recovery may be used during short connection failures, but the server remains authoritative for attempt state and timing.

### BR-ASSESSMENT-005 - Question and Option Shuffling

- Description: When question or option randomization is enabled, the system must generate the applicable ordering for each attempt without changing the semantic content or correct answer definition.

### BR-ASSESSMENT-006 - Historical Attempt Integrity

- Description: Changes to questions or assessment configuration must not corrupt or retroactively alter the question content, submitted responses, scores, or grading evidence associated with historical submitted attempts. The implementation must preserve the information required to reproduce an authorized historical result.

### BR-ASSESSMENT-007 - Grading Constraints

- Description: Automatically graded questions must use the answer key and point values applicable to the attempt. Manually assigned essay scores must be within the range from zero to the configured maximum points for the question.

### BR-ASSESSMENT-008 - Result Release

- Description: Assessment results, answer details, and Lecturer feedback are visible to a Student only according to the assessment's configured release policy. A result requiring manual grading must not be presented as a final result before grading is finalized.

### BR-ASSESSMENT-009 - Assessment Data Privacy

- Description: A Student may access only their own authorized assessment attempts and released results. A Lecturer may access assessment data only for assigned courses. An Administrator may access only authorized system-level information. One Student's assessment data must not be disclosed to another Student.

### BR-ASSESSMENT-010 - Learning Analytics Boundary

- Description: Assessment provides authorized attempt and result data to Learning Analytics. Learning Analytics, not Assessment, owns normalization of risk indicators, team-defined weighted-sum risk-score calculation, risk classification, risk factors, and early-warning logic. Risk scores, risk levels, risk factors, and contributing risk indicators must never be exposed to Students.
