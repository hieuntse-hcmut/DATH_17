-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: smart_campus_seed
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
-- Dumping data for table `assessment_attempts`
--

/*!40000 ALTER TABLE `assessment_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessment_attempts` ENABLE KEYS */;

--
-- Dumping data for table `assessment_questions`
--

/*!40000 ALTER TABLE `assessment_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assessment_questions` ENABLE KEYS */;

--
-- Dumping data for table `assessments`
--

/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` (`id`, `course_id`, `title`, `status`, `start_time`, `end_time`, `duration_minutes`, `max_attempts`) VALUES (1,1,'Seed Quiz 1','PUBLISHED',NULL,NULL,30,3),(2,2,'Seed Quiz 2','PUBLISHED',NULL,NULL,30,3),(3,3,'Seed Quiz 3','PUBLISHED',NULL,NULL,30,3),(4,4,'Seed Quiz 4','PUBLISHED',NULL,NULL,30,3),(5,5,'Seed Quiz 5','PUBLISHED',NULL,NULL,30,3);
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;

--
-- Dumping data for table `attempt_answers`
--

/*!40000 ALTER TABLE `attempt_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `attempt_answers` ENABLE KEYS */;

--
-- Dumping data for table `audit_logs`
--

/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;

--
-- Dumping data for table `chapters`
--

/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` (`id`, `course_id`, `title`, `order_index`) VALUES (1,1,'Chapter 1',1),(2,1,'Chapter 2',2),(3,2,'Chapter 1',1),(4,2,'Chapter 2',2),(5,3,'Chapter 1',1),(6,3,'Chapter 2',2),(7,4,'Chapter 1',1),(8,4,'Chapter 2',2),(9,5,'Chapter 1',1),(10,5,'Chapter 2',2);
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;

--
-- Dumping data for table `course_discussions`
--

/*!40000 ALTER TABLE `course_discussions` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_discussions` ENABLE KEYS */;

--
-- Dumping data for table `course_lecturers`
--

/*!40000 ALTER TABLE `course_lecturers` DISABLE KEYS */;
INSERT INTO `course_lecturers` (`course_id`, `lecturer_id`) VALUES (1,2),(2,2),(3,2),(4,2),(5,2);
/*!40000 ALTER TABLE `course_lecturers` ENABLE KEYS */;

--
-- Dumping data for table `courses`
--

/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` (`id`, `title`, `description`, `publication_state`, `is_enrollment_open`, `created_by`, `created_at`, `updated_at`) VALUES (1,'Seed Course 1','Development-only sample course 1','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(2,'Seed Course 2','Development-only sample course 2','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(3,'Seed Course 3','Development-only sample course 3','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(4,'Seed Course 4','Development-only sample course 4','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12'),(5,'Seed Course 5','Development-only sample course 5','PUBLISHED',1,2,'2026-10-31 16:11:12','2026-10-31 16:11:12');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;

--
-- Dumping data for table `enrollment_histories`
--

/*!40000 ALTER TABLE `enrollment_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollment_histories` ENABLE KEYS */;

--
-- Dumping data for table `enrollments`
--

/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `status`, `enrolled_at`, `updated_at`) VALUES (1,3,1,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(2,3,2,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(3,3,3,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(4,3,4,'ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;

--
-- Dumping data for table `interventions`
--

/*!40000 ALTER TABLE `interventions` DISABLE KEYS */;
/*!40000 ALTER TABLE `interventions` ENABLE KEYS */;

--
-- Dumping data for table `learning_activities`
--

/*!40000 ALTER TABLE `learning_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_activities` ENABLE KEYS */;

--
-- Dumping data for table `learning_materials`
--

/*!40000 ALTER TABLE `learning_materials` DISABLE KEYS */;
INSERT INTO `learning_materials` (`id`, `lesson_id`, `title`, `file_url`, `file_type`) VALUES (1,1,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(2,1,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(3,2,'Material 1','https://example.com/dev/sample.pdf','PDF'),(4,2,'Material 2','https://example.com/dev/sample.pdf','PDF'),(5,3,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(6,3,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(7,4,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(8,4,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(9,5,'Material 1','https://example.com/dev/sample.pdf','PDF'),(10,5,'Material 2','https://example.com/dev/sample.pdf','PDF'),(11,6,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(12,6,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(13,7,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(14,7,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(15,8,'Material 1','https://example.com/dev/sample.pdf','PDF'),(16,8,'Material 2','https://example.com/dev/sample.pdf','PDF'),(17,9,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(18,9,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(19,10,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(20,10,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(21,11,'Material 1','https://example.com/dev/sample.pdf','PDF'),(22,11,'Material 2','https://example.com/dev/sample.pdf','PDF'),(23,12,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(24,12,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(25,13,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(26,13,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(27,14,'Material 1','https://example.com/dev/sample.pdf','PDF'),(28,14,'Material 2','https://example.com/dev/sample.pdf','PDF'),(29,15,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(30,15,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(31,16,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(32,16,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(33,17,'Material 1','https://example.com/dev/sample.pdf','PDF'),(34,17,'Material 2','https://example.com/dev/sample.pdf','PDF'),(35,18,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(36,18,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(37,19,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(38,19,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(39,20,'Material 1','https://example.com/dev/sample.pdf','PDF'),(40,20,'Material 2','https://example.com/dev/sample.pdf','PDF'),(41,21,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(42,21,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(43,22,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(44,22,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(45,23,'Material 1','https://example.com/dev/sample.pdf','PDF'),(46,23,'Material 2','https://example.com/dev/sample.pdf','PDF'),(47,24,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(48,24,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(49,25,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(50,25,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(51,26,'Material 1','https://example.com/dev/sample.pdf','PDF'),(52,26,'Material 2','https://example.com/dev/sample.pdf','PDF'),(53,27,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(54,27,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(55,28,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(56,28,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO'),(57,29,'Material 1','https://example.com/dev/sample.pdf','PDF'),(58,29,'Material 2','https://example.com/dev/sample.pdf','PDF'),(59,30,'Material 1','https://example.com/dev/sample-video.mp4','VIDEO'),(60,30,'Material 2','https://example.com/dev/sample-video.mp4','VIDEO');
/*!40000 ALTER TABLE `learning_materials` ENABLE KEYS */;

--
-- Dumping data for table `learning_progress`
--

/*!40000 ALTER TABLE `learning_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_progress` ENABLE KEYS */;

--
-- Dumping data for table `lessons`
--

/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` (`id`, `chapter_id`, `title`, `order_index`, `total_length`) VALUES (1,1,'Lesson 1.1',1,600),(2,1,'Lesson 1.2',2,10),(3,1,'Lesson 1.3',3,600),(4,2,'Lesson 2.1',1,600),(5,2,'Lesson 2.2',2,10),(6,2,'Lesson 2.3',3,600),(7,3,'Lesson 1.1',1,600),(8,3,'Lesson 1.2',2,10),(9,3,'Lesson 1.3',3,600),(10,4,'Lesson 2.1',1,600),(11,4,'Lesson 2.2',2,10),(12,4,'Lesson 2.3',3,600),(13,5,'Lesson 1.1',1,600),(14,5,'Lesson 1.2',2,10),(15,5,'Lesson 1.3',3,600),(16,6,'Lesson 2.1',1,600),(17,6,'Lesson 2.2',2,10),(18,6,'Lesson 2.3',3,600),(19,7,'Lesson 1.1',1,600),(20,7,'Lesson 1.2',2,10),(21,7,'Lesson 1.3',3,600),(22,8,'Lesson 2.1',1,600),(23,8,'Lesson 2.2',2,10),(24,8,'Lesson 2.3',3,600),(25,9,'Lesson 1.1',1,600),(26,9,'Lesson 1.2',2,10),(27,9,'Lesson 1.3',3,600),(28,10,'Lesson 2.1',1,600),(29,10,'Lesson 2.2',2,10),(30,10,'Lesson 2.3',3,600);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;

--
-- Dumping data for table `notifications`
--

/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;

--
-- Dumping data for table `question_bank`
--

/*!40000 ALTER TABLE `question_bank` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank` ENABLE KEYS */;

--
-- Dumping data for table `question_options`
--

/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;

--
-- Dumping data for table `risk_assessments`
--

/*!40000 ALTER TABLE `risk_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `risk_assessments` ENABLE KEYS */;

--
-- Dumping data for table `risk_factors`
--

/*!40000 ALTER TABLE `risk_factors` DISABLE KEYS */;
/*!40000 ALTER TABLE `risk_factors` ENABLE KEYS */;

--
-- Dumping data for table `users`
--

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `email`, `role`, `status`, `created_at`, `updated_at`) VALUES (1,'seed_admin','$2a$10$DDyodb24MlhYIvA09.rsFe.5FPH0oy16mwBEIShyOoXVf8m30U2Ta','Seed Administrator','admin@test.local','ADMIN','ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(2,'seed_lecturer','$2a$10$DoYDCE8YgcIEIFHvpnUlVO03nSmzNsOLk2lRk/T6OGqzUA5wvhgUO','Seed Lecturer','lecturer@test.local','LECTURER','ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12'),(3,'seed_student','$2a$10$OjXKrENNlnPv1FLLQtoIL.4OzLRF7V5P/.Do8.dhOAjaA2EvtXeou','Seed Student','student@test.local','STUDENT','ACTIVE','2026-10-31 16:11:12','2026-10-31 16:11:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-31 17:02:43
