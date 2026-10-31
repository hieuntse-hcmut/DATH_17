-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: mysql-36ad3504-dath.f.aivencloud.com    Database: smart_campus
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assessment_attempts`
--

DROP TABLE IF EXISTS `assessment_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assessment_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `attempt_number` int NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submit_time` timestamp NULL DEFAULT NULL,
  `score` decimal(8,2) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assessment_attempts_number` (`assessment_id`,`student_id`,`attempt_number`),
  KEY `idx_assessment_attempts_student` (`student_id`),
  CONSTRAINT `fk_assessment_attempts_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_assessment_attempts_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_assessment_attempts_number` CHECK ((`attempt_number` > 0)),
  CONSTRAINT `chk_assessment_attempts_score` CHECK (((`score` is null) or (`score` >= 0))),
  CONSTRAINT `chk_assessment_attempts_status` CHECK ((`status` in (_utf8mb4'IN_PROGRESS',_utf8mb4'SUBMITTED',_utf8mb4'GRADED'))),
  CONSTRAINT `chk_assessment_attempts_time` CHECK (((`submit_time` is null) or (`submit_time` >= `start_time`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_attempts`
--

LOCK TABLES `assessment_attempts` WRITE;
/*!40000 ALTER TABLE `assessment_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessment_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_questions`
--

DROP TABLE IF EXISTS `assessment_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_questions` (
  `assessment_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `order_index` int NOT NULL,
  `points` decimal(8,2) NOT NULL,
  PRIMARY KEY (`assessment_id`,`question_id`),
  UNIQUE KEY `uk_assessment_questions_order` (`assessment_id`,`order_index`),
  KEY `fk_assessment_questions_question` (`question_id`),
  CONSTRAINT `fk_assessment_questions_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_assessment_questions_question` FOREIGN KEY (`question_id`) REFERENCES `question_bank` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_assessment_questions_order_index` CHECK ((`order_index` >= 0)),
  CONSTRAINT `chk_assessment_questions_points` CHECK ((`points` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_questions`
--

LOCK TABLES `assessment_questions` WRITE;
/*!40000 ALTER TABLE `assessment_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessment_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `status` varchar(30) NOT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `max_attempts` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_assessments_course` (`course_id`),
  CONSTRAINT `fk_assessments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_assessments_duration` CHECK (((`duration_minutes` is null) or (`duration_minutes` > 0))),
  CONSTRAINT `chk_assessments_max_attempts` CHECK ((`max_attempts` > 0)),
  CONSTRAINT `chk_assessments_status` CHECK ((`status` in (_utf8mb4'DRAFT',_utf8mb4'PUBLISHED',_utf8mb4'CLOSED'))),
  CONSTRAINT `chk_assessments_time` CHECK (((`start_time` is null) or (`end_time` is null) or (`end_time` > `start_time`)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES (1,1,'Seed Quiz 1','PUBLISHED',NULL,NULL,30,3),(2,2,'Seed Quiz 2','PUBLISHED',NULL,NULL,30,3),(3,3,'Seed Quiz 3','PUBLISHED',NULL,NULL,30,3),(4,4,'Seed Quiz 4','PUBLISHED',NULL,NULL,30,3),(5,5,'Seed Quiz 5','PUBLISHED',NULL,NULL,30,3);
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attempt_answers`
--

DROP TABLE IF EXISTS `attempt_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attempt_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `answer_data` json DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `score` decimal(8,2) DEFAULT NULL,
  `feedback` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attempt_answers_attempt_question` (`attempt_id`,`question_id`),
  KEY `fk_attempt_answers_question` (`question_id`),
  CONSTRAINT `fk_attempt_answers_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_attempt_answers_question` FOREIGN KEY (`question_id`) REFERENCES `question_bank` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_attempt_answers_score` CHECK (((`score` is null) or (`score` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attempt_answers`
--

LOCK TABLES `attempt_answers` WRITE;
/*!40000 ALTER TABLE `attempt_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `attempt_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `acting_user_id` bigint NOT NULL,
  `target_user_id` bigint DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `reason` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_logs_acting_user` (`acting_user_id`),
  KEY `fk_audit_logs_target_user` (`target_user_id`),
  CONSTRAINT `fk_audit_logs_acting_user` FOREIGN KEY (`acting_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_audit_logs_target_user` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_chapters_course_order` (`course_id`,`order_index`),
  CONSTRAINT `fk_chapters_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_chapters_order_index` CHECK ((`order_index` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES (1,1,'Chapter 1',1),(2,1,'Chapter 2',2),(3,2,'Chapter 1',1),(4,2,'Chapter 2',2),(5,3,'Chapter 1',1),(6,3,'Chapter 2',2),(7,4,'Chapter 1',1),(8,4,'Chapter 2',2),(9,5,'Chapter 1',1),(10,5,'Chapter 2',2);
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_discussions`
--

DROP TABLE IF EXISTS `course_discussions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_discussions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `author_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_course_discussions_author` (`author_id`),
  KEY `idx_course_discussions_course_created` (`course_id`,`created_at`,`id`),
  KEY `idx_course_discussions_parent` (`parent_id`),
  CONSTRAINT `fk_course_discussions_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_course_discussions_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_course_discussions_parent` FOREIGN KEY (`parent_id`) REFERENCES `course_discussions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_discussions`
--

LOCK TABLES `course_discussions` WRITE;
/*!40000 ALTER TABLE `course_discussions` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_discussions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_lecturers`
--

DROP TABLE IF EXISTS `course_lecturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lecturers` (
  `course_id` bigint NOT NULL,
  `lecturer_id` bigint NOT NULL,
  PRIMARY KEY (`course_id`,`lecturer_id`),
  KEY `fk_course_lecturers_lecturer` (`lecturer_id`),
  CONSTRAINT `fk_course_lecturers_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_course_lecturers_lecturer` FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lecturers`
--

LOCK TABLES `course_lecturers` WRITE;
/*!40000 ALTER TABLE `course_lecturers` DISABLE KEYS */;
INSERT INTO `course_lecturers` VALUES (1,2),(2,2),(3,2),(4,2),(5,2);
/*!40000 ALTER TABLE `course_lecturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `publication_state` varchar(30) NOT NULL,
  `is_enrollment_open` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_courses_created_by` (`created_by`),
  CONSTRAINT `fk_courses_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_courses_publication_state` CHECK ((`publication_state` in (_utf8mb4'DRAFT',_utf8mb4'PUBLISHED',_utf8mb4'ARCHIVED')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Seed Course 1','Development-only sample course 1','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(2,'Seed Course 2','Development-only sample course 2','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(3,'Seed Course 3','Development-only sample course 3','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(4,'Seed Course 4','Development-only sample course 4','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(5,'Seed Course 5','Development-only sample course 5','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollment_histories`
--

DROP TABLE IF EXISTS `enrollment_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment_histories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint NOT NULL,
  `previous_status` varchar(30) DEFAULT NULL,
  `new_status` varchar(30) NOT NULL,
  `changed_by` bigint NOT NULL,
  `reason` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_enrollment_histories_enrollment` (`enrollment_id`),
  KEY `fk_enrollment_histories_changed_by` (`changed_by`),
  CONSTRAINT `fk_enrollment_histories_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_enrollment_histories_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_enrollment_histories_new_status` CHECK ((`new_status` in (_utf8mb4'ACTIVE',_utf8mb4'WITHDRAWN',_utf8mb4'REMOVED'))),
  CONSTRAINT `chk_enrollment_histories_previous_status` CHECK (((`previous_status` is null) or (`previous_status` in (_utf8mb4'ACTIVE',_utf8mb4'WITHDRAWN',_utf8mb4'REMOVED'))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollment_histories`
--

LOCK TABLES `enrollment_histories` WRITE;
/*!40000 ALTER TABLE `enrollment_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollment_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `status` varchar(30) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_enrollments_student_course` (`student_id`,`course_id`),
  KEY `idx_enrollments_course_status` (`course_id`,`status`),
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_enrollments_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'WITHDRAWN',_utf8mb4'REMOVED')))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,3,1,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(2,3,2,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(3,3,3,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(4,3,4,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init schema','SQL','V1__init_schema.sql',1509274108,'avnadmin','2026-10-31 16:56:15',4927,1),(2,'2','enrollment status withdrawn removed','SQL','V2__enrollment_status_withdrawn_removed.sql',-1102969840,'avnadmin','2026-10-31 16:56:21',3576,1),(3,'3','create notifications','SQL','V3__create_notifications.sql',-526491964,'avnadmin','2026-10-31 16:56:24',751,1),(4,'4','assessment options and discussions','SQL','V4__assessment_options_and_discussions.sql',1360282415,'avnadmin','2026-10-31 16:56:27',984,1),(5,'5','lesson total length','SQL','V5__lesson_total_length.sql',1954657272,'avnadmin','2026-10-31 16:56:30',1055,1),(6,'6','remove lesson content type','SQL','V6__remove_lesson_content_type.sql',422026462,'avnadmin','2026-10-31 16:56:33',778,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interventions`
--

DROP TABLE IF EXISTS `interventions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interventions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `risk_assessment_id` bigint NOT NULL,
  `created_by` bigint NOT NULL,
  `intervention_type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_interventions_risk_assessment` (`risk_assessment_id`),
  KEY `fk_interventions_created_by` (`created_by`),
  CONSTRAINT `fk_interventions_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_interventions_risk_assessment` FOREIGN KEY (`risk_assessment_id`) REFERENCES `risk_assessments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_interventions_completed_at` CHECK (((`completed_at` is null) or (`completed_at` >= `created_at`))),
  CONSTRAINT `chk_interventions_status` CHECK ((`status` in (_utf8mb4'OPEN',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interventions`
--

LOCK TABLES `interventions` WRITE;
/*!40000 ALTER TABLE `interventions` DISABLE KEYS */;
/*!40000 ALTER TABLE `interventions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_activities`
--

DROP TABLE IF EXISTS `learning_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `lesson_id` bigint DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `current_position` int DEFAULT NULL,
  `total_length` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_learning_activities_student_created` (`student_id`,`created_at`),
  KEY `idx_learning_activities_lesson_created` (`lesson_id`,`created_at`),
  CONSTRAINT `fk_learning_activities_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_learning_activities_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_learning_activities_current_position` CHECK (((`current_position` is null) or (`current_position` >= 0))),
  CONSTRAINT `chk_learning_activities_total_length` CHECK (((`total_length` is null) or (`total_length` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_activities`
--

LOCK TABLES `learning_activities` WRITE;
/*!40000 ALTER TABLE `learning_activities` DISABLE KEYS */;
INSERT INTO `learning_activities` VALUES (1,3,2,'LESSON_COMPLETED',NULL,NULL,'2026-10-31 18:27:19');
/*!40000 ALTER TABLE `learning_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_materials`
--

DROP TABLE IF EXISTS `learning_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_materials` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_url` text NOT NULL,
  `file_type` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_learning_materials_lesson` (`lesson_id`),
  CONSTRAINT `fk_learning_materials_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_materials`
--

LOCK TABLES `learning_materials` WRITE;
/*!40000 ALTER TABLE `learning_materials` DISABLE KEYS */;
INSERT INTO `learning_materials` VALUES (1,1,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(2,1,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(3,2,'Material 1','https://example.com/dev/sample.pdf','PDF'),(4,2,'Material 2','https://example.com/dev/sample.pdf','PDF'),(5,3,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(6,3,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(7,4,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(8,4,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(9,5,'Material 1','https://example.com/dev/sample.pdf','PDF'),(10,5,'Material 2','https://example.com/dev/sample.pdf','PDF'),(11,6,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(12,6,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(13,7,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(14,7,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(15,8,'Material 1','https://example.com/dev/sample.pdf','PDF'),(16,8,'Material 2','https://example.com/dev/sample.pdf','PDF'),(17,9,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(18,9,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(19,10,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(20,10,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(21,11,'Material 1','https://example.com/dev/sample.pdf','PDF'),(22,11,'Material 2','https://example.com/dev/sample.pdf','PDF'),(23,12,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(24,12,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(25,13,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(26,13,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(27,14,'Material 1','https://example.com/dev/sample.pdf','PDF'),(28,14,'Material 2','https://example.com/dev/sample.pdf','PDF'),(29,15,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(30,15,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(31,16,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(32,16,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(33,17,'Material 1','https://example.com/dev/sample.pdf','PDF'),(34,17,'Material 2','https://example.com/dev/sample.pdf','PDF'),(35,18,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(36,18,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(37,19,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(38,19,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(39,20,'Material 1','https://example.com/dev/sample.pdf','PDF'),(40,20,'Material 2','https://example.com/dev/sample.pdf','PDF'),(41,21,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(42,21,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(43,22,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(44,22,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(45,23,'Material 1','https://example.com/dev/sample.pdf','PDF'),(46,23,'Material 2','https://example.com/dev/sample.pdf','PDF'),(47,24,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(48,24,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(49,25,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(50,25,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(51,26,'Material 1','https://example.com/dev/sample.pdf','PDF'),(52,26,'Material 2','https://example.com/dev/sample.pdf','PDF'),(53,27,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(54,27,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(55,28,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(56,28,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(57,29,'Material 1','https://example.com/dev/sample.pdf','PDF'),(58,29,'Material 2','https://example.com/dev/sample.pdf','PDF'),(59,30,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(60,30,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO');
/*!40000 ALTER TABLE `learning_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learning_progress`
--

DROP TABLE IF EXISTS `learning_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `lesson_id` bigint NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `last_position` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_learning_progress_student_lesson` (`student_id`,`lesson_id`),
  KEY `fk_learning_progress_lesson` (`lesson_id`),
  CONSTRAINT `fk_learning_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_learning_progress_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_learning_progress_last_position` CHECK ((`last_position` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_progress`
--

LOCK TABLES `learning_progress` WRITE;
/*!40000 ALTER TABLE `learning_progress` DISABLE KEYS */;
INSERT INTO `learning_progress` VALUES (1,3,2,1,0,'2026-10-31 18:27:18');
/*!40000 ALTER TABLE `learning_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chapter_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `order_index` int NOT NULL,
  `total_length` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lessons_chapter_order` (`chapter_id`,`order_index`),
  CONSTRAINT `fk_lessons_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_lessons_order_index` CHECK ((`order_index` >= 0)),
  CONSTRAINT `chk_lessons_total_length` CHECK (((`total_length` is null) or (`total_length` > 0)))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,1,'Lesson 1.1',1,600),(2,1,'Lesson 1.2',2,10),(3,1,'Lesson 1.3',3,600),(4,2,'Lesson 2.1',1,600),(5,2,'Lesson 2.2',2,10),(6,2,'Lesson 2.3',3,600),(7,3,'Lesson 1.1',1,600),(8,3,'Lesson 1.2',2,10),(9,3,'Lesson 1.3',3,600),(10,4,'Lesson 2.1',1,600),(11,4,'Lesson 2.2',2,10),(12,4,'Lesson 2.3',3,600),(13,5,'Lesson 1.1',1,600),(14,5,'Lesson 1.2',2,10),(15,5,'Lesson 1.3',3,600),(16,6,'Lesson 2.1',1,600),(17,6,'Lesson 2.2',2,10),(18,6,'Lesson 2.3',3,600),(19,7,'Lesson 1.1',1,600),(20,7,'Lesson 1.2',2,10),(21,7,'Lesson 1.3',3,600),(22,8,'Lesson 2.1',1,600),(23,8,'Lesson 2.2',2,10),(24,8,'Lesson 2.3',3,600),(25,9,'Lesson 1.1',1,600),(26,9,'Lesson 1.2',2,10),(27,9,'Lesson 1.3',3,600),(28,10,'Lesson 2.1',1,600),(29,10,'Lesson 2.2',2,10),(30,10,'Lesson 2.3',3,600);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_id` bigint NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient_read_created` (`recipient_id`,`is_read`,`created_at`),
  CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank`
--

DROP TABLE IF EXISTS `question_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `content` text NOT NULL,
  `question_type` varchar(50) NOT NULL,
  `answer_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_question_bank_course` (`course_id`),
  CONSTRAINT `fk_question_bank_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_question_bank_type` CHECK ((`question_type` in (_utf8mb4'SINGLE_CHOICE',_utf8mb4'MULTIPLE_CHOICE',_utf8mb4'TRUE_FALSE',_utf8mb4'SHORT_ANSWER')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank`
--

LOCK TABLES `question_bank` WRITE;
/*!40000 ALTER TABLE `question_bank` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_options`
--

DROP TABLE IF EXISTS `question_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `content` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_options_order` (`question_id`,`order_index`),
  CONSTRAINT `fk_question_options_question` FOREIGN KEY (`question_id`) REFERENCES `question_bank` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `chk_question_options_order` CHECK ((`order_index` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_options`
--

LOCK TABLES `question_options` WRITE;
/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_assessments`
--

DROP TABLE IF EXISTS `risk_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_assessments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `risk_score` decimal(5,2) NOT NULL,
  `risk_level` varchar(20) NOT NULL,
  `assessed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_risk_assessments_student_course_assessed` (`student_id`,`course_id`,`assessed_at`),
  KEY `idx_risk_assessments_course_level` (`course_id`,`risk_level`),
  CONSTRAINT `fk_risk_assessments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_risk_assessments_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_risk_assessments_level` CHECK ((`risk_level` in (_utf8mb4'LOW',_utf8mb4'MEDIUM',_utf8mb4'HIGH'))),
  CONSTRAINT `chk_risk_assessments_score` CHECK (((`risk_score` >= 0) and (`risk_score` <= 100)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_assessments`
--

LOCK TABLES `risk_assessments` WRITE;
/*!40000 ALTER TABLE `risk_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `risk_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_factors`
--

DROP TABLE IF EXISTS `risk_factors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_factors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `risk_assessment_id` bigint NOT NULL,
  `factor_type` varchar(50) NOT NULL,
  `factor_value` decimal(8,2) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `fk_risk_factors_risk_assessment` (`risk_assessment_id`),
  CONSTRAINT `fk_risk_factors_risk_assessment` FOREIGN KEY (`risk_assessment_id`) REFERENCES `risk_assessments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_factors`
--

LOCK TABLES `risk_factors` WRITE;
/*!40000 ALTER TABLE `risk_factors` DISABLE KEYS */;
/*!40000 ALTER TABLE `risk_factors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(30) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  CONSTRAINT `chk_users_role` CHECK ((`role` in (_utf8mb4'STUDENT',_utf8mb4'LECTURER',_utf8mb4'ADMIN'))),
  CONSTRAINT `chk_users_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'seed_admin','$2a$10$DDyodb24MlhYIvA09.rsFe.5FPH0oy16mwBEIShyOoXVf8m30U2Ta','Seed Administrator','admin@test.local','ADMIN','ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(2,'seed_lecturer','$2a$10$DoYDCE8YgcIEIFHvpnUlVO03nSmzNsOLk2lRk/T6OGqzUA5wvhgUO','Seed Lecturer','lecturer@test.local','LECTURER','ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(3,'seed_student','$2a$10$OjXKrENNlnPv1FLLQtoIL.4OzLRF7V5P/.Do8.dhOAjaA2EvtXeou','Seed Student','student@test.local','STUDENT','ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-31 19:07:19
