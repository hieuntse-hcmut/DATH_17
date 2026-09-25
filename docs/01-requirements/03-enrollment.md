# Enrollment Requirements

## 1. Overview

- Module Description: Manages the relationship between Students and the courses in which they participate.
- Scope: Covers student self-enrollment, enrollment by an authorized Lecturer or Administrator, course rosters, a Student's enrolled-course list, and withdrawal or removal from a course. Course creation and publication belong to Course Management; lesson access belongs to Course Content; progress, assessments, and risk calculations belong to their respective modules. Enrollment supplies their course-participation context.
- Dependency: Course Management owns three distinct attributes used here: course publication state, the enrollment window (whether the course accepts new enrollments), and content availability. Course Content applies content availability when serving published materials. Enrollment decisions use course publication state and the enrollment window; an enrollment alone does not make content available.

## 2. Actors

- Student: Enrolls in available courses, views their course participation, and withdraws when allowed.
- Lecturer: Views and manages enrollment in courses to which they are assigned.
- Administrator: Manages enrollment and course participation across the platform.

## 3. Functional Requirements

### FR-ENROLL-001 - Enroll in Available Course
- Description: The system must allow an authenticated Student to enroll when the course publication state is published and the enrollment window accepts new enrollments. Successful enrollment must create or reactivate an ACTIVE Student-Course relationship.
- Priority: High

### FR-ENROLL-002 - Enroll Student by Authorized Staff
- Description: The system must allow an assigned Lecturer or an Administrator to enroll an existing, active Student when the enrollment window accepts new enrollments. The system must allow only an Administrator to override a closed enrollment window through an explicit, separately confirmed action with a mandatory reason; the override must record the acting Administrator, timestamp, and reason in Enrollment Status History and the administrative audit log. The override must only create or reactivate enrollment and must not change course publication state, content availability, or their access rules.
- Priority: High

### FR-ENROLL-003 - Prevent Duplicate Active Enrollment
- Description: The system must enforce at most one Enrollment record per (Student, Course) pair with a uniqueness constraint at the persistence layer. Re-enrollment must reactivate that record through a conditional update, never through check-then-insert; concurrent requests must yield exactly one ACTIVE enrollment and treat losing requests as already enrolled.
- Priority: High

### FR-ENROLL-004 - View Course Roster
- Description: The system must allow the assigned Lecturer and authorized Administrator to view a roster that defaults to ACTIVE enrollments and offers an explicit option to include WITHDRAWN and REMOVED entries. Each entry must show enrollment status, latest status-change date, and the Student's account status as a derived indicator.
- Priority: High

### FR-ENROLL-005 - View My Courses
- Description: The system must allow a Student to view courses with ACTIVE enrollment and open course content only when the course publication state is published and content availability permits access.
- Dependency: Learning Progress owns grouping courses as in progress or completed and displaying progress percentages.
- Priority: High

### FR-ENROLL-006 - Withdraw or Remove Enrollment
- Description: The system must allow a Student to change their own enrollment from ACTIVE to WITHDRAWN when course policy permits, and allow an assigned Lecturer or Administrator to change an authorized course enrollment from ACTIVE to REMOVED. The enrollment must cease to grant course access immediately after either transition.
- Priority: Medium

### FR-ENROLL-007 - Maintain Enrollment Status and History
- Description: The system must keep Student, Course, current status, initial enrollment date, and latest status-change date on the Enrollment record. On initial creation and every status transition, the system must append an Enrollment Status History entry with the enrollment reference, previous status, new status, change timestamp, acting user, and optional reason. History entries must remain append-only through withdrawal, removal, and re-enrollment so Learning Analytics can derive periods of non-participation from transition history rather than current status alone; prior learning and assessment data must remain available for authorized historical reporting.
- Priority: High

### 3.1 Enrollment Status Model

An Enrollment has exactly three statuses: `ACTIVE` (current participation), `WITHDRAWN` (the Student ended participation), and `REMOVED` (an authorized Lecturer or Administrator ended participation). Completion belongs to Learning Progress and never changes the Enrollment status. The terms "inactive enrollment" and "previous inactive enrollment" mean `WITHDRAWN` or `REMOVED`.

| From | To | Permitted Actor | Condition |
| --- | --- | --- | --- |
| ACTIVE | WITHDRAWN | Student (own enrollment) | Course policy permits withdrawal |
| ACTIVE | REMOVED | Assigned Lecturer, Administrator | Actor authorized for the course |
| WITHDRAWN | ACTIVE | Student, Assigned Lecturer, Administrator | Course permits enrollment |
| REMOVED | ACTIVE | Assigned Lecturer, Administrator only | Reinstatement decision |

No other transition is valid. A newly created Enrollment starts as `ACTIVE`; its first history entry has an empty previous-status field, which is not another status. For `WITHDRAWN` to `ACTIVE`, the audited Administrator override in UC-ENROLL-002/A3 is the sole exception to the enrollment-window condition above, not a new transition.

## 4. Use Cases

### UC-ENROLL-001 - Student Enrolls in a Course
- Related Requirements: FR-ENROLL-001, FR-ENROLL-003, FR-ENROLL-007
- Primary Actor: Student
- Preconditions:
    * The Student is authenticated with an active account.
    * The target course exists, its course publication state is published, and its enrollment window accepts new enrollments.
- Trigger: The Student selects Enroll on the course page.
- Main Flow:
    1. The system identifies the Student and target course.
    2. The system checks the course publication state, enrollment window, and whether an ACTIVE enrollment already exists.
    3. The Student confirms enrollment.
    4. The system creates an ACTIVE Enrollment or conditionally changes the existing WITHDRAWN Enrollment to ACTIVE, then appends the status history entry.
    5. The system confirms enrollment and adds the course to the Student's enrolled-course list.
- Alternative Flows:
    * A1 - Previously WITHDRAWN: The system reactivates the existing record when the enrollment window accepts new enrollments.
    * A2 - Cancel Enrollment: The Student cancels before confirmation; no enrollment changes.
- Exception Flows:
    * E1 - Enrollment Window Closed or Course Unpublished: The system rejects the request and identifies the applicable enrollment restriction.
    * E2 - Already Enrolled: The system retains the existing ACTIVE enrollment and informs the Student, including when another concurrent request succeeded first.
    * E3 - Account Inactive: The system denies the request.
    * E4 - Previously REMOVED: The system denies self-enrollment until an authorized Lecturer or Administrator reinstates the Student.
- Postconditions:
    * On success, exactly one ACTIVE Enrollment exists for the Student and Course. Course content access still depends on content availability.

### UC-ENROLL-002 - Lecturer or Administrator Enrolls a Student
- Related Requirements: FR-ENROLL-002, FR-ENROLL-003, FR-ENROLL-007, FR-ACCESS-010
- Primary Actor: Lecturer, Administrator
- Preconditions:
    * The actor is authenticated and authorized to manage the target course.
    * The Student has an existing active account; the enrollment window accepts new enrollments for the normal flow.
- Trigger: The actor selects Add Student from the course roster.
- Main Flow:
    1. The system displays the target course roster and enrollment action.
    2. The actor selects an existing Student.
    3. The system verifies the Student's account, the enrollment window, the actor's permission, and absence of an ACTIVE enrollment.
    4. The system creates an ACTIVE Enrollment or conditionally changes an existing WITHDRAWN or REMOVED Enrollment to ACTIVE, then appends the status history entry.
    5. The system confirms the change and updates the roster.
- Alternative Flows:
    * A1 - Cancel: The actor cancels before saving; the roster is unchanged.
    * A2 - Previous WITHDRAWN or REMOVED Enrollment: The system reactivates the existing record when the actor is permitted by the status transition model.
    * A3 - Administrator Override: If the enrollment window is closed, only an Administrator may choose a separately confirmed override, enter a mandatory reason, and enroll or reinstate the Student. The system records the acting Administrator, timestamp, and reason in Enrollment Status History and the administrative audit log. The enrollment does not bypass course publication state or content availability.
- Exception Flows:
    * E1 - Student Account Not Found or Inactive: The system rejects the enrollment.
    * E2 - Already Enrolled: The system does not create a duplicate, including when a concurrent request succeeded first.
    * E3 - Enrollment Window Closed: The system rejects the action unless the Administrator completes A3.
    * E4 - Lecturer Not Assigned: The system rejects the action.
    * E5 - Override Reason Missing: The system rejects the override without a reason.
- Postconditions:
    * On success, one ACTIVE Enrollment links the selected Student and Course; any override has both history and audit entries.

### UC-ENROLL-003 - View Course Roster
- Related Requirements: FR-ENROLL-004, FR-ENROLL-007
- Primary Actor: Lecturer, Administrator
- Preconditions:
    * The actor is authenticated and authorized to view the target course.
- Trigger: The actor opens the course roster.
- Main Flow:
    1. The system verifies the actor's permission for the course.
    2. The system retrieves the course's ACTIVE enrollments.
    3. The system displays the Students, enrollment status, latest status-change date, and derived account status.
- Alternative Flows:
    * A1 - Empty Roster: The system displays an empty state when there are no ACTIVE enrollments.
    * A2 - Include Participation History: The actor selects the history view; the system includes WITHDRAWN and REMOVED entries with their enrollment status, latest status-change date, and derived account status.
- Exception Flows:
    * E1 - Course Not Found: The system reports that the course does not exist.
    * E2 - Unauthorized Access: The system denies the roster request.
- Postconditions:
    * The roster is displayed without changing enrollment data.

### UC-ENROLL-004 - Student Views Enrolled Courses
- Related Requirements: FR-ENROLL-005
- Primary Actor: Student
- Preconditions:
    * The Student is authenticated with an active account.
- Trigger: The Student opens My Courses.
- Main Flow:
    1. The system retrieves the Student's ACTIVE enrollments.
    2. The system shows the associated courses, course publication state, and content availability.
    3. The Student selects a published course with available content to open its published materials.
- Alternative Flows:
    * A1 - Progress View: Learning Progress groups the courses as in progress or completed, orders them by recent access, and displays any available progress percentage.
    * A2 - No Enrollments: The system displays an empty state and offers navigation to courses whose course publication state is published.
- Exception Flows:
    * E1 - Content Unavailable: The system shows the ACTIVE enrollment but does not open restricted course content when content availability prevents access.
    * E2 - Enrollment WITHDRAWN or REMOVED: The system excludes the course from the ACTIVE list and denies enrollment-based access to its content.
    * E3 - Course Unpublished: The system shows the ACTIVE enrollment but does not open restricted course content when course publication state is unpublished.
- Postconditions:
    * No enrollment data changes; only courses with ACTIVE enrollment are shown as current participation.

### UC-ENROLL-005 - Student Withdraws from a Course
- Related Requirements: FR-ENROLL-006, FR-ENROLL-007
- Primary Actor: Student
- Preconditions:
    * The Student is authenticated and has an ACTIVE enrollment in the course.
    * The course permits student withdrawal.
- Trigger: The Student selects Withdraw from the enrolled course.
- Main Flow:
    1. The system displays the target enrollment and requests confirmation.
    2. The Student confirms withdrawal.
    3. The system changes the enrollment status from ACTIVE to WITHDRAWN, updates the latest status-change date, and appends a status history entry.
    4. The system removes the course from the Student's ACTIVE enrolled-course list and revokes access to restricted course content.
- Alternative Flows:
    * A1 - Cancel: The Student cancels; enrollment remains ACTIVE.
- Exception Flows:
    * E1 - Withdrawal Not Permitted: The system rejects the request and retains the ACTIVE enrollment.
    * E2 - No ACTIVE Enrollment: The system reports that there is no ACTIVE enrollment to withdraw.
- Postconditions:
    * The participation record remains for history, but it no longer grants course access.

### UC-ENROLL-006 - Lecturer or Administrator Removes a Student
- Related Requirements: FR-ENROLL-006, FR-ENROLL-007, FR-ACCESS-010
- Primary Actor: Lecturer, Administrator
- Preconditions:
    * The actor is authenticated and authorized to manage the course.
    * The selected Student has an ACTIVE enrollment in that course.
- Trigger: The actor selects Remove Student on the roster.
- Main Flow:
    1. The system displays the target Student and enrollment for confirmation.
    2. The actor confirms removal.
    3. The system changes the enrollment status from ACTIVE to REMOVED, updates the latest status-change date, and appends a status history entry and an administrative audit entry.
    4. The system updates the roster and revokes the Student's access to restricted course content.
- Alternative Flows:
    * A1 - Cancel: The actor cancels; enrollment remains ACTIVE.
- Exception Flows:
    * E1 - Lecturer Not Assigned: The system denies the removal.
    * E2 - No ACTIVE Enrollment: The system reports that the Student is not currently enrolled.
- Postconditions:
    * The Student no longer appears on the active roster; historical participation and learning data are retained.

## 5. Business Rules

### BR-ENROLL-001 - One Active Enrollment Per Student and Course
- Description: A persistence-layer uniqueness constraint must permit at most one Enrollment record per (Student, Course) pair, regardless of status. Re-enrollment must conditionally update that record to ACTIVE rather than use check-then-insert. Concurrent requests must resolve to exactly one ACTIVE enrollment; losing requests follow the already-enrolled exception flow.

### BR-ENROLL-002 - Enrollment Eligibility
- Description: Self-enrollment requires an active Student account, a course publication state set to published, and an enrollment window accepting new enrollments. Normal staff enrollment requires an active Student account, an enrollment window accepting new enrollments, and an authorized Administrator or assigned Lecturer. Only an Administrator may override a closed enrollment window through a separately confirmed action with a mandatory reason recorded with the acting Administrator and timestamp in Enrollment Status History and the administrative audit log. The override creates or reactivates enrollment only; it does not change course publication state, content availability, or their access rules.

### BR-ENROLL-003 - Enrollment-Based Content Access
- Description: An ACTIVE enrollment is required for enrollment-based access to course content. Course publication state determines whether the course is published. The enrollment window determines whether new enrollment is accepted, without itself changing an existing Student's content access. Content availability independently determines whether published materials can be opened. A transition to WITHDRAWN or REMOVED revokes enrollment-based access immediately.

### BR-ENROLL-004 - Course-Scoped Management
- Description: A Lecturer may view or change enrollments only in assigned courses. An authorized Administrator may manage enrollments across courses. A Student may view or withdraw only their own enrollment.

### BR-ENROLL-005 - Participation and Learning History
- Description: The Enrollment record holds Student, Course, current status, initial enrollment date, and latest status-change date as fast-path fields. Initial creation and every transition append an Enrollment Status History entry containing the enrollment reference, previous status, new status, change timestamp, acting user, and optional reason; previous status is empty only for initial creation. These entries are append-only and are never modified or deleted by withdrawal, removal, or re-enrollment. Learning Analytics must derive periods of non-participation from this history rather than current status alone. Existing progress and assessment results remain available for authorized historical reporting. Course completion belongs to Learning Progress and does not change Enrollment status.

### BR-ENROLL-006 - Re-enrollment
- Description: A WITHDRAWN Enrollment may return to ACTIVE while the enrollment window accepts new enrollments, except for an audited Administrator override under UC-ENROLL-002/A3. A REMOVED Enrollment may return to ACTIVE only by a reinstatement decision from an assigned Lecturer or Administrator; a closed enrollment window additionally requires the Administrator override. Reactivation must reuse the single Enrollment record and preserve its status history and existing learning history.

### BR-ENROLL-007 - Account Status and Enrollment Independence
- Description: Deactivating a user account must not change any enrollment status; account lifecycle is system-scoped while enrollment lifecycle is course-scoped. BR-ACCESS-002 already denies access for inactive accounts without an enrollment transition. The roster must display the Student's account status as a derived indicator alongside enrollment status so an assigned Lecturer can identify an ACTIVE enrollee who cannot sign in. Learning Analytics must exclude periods of account deactivation when computing inactivity and engagement indicators to avoid a false at-risk signal.
