# Smart Campus – System Specification

## 1. Introduction

### 1.1 Purpose

Smart Campus is an online learning platform designed to support teaching,
learning, assessment, and learning-progress monitoring in a university
environment.

The platform provides lecturers with tools to organize courses and learning
materials, while students can participate in courses, access learning content,
complete assessments, and monitor their learning progress.

In addition to standard Learning Management System (LMS) functionality,
Smart Campus incorporates Learning Analytics and Early Warning capabilities
to help lecturers identify students who may be at risk of falling behind.

### 1.2 Objectives

The main objectives of Smart Campus are to:

- Provide a centralized environment for online teaching and learning.
- Support structured course and learning-content management.
- Allow students to participate in courses and track their learning progress.
- Support assignments, assessments, and learning interactions.
- Collect learning activity data generated during the learning process.
- Transform learning data into meaningful information for lecturers.
- Identify potentially at-risk students and support timely intervention.

---

## 2. System Context

Smart Campus operates as a web-based learning platform.

Students use the platform to participate in courses and learning activities.
Lecturers create and manage courses, deliver learning content, conduct
assessments, and monitor student performance.

Administrators maintain the overall learning environment by managing users,
courses, and system-level information.

During normal system usage, learning activities and assessment results are
recorded. The Learning Analytics component processes this information to
generate risk assessments that assist lecturers in identifying students who
may require additional support.

---

## 3. User Roles

### 3.1 Student

A Student is a learner participating in courses available through the system.

Students interact with learning content, assessments, discussions, and other
learning activities. The system records relevant learning progress and
activity information associated with the student.

### 3.2 Lecturer

A Lecturer is responsible for delivering and managing courses.

Lecturers organize course content, manage learning activities and assessments,
monitor student progress, and use learning analytics information to identify
students who may require intervention.

### 3.3 Administrator

An Administrator is responsible for maintaining the operational environment
of the platform.

Administrators manage users, courses, roles, and system-level information
necessary for the platform to operate correctly.

---

## 4. System Scope

Smart Campus consists of the following major functional areas:

### 4.1 Identity and Access Management

Provides user authentication, authorization, account management, and
role-based access to system resources.

### 4.2 Course Management

Provides facilities for creating, organizing, publishing, and managing
courses.

### 4.3 Learning Content Management

Allows learning materials to be organized into a structured hierarchy such
as courses, chapters, and lessons.

Learning content may include different forms of educational materials such
as documents, videos, and other supported resources.

### 4.4 Enrollment Management

Manages the relationship between students and the courses in which they
participate.

### 4.5 Learning Progress Tracking

Records and maintains information about a student's progress through course
content.

### 4.6 Assessment Management

Supports the creation and delivery of learning assessments and records
student assessment results.

### 4.7 Learning Interaction

Provides mechanisms that allow students and lecturers to communicate and
interact within the learning environment.

### 4.8 Notification

Provides system notifications related to relevant learning activities and
events.

### 4.9 Administration and Reporting

Provides administrative capabilities for managing the platform and viewing
general system and learning information.

### 4.10 Learning Analytics and Early Warning

Collects and analyzes learning-related information such as:

- learning progress;
- assessment performance;
- learning activity;
- inactivity;
- missed or late submissions;
- engagement indicators.

The analytics component uses these indicators to generate a risk assessment
for a student within a course.

A risk assessment may contain:

- a risk level;
- factors contributing to the assessment;
- supporting learning indicators.

The resulting information is presented to lecturers to support decisions
about appropriate interventions.

---

## 5. Core Domain Overview

The core domain of Smart Campus revolves around the following concepts:

### User

Represents a person who interacts with the platform under an authorized role.

### Course

Represents an organized learning offering managed by a lecturer and
participated in by students.

### Enrollment

Represents the participation of a student in a course.

### Chapter

Represents a major organizational section of a course.

### Lesson

Represents an individual learning unit contained within a chapter.

### Learning Progress

Represents the progress of a student through learning content.

### Assessment

Represents an activity used to evaluate student learning.

### Assessment Attempt

Represents a student's participation in an assessment and its resulting
outcome.

### Learning Activity

Represents relevant student activity recorded during interaction with the
learning platform.

### Risk Assessment

Represents the system's assessment of a student's learning risk within a
specific course.

### Risk Factor

Represents a factor contributing to a generated risk assessment.

### Intervention

Represents an action taken by a lecturer to support a student after reviewing
learning progress or risk information.

---

## 6. High-Level Learning Flow

A typical learning process is:

1. A lecturer creates and prepares a course.
2. Learning content is organized into chapters and lessons.
3. Students enroll in or are enrolled in the course.
4. Students access learning materials and participate in learning activities.
5. Students complete assessments during the course.
6. The system records learning progress, activities, and assessment results.
7. Lecturers monitor student and course progress.

---

## 7. Learning Analytics and Early Warning Flow

The Learning Analytics and Early Warning process operates alongside the
normal learning process.

A high-level flow is:

Student Learning Activities
        ↓
Learning Data Collection
        ↓
Learning Indicator Aggregation
        ↓
Risk Assessment
        ↓
Risk Level and Contributing Factors
        ↓
Lecturer Analytics Dashboard
        ↓
Lecturer Intervention

The analytics component is intended to assist lecturers rather than replace
their academic judgment.

---

## 8. System Boundaries

Smart Campus focuses on the management and monitoring of online learning
activities within a university learning environment.

The initial system does not aim to provide:

- live video-conferencing infrastructure;
- payment processing;
- native mobile applications;
- advanced AI tutoring;
- a replacement for lecturer academic decisions.

These capabilities may be considered as future extensions but are outside
the initial project scope.

---

## 9. High-Level System Architecture

Smart Campus follows a web-based client-server architecture.

The system consists of:

- a web frontend used by students, lecturers, and administrators;
- a backend application providing application and business services;
- a relational database for persistent application and learning data;
- storage for learning materials;
- a Learning Analytics component integrated with the learning platform.

The Learning Analytics component consumes learning and assessment data
generated by the core LMS and produces risk information that can be presented
to lecturers.

Detailed architectural and implementation decisions are documented
separately.

---

## 10. Requirement References

Detailed system requirements are maintained separately from this
specification.

They are divided into:

- Functional Requirements (FR)
- Non-Functional Requirements (NFR)

Functional Requirements define what behaviors and capabilities the system
must provide.

Non-Functional Requirements define quality attributes and operational
constraints such as security, performance, reliability, usability, and
maintainability.