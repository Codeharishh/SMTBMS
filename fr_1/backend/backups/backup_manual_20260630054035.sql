-- MySQL dump 10.13  Distrib 9.7.0, for Win64 (x86_64)
--
-- Host: thomas.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

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
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `attendance_date` date DEFAULT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `status` enum('Present','Absent','Late','Leave') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,'2026-05-20','12:14:34','12:14:39','Present','2026-05-20 06:44:34'),(2,6,'2026-05-21','13:21:56',NULL,'Present','2026-05-21 07:51:56'),(3,7,'2026-05-23','17:06:48','17:16:23','Present','2026-05-23 11:36:48'),(4,7,'2026-05-25','11:10:26','11:10:36','Present','2026-05-25 05:40:26'),(5,8,'2026-05-25','15:25:08',NULL,'Present','2026-05-25 09:55:08'),(6,8,'2026-05-26','19:51:50',NULL,'Present','2026-05-26 14:21:50'),(7,13,'2026-05-28','12:11:57','12:12:30','Present','2026-05-28 06:41:57'),(8,8,'2026-05-28','12:17:23','12:17:52','Present','2026-05-28 06:47:23'),(9,7,'2026-05-28','12:28:48','12:29:03','Present','2026-05-28 06:58:48'),(10,13,'2026-05-29','10:59:37','10:59:51','Present','2026-05-29 05:29:37'),(11,8,'2026-05-31','21:26:10','21:26:14','Present','2026-05-31 15:56:10'),(12,13,'2026-06-13','09:26:30',NULL,'Present','2026-06-13 03:56:30'),(13,20,'2026-06-16','16:48:22',NULL,'Present','2026-06-16 11:18:22'),(14,13,'2026-06-17','11:38:00','11:56:37','Present','2026-06-17 06:08:00'),(15,13,'2026-06-18','10:25:25',NULL,'Present','2026-06-18 10:25:25'),(16,13,'2026-06-25','07:09:51',NULL,'Present','2026-06-25 07:09:51');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT '127.0.0.1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'AUTHENTICATION','Admin User logged in successfully','192.168.1.50','2026-05-27 06:43:25'),(2,1,'DATABASE','System database backup snapshot-20260520.sql created manually','192.168.1.50','2026-05-27 06:43:25'),(3,1,'USER_MANAGEMENT','Registered new user account: HR Manager (hr@smtbms.com)','127.0.0.1','2026-05-27 06:43:25'),(4,1,'INVENTORY','Material inventory level rubber stock updated successfully','192.168.1.102','2026-05-27 06:43:25'),(5,1,'INTEGRATION','Toggled Stripe Payment Gateway integration to ACTIVE','192.168.1.50','2026-05-27 06:43:25'),(6,31,'INTEGRATION','ENABLED Third-party Connection integration for: QuickBooks Accounting','::1','2026-05-27 07:46:41'),(7,31,'INTEGRATION','DISABLED Third-party Connection integration for: QuickBooks Accounting','::1','2026-05-27 07:46:43'),(8,31,'INTEGRATION','DISABLED Third-party Connection integration for: SendGrid Email Service','::1','2026-05-27 07:46:45'),(9,31,'USER_MANAGEMENT','Created new user: suresh@gmail.com (Role: Employee)','::1','2026-05-31 15:21:11'),(10,31,'INTEGRATION','ENABLED Third-party Connection integration for: Slack Notifications','::1','2026-05-31 15:39:41'),(11,31,'USER_MANAGEMENT','Created new user: rajesh@gmail.com (Role: Employee)','::1','2026-06-03 05:27:40'),(12,31,'USER_MANAGEMENT','Created new user: john@gmail.com (Role: Employee)','::1','2026-06-03 05:38:31'),(13,31,'USER_MANAGEMENT','Deleted user account: john@gmail.com','::1','2026-06-03 05:48:38'),(14,31,'USER_MANAGEMENT','Deleted user account: rajesh@gmail.com','::1','2026-06-03 05:48:42'),(15,31,'USER_MANAGEMENT','Deleted user account: suresh@gmail.com','::1','2026-06-03 05:48:47'),(16,31,'USER_MANAGEMENT','Created new user: john@gmail.com (Role: Employee)','::1','2026-06-03 05:49:12'),(17,31,'USER_MANAGEMENT','Deleted user account: john@gmail.com','::1','2026-06-03 05:56:55'),(18,31,'USER_MANAGEMENT','Created new user: john@gmail.com (Role: Employee)','::1','2026-06-03 05:57:20'),(19,31,'USER_MANAGEMENT','Updated user account details: john@gmail.com','::1','2026-06-03 06:18:59'),(20,31,'USER_MANAGEMENT','Deleted user account: john@gmail.com','::1','2026-06-03 06:25:06'),(21,31,'USER_MANAGEMENT','Created new user: rajesh@gmail.com (Role: Employee)','::1','2026-06-03 06:46:33'),(22,31,'USER_MANAGEMENT','Created new user: john@gmail.com (Role: Employee)','::1','2026-06-03 06:47:58'),(23,31,'USER_MANAGEMENT','Created new user: sriharishsenthil03@gmail.com (Role: Employee)','::1','2026-06-15 03:38:39'),(24,31,'DATABASE','Manual database backup file generated successfully: backup_manual_admin_2026-06-26_0746.sql','::1','2026-06-26 07:46:57');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `sql_path` varchar(500) NOT NULL,
  `zip_path` varchar(500) NOT NULL,
  `size_bytes` bigint DEFAULT '0',
  `created_by` varchar(255) NOT NULL,
  `created_by_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Success',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `address` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Acme Corp','contact@acme.com',NULL,'Acme Corporation',NULL),(2,'NovaTech Ltd','info@novatech.com',NULL,'NovaTech',NULL),(3,'Small Biz Co','hello@smallbiz.com','9876','Small Biz Co','cheapuk chennai warehouse B'),(4,'MegaStore','procurement@megastore.com',NULL,'MegaStore Retail',NULL),(5,'suresh','chennaitraders@gmail.com','345678','chennai traders','chennai warehouse A'),(8,'hgf','hgf@gmail.com','4534','hgf','ramapuram,chennai'),(11,'nelson','nelson@gmail.com','2343','nelson enterprises','mumbai , india ');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `attendance_status` varchar(50) DEFAULT NULL,
  `leave_balance` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'',NULL,'Engineering',85000.00,'2022-03-15','Present',0),(2,'',NULL,'Sales',72000.00,'2021-06-01','Present',0),(3,'',NULL,'HR',58000.00,'2023-01-10','Present',0),(4,'',NULL,'Finance',67000.00,'2022-09-20','Present',0),(5,'',NULL,'Operations',79000.00,'2020-11-05','Present',0),(6,'',26,'IT',0.00,'2026-05-21','Present',0),(7,'',27,'IT',0.00,'2026-05-21','Present',0),(8,'',33,'IT',0.00,'2026-05-25','Present',0),(9,'',34,'Human Resources',0.00,'2026-05-25','Present',0),(10,'',35,'IT',0.00,'2026-05-25','Present',0),(11,'kumar',39,'IT',0.00,'2026-05-27','Present',0),(12,'siva',40,'IT',0.00,'2026-05-27','Present',0),(13,'ramesh',41,'IT',0.00,'2026-05-27','Present',0),(18,'rajesh',51,'IT',0.00,'2026-06-03','Present',0),(19,'john',52,'IT',0.00,'2026-06-03','Present',0),(20,'sriharish',53,'it',0.00,'2026-06-15','Present',0);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `holiday_date` date NOT NULL,
  `description` text,
  `type` varchar(100) DEFAULT 'National',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
INSERT INTO `holidays` VALUES (1,'New Year\'s Day','2026-01-01','First day of the year.','National','2026-06-10 05:13:46'),(2,'Republic Day','2026-01-26','Celebrating the Constitution of India.','National','2026-06-10 05:13:46'),(3,'Independence Day','2026-08-15','Celebrating India\'s Independence.','National','2026-06-10 05:13:46'),(4,'Gandhi Jayanti','2026-10-02','Birthday of Mahatma Gandhi.','National','2026-06-10 05:13:46'),(5,'Diwali Festival','2026-11-05','Festival of Lights.','Optional','2026-06-10 05:13:46'),(6,'Christmas Day','2026-12-25','Celebration of Christmas.','National','2026-06-10 05:13:46');
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_documents`
--

DROP TABLE IF EXISTS `hr_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT '',
  `description` text,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_documents`
--

LOCK TABLES `hr_documents` WRITE;
/*!40000 ALTER TABLE `hr_documents` DISABLE KEYS */;
INSERT INTO `hr_documents` VALUES (1,'Employee Handbook 2026','Handbooks','Employee_Handbook_2026.pdf','/documents/handbook.pdf','Core values, rules, regulations, and workplace guidelines.',1,'2026-06-10 05:13:46'),(2,'Remote Work Guidelines & Policies','Policy','Remote_Work_Guidelines.pdf','/documents/remote_policy.pdf','Standard operating guidelines for working remotely and security protocols.',1,'2026-06-10 05:13:46'),(3,'Leave Request Guidelines','Policy','Leave_Request_Guidelines.pdf','/documents/leave_policy.pdf','Leave request procedures and rules.',1,'2026-06-10 05:13:46'),(4,'NDA Template','Template','NDA_Template_2026.docx','/documents/nda.docx','NDA template.',1,'2026-06-10 05:13:46');
/*!40000 ALTER TABLE `hr_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integrations`
--

DROP TABLE IF EXISTS `integrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `active` tinyint(1) DEFAULT '0',
  `apiKey` varchar(255) DEFAULT '',
  `webhookUrl` varchar(255) DEFAULT '',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integrations`
--

LOCK TABLES `integrations` WRITE;
/*!40000 ALTER TABLE `integrations` DISABLE KEYS */;
INSERT INTO `integrations` VALUES (1,'stripe','Stripe Payment Gateway',1,'sk_test_51Mz...','https://api.smtbms.com/webhooks/stripe','2026-05-27 06:43:25'),(2,'slack','Slack Notifications',1,'xoxb-slack-token','https://hooks.slack.com/services/...','2026-05-31 15:39:41'),(3,'quickbooks','QuickBooks Accounting',0,'qb-realm-id','','2026-05-27 07:46:43'),(4,'sendgrid','SendGrid Email Service',0,'SG.sendgrid-key','https://api.sendgrid.com/v3/','2026-05-27 07:46:45');
/*!40000 ALTER TABLE `integrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contact_name` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `stage` varchar(100) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `value` decimal(15,2) DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `notes` text,
  `closing_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (1,'James Park','DataFlow Inc','j.park@dataflow.com',NULL,'proposal','linkedin',45000.00,'Bob Martinez',NULL,'2026-06-30','2026-05-20 10:42:15'),(2,'Linda Tran','CloudVault','l.tran@cloudvault.com',NULL,'qualified','website',128000.00,'Bob Martinez',NULL,NULL,'2026-05-20 10:42:15'),(3,'Marcus Hill','BuildRight','m.hill@buildright.com',NULL,'Closed Won','referral',22000.00,'Alice Johnson',NULL,NULL,'2026-05-20 10:42:16'),(4,'Sophie Ng','QuickFin','s.ng@quickfin.com',NULL,'won','cold-call',67000.00,'Bob Martinez',NULL,NULL,'2026-05-20 10:42:16'),(5,'mark','msteels','mark@gmail.com','75575','In Negotiation','CRM Terminal',0.00,'mark',NULL,'2026-06-23',NULL),(6,'caeserm','caeser enterproses','c@gmail.com','757578','New Lead','linkedin',0.01,'caeser',NULL,'2026-06-16',NULL),(7,'f','fdfdf','mark@gmail.com','3434','Closed Won','CRM Terminal',200000.00,'tt\\',NULL,'2026-06-23',NULL),(8,'rogers','rogers enterprises','rogers@gmail.com','657575','Marketing Qualified','whatsapp',150000.00,'rogers',NULL,'2026-06-24',NULL);
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `reason` text,
  `status` varchar(50) DEFAULT 'Pending',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,27,'Casual Leave','2026-05-28','2026-05-29','vacation','Approved','2026-05-25 06:58:30'),(2,27,'Sick Leave','2026-05-29','2026-05-30','fever','Rejected','2026-05-25 07:31:14'),(3,8,'Sick Leave','2026-05-29','2026-05-30','viral fever','Approved','2026-05-25 08:00:09'),(4,13,'Sick Leave','2026-05-30','2026-06-01','fever','Approved','2026-05-29 05:31:03'),(5,13,'Sick Leave','2026-06-17','2026-06-17','fever','Pending','2026-06-16 10:59:13'),(6,13,'Casual Leave','2026-06-18','2026-06-19','causual leave ','Approved','2026-06-16 12:29:09');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaves` (
  `id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `days` int DEFAULT NULL,
  `reason` text,
  `status` varchar(100) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` VALUES (1,3,'Carol Davis','annual','2026-05-25','2026-05-29',5,'Family vacation','pending',NULL,'2026-05-20 10:42:18'),(2,5,'Emma Wilson','sick','2026-05-20','2026-05-22',3,'Medical appointment','pending',NULL,'2026-05-20 10:42:18'),(3,2,'Bob Martinez','annual','2026-06-01','2026-06-05',5,'Personal time off','approved',NULL,'2026-05-20 10:42:18');
/*!40000 ALTER TABLE `leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager_projects`
--

DROP TABLE IF EXISTS `manager_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(50) DEFAULT 'Planning',
  `progress` int DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `manager_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_projects`
--

LOCK TABLES `manager_projects` WRITE;
/*!40000 ALTER TABLE `manager_projects` DISABLE KEYS */;
INSERT INTO `manager_projects` VALUES (1,'Supply Chain Optimization Q3','Streamlining supplier channels and procurement workflows to reduce lead latency.','Active',35,'2026-06-01','2026-09-30',1,'2026-06-11 07:17:06'),(2,'CRM Database Upgrade','Upgrading the customer accounts schema and database indexing parameters.','Planning',10,'2026-07-01','2026-08-15',1,'2026-06-11 07:17:06');
/*!40000 ALTER TABLE `manager_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager_tasks`
--

DROP TABLE IF EXISTS `manager_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `assigned_to` int NOT NULL,
  `assigned_by` int NOT NULL,
  `due_date` date DEFAULT NULL,
  `priority` varchar(50) DEFAULT 'Medium',
  `status` varchar(50) DEFAULT 'Todo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_tasks`
--

LOCK TABLES `manager_tasks` WRITE;
/*!40000 ALTER TABLE `manager_tasks` DISABLE KEYS */;
INSERT INTO `manager_tasks` VALUES (1,'Audit incoming steel bundles quantity','Verify raw steel inventory levels and log reports in the ERP system.',1,1,'2026-06-20','High','In Progress','2026-06-11 07:17:06'),(2,'Update vendor contact records in CRM','Liaise with logistics vendors and verify their contact emails/phones.',2,1,'2026-06-25','Medium','Todo','2026-06-11 07:17:06'),(5,'check low stocks','',13,29,'2026-06-13','Medium','Todo','2026-06-12 06:09:01'),(6,'check the reports ','',18,29,'2026-06-13','Medium','Todo','2026-06-12 07:34:09');
/*!40000 ALTER TABLE `manager_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_name` varchar(100) DEFAULT NULL,
  `material_code` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'Steel Rods','SR-001','Raw Material',600,NULL,'Warehouse A','Available','2026-05-20 10:41:47'),(2,'Aluminum Sheets','AL-002','Raw Material',75,NULL,'Warehouse B','Available','2026-05-20 10:41:47'),(3,'Cardboard Boxes','CB-003','Packaging',1150,NULL,'Storage C','Available','2026-05-20 10:41:47'),(4,'Copper Wire','CW-004','Electronics',40,NULL,'Warehouse A','Available','2026-05-20 10:41:47'),(5,'Paint - Red','PR-005','Chemicals',220,NULL,'Chemical Storage','Available','2026-05-20 10:41:47'),(6,'Steel Rod','MAT001','Metal',50,'ABC Suppliers','Warehouse A','Available','2026-05-21 07:58:08'),(7,'Copper Wire','MAT002','Electrical',20,'Global Traders','Warehouse B','Low Stock','2026-05-21 07:58:08'),(8,'Aluminium Sheet','MAT003','Metal',15,'Prime Metals','Warehouse C','Available','2026-05-21 07:58:08'),(9,'Gold','gol101','Metal',1,'abc gold suplier','chennai','Low Stock','2026-05-21 12:50:51'),(10,'silver','SLV501','metal',5,'xyz supplier','hyderabad','Low Stock','2026-05-23 05:45:41'),(15,'bronze','bro301','metal',2,'def supplier','mumbai','Low Stock','2026-05-23 05:49:34'),(16,'platinum','pla234','metal',100,'qrs supplier','xxxxx','Active','2026-05-23 11:44:37'),(17,'paladium','pal345','metal',1,'mno supplier','delhi','Low Stock','2026-05-25 04:56:19'),(19,'RAM','ram123','hardware',50,'mno supplier','mumbai','Active','2026-05-29 10:49:47'),(20,'ROM','ROM987','hardware',50,'mno supplier','mumbai','Active','2026-05-29 11:01:09'),(21,'cardboard','car345','box',50,'dgh suplleir','telegana','Active','2026-06-02 12:08:44'),(22,'lubber','lub234','solid',20,'jkl supplier','mumbai','Active','2026-06-02 12:24:41'),(23,'diamond','dia456','metal',10,'diamond supplier','mumbai','Low Stock','2026-06-15 10:04:28');
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movements`
--

DROP TABLE IF EXISTS `movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int DEFAULT NULL,
  `material_name` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `quantity` decimal(15,2) DEFAULT NULL,
  `from_location` varchar(255) DEFAULT NULL,
  `to_location` varchar(255) DEFAULT NULL,
  `performed_by` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movements`
--

LOCK TABLES `movements` WRITE;
/*!40000 ALTER TABLE `movements` DISABLE KEYS */;
INSERT INTO `movements` VALUES (1,1,'Steel Rods','inbound',100.00,'Supplier','Warehouse A','Alice Johnson','Delivery received','2026-05-20 10:42:34'),(2,3,'Cardboard Boxes','outbound',50.00,'Storage C','Production','David Kim',NULL,'2026-05-20 10:42:34'),(3,5,'Paint - Red','transfer',80.00,'Chemical Storage','Line 2','Emma Wilson',NULL,'2026-05-20 10:42:34'),(4,1,'Gold','Inbound',50.00,'chennai','mumbai','samson','','2026-05-31 16:18:33'),(5,5,'Gold','Inbound',50.00,'chennai','mumbai','samson','','2026-06-02 12:25:54'),(6,7,'diamond','Inbound',50.00,'chennai','mumbai','samson','','2026-06-16 10:55:34');
/*!40000 ALTER TABLE `movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `status` enum('Unread','Read') DEFAULT 'Unread',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,'Low Stock Alert','bronze stock is running low','Unread','2026-05-23 05:49:34','warning'),(2,NULL,'Low Stock Alert','paladium stock is running low','Unread','2026-05-25 04:56:19','warning'),(3,NULL,'Low Stock Alert','Gold stock is running low','Unread','2026-06-01 06:37:59','warning');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `bonus` decimal(10,2) DEFAULT NULL,
  `deductions` decimal(10,2) DEFAULT NULL,
  `net_salary` decimal(10,2) DEFAULT NULL,
  `payroll_month` varchar(50) DEFAULT NULL,
  `payment_status` enum('Pending','Paid') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` VALUES (1,7,20000.00,499.00,0.00,20499.00,'May 2026','Paid','2026-05-27 04:47:08'),(2,11,30000.00,500.00,0.00,30500.00,'May 2026','Paid','2026-05-27 05:03:35'),(3,12,20000.00,500.00,0.00,20500.00,'May 2026','Paid','2026-05-27 05:31:05'),(4,12,20000.00,500.00,0.00,20500.00,'May 2026','Paid','2026-05-27 05:55:42'),(5,12,2222.00,0.00,0.00,2222.00,'May 2026','Paid','2026-05-27 06:04:14'),(6,13,20000.00,500.00,0.00,20500.00,'May 2026','Paid','2026-05-27 06:13:06'),(7,13,20000.00,500.00,10.00,20490.00,'May 2026','Paid','2026-05-29 05:25:11'),(8,13,50000.00,500.00,100.00,50400.00,'May 2026','Paid','2026-06-02 12:33:18'),(9,19,20000.00,500.00,100.00,20400.00,'May 2026','Paid','2026-06-03 06:48:45'),(10,20,20000.00,0.00,0.00,20000.00,'May 2026','Paid','2026-06-15 03:57:51');
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_reviews`
--

DROP TABLE IF EXISTS `performance_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `review_date` date NOT NULL,
  `rating` int NOT NULL,
  `feedback` text NOT NULL,
  `goals` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_reviews`
--

LOCK TABLES `performance_reviews` WRITE;
/*!40000 ALTER TABLE `performance_reviews` DISABLE KEYS */;
INSERT INTO `performance_reviews` VALUES (1,1,1,'2026-06-01',5,'Exceptional commitment to raw material logistics and quality control protocols.','Continue optimizing supplier turnaround times.','2026-06-10 05:13:46'),(2,2,1,'2026-06-05',4,'Solid sales support performance. Strong customer rapport and follow-ups.','Increase sales leads generation by 15% next quarter.','2026-06-10 05:13:46');
/*!40000 ALTER TABLE `performance_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurements`
--

DROP TABLE IF EXISTS `procurements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int DEFAULT NULL,
  `material_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `procurement_date` date DEFAULT NULL,
  `status` enum('Pending','Completed','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `procurements_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `procurements_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurements`
--

LOCK TABLES `procurements` WRITE;
/*!40000 ALTER TABLE `procurements` DISABLE KEYS */;
INSERT INTO `procurements` VALUES (1,1,1,200,500.00,'2026-05-15','Pending','2026-05-20 10:42:31'),(2,1,2,50,750.00,'2026-05-15','Pending','2026-05-20 10:42:31'),(3,2,3,500,400.00,'2026-05-18','Pending','2026-05-20 10:42:31'),(4,NULL,NULL,0,0.00,NULL,'Approved','2026-05-20 10:42:31'),(5,7,NULL,50,2500.00,'2026-06-08','Pending','2026-06-08 05:52:37'),(6,NULL,NULL,0,0.00,NULL,'Approved','2026-06-08 05:53:23');
/*!40000 ALTER TABLE `procurements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders_raw`
--

DROP TABLE IF EXISTS `purchase_orders_raw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders_raw` (
  `id` int NOT NULL,
  `po_number` varchar(255) DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `notes` text,
  `items` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders_raw`
--

LOCK TABLES `purchase_orders_raw` WRITE;
/*!40000 ALTER TABLE `purchase_orders_raw` DISABLE KEYS */;
INSERT INTO `purchase_orders_raw` VALUES (1,'PO-1779293551849',1,'Global Steel Inc','pending',1250.00,'2026-05-15','2026-05-30','Urgent restock','[{\"quantity\": 200, \"unitPrice\": 2.5, \"materialId\": 1, \"totalPrice\": 500}, {\"quantity\": 50, \"unitPrice\": 15, \"materialId\": 2, \"totalPrice\": 750}]','2026-05-20 10:42:31'),(2,'PO-1779293551889',2,'PackPro Solutions','pending',400.00,'2026-05-18',NULL,NULL,'[{\"quantity\": 500, \"unitPrice\": 0.8, \"materialId\": 3, \"totalPrice\": 400}]','2026-05-20 10:42:31'),(3,'PO-1779293551929',3,'TechParts Co','pending',320.00,'2026-05-10','2026-05-20',NULL,'[{\"quantity\": 100, \"unitPrice\": 3.2, \"materialId\": 4, \"totalPrice\": 320}]','2026-05-20 10:42:31');
/*!40000 ALTER TABLE `purchase_orders_raw` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotations`
--

DROP TABLE IF EXISTS `quotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NOT NULL,
  `quote_number` varchar(100) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('Draft','Sent','Accepted','Expired') DEFAULT 'Draft',
  `valid_until` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quote_number` (`quote_number`),
  KEY `lead_id` (`lead_id`),
  CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotations`
--

LOCK TABLES `quotations` WRITE;
/*!40000 ALTER TABLE `quotations` DISABLE KEYS */;
INSERT INTO `quotations` VALUES (1,1,'QT-1781328491443',50000.00,'Draft','2026-06-19','2026-06-13 05:28:11'),(2,1,'QT-1781329212476',656464.00,'Draft','2026-06-16','2026-06-13 05:40:12'),(3,1,'QT-1781329263081',753.00,'Draft','2026-03-10','2026-06-13 05:41:03'),(4,1,'QT-1781329643933',757576.00,'Draft','2026-06-25','2026-06-13 05:47:23'),(5,4,'QT-1781584341200',335535.00,'Draft','2026-06-30','2026-06-16 04:32:21');
/*!40000 ALTER TABLE `quotations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruitment_candidates`
--

DROP TABLE IF EXISTS `recruitment_candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruitment_candidates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `position` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'Applied',
  `experience` varchar(100) DEFAULT NULL,
  `resume_url` varchar(255) DEFAULT '',
  `notes` text,
  `applied_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruitment_candidates`
--

LOCK TABLES `recruitment_candidates` WRITE;
/*!40000 ALTER TABLE `recruitment_candidates` DISABLE KEYS */;
INSERT INTO `recruitment_candidates` VALUES (1,'Amit Sharma','amit.sharma@example.com','+91 98765 43210','Logistics Analyst','Interviewing','4 years','resume_amit_sharma.pdf','Impressive background in supply chain management. Scheduled for technical interview.','2026-06-01','2026-06-10 05:13:46'),(2,'Priya Patel','priya.patel@example.com','+91 99988 77766','HR Specialist','Applied','2 years','resume_priya_patel.pdf','Strong interpersonal skills. Screened, fits basic criteria.','2026-06-08','2026-06-10 05:13:46'),(3,'Rohan Das','rohan.das@example.com','+91 91234 56789','Sales Representative','Offered','5 years','resume_rohan_das.pdf','Excellent track record in B2B sales. Verbal offer accepted. Awaiting background check.','2026-05-20','2026-06-10 05:13:46'),(4,'amit sharma','amit@gmail.com','4546','logistic analyst','Applied','4','resume_amit','','2026-06-15','2026-06-15 10:05:37');
/*!40000 ALTER TABLE `recruitment_candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_name` varchar(255) DEFAULT NULL,
  `report_type` varchar(100) DEFAULT NULL,
  `generated_by` int DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `generated_by` (`generated_by`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `sales_person_id` int DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `sales_date` date DEFAULT NULL,
  `payment_status` enum('Pending','Completed') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `sales_person_id` (`sales_person_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`sales_person_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,1,1,'Gold',5,10000.00,'2026-05-22','Completed','2026-05-22 05:42:50'),(2,NULL,NULL,NULL,0,0.00,NULL,'Completed','2026-06-09 04:46:04'),(3,NULL,NULL,NULL,0,0.00,NULL,'Completed','2026-06-09 06:44:47');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_targets`
--

DROP TABLE IF EXISTS `sales_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_targets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_amount` decimal(12,2) NOT NULL DEFAULT '500000.00',
  `achieved_amount` decimal(12,2) DEFAULT '0.00',
  `target_month` int NOT NULL,
  `target_year` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_period` (`user_id`,`target_month`,`target_year`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_targets`
--

LOCK TABLES `sales_targets` WRITE;
/*!40000 ALTER TABLE `sales_targets` DISABLE KEYS */;
INSERT INTO `sales_targets` VALUES (1,1,500000.00,0.00,6,2026,'2026-06-13 05:39:43');
/*!40000 ALTER TABLE `sales_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `sid` varchar(255) NOT NULL,
  `sess` json DEFAULT NULL,
  `expire` datetime DEFAULT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('UdH73-VQ3OFpLK5zmAZEkwpDDYv_xsYS','{\"role\": \"admin\", \"cookie\": {\"path\": \"/\", \"secure\": false, \"expires\": \"2026-05-27T16:25:14.088Z\", \"httpOnly\": true, \"originalMaxAge\": 604800000}, \"userId\": 1}','2026-05-27 16:25:15'),('XGIPAnAxYXuN7cNYVXAtTXgFcAg2GuDK','{\"role\": \"employee\", \"cookie\": {\"path\": \"/\", \"secure\": false, \"expires\": \"2026-05-27T16:32:32.926Z\", \"httpOnly\": true, \"originalMaxAge\": 604800000}, \"userId\": 7}','2026-05-27 16:49:27');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text,
  `priority` varchar(50) DEFAULT 'Low',
  `status` varchar(50) DEFAULT 'Open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
INSERT INTO `support_tickets` VALUES (1,1,'Unable to export PDF billing statements','Reporting','When attempting to download CRM transaction reports, the backend drops a timeout error.','Medium','In Progress','2026-05-27 06:43:25'),(2,1,'MySQL primary cluster latency check','Infrastructure','Active DB pool latency has spiked up by 150ms over the last week. Review thread queues.','High','Open','2026-05-27 06:43:25'),(3,1,'Password recovery for Warehouse supervisor','Authentication','Supervisor requested credentials overwrite after losing lock file access.','Low','Resolved','2026-05-27 06:43:25');
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `assigned_to` int NOT NULL,
  `priority` varchar(50) DEFAULT 'Medium',
  `status` varchar(50) DEFAULT 'In Progress',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `ticket_number` varchar(255) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `description` text,
  `priority` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'TKT-1779293548082',1,'Acme Corp','Invoice discrepancy on last order',NULL,'high','open','Billing','Carol Davis',NULL,'2026-05-20 10:42:28'),(2,'TKT-1779293548122',2,'NovaTech Ltd','API integration not working','Webhook endpoint failing with 500 errors','critical','open','Technical','Alice Johnson',NULL,'2026-05-20 10:42:28'),(3,'TKT-1779293548160',3,'Small Biz Co','Request for bulk pricing',NULL,'medium','open','General',NULL,NULL,'2026-05-20 10:42:28'),(4,'TKT-1779293548200',4,'MegaStore','Delayed shipment inquiry',NULL,'high','open','General','Bob Martinez',NULL,'2026-05-20 10:42:28');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainings`
--

DROP TABLE IF EXISTS `trainings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `department` varchar(100) DEFAULT 'All',
  `trainer` varchar(255) DEFAULT NULL,
  `scheduled_date` date NOT NULL,
  `status` varchar(50) DEFAULT 'Upcoming',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainings`
--

LOCK TABLES `trainings` WRITE;
/*!40000 ALTER TABLE `trainings` DISABLE KEYS */;
INSERT INTO `trainings` VALUES (1,'Safety Protocols & Warehouse Hazards','Mandatory safety training covering heavy machinery operation, inventory stacking, and hazard mitigation.','Logistics','Karan Mehta','2026-06-15','Upcoming','2026-06-10 05:13:46'),(2,'Advanced CRM & Customer Engagement','Interactive workshop on using custom CRM modules, lead nurturing, and automation parameters.','Sales','Neha Sen','2026-06-03','Completed','2026-06-10 05:13:46');
/*!40000 ALTER TABLE `trainings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `role` enum('Admin','HR','Manager','Employee','Sales') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `department` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@smtbms.com','$2b$12$271Dl1Y.Z6yBO/fa1ZQjtOdgYz/bYqJHCaXNK7tUCzSVvkhh.Qmgi',NULL,'Admin',NULL,'2026-05-20 10:53:30',NULL),(2,'salesrep','sales@smtbms.com','$2b$12$Ulgntj2MhpwEOlUqjJdHfOjqWiJ2p5ZT1iSR4rR.YQoMs2yClubAa',NULL,'Sales',NULL,'2026-05-20 10:53:30',NULL),(3,'ops_manager','manager@smtbms.com','$2b$12$FDl6OzTk/j8f781LHmmZI.c0Siaa4ZMe/qCEvD8SS4Zz63hYwGad2',NULL,'Manager',NULL,'2026-05-20 10:53:31',NULL),(4,'jdoe','employee@smtbms.com','$2b$12$/NEzAVBuBlg7Q02DTEzXyeSG2MLjzTNx/UJnGsfT1aytWoTbBFJeu',NULL,'Employee',NULL,'2026-05-20 10:53:31',NULL),(5,'admin1234','admin@gmail.com','$2b$12$cMHbRFUNU8kNrNtr7xzl1.1Eu7pLRdJEPtM404oqugw1O124B6kTW',NULL,'Admin',NULL,'2026-05-20 10:53:55',NULL),(6,'humanresource123','hr123@gmail.com','$2b$12$JaWElmG3tlqegQw/bMHbWOzXi5qDjl8ifyZRHqwAhX5jVJoShx5fG',NULL,'HR',NULL,'2026-05-20 10:55:34',NULL),(7,'harish','harish@gmail.com','$2b$12$oKyb/hp89K4xQipgkxgzauaY/3nimKuv6dbI9Qh.3tYsj3uLMhJPy',NULL,'Employee',NULL,'2026-05-20 11:02:32',NULL),(8,'sc','s@gmail.com','$2a$10$DaU2GUL3GcNe/qkvw4Qn.upvH7XqRzL0EUu0yqTwq6XamA1J7waEO',NULL,'Employee','345678','2026-05-18 16:28:04',NULL),(9,'ram','ram@gmail.com','$2a$10$atHNLV7xOCFzVcuIX0Dp0OVnX/XpF5YVUgHH2KtKeUTUHX13vx7Gq',NULL,'Employee','1234','2026-05-20 06:44:28',NULL),(10,'hari','hari@gmail.com','$2a$10$Z/bE9oTmfYNHgpCjNfWR3.K8LcNT.5ScpPph2bEI82.UsGlCh.PVS',NULL,'Admin','88256','2026-05-20 06:51:47',NULL),(11,'sales','sales@gmail.com','$2a$10$R6uDZAGmN66XTDepHYU9beraPiqcWyGz4COZbNMJqzwugqCN0GES6',NULL,'Sales','890','2026-05-20 07:05:30',NULL),(12,'hr','hr@gmail.com','$2a$10$yfvj.NWaJNyjQvh2bK8vhuTm65yAULh6fqD36K5qF4J2hjNdW4sGy',NULL,'HR','12','2026-05-20 07:30:37',NULL),(13,'Harish Employee','employee@test.com','$2a$10$jNS1zdseg297HNLKeInXbes/qiEFLV8DG3mvJnnIp9MFgfr9.U9Mq',NULL,'Employee','9876543210','2026-05-20 10:19:57',NULL),(14,'Harish Employee','employees@test.com','$2a$10$oljCHmg2EpWlvQrtcjqUYeggFA9wCPTV2kI9YRTtfgLDxnMTegCWq',NULL,'Employee','9876543210','2026-05-20 10:42:59',NULL),(15,'ad','ad@gmail.com','$2a$10$T8GmPPSIEszHu.KZ/RWrnelzFdHlcmeGrH86bKTYMFckwDs4sv0dC',NULL,'Admin','123','2026-05-20 11:02:15',NULL),(22,'emp','emp@gamil.com','$2a$10$Qzu3yhOqzEF/EHunJjlfvuC2kQ95byGovl1X0.YYEhonK/eLpzthO',NULL,'Admin','234','2026-05-21 07:34:01',NULL),(24,'koki','koki@gmail.com','$2a$10$vpX.PnbkRtdfKXR4rSddNeuPXJZvewchxMlF8Px5WJMHmOsiW.37q',NULL,'Admin','123','2026-05-21 07:47:35',NULL),(25,'hrs','hrs@gmail.com','$2a$10$koDCI2vZLEqMO4rwe08mWOCyMnUA8iwcewQeatxiFxbCBd57MYiBC',NULL,'HR','123','2026-05-21 07:50:48',NULL),(26,'empl','empl@gmail.com','$2a$10$TrZka.otwocE/Qfz.hNnE.8HE2OfHXbLRaFT3jJ.B//qLn8hQ8dEu',NULL,'Employee','123','2026-05-21 07:51:52',NULL),(27,'employ','employ@gmail.com','$2a$10$Ynk3FrdQY0JoUvmHBhLppuHnp8AotGVTsuFOkEEKKoqz0aq0kF2E.',NULL,'Employee','123','2026-05-21 08:03:35',NULL),(28,'human res','humanr@gmail.com','$2a$10$g7FhM6Saknw2fAd1IXMWn.tJjneRJMZywn31XkKauJHmzMSDejKou',NULL,'HR','123','2026-05-21 08:04:38',NULL),(29,'manager','manager@gmail.com','$2a$10$zDZuGkz4Rj4nR/fNkGWkqOptltuHWP03bK94Hv.yGgM3jAFpKinmq',NULL,'Manager','234','2026-05-21 08:05:36',NULL),(30,'sales','sales1@gmail.com','$2a$10$UEEEfdzAd/wgj6Cx0JOlJO6GrOZjCq4TtqDndJ43AJ6fW/PxFB8pC',NULL,'Sales','345','2026-05-21 08:06:28',NULL),(31,'admin','admin1@gmail.com','$2a$10$YzDXENVs9/Mpub5Dzg22AOsTLfhoCsRAAHI9D5CVcxcX8gW8YM6oa',NULL,'Admin','123','2026-05-21 08:15:28',NULL),(32,'sales','sales1@gmail.coms','$2a$10$2jyrlQufNYitEfSYjlvQQeOO/ZQLjXkAbuZut2xIQfEvqxxbrqEsK',NULL,'Sales','12345','2026-05-25 05:43:33',NULL),(33,'sri','sri@gmail.com','$2a$10$9F8pPsCKa6qx0/B9/SyMmu9rX8avJzfYqhWu0bjfQzlCLMULGgiza',NULL,'Employee','456','2026-05-25 07:59:28',NULL),(34,'sai','sai@gmail.com','$2a$10$cGhevcnvXEtRwL58iLhxc.bS5cFC054lykBOzPyU3E0/tKRCVc6UG',NULL,'Employee','456','2026-05-25 09:24:33',NULL),(35,'lakshmi','lakshmi@gmail.com','$2a$10$qC1VC3UEUB81GSywVLotWuYGk3BBy4GVd2Wq.OGJhBVTbcQz.LRR6',NULL,'Employee','45689','2026-05-25 09:27:45',NULL),(39,'kumar','kumar@gmail.com','$2a$10$12McuX93HglN067xl3G8eOyPqqPHLV2x49blRVR0pNqYAJ2LePZXK',NULL,'Employee','34567890','2026-05-27 05:00:12','IT'),(40,'siva','siva@gmail.com','$2a$10$8HDgi1xGH.Q1pZL0mOo44.1zh5TYHTFvMqcHcLop5MAw2uWpy.3dK',NULL,'Employee','8765','2026-05-27 05:26:15','IT'),(41,'ramesh','ramesh@gmail.com','$2a$10$fhFSOul1WXQdve36QWnBb.FMeYjVYMw8IGv4gtr5NA9f1qKZRJjpO',NULL,'Employee','3456987','2026-05-27 05:37:30','IT'),(51,'rajesh','rajesh@gmail.com','$2a$10$fUxvm/z8ljSDja.kD8YsMeNBH9yytx/35qnawUAMj3J9LCAFHG9lW',NULL,'Employee','65784','2026-06-03 06:46:33','IT'),(52,'john','john@gmail.com','$2a$10$Fs/vdP7s1FQUjUE2YNGMiuMpptFFm0y6ERF4Q/hvJyyfRBSPuggLC',NULL,'Employee','35437','2026-06-03 06:47:58','IT'),(53,'sriharish','sriharishsenthil03@gmail.com','$2a$10$3SI20BQxIA.x5FThPg3UZ.Z8QCytsFqGVdJ7uxmeZsCmNVSq/TRXW','100805490042964483339','Employee','3534','2026-06-15 03:38:39','it');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'Global Steel Inc','John Weber','jweber@globalsteel.com','+1-555-0101',NULL,'2026-05-21 05:59:31','Supplier',4.5,'active'),(2,'PackPro Solutions','Sarah Chen','s.chen@packpro.com',NULL,NULL,'2026-05-21 05:59:31','Manufacturer',3.8,'active'),(3,'TechParts Co','Mike Torres','m.torres@techparts.io',NULL,NULL,'2026-05-21 05:59:31','Distributer',4.2,'active'),(4,'Techno Steels','jeo','technosteels@gmail.com','234567','Chennai','2026-05-26 06:06:22','Supplier',4.6,'active'),(5,'xyz materials','chris','xyz@gmail.com','1234','mumbai','2026-05-26 06:25:35','distibutor',4.6,'active'),(6,'Techno Steels','xyz operson','xyz@gmail.com','4567','delhi','2026-05-29 05:21:32','distibutor',4.6,'active'),(7,'chennai traders','will','chennaitraders@gmail.com','6446836','ramapuram,chennai','2026-06-02 12:29:55','distibutor',4.5,'active'),(8,'rogers','chris','rogers@gmail.com','74746','delhi','2026-06-16 12:49:55','metal',4.5,'active');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'railway'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-30 11:14:15
