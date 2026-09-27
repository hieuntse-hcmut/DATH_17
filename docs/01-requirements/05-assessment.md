# ASSESSMENT MODULE SPECIFICATION

## 1. Overview

**Short Description:** The Assessment Module manages the entire evaluation process for learners in the online learning platform. It allows Lecturers to create, configure, manage question banks, and conduct tests/quizzes (multiple-choice and essay). Students can take assessments online and receive auto-graded results or instructor feedback. Additionally, the module integrates automated risk-score calculation using a weighted-sum method to help Lecturers and Admins monitor academic risk without exposing risk levels to Students.

**Module Scope:**
* Question bank and test management.
* Assessment configuration (time limit, max attempts, password, question shuffling).
* Online test execution with automated background saving and countdown timer.
* Automated grading for objective questions (multiple-choice) and manual grading for essays.
* Risk score evaluation based on a weighted-sum algorithm for academic risk monitoring.
* Result statistics, reporting, and answer/feedback release.

---

## 2. Actors

* **Student:** Primary actor who takes assessments, submits responses, and views final scores and feedback. *Note: Students cannot view risk statuses or risk scores.*
* **Lecturer:** Actor who manages question banks, creates tests, configures risk weights, grades essay responses, views student risk status/alerts, and accesses performance analytics.
* **Admin:** System administrator who configures global parameters, manages user roles, oversees system-wide assessment logs, and monitors institutional risk reports.

---

## 3. Functional Requirements

**FR-ASSESSMENT-001 - Question Bank Management**
  
  * **Description:** Allows Lecturers to create, edit, delete, and categorize questions (multiple-choice, essay, true/false) by topic or difficulty level.
  * **Priority:** Must-have

**FR-ASSESSMENT-002 - Assessment Configuration**
  * **Description:** Enables Lecturers to create tests, set start/end times, limit duration, set maximum attempts, configure access passwords, and set grading criteria.
  * **Priority:** Must-have

**FR-ASSESSMENT-003 - Online Assessment Execution**
  * **Description:** Provides an online test-taking interface for Students featuring a countdown timer, periodic auto-saving of answers, and automatic submission upon time expiry.
  * **Priority:** Must-have

**FR-ASSESSMENT-004 - Automated Objective Grading**
  * **Description:** Automatically evaluates multiple-choice and true/false responses against standard answer keys upon submission.
  * **Priority:** Must-have

* **FR-ASSESSMENT-005 - Essay Manual Grading**
  * **Description:** Enables Lecturers to review essay submissions, enter scores, attach feedback, and update total test scores.
  * **Priority:** Must-have

**FR-ASSESSMENT-006 - Results & Performance Reporting**
  * **Description:** Displays scores, attempt history, and answer details (if permitted) to Students, while providing statistical performance reports to Lecturers and Admins.
  * **Priority:** Must-have

**FR-ASSESSMENT-007 - Weighted-Sum Risk Score Calculation**
  * **Description:** Calculates a student's academic risk score based on a weighted-sum formula using factors such as assessment scores, attempt counts, and submission timing. Risk scores and risk statuses are accessible exclusively to Lecturers and Admins; Students cannot view their risk status.
  * **Priority:** Should-have

---

## 4. Use Cases

### UC-ASSESSMENT-01 - Take Assessment
* **Related Requirements:** FR-ASSESSMENT-003, FR-ASSESSMENT-004
* **Primary Actor:** Student
* **Supporting Actor:** Admin
* **Description:** The Student answers assessment questions online within a specified time limit and submits the test for evaluation.
* **Trigger:** Student clicks the "Start Assessment" button for an available test.
* **Preconditions:**
  1. Student is logged into the system.
  2. Student is enrolled in the course containing the assessment.
  3. Assessment status is open (between Start Time and End Time).
* **Postconditions:**
  1. Student responses are saved with a submission timestamp.
  2. Objective questions are automatically graded.
  3. Attempt status is updated to "Submitted" or "Graded".
  4. System updates internal metrics for weighted-sum risk assessment (invisible to Student).
* **Main Flow:**
  1. Student selects an assessment from the course module.
  2. System displays assessment overview (duration, question count, remaining attempts, instructions).
  3. Student selects "Start Assessment".
  4. System validates access rules (BR-ASSESSMENT-01, BR-ASSESSMENT-02), initializes the test session, starts the countdown timer, and displays questions.
  5. Student selects or enters answers for questions.
  6. System periodically auto-saves answers every 30 seconds (BR-ASSESSMENT-03).
  7. Student selects "Submit Assessment".
  8. System displays a confirmation dialog showing completed question counts.
  9. Student confirms submission.
  10. System ends the session, records completion time, automatically grades objective questions, and displays the result summary.
  11. Use case ends.
* **Alternative Flows:**
  * **4a. Password-protected Assessment:**
    * 4a1. System prompts Student for an access password.
    * 4a2. Student enters password and confirms.
    * 4a3. System validates password; resumes at step 4.
  * **10a. Assessment Contains Essay Questions:**
    * 10a1. System calculates score for objective questions only.
    * 10a2. System updates submission status to "Awaiting Grading".
    * 10a3. System informs Student that official final score will be published after Lecturer grades the essay portion; use case ends.
* **Exception Flows:**
  * **E1 – Time Expired (steps 5–6):**
    * E1.1. Countdown timer reaches 00:00.
    * E1.2. System disables answer selection UI.
    * E1.3. System automatically gathers all saved answers and submits the test.
    * E1.4. System displays message: "Time expired. Your assessment has been automatically submitted."; proceeds to step 10.
  * **E2 – Maximum Attempts Exceeded (step 4):**
    * E2.1. System detects Student has reached maximum allowed attempts.
    * E2.2. System displays error message: "You have reached the maximum number of attempts for this assessment."
    * E2.3. Use case ends unsuccessfully.
  * **E3 – Network Disconnection (any step during test execution):**
    * E3.1. System detects network outage and alerts offline status.
    * E3.2. Student restores connection.
    * E3.3. System synchronizes cached responses to server; resumes at step 5.
* **Business Rules:** BR-ASSESSMENT-01, BR-ASSESSMENT-02, BR-ASSESSMENT-03
* **Special Requirements:** System UI must respond to answer selection within $\le 1$ second.
* **Frequency of Use:** ~500–1000 attempts/day during peak assessment periods.
* **Assumptions:** Student device time is synchronized with server standard time.

---

### UC-ASSESSMENT-02 - Create and Configure Assessment
* **Related Requirements:** FR-ASSESSMENT-001, FR-ASSESSMENT-002
* **Primary Actor:** Lecturer
* **Supporting Actor:** Admin
* **Description:** Lecturer sets up a new assessment, configures parameters (time limit, access password, attempt limits), and links questions from the question bank.
* **Trigger:** Lecturer selects "Create New Assessment" in course management.
* **Preconditions:**
  1. Lecturer is authenticated with course management permissions.
  2. Course is active on the system.
  3. Question bank contains valid questions for the course.
* **Postconditions:**
  1. Assessment is created with status "Draft" or "Published".
  2. Questions and configuration parameters are successfully linked.
* **Main Flow:**
  1. Lecturer selects "Create New Assessment".
  2. System displays assessment configuration form.
  3. Lecturer enters general information (Title, Description, Time Limit, Open/Close Dates, Max Attempts).
  4. Lecturer selects questions from the question bank to include in the test.
  5. System validates information completeness and score weights.
  6. Lecturer selects "Save and Publish".
  7. System saves configuration, updates status to "Published", and displays success message.
  8. Use case ends.
* **Alternative Flows:**
  * **6a. Save as Draft:**
    * 6a1. Lecturer selects "Save as Draft".
    * 6a2. System stores assessment under "Draft" status (invisible to Students).
    * 6a3. Use case ends.
* **Exception Flows:**
  * **E1 – No Questions Selected (step 5):**
    * E1.1. System detects assessment contains zero questions.
    * E1.2. System displays error: "Assessment must contain at least 1 question."
    * E1.3. Lecturer adds questions; returns to step 4.
* **Business Rules:** BR-ASSESSMENT-02, BR-ASSESSMENT-04
* **Special Requirements:** Filter and search question bank by tag or difficulty in $\le 2$ seconds.
* **Frequency of Use:** ~10–20 times/week per course.
* **Assumptions:** Selected question bank items have been proofread and approved.

---

### UC-ASSESSMENT-03 - Grade Essay Assessment
* **Related Requirements:** FR-ASSESSMENT-005, FR-ASSESSMENT-006
* **Primary Actor:** Lecturer
* **Supporting Actor:** Admin
* **Description:** Lecturer reviews student essay responses, assigns scores per question, provides qualitative feedback, and finalizes total test scores.
* **Trigger:** Lecturer selects a submission in "Awaiting Grading" status.
* **Preconditions:**
  1. Lecturer is logged in.
  2. Student has submitted an assessment containing essay questions.
* **Postconditions:**
  1. Essay scores are recorded.
  2. Student total assessment score is updated.
  3. Submission status transitions to "Graded".
  4. Risk score calculation is automatically refreshed (BR-ASSESSMENT-06).
* **Main Flow:**
  1. Lecturer selects "Submissions Pending Grading".
  2. System displays list of ungraded submissions.
  3. Lecturer selects a specific Student submission.
  4. System displays essay questions along with Student answers.
  5. Lecturer inputs scores and comments for each essay item.
  6. Lecturer selects "Finalize Grading".
  7. System checks score bounds (BR-ASSESSMENT-05), computes final score, and updates feedback records.
  8. System sends notification to Student and updates submission status to "Graded".
  9. Use case ends.
* **Alternative Flows:**
  * **6a. Save Partial Evaluation:**
    * 6a1. Lecturer selects "Save Draft Grade".
    * 6a2. System preserves entered scores and comments, keeping status as "In Grading".
    * 6a3. Use case ends.
* **Exception Flows:**
  * **E1 – Score Exceeds Maximum (step 7):**
    * E1.1. System detects entered score is greater than maximum weight for the question.
    * E1.2. System displays error: "Score cannot exceed the maximum question point limit."
    * E1.3. Lecturer adjusts score; returns to step 5.
* **Business Rules:** BR-ASSESSMENT-05, BR-ASSESSMENT-06
* **Special Requirements:** Support attaching PDF or image files in feedback comments.
* **Frequency of Use:** Frequent following assessment deadlines.
* **Assumptions:** Essay response formatting displays correctly without corruption.

---

### UC-ASSESSMENT-04 - View Risk Assessment Reports
* **Related Requirements:** FR-ASSESSMENT-007
* **Primary Actor:** Lecturer
* **Supporting Actor:** Admin
* **Description:** Lecturer or Admin views calculated risk scores and risk classifications (e.g., Low Risk, High Risk) for students based on the weighted-sum model. Students are strictly blocked from accessing this view or seeing risk labels.
* **Trigger:** Lecturer or Admin selects "Risk Analytics" in the course dashboard.
* **Preconditions:**
  1. User is authenticated with Lecturer or Admin role.
  2. Course has active assessment data.
* **Postconditions:**
  1. System presents risk scores calculated via weighted-sum formula.
* **Main Flow:**
  1. Lecturer selects "Risk Analytics".
  2. System verifies user authorization (Admin/Lecturer).
  3. System retrieves student performance metrics and calculates risk scores using BR-ASSESSMENT-06 (weighted-sum method).
  4. System displays risk scores and risk categories alongside student names and assessment metrics.
  5. Use case ends.
* **Alternative Flows:**
  * **4a. Lecturer filters by risk level:**
    * 4a1. Lecturer selects a filter (e.g., "High Risk Only").
    * 4a2. System displays students matching the selected risk category.
    * 4a3. Use case ends.
* **Exception Flows:**
  * **E1 – Unauthorized Access Attempt by Student (step 2):**
    * E1.1. System detects requesting user has Student role.
    * E1.2. System blocks access and returns "403 Forbidden - Access Denied".
    * E1.3. Use case ends.
* **Business Rules:** BR-ASSESSMENT-06
* **Special Requirements:** Risk score dashboard must load in $\le 3$ seconds.
* **Frequency of Use:** Daily/Weekly by teaching staff and admins.
* **Assumptions:** Weighted-sum parameter weights have been configured by teaching staff or system defaults.

---

## 5. Business Rules

**BR-ASSESSMENT-01 - Time Limit Constraint**
  * **Description:** Every assessment has a designated Time Limit (in minutes). When the countdown timer reaches zero, the system must immediately lock response editing and force-submit all existing answers.

**BR-ASSESSMENT-02 - Maximum Attempt Limit**
  * **Description:** Students are permitted to attempt an assessment only up to Max Attempts. Official grade calculation depends on course configuration (Highest Attempt, Average Attempt, or Last Attempt).

**BR-ASSESSMENT-03 - Periodic Auto-Save**
  * **Description:** During active assessment sessions, the system must auto-save student response data to the server at least once every 30 seconds to prevent data loss due to network interruptions.

**BR-ASSESSMENT-04 - Question and Option Shuffling**
  * **Description:** If "Randomize Questions/Answers" is enabled, the system must shuffle question order and option sequences uniquely for each student attempt.

**BR-ASSESSMENT-05 - Essay Grading Range Constraint**
  * **Description:** Points assigned to essay responses must lie in the range $[0, \text{Max Score}]$. Negative scores or scores exceeding Max Score are rejected by the system.

**BR-ASSESSMENT-06 - Weighted-Sum Risk Score Calculation & Access Control**
  * **Description:** Student risk scores are calculated using a weighted-sum formula over normalized assessment parameters:
    $$\text{Risk Score} = \sum_{i=1}^{n} (w_i \times f_i)$$
    where $w_i$ represents the weight assigned to factor $i$ (decided by team/course settings) and $f_i$ represents the normalized risk factor metric (e.g., assessment score deficit, attempt usage ratio, delay in submission).
  * **Access Restriction:** Risk scores, risk levels, and risk factor indicators are visible exclusively to Lecturers and Admins. Under no circumstances shall risk statuses or scores be exposed to Student users.