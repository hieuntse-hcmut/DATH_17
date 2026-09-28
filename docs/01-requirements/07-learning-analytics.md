# Learning Analytics

## 1. Overview
- This module is a **mandatory advanced component** of the project (Direction 5). It ingests learning behavior data and assessment results, computes a risk score and risk level for each student per course, explains the contributing factors (risk factors), displays them on a lecturer dashboard, and supports the lecturer in taking intervention actions.
- MVP scope: a rule-based baseline model, a lecturer dashboard, and evaluation on simulated student data. Out of MVP scope: an actual ML model (only to be done if sufficient labeled data is available).

## 2. Actors
- Lecturer (primary user)
- Admin (course-level/system-level aggregate statistics)

## 3. Functional Requirements
### FR-ANL-001 - Collect Learning Indicators
- Description: The system aggregates raw data from `LearningActivity` (module 04) and `Assessment` (module 05) into indicators per student/course, on a predefined cycle.
- Priority: Must-have

### FR-ANL-002 - Compute Risk Score
- Description: The system computes a numeric risk score for each student/course using a weighted-sum formula over the collected indicators.
- Priority: Must-have

### FR-ANL-003 - Classify Risk Level
- Description: The system maps the risk score to a Low / Medium / High level based on configurable thresholds.
- Priority: Must-have

### FR-ANL-004 - Generate Risk Factor Explanations
- Description: For each risk assessment, the system stores the top contributing factors (e.g., "3 missed deadlines", "no login in 10 days") so the lecturer understands why a student was flagged.
- Priority: Must-have

### FR-ANL-005 - Lecturer Risk Dashboard
- Description: The lecturer views a list of students (filterable/sortable) with their current risk level, trend, and last update time, per course.
- Priority: Must-have

### FR-ANL-006 - Lecturer Views Student Risk Details
- Description: The lecturer can drill down into an individual student to see the history/trend of their risk score and an analysis of the risk factors.
- Priority: Must-have

### FR-ANL-007 - Trigger Intervention
- Description: The lecturer can send a reminder/support message directly to a flagged student from the dashboard (integrated with FR-INT-007, module 06).
- Priority: Must-have

### FR-ANL-008 - Log Intervention Outcome
- Description: The system records that an intervention was sent and (optionally) tracks whether the risk score improves afterward.
- Priority: Should-have

### FR-ANL-009 - Course-Level Aggregate Analytics
- Description: Admin/lecturer can view course-level statistics: enrollment count, completion rate, average score, and the percentage of students at each risk level.
- Priority: Should-have

### FR-ANL-010 - Evaluate Against Simulated Profiles
- Description: The system supports running the risk model against a set of simulated student profiles with expected labels, in order to validate and report on model effectiveness (a mandatory requirement of the assignment).
- Priority: Must-have (mandatory for the report/demo)

## 4. Use Cases
### UC-ANL-001 - Lecturer Views At-Risk Student Dashboard
- Related Requirements: FR-ANL-005
- Primary Actor: Lecturer
- Preconditions: A risk assessment already exists for the course.
- Trigger: The Analytics tab of the course is opened.
- Main Flow: 1. The system retrieves the latest `RiskAssessment` for each student.
2. It displays the list sorted by risk level (High first) with filters available.
- Postconditions: None (read-only).

### UC-ANL-002 - Lecturer Views Risk Explanation
- Related Requirements: FR-ANL-004, FR-ANL-006
- Primary Actor: Lecturer
- Preconditions: A `RiskAssessment` exists for the selected student.
- Trigger: The lecturer clicks on a student row.
- Main Flow: 1. A trend chart of the score over time is displayed.
2. A list of risk factors with their values is displayed (e.g., "Logins: 0 times in the last 14 days").
- Postconditions: None.

### UC-ANL-003 - Lecturer Sends an Intervention
- Related Requirements: FR-ANL-007, FR-ANL-008
- Primary Actor: Lecturer
- Preconditions: The student is at Medium/High risk level.
- Trigger: The lecturer clicks "Send Reminder".
- Main Flow: 1. The lecturer selects/writes a message.
2. The system creates an `Intervention` record linked to the `RiskAssessment` and sends it through the notification module.
3. At the next scoring cycle, the system may compare the risk score before and after.
- Postconditions: The intervention is recorded.

## 5. Business Rules
### BR-ANL-001 - Scoring Frequency
- Description: The risk score is recomputed daily (a nightly batch job), with an option to recompute manually on demand.

### BR-ANL-002 - Weighted-Sum Risk Model
- Description: The risk score is calculated from normalized risk indicators using `RiskScore = Σ(w_i × r_i)`, where `r_i` is a normalized risk indicator in [0,100] and `w_i` is the team-defined non-negative weight for indicator `i`. The weights must sum to 1 and must be applied consistently to students evaluated under the same model version.

### BR-ANL-003 - Risk Thresholds
- Description: The risk score ranges over [0,100]. The current thresholds are 0–39 = Low, 40–69 = Medium, 70–100 = High; they may be calibrated using the simulated-profile evaluation before the final model version is fixed.

### BR-ANL-004 - Cold-Start Handling
- Description: Students enrolled for fewer than X days, or who have insufficient data (e.g., fewer than 2 recorded learning sessions), are shown "Insufficient data" instead of being assigned a risk level, to avoid false positives.

### BR-ANL-005 - Explainability Requirement
- Description: Every `RiskAssessment` must be traceable to at least one `RiskFactor` with a human-readable description; a raw score without an explanation does not satisfy the rubric requirement for "explanation and intervention action".

### BR-ANL-006 - Privacy/Ethical Use
- Description: Risk scores, risk levels, risk factors, and contributing risk indicators are visible only to the lecturer responsible for that course and to authorized Admins. Students cannot access their own or another student's risk assessment data. The use of behavioral data for this purpose must be clearly disclosed.
