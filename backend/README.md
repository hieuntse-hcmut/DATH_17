# Smart Campus - Online Learning Platform

Smart Campus is an online learning platform developed for the CO3103 course project.

The system has three main roles:

- Student
- Lecturer
- Administrator

Advanced component: **Learning Analytics and Early Warning**.

---

## 1. Tech Stack

### Backend
- Java
- Spring Boot
- Spring Data JPA
- MySQL 8.4
- Flyway
- Maven

### Frontend
- React
- TypeScript

### Development
- Docker
- Docker Compose
- GitHub
- GitHub Projects

---

## 2. Project Structure

```text
DATH_17/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Prerequisites

Install the following tools before running the project:

- Git
- Docker Desktop
- Java 21+
- Node.js
- npm

Check installation:

```bash
git --version
docker --version
java --version
node --version
npm --version
```

---

## 4. Clone Repository

```bash
git clone https://github.com/hieuntse-hcmut/DATH_17.git
cd DATH_17
```

---

## 5. Start MySQL

MySQL runs through Docker Compose.

From the project root:

```bash
docker compose up -d
```

Check container status:

```bash
docker compose ps
```

Development database:

```text
Host: localhost
Port: 3306
Database: smart_campus
```

> Do not manually create or modify application tables.
> Database schema changes are managed by Flyway.

---

## 6. Run Backend

Open a terminal:

```bash
cd backend
```

### Windows

```bash
mvnw.cmd spring-boot:run
```

### macOS / Linux

```bash
./mvnw spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

Health check:

```text
GET http://localhost:8080/api/health
```

Expected response:

```text
OK
```

Flyway migrations run automatically when the backend starts.

---

## 7. Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will normally run at:

```text
http://localhost:5173
```

---

## 8. Frontend - Backend Connection

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Frontend should use this environment variable instead of hardcoding the backend URL.

Example:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const response = await fetch(`${API_BASE_URL}/api/health`);
```

During local development:

```text
React
localhost:5173
     |
     | HTTP API
     v
Spring Boot
localhost:8080
     |
     v
MySQL
localhost:3306
```

The backend must allow requests from the frontend origin through CORS.

---

## 9. Development Workflow

Before starting new work:

```bash
git checkout main
git pull origin main
```

Create a branch:

```bash
git checkout -b feature/<feature-name>
```

Examples:

```text
feature/user-authentication
feature/course-management
feature/enrollment
feature/learning-progress
feature/assessment
feature/analytics-dashboard
```

After completing your work:

```bash
git add .
git commit -m "feat: <description>"
git push origin feature/<feature-name>
```

Then create a Pull Request to `main`.

Do not develop features directly on `main`.

---

## 10. GitHub Issues

Each major task should have a GitHub Issue.

Workflow:

```text
Todo
  ↓
In Progress
  ↓
Review
  ↓
Done
```

Assign the Issue to the responsible member before starting.

When creating a Pull Request, link it to its Issue:

```text
Closes #<issue-number>
```

An Issue should only be closed when:

- Acceptance criteria are satisfied.
- The related code has been reviewed.
- The Pull Request has been merged into `main`.

---

## 11. Database Migration

Database schema is managed by Flyway.

Migration files:

```text
backend/src/main/resources/db/migration/
```

Example:

```text
V1__init_schema.sql
V2__add_example.sql
V3__update_example.sql
```

### Rules

1. Do not manually modify the shared database schema.
2. Do not modify an existing migration after it has been merged and shared.
3. Create a new migration for every new schema change.
4. Pull the latest `main` before creating a migration to avoid duplicate version numbers.

---

## 12. Useful Commands

Start MySQL:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down
```

Check containers:

```bash
docker compose ps
```

Run backend:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Update local `main`:

```bash
git checkout main
git pull origin main
```

---

## 13. Project Management

Tasks are managed using GitHub Issues and GitHub Projects.

Before starting development:

1. Check your assigned Issue.
2. Move it to `In Progress`.
3. Create a feature branch.
4. Implement and test the feature.
5. Create a Pull Request.
6. Move the task to `Review`.
7. After review and merge, move it to `Done`.