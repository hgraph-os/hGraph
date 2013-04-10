-- MySQL dump 10.13  Distrib 5.1.66, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: hmixer
-- ------------------------------------------------------
-- Server version	5.1.66-0+squeeze1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `age_ranges`
--

DROP TABLE IF EXISTS `age_ranges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `age_ranges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `age_min` int(11) DEFAULT NULL,
  `age_max` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `age_ranges`
--

LOCK TABLES `age_ranges` WRITE;
/*!40000 ALTER TABLE `age_ranges` DISABLE KEYS */;
INSERT INTO `age_ranges` VALUES (1,'everyone',0,1000,'2013-02-18 15:00:11','2013-02-18 15:00:13');
/*!40000 ALTER TABLE `age_ranges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contributions`
--

DROP TABLE IF EXISTS `contributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contributions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) DEFAULT NULL,
  `metric_id` int(11) DEFAULT NULL,
  `healthy_min` decimal(10,0) DEFAULT NULL,
  `healthy_max` decimal(10,0) DEFAULT NULL,
  `total_min` decimal(10,0) DEFAULT NULL,
  `total_max` decimal(10,0) DEFAULT NULL,
  `score_weight` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `demographic_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_contributions_on_submission_id` (`submission_id`),
  KEY `index_contributions_on_metric_id` (`metric_id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contributions`
--

LOCK TABLES `contributions` WRITE;
/*!40000 ALTER TABLE `contributions` DISABLE KEYS */;
INSERT INTO `contributions` VALUES (1,1,1,'49','90','0','160',10,'2013-02-12 01:35:57','2013-02-26 23:00:15',1),(2,1,2,'93','123','0','130',4,'2013-02-12 01:35:57','2013-02-26 23:00:15',1),(3,1,3,'437','600','0','600',3,'2013-02-12 01:35:57','2013-02-26 23:00:15',1),(4,1,4,'1','4','0','18',5,'2013-02-12 01:35:57','2013-02-26 23:00:15',1),(5,1,1,'63','148','0','160',5,'2013-02-12 01:35:57','2013-02-26 23:00:15',2),(6,1,2,'28','102','0','130',7,'2013-02-12 01:35:57','2013-02-26 23:00:20',2),(7,1,3,'291','454','0','600',3,'2013-02-12 01:35:57','2013-02-26 23:00:15',2),(8,1,4,'6','9','0','18',5,'2013-02-12 01:35:57','2013-02-25 21:03:01',2),(17,5,1,'49','90','0','160',10,'2013-02-25 22:01:35','2013-02-26 23:03:18',1),(18,5,2,'93','123','0','130',4,'2013-02-25 22:01:35','2013-02-26 23:03:18',1),(19,5,3,'437','600','0','600',3,'2013-02-25 22:01:35','2013-02-26 23:03:18',1),(20,5,4,'1','4','0','18',5,'2013-02-25 22:01:35','2013-02-26 23:03:18',1),(21,5,1,'63','148','0','160',5,'2013-02-25 22:01:35','2013-02-26 23:03:18',2),(22,5,2,'28','102','0','130',7,'2013-02-25 22:01:35','2013-02-26 23:03:18',2),(23,5,3,'291','454','0','600',3,'2013-02-25 22:01:35','2013-02-26 23:03:18',2),(24,5,4,'6','9','0','18',5,'2013-02-25 22:01:35','2013-02-26 22:41:57',2),(49,9,1,'22','88','0','160',10,'2013-02-25 22:18:16','2013-02-26 22:46:54',1),(50,9,2,'63','130','0','130',4,'2013-02-25 22:18:16','2013-02-26 22:46:54',1),(51,9,3,'237','516','0','600',3,'2013-02-25 22:18:16','2013-02-26 22:47:13',1),(52,9,4,'6','9','0','18',5,'2013-02-25 22:18:16','2013-02-25 22:18:16',1),(53,9,1,'25','75','0','160',1,'2013-02-25 22:18:16','2013-02-25 22:18:16',2),(54,9,2,'13','43','0','130',1,'2013-02-25 22:18:16','2013-02-25 22:18:16',2),(55,9,3,'97','291','0','600',1,'2013-02-25 22:18:16','2013-02-25 22:18:16',2),(56,9,4,'5','14','0','18',1,'2013-02-25 22:18:16','2013-02-25 22:18:16',2),(57,10,1,'22','60','0','160',10,'2013-02-25 22:19:27','2013-02-25 22:19:27',1),(58,10,2,'100','130','0','130',4,'2013-02-25 22:19:27','2013-02-25 22:19:27',1),(59,10,3,'237','400','0','600',3,'2013-02-25 22:19:27','2013-02-25 22:19:27',1),(60,10,4,'6','9','0','18',5,'2013-02-25 22:19:27','2013-02-25 22:19:27',1),(61,10,1,'25','75','0','160',1,'2013-02-25 22:19:27','2013-02-25 22:19:27',2),(62,10,2,'13','43','0','130',1,'2013-02-25 22:19:27','2013-02-25 22:19:27',2),(63,10,3,'97','291','0','600',1,'2013-02-25 22:19:27','2013-02-25 22:19:27',2),(64,10,4,'5','14','0','18',1,'2013-02-25 22:19:27','2013-02-25 22:19:27',2),(65,11,1,'49','90','0','160',10,'2013-02-26 22:53:42','2013-02-27 14:56:42',1),(66,11,2,'93','123','0','130',4,'2013-02-26 22:53:42','2013-02-27 14:56:42',1),(67,11,3,'437','600','0','600',3,'2013-02-26 22:53:42','2013-02-27 14:56:42',1),(68,11,4,'1','4','0','18',5,'2013-02-26 22:53:42','2013-02-27 14:56:42',1),(69,11,1,'22','125','0','160',5,'2013-02-26 22:53:42','2013-02-26 22:55:20',2),(70,11,2,'56','130','0','130',7,'2013-02-26 22:53:42','2013-02-26 22:55:20',2),(71,11,3,'237','400','0','600',3,'2013-02-26 22:53:42','2013-02-26 22:55:20',2),(72,11,4,'6','9','0','18',5,'2013-02-26 22:53:42','2013-02-26 22:55:20',2),(73,12,1,'68','106','0','160',10,'2013-02-26 22:56:29','2013-02-26 22:56:29',1),(74,12,2,'63','93','0','130',4,'2013-02-26 22:56:29','2013-02-26 22:56:29',1),(75,12,3,'144','307','0','600',3,'2013-02-26 22:56:29','2013-02-26 22:56:29',1),(76,12,4,'8','11','0','18',5,'2013-02-26 22:56:29','2013-02-26 22:56:29',1),(77,12,1,'22','107','0','160',5,'2013-02-26 22:56:29','2013-02-26 22:56:29',2),(78,12,2,'32','106','0','130',7,'2013-02-26 22:56:29','2013-02-26 22:56:29',2),(79,12,3,'237','400','0','600',3,'2013-02-26 22:56:29','2013-02-26 22:56:29',2),(80,12,4,'11','14','0','18',5,'2013-02-26 22:56:29','2013-02-26 22:56:29',2),(81,13,1,'37','70','0','160',10,'2013-02-26 23:18:46','2013-03-04 22:35:30',1),(82,13,2,'41','66','0','130',4,'2013-02-26 23:18:46','2013-03-04 22:35:28',1),(83,13,3,'494','600','0','600',3,'2013-02-26 23:18:46','2013-03-04 22:35:25',1),(84,13,4,'0','3','0','18',5,'2013-02-26 23:18:46','2013-03-04 22:35:22',1),(85,13,1,NULL,NULL,NULL,NULL,NULL,'2013-02-26 23:18:46','2013-02-26 23:18:46',2),(86,13,2,NULL,NULL,NULL,NULL,NULL,'2013-02-26 23:18:46','2013-02-26 23:18:46',2),(87,13,3,NULL,NULL,NULL,NULL,NULL,'2013-02-26 23:18:46','2013-02-26 23:18:46',2),(88,13,4,NULL,NULL,NULL,NULL,NULL,'2013-02-26 23:18:46','2013-02-26 23:18:46',2),(89,14,1,'0','41','0','160',10,'2013-02-27 01:00:10','2013-02-27 01:03:02',1),(90,14,2,'0','30','0','130',4,'2013-02-27 01:00:10','2013-02-27 01:03:02',1),(91,14,3,'0','163','0','600',3,'2013-02-27 01:00:10','2013-02-27 01:03:02',1),(92,14,4,'0','3','0','18',5,'2013-02-27 01:00:10','2013-02-27 01:03:02',1),(93,14,1,'0','85','0','160',5,'2013-02-27 01:00:10','2013-02-27 01:00:10',2),(94,14,2,'0','74','0','130',7,'2013-02-27 01:00:10','2013-02-27 01:00:10',2),(95,14,3,'0','163','0','600',3,'2013-02-27 01:00:10','2013-02-27 01:00:10',2),(96,14,4,'0','3','0','18',5,'2013-02-27 01:00:10','2013-02-27 01:00:10',2),(97,15,1,'0','41','0','160',10,'2013-03-04 22:32:48','2013-03-04 22:32:48',1),(98,15,2,'0','29','0','130',4,'2013-03-04 22:32:48','2013-03-04 22:32:48',1),(99,15,3,'0','163','0','600',3,'2013-03-04 22:32:48','2013-03-04 22:32:48',1),(100,15,4,'1','4','0','18',5,'2013-03-04 22:32:48','2013-03-04 22:32:48',1),(101,15,1,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:32:48','2013-03-04 22:32:48',2),(102,15,2,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:32:48','2013-03-04 22:32:48',2),(103,15,3,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:32:48','2013-03-04 22:32:48',2),(104,15,4,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:32:48','2013-03-04 22:32:48',2),(105,16,1,'49','90','0','160',10,'2013-03-04 22:33:26','2013-03-04 22:33:26',1),(106,16,2,'55','85','0','130',4,'2013-03-04 22:33:26','2013-03-04 22:33:26',1),(107,16,3,'156','319','0','600',3,'2013-03-04 22:33:26','2013-03-04 22:33:26',1),(108,16,4,'1','4','0','18',5,'2013-03-04 22:33:26','2013-03-04 22:33:26',1),(109,16,1,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:33:26','2013-03-04 22:33:26',2),(110,16,2,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:33:26','2013-03-04 22:33:26',2),(111,16,3,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:33:26','2013-03-04 22:33:26',2),(112,16,4,NULL,NULL,NULL,NULL,NULL,'2013-03-04 22:33:26','2013-03-04 22:33:26',2),(113,17,1,'49','90','0','160',10,'2013-03-05 15:08:26','2013-03-05 15:09:41',1),(114,17,2,'19','49','0','130',4,'2013-03-05 15:08:26','2013-03-05 15:09:41',1),(115,17,3,'359','522','0','600',3,'2013-03-05 15:08:26','2013-03-05 15:09:41',1),(116,17,4,'9','12','0','18',5,'2013-03-05 15:08:26','2013-03-05 15:09:41',1),(117,17,1,'63','148','0','160',5,'2013-03-05 15:08:26','2013-03-05 15:09:41',2),(118,17,2,'28','79','0','130',7,'2013-03-05 15:08:26','2013-03-05 15:09:41',2),(119,17,3,'113','276','0','600',3,'2013-03-05 15:08:26','2013-03-05 15:09:41',2),(120,17,4,'9','12','0','18',5,'2013-03-05 15:08:26','2013-03-05 15:09:41',2),(121,18,1,'49','90','0','160',10,'2013-03-05 15:22:38','2013-03-05 15:22:38',1),(122,18,2,'93','123','0','130',4,'2013-03-05 15:22:38','2013-03-05 15:22:38',1),(123,18,3,'437','600','0','600',3,'2013-03-05 15:22:38','2013-03-05 15:22:38',1),(124,18,4,'1','4','0','18',5,'2013-03-05 15:22:38','2013-03-05 15:22:38',1),(125,18,1,'63','148','0','160',5,'2013-03-05 15:22:38','2013-03-05 15:22:38',2),(126,18,2,'28','102','0','130',7,'2013-03-05 15:22:38','2013-03-05 15:22:38',2),(127,18,3,'291','454','0','600',3,'2013-03-05 15:22:38','2013-03-05 15:22:38',2),(128,18,4,'6','9','0','18',5,'2013-03-05 15:22:38','2013-03-05 15:22:38',2);
/*!40000 ALTER TABLE `contributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demographics`
--

DROP TABLE IF EXISTS `demographics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demographics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gender` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `age_ranges_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demographics`
--

LOCK TABLES `demographics` WRITE;
/*!40000 ALTER TABLE `demographics` DISABLE KEYS */;
INSERT INTO `demographics` VALUES (1,'male','2013-02-18 14:59:36','2013-02-18 14:59:37',1),(2,'female','2013-02-18 14:59:50','2013-02-18 14:59:52',1);
/*!40000 ALTER TABLE `demographics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrics`
--

DROP TABLE IF EXISTS `metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrics`
--

LOCK TABLES `metrics` WRITE;
/*!40000 ALTER TABLE `metrics` DISABLE KEYS */;
INSERT INTO `metrics` VALUES (1,'LDL','mg/dl','2013-02-12 01:30:13','2013-02-12 01:30:13'),(2,'HDL','mg/dl','2013-02-12 01:30:13','2013-02-12 01:30:13'),(3,'Triglycerides','mg/dl','2013-02-12 01:30:13','2013-02-12 01:30:13'),(4,'Sleep','hours/night','2013-02-12 01:30:13','2013-02-12 01:30:13'),(5,'LDL','mg/dl','2013-02-12 01:32:54','2013-02-12 01:32:54'),(6,'HDL','mg/dl','2013-02-12 01:32:54','2013-02-12 01:32:54'),(7,'Triglycerides','mg/dl','2013-02-12 01:32:54','2013-02-12 01:32:54'),(8,'Sleep','hours/night','2013-02-12 01:32:54','2013-02-12 01:32:54'),(9,'LDL','mg/dl','2013-02-12 01:35:57','2013-02-12 01:35:57'),(10,'HDL','mg/dl','2013-02-12 01:35:57','2013-02-12 01:35:57'),(11,'Triglycerides','mg/dl','2013-02-12 01:35:57','2013-02-12 01:35:57'),(12,'Sleep','hours/night','2013-02-12 01:35:57','2013-02-12 01:35:57');
/*!40000 ALTER TABLE `metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL,
  UNIQUE KEY `unique_schema_migrations` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_migrations`
--

LOCK TABLES `schema_migrations` WRITE;
/*!40000 ALTER TABLE `schema_migrations` DISABLE KEYS */;
INSERT INTO `schema_migrations` VALUES ('20130211214156'),('20130211214221'),('20130211214319'),('20130211215510'),('20130211223441'),('20130212003231'),('20130212003901'),('20130213190849'),('20130213191346'),('20130213192205'),('20130213192911'),('20130214222723');
/*!40000 ALTER TABLE `schema_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `message` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index_submissions_on_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,'','2013-02-12 01:35:57','2013-02-26 23:00:20'),(5,2,'Here is a message','2013-02-25 22:01:35','2013-02-26 22:41:57'),(9,3,'Hello world of hGraph and Stuff!','2013-02-25 22:18:16','2013-02-26 22:44:07'),(10,4,NULL,'2013-02-25 22:19:27','2013-02-25 22:19:27'),(11,5,'hello everyone','2013-02-26 22:53:42','2013-02-26 22:54:43'),(12,6,NULL,'2013-02-26 22:56:29','2013-02-26 22:56:29'),(13,7,'','2013-02-26 23:18:46','2013-02-26 23:19:44'),(14,8,'Double Booya!','2013-02-27 01:00:10','2013-02-27 01:03:02'),(15,9,NULL,'2013-03-04 22:32:48','2013-03-04 22:32:48'),(16,10,NULL,'2013-03-04 22:33:26','2013-03-04 22:33:26'),(17,11,'dsadfs','2013-03-05 15:08:26','2013-03-05 15:09:41'),(18,12,'teiuieuojksdc','2013-03-05 15:22:38','2013-03-05 15:22:38');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `encrypted_password` varchar(255) NOT NULL DEFAULT '',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_sent_at` datetime DEFAULT NULL,
  `remember_created_at` datetime DEFAULT NULL,
  `sign_in_count` int(11) DEFAULT '0',
  `current_sign_in_at` datetime DEFAULT NULL,
  `last_sign_in_at` datetime DEFAULT NULL,
  `current_sign_in_ip` varchar(255) DEFAULT NULL,
  `last_sign_in_ip` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_users_on_reset_password_token` (`reset_password_token`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Dr. Rob Defacto','drdefacto@defactomd.com','2013-02-12 01:30:13','2013-02-26 22:19:59','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(2,'Dr. Defacto 2','test1@defactomd.com','2013-02-12 01:32:54','2013-02-26 22:41:57','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(3,'Dr. Defacto 2','test2@defactomd.com','2013-02-12 01:35:57','2013-02-26 22:44:07','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(4,'Dr. Defacto','test3@defactomd.com','2013-02-25 17:19:13','2013-02-25 17:19:15','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(5,'Dr. Bob','test4@test.com','2013-02-26 22:53:42','2013-02-26 22:53:42','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(6,'Dr. Bobo','test5@test.com','2013-02-26 22:56:29','2013-02-26 22:56:29','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(7,'','','2013-02-26 23:18:46','2013-02-26 23:18:46','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(8,'Andrew','andrew@myimedia.com','2013-02-27 01:00:10','2013-02-27 01:00:10','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(9,'Andrew','invo@myimedia.com','2013-03-04 22:32:48','2013-03-04 22:32:48','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(10,'Dubious Guy','invo2@myimedia.com','2013-03-04 22:33:26','2013-03-04 22:33:26','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(11,'kja;slkf','test5@test.org','2013-03-05 15:08:26','2013-03-05 15:08:26','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(12,'testjlkj','test6@usr.com','2013-03-05 15:22:38','2013-03-05 15:22:38','',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2013-03-05 10:25:38
