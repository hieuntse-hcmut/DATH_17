# Database Conventions and Migration Rules

## 1. Purpose

This document defines the shared database conventions for the Smart Campus LMS backend.

The ERD is the conceptual/logical reference for entities and relationships.
Flyway migration files are the executable history of the physical database schema.
After `V1__init_schema.sql` is accepted and merged, V1 is treated as the baseline and must not be edited.

## 2. Technology

- Database: MySQL 8.4
- Schema migration: Flyway
- Persistence: Spring Data JPA / JPA / Hibernate
- Hibernate schema policy: `ddl-auto=validate`
- Database naming: `snake_case`
- Java naming: `camelCase`

## 3. Primary Keys

Standalone entities use:

```sql
id BIGINT AUTO_INCREMENT PRIMARY KEY
```

Java entities should therefore normally use:

```java
private Long id;
```

Pure join tables may use composite primary keys where defined by the ERD.

## 4. Foreign Keys and Role Validation

Foreign keys guarantee that the referenced record exists.

They do NOT guarantee application roles. For example:

- `student_id -> users.id` does not prove that the user has role `STUDENT`.
- `lecturer_id -> users.id` does not prove that the user has role `LECTURER`.

Role-specific rules are validated in the Spring service/security layer.

## 5. Application Enums

Application states are stored as `VARCHAR`, not MySQL `ENUM`.

Examples:

- User role: `STUDENT`, `LECTURER`, `ADMIN`
- User status: `ACTIVE`, `INACTIVE`
- Course publication state: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- Enrollment status: `ACTIVE`, `COMPLETED`, `DROPPED`
- Assessment status: `DRAFT`, `PUBLISHED`, `CLOSED`
- Attempt status: `IN_PROGRESS`, `SUBMITTED`, `GRADED`
- Risk level: `LOW`, `MEDIUM`, `HIGH`
- Intervention status: `OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

Java should map these values using string enum mapping, for example:

```java
@Enumerated(EnumType.STRING)
private Role role;
```

Database `CHECK` constraints may enforce stable enum values.

## 6. Uniqueness Rules

The baseline enforces these important rules:

- `users.username` is unique.
- `users.email` is unique.
- One enrollment per `(student_id, course_id)`.
- One learning-progress record per `(student_id, lesson_id)`.
- One attempt number per `(assessment_id, student_id, attempt_number)`.
- One answer per `(attempt_id, question_id)`.
- Chapter `order_index` is unique within a course.
- Lesson `order_index` is unique within a chapter.
- Assessment-question `order_index` is unique within an assessment.

These constraints protect invariants even if application code has a bug or concurrent requests occur.

## 7. Delete Strategy

Do not physically delete users merely to deactivate an account. Use `users.status`.

Do not physically delete a course merely to stop publication. Use `courses.publication_state = 'ARCHIVED'` when appropriate.

Default policy for historical or learning records is `ON DELETE RESTRICT`.

`ON DELETE CASCADE` is reserved for records that are strongly owned by their parent, such as:

- `course_lecturers` when its course is deleted.
- chapters when their course is physically deleted.
- lessons when their chapter is physically deleted.
- learning materials when their lesson is physically deleted.
- `assessment_questions` when its assessment is deleted.
- attempt answers when their attempt is deleted.
- risk factors when their risk assessment is deleted.

A physical deletion that is blocked by `RESTRICT` must be handled explicitly by business logic rather than by weakening the foreign key casually.

## 8. Timestamp Strategy

Database timestamps use MySQL defaults.

For creation timestamps:

```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

For mutable records:

```sql
updated_at TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
```

Application code should not depend on nullable creation timestamps.

## 9. Scores and Numeric Precision

Do not use `FLOAT` for persisted scores or assessment points.

Use `DECIMAL`, for example:

```sql
score DECIMAL(8,2)
```

Risk score uses:

```sql
risk_score DECIMAL(5,2)
```

with range `0..100`.

Java should normally use `BigDecimal` for these fields.

## 10. Question and Answer Data

`question_bank.answer_data` and `attempt_answers.answer_data` use MySQL `JSON`.

This allows different answer structures for different question types without adding many nullable columns.

Initial question types:

- `SINGLE_CHOICE`
- `MULTIPLE_CHOICE`
- `TRUE_FALSE`
- `SHORT_ANSWER`

The Assessment module owner must define and document the JSON contract used by each question type before implementing serialization/deserialization.

## 11. Learning Activity and Progress

`learning_activities.lesson_id` is nullable because some learning events may not belong to a specific lesson.

`event_type` remains a `VARCHAR` so the application can evolve the event vocabulary. Event names should still be defined centrally in Java rather than scattered as string literals.

`last_position`, `current_position`, and `total_length` are non-negative integer position fields.

IMPORTANT OPEN CONTRACT:
The team must finalize the exact semantic/unit of these position fields before implementing progress tracking for multiple content types. For video/audio they may represent seconds; other lesson types may require a different interpretation.

A schema change discovered later must be introduced by a new Flyway migration rather than by editing an already-shared V1.

## 12. Learning Analytics

Risk assessments are historical snapshots, not a single overwritten current row.

Initial risk levels:

- `LOW`
- `MEDIUM`
- `HIGH`

Initial risk score range:

```text
0 <= risk_score <= 100
```

The risk-scoring formula, weights, thresholds, and factor calculation are application/business rules and belong primarily in the analytics service. They are not hard-coded into V1 except for the persisted score range and risk-level vocabulary.

Risk factors belong to one risk assessment.

Interventions reference the risk assessment that motivated the intervention and the user who created it.

## 13. Indexing

Indexes should support actual query patterns rather than being added to every column.

The baseline explicitly adds indexes for common/high-volume access patterns such as:

- learning activities by student and time
- learning activities by lesson and time
- assessment attempts by student
- risk assessments by student/course/time
- risk assessments by course/risk level

Primary keys, unique constraints, and MySQL foreign-key requirements already provide or require indexes in several other places.

Additional indexes should be justified by real queries or performance measurements.

## 14. Flyway Rules

`V1__init_schema.sql` is the initial database baseline.

Before V1 is accepted by the team, it may be corrected while the development database is disposable.

After V1 is merged/shared and used by the team:

1. Never edit, rename, or delete V1.
2. Every schema change gets a new versioned migration.
3. Never use Hibernate `ddl-auto=create` or `ddl-auto=update` as the team schema-management mechanism.
4. Use Hibernate `ddl-auto=validate`.
5. Never make an untracked manual schema change in MySQL and assume teammates will reproduce it.
6. Database objects such as tables, constraints, indexes, views, triggers, procedures, and functions must be created/changed through Flyway when they are part of the application schema.
7. Before merging a PR containing a migration, update/rebase from `main` and ensure the migration version is not duplicated.
8. Test migrations from a clean database when practical.
9. Once a migration has been merged/applied as shared history, fix mistakes with a later migration instead of rewriting history.

Example:

```text
V1__init_schema.sql
V2__add_course_thumbnail.sql
V3__add_activity_event_index.sql
V4__create_some_database_object.sql
```

Parallel backend work is allowed. Migration version conflicts are resolved before merging to `main`.

## 15. Application Layer Responsibilities

Flyway owns schema evolution.

JPA/Hibernate maps Java objects to the existing schema.

Spring services own most business workflows and validations.

The database should enforce structural/data-integrity invariants such as:

- primary keys
- foreign keys
- uniqueness
- nullability
- stable checks
- appropriate numeric ranges

Business rules such as authorization, role-specific actions, enrollment workflows, risk-score calculation, and intervention behavior normally belong in the application service/security layer.

## 16. Open Decisions Before Relevant Feature Implementation

The following details are intentionally not invented by the database baseline and must be finalized by the responsible module owner before implementation:

1. Exact semantics/units for lesson progress position fields across all content types.
2. Exact JSON schema for `question_bank.answer_data` and `attempt_answers.answer_data`.
3. Complete vocabulary for `learning_activities.event_type`.
4. Complete vocabulary for `lessons.content_type` and `learning_materials.file_type`.
5. Complete vocabulary for `risk_factors.factor_type`.
6. Complete vocabulary for `interventions.intervention_type`.

If one of these decisions requires a physical schema change after V1 has been shared, create V2/V3/etc.; do not edit V1.
