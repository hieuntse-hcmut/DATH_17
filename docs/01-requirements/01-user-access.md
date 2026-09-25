# User Access Requirements

## 1. Overview

- Module Description: Manages user accounts, authentication, and role-based access for the Smart Campus web platform.
- Scope: Covers administrator-provisioned accounts, sign-in and sign-out, account status and role management, profile and credential updates, and authorization of protected resources. Course enrollment and lecturer-to-course assignments are managed by their respective modules; this module uses those relationships when checking access. External identity providers and public self-registration are outside the initial scope.
- Cross-module note: Deactivating an account does not alter the user's enrollments; see BR-ENROLL-007.

## 2. Actors

- Student: Signs in to participate in enrolled courses and manages their own account information.
- Lecturer: Signs in to manage assigned courses and view information about students in those courses.
- Administrator: Creates and manages accounts, roles, and account status across the platform.

## 3. Functional Requirements

### FR-ACCESS-001 - Create User Account
- Description: The system must allow an administrator to create a user account with a unique login identifier, initial credentials, and at least one authorized role: Student, Lecturer, or Administrator. Accounts are active by default, but the Administrator may create an account in inactive state.
- Priority: High

### FR-ACCESS-002 - Authenticate User
- Description: The system must verify a user's login identifier and credentials, confirm that the account is active, and establish an authenticated session only when all checks succeed.
- Priority: High

### FR-ACCESS-003 - Sign Out
- Description: The system must allow an authenticated user to sign out and invalidate the current session so it can no longer access protected resources.
- Priority: High

### FR-ACCESS-004 - Enforce Role and Resource Permissions
- Description: The system must authorize each protected action using the user's role and relevant resource relationship. A Student may access their own permitted information and available content in courses with ACTIVE enrollment; a Lecturer may manage and inspect only assigned courses and their students; an Administrator may perform system-level management. The same checks must apply to direct requests as to navigation in the user interface.
- Priority: High

### FR-ACCESS-005 - Manage Account Roles and Status
- Description: The system must allow an administrator to view accounts, update their assigned roles, and activate or deactivate accounts. Role or status changes must invalidate the affected account's existing sessions so outdated permissions cannot be used.
- Priority: High

### FR-ACCESS-006 - Update Own Profile
- Description: The system must allow an authenticated user to view and update supported personal profile fields while preventing changes to their own roles, account status, or login identifier through profile editing.
- Priority: Medium

### FR-ACCESS-007 - Change or Reset Credentials
- Description: The system must allow an authenticated user to change their own password after verifying the current password, and allow an Administrator to initiate a credential reset when the user cannot sign in. A reset must issue a single-use temporary credential to the account holder without disclosing a usable password to the Administrator; it must expire after a configured period and require a password change at the next successful sign-in before any protected resource is accessible. Existing sessions for that account must be invalidated after a successful password change or reset.
- Priority: High

### FR-ACCESS-008 - Protect Learning and Analytics Data
- Description: The system must allow a Student to view their own progress, activity, and assessment results, but must deny the Student access to their own risk level, risk factors, and contributing indicators as presented in a risk assessment. The system must restrict a Lecturer to records and risk assessments for Students in assigned courses, and an Administrator to authorized system-level views.
- Priority: High

### FR-ACCESS-009 - Limit Authentication Attempts
- Description: The system must rate-limit authentication attempts per account and per source, temporarily lock out attempts after a configured number of consecutive failures, and use the same generic failure response for invalid credentials and lockout.
- Priority: High

### FR-ACCESS-010 - Record Administrative Actions
- Description: The system must append an administrative audit record for account creation, role change, account activation or deactivation, credential reset, enrollment override, and removal of a Student from a course. Each record must contain the acting user, target, action, timestamp, and reason where required. Audit records must be readable only by authorized Administrators and must never be modified or deleted.
- Priority: High

## 4. Use Cases

### UC-ACCESS-001 - Create User Account
- Related Requirements: FR-ACCESS-001, FR-ACCESS-004, FR-ACCESS-010
- Primary Actor: Administrator
- Preconditions:
    * The administrator is authenticated and authorized to manage users.
- Trigger: The administrator chooses to create an account.
- Main Flow:
    1. The system displays the account creation form.
    2. The administrator enters a login identifier, initial credentials, required profile details, and role.
    3. The system validates the required information and checks identifier uniqueness.
    4. The system creates an active account by default, or an inactive account if selected, stores its assigned role, and appends the administrative audit record.
    5. The system confirms creation to the administrator.
- Alternative Flows:
    * A1 - Create Inactive Account: The administrator selects inactive status; the system stores the account but prevents sign-in until activation.
    * A2 - Cancel Creation: The administrator cancels; no account is created.
- Exception Flows:
    * E1 - Duplicate Identifier: The system rejects the identifier and requests a unique one.
    * E2 - Invalid Data: The system identifies missing or invalid fields and requests correction.
    * E3 - Unauthorized Request: The system rejects account creation by a user without administrator permission.
- Postconditions:
    * A new account with its role and status is stored, or no account is created if the flow fails or is canceled.

### UC-ACCESS-002 - Sign In
- Related Requirements: FR-ACCESS-002, FR-ACCESS-004, FR-ACCESS-007, FR-ACCESS-009
- Primary Actor: Student, Lecturer, Administrator
- Preconditions:
    * The user has an existing account and is not authenticated in the current session.
- Trigger: The user submits a login identifier and password.
- Main Flow:
    1. The system receives the credentials.
    2. The system verifies the identifier and password.
    3. The system confirms that the account is active.
    4. The system establishes an authenticated session with the user's current roles.
    5. The system displays the authorized starting page.
- Alternative Flows:
    * A1 - Reset Credential Sign-In: After a reset under UC-ACCESS-007, the user presents the single-use temporary credential. The system permits only the required password-change flow; once the new password is set, it consumes the temporary credential and establishes an ordinary session. No protected resource is accessible before that change.
- Exception Flows:
    * E1 - Invalid Credentials: The system denies sign-in and displays a generic failure message.
    * E2 - Inactive Account: The system denies sign-in using the generic failure message.
    * E3 - Expired Temporary Credential: The system denies sign-in using the generic failure message; a new reset under UC-ACCESS-007 is required.
    * E4 - Rate Limit or Temporary Lockout: The system denies the attempt using the same generic failure message as E1.
- Postconditions:
    * A session exists only after successful authentication; unsuccessful attempts grant no access.

### UC-ACCESS-003 - Sign Out
- Related Requirements: FR-ACCESS-003
- Primary Actor: Student, Lecturer, Administrator
- Preconditions:
    * The user has an active authenticated session.
- Trigger: The user selects Sign Out.
- Main Flow:
    1. The system invalidates the current session.
    2. The system returns the user to a public or sign-in page.
- Alternative Flows:
    * A1 - Already Expired Session: The system directs the user to sign in again.
- Exception Flows:
    * E1 - Protected Request After Sign-Out: The system rejects the request and requires a new sign-in.
- Postconditions:
    * The previous session cannot be used to access protected resources.

### UC-ACCESS-004 - Manage User Role or Account Status
- Related Requirements: FR-ACCESS-004, FR-ACCESS-005, FR-ACCESS-010
- Primary Actor: Administrator
- Preconditions:
    * The administrator is authenticated and the target account exists.
- Trigger: The administrator selects a user account to update.
- Main Flow:
    1. The system displays the account's roles and status.
    2. The administrator changes the role assignment or account status.
    3. The system validates the requested change and administrator permission.
    4. The system saves the change, invalidates the affected account's existing sessions, and appends the administrative audit record.
    5. The system confirms the updated account details.
- Alternative Flows:
    * A1 - Cancel Change: The administrator leaves without saving; the account remains unchanged.
- Exception Flows:
    * E1 - Invalid Role or Status: The system rejects the change and requests a valid selection.
    * E2 - Account No Longer Exists: The system reports that the account cannot be updated.
    * E3 - Unauthorized Request: The system rejects the update.
- Postconditions:
    * Successful changes are stored; previous sessions cannot continue using outdated permissions.

### UC-ACCESS-005 - Update Own Profile
- Related Requirements: FR-ACCESS-006
- Primary Actor: Student, Lecturer, Administrator
- Preconditions:
    * The user is authenticated and has an active account.
- Trigger: The user opens and edits their profile.
- Main Flow:
    1. The system displays the user's editable profile fields.
    2. The user changes supported fields and submits them.
    3. The system validates the submitted values.
    4. The system saves and displays the updated profile.
- Alternative Flows:
    * A1 - Cancel Edit: The user cancels; the existing profile is retained.
- Exception Flows:
    * E1 - Invalid Profile Data: The system reports errors and keeps the prior values.
    * E2 - Restricted Field Change: The system rejects attempts to alter roles, status, or login identifier through this flow.
- Postconditions:
    * Only permitted profile fields are updated.

### UC-ACCESS-006 - Change Password
- Related Requirements: FR-ACCESS-007
- Primary Actor: Student, Lecturer, Administrator
- Preconditions:
    * The user is authenticated and has an active account.
- Trigger: The user chooses to change their password.
- Main Flow:
    1. The system requests the current and new passwords.
    2. The user submits both values.
    3. The system verifies the current password and validates the new one against the configured password policy.
    4. The system replaces the credentials and invalidates existing sessions for the account.
    5. The system asks the user to sign in with the new password.
- Alternative Flows:
    * A1 - Cancel Change: The user cancels and retains the current password.
- Exception Flows:
    * E1 - Incorrect Current Password: The system rejects the change.
    * E2 - Invalid New Password: The system explains the applicable policy and requests another password.
- Postconditions:
    * The new password is required for subsequent authentication after a successful change.

### UC-ACCESS-007 - Reset User Credentials
- Related Requirements: FR-ACCESS-005, FR-ACCESS-007, FR-ACCESS-010
- Primary Actor: Administrator
- Preconditions:
    * The administrator is authenticated and the target account exists.
- Trigger: The administrator selects Reset Credentials for the account.
- Main Flow:
    1. The system verifies the administrator's permission and displays the target account.
    2. The administrator confirms the reset.
    3. The system issues a single-use temporary credential to the account holder without showing it to the Administrator, sets its configured expiry, requires a password change on its next successful use before granting protected access, and invalidates existing sessions.
    4. The system appends an administrative audit record and confirms the reset to the Administrator without disclosing the credential.
- Alternative Flows:
    * A1 - Cancel Reset: The administrator cancels; the account is unchanged.
- Exception Flows:
    * E1 - Account Not Found: The system rejects the reset.
    * E2 - Unauthorized Request: The system rejects the reset.
- Postconditions:
    * The account holder must use the temporary credential and set a new password before protected access; no prior session remains valid. An expired temporary credential follows UC-ACCESS-002/E3.

### UC-ACCESS-008 - Access Protected Course or Learning Data
- Related Requirements: FR-ACCESS-004, FR-ACCESS-008
- Primary Actor: Student, Lecturer, Administrator
- Preconditions:
    * A protected resource exists and the user is authenticated with an active account.
- Trigger: The user opens or submits a request for a course resource, learning record, or risk assessment.
- Main Flow:
    1. The system identifies the requested resource and action.
    2. The system checks the user's role, the applicable enrollment or course assignment, and the course publication state and content availability where relevant.
    3. The system returns the resource or performs the action when all checks pass.
- Alternative Flows:
    * A1 - Administrator Access: The system applies administrator permissions to authorized system-level resources.
- Exception Flows:
    * E1 - No ACTIVE Enrollment: The system denies Student access to restricted course content when no enrollment exists or its status is WITHDRAWN or REMOVED.
    * E2 - Unassigned Lecturer: The system denies access to another lecturer's course or student records.
    * E3 - Expired Session or Inactive Account: The system requires sign-in or denies access.
    * E4 - Student Risk Data Request: The system denies a Student access to their own risk level, risk factors, or contributing indicators in a risk assessment.
- Postconditions:
    * Only an authorized request obtains the protected resource or changes its state.

### UC-ACCESS-009 - View and Search Accounts
- Related Requirements: FR-ACCESS-004, FR-ACCESS-005
- Primary Actor: Administrator
- Preconditions:
    * The Administrator is authenticated and authorized to manage user accounts.
- Trigger: The Administrator opens the account list or submits a search.
- Main Flow:
    1. The system verifies the Administrator's permission.
    2. The system lists accounts with their roles and account status.
    3. The Administrator enters a search term or selects supported filters.
    4. The system displays matching accounts for selection.
- Alternative Flows:
    * A1 - No Matches: The system displays an empty result without changing any account.
- Exception Flows:
    * E1 - Unauthorized Request: The system denies access to the account list and search results.
- Postconditions:
    * No account is changed; only an authorized Administrator can view the results.

## 5. Business Rules

### BR-ACCESS-001 - Unique Account Identity
- Description: Each account must have a unique login identifier. Only an administrator can create accounts or assign roles; a user cannot grant themselves additional permissions by editing their profile.

### BR-ACCESS-002 - Active Account and Session Requirement
- Description: Protected actions require a valid session for an active account. Sign-out, administrator changes to account roles or status, and credential changes or resets invalidate affected sessions. Account deactivation does not change enrollment status (BR-ENROLL-007).

### BR-ACCESS-003 - Role and Relationship Based Access
- Description: Role alone does not grant course-scoped access. Student access to restricted course content requires an ACTIVE enrollment, a published course publication state, and content availability; Lecturer management and student-data access require assignment to that course. Unauthorized direct requests must be rejected.

### BR-ACCESS-004 - Credential Protection
- Description: Passwords must be stored using a one-way password hash and never exposed in account views. The configured password policy must require at least 12 characters, reject known-breached and trivially common passwords, and avoid composition rules that force predictable substitutions. Authentication attempts must be rate-limited per account and per source, with temporary lockout after a configured number of consecutive failures. Invalid credentials, lockout, and expired temporary credentials must use a generic failure response that does not reveal account existence or lockout state.
- Dependency: Configuration and management of the password policy belong to Administration and Reporting (specification.md §4.9).

### BR-ACCESS-005 - Learning Data Privacy
- Description: A Student may view their own progress, activity, and assessment results, but not their own risk level, risk factors, or contributing indicators in a risk assessment. A Lecturer may view student progress and risk information only for assigned courses; authorized Administrators may access system-level views. This exclusion is a deliberate design decision: risk assessment is lecturer-facing decision support, and exposing a risk label to its Student could create a self-fulfilling effect. One Student's records must not be disclosed to another Student.

### BR-ACCESS-006 - Session Revocation
- Description: Session validity must be verifiable against server-side state on every protected request, through a server-side session store or a per-account token version compared on each request. Role changes, account deactivation, password changes, and credential resets must revoke affected sessions immediately rather than wait for token expiry.
