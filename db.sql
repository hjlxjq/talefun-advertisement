-- MySQL dump 10.13  Distrib 5.7.24, for macos10.14 (x86_64)
--
-- Host: localhost    Database: talefun_ad
-- ------------------------------------------------------
-- Server version	5.7.24-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ABTestGroup`
--

DROP TABLE IF EXISTS `abTestGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `abTestGroup` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `begin` tinyint(3) DEFAULT NULL,
  `end` tinyint(3) DEFAULT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nativeTmplConfGroupId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `configGroupId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `versionGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_versionGroupId` (`name`,`versionGroupId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ABTestMap`
--

DROP TABLE IF EXISTS `ABTestMap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ABTestMap` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adGroupId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `abTestGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `place` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `place_abTest` (`place`,`abTestGroupId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ad`
--

DROP TABLE IF EXISTS `ad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ad` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `placementID` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ecpm` decimal(6,2) unsigned NOT NULL,
  `loader` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subloader` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `interval` smallint(4) unsigned DEFAULT '60',
  `weight` tinyint(3) unsigned DEFAULT '10',
  `bidding` tinyint(1) unsigned DEFAULT '0',
  `adChannelId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adTypeId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activeTime` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activeIndex_adGroupId_placementId` (`activeTime`,`adGroupId`,`placementID`),
  UNIQUE KEY `name_activeIndex_adGroupId_adChannelId` (`name`,`activeTime`,`adGroupId`,`adChannelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adChannel`
--

DROP TABLE IF EXISTS `adChannel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adChannel` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key1` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `key2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `key3` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `test` tinyint(1) unsigned DEFAULT '1',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `channel_UNIQUE` (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adChannelMap`
--

DROP TABLE IF EXISTS `adChannelMap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adChannelMap` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adChannelId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adTypeId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adChannel_adType` (`adChannelId`,`adTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adGroup`
--

DROP TABLE IF EXISTS `adGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adGroup` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `adTypeId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_typeId_pid` (`name`,`adTypeId`,`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adType`
--

DROP TABLE IF EXISTS `adType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adType` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test` tinyint(1) unsigned DEFAULT '1',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_UNIQUE` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `baseConfig`
--

DROP TABLE IF EXISTS `baseConfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `baseConfig` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `test` tinyint(1) unsigned DEFAULT '1',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_UNIQUE` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `channelParamConf`
--

DROP TABLE IF EXISTS `channelParamConf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channelParamConf` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value1` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value2` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value3` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adChannelId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pId_adChannelId` (`productId`,`adChannelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(800) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `configGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_confGroupId` (`key`,`configGroupId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configGroup`
--

DROP TABLE IF EXISTS `configGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configGroup` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `type` tinyint(1) unsigned DEFAULT '1',
  `dependentId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name_pid` (`type`,`name`,`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nation`
--

DROP TABLE IF EXISTS `nation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nation` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `include` tinyint(1) unsigned NOT NULL,
  `versionGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_versionGroupId` (`code`,`versionGroupId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nativeTmpl`
--

DROP TABLE IF EXISTS `nativeTmpl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nativeTmpl` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preview` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test` tinyint(1) unsigned DEFAULT '1',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_UNIQUE` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nativeTmplConf`
--

DROP TABLE IF EXISTS `nativeTmplConf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nativeTmplConf` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` tinyint(3) unsigned DEFAULT '10',
  `clickArea` tinyint(3) unsigned NOT NULL,
  `isFull` tinyint(1) unsigned DEFAULT '0',
  `nativeTmplId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nativeTmplConfGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `groupId_nativeTmplId` (`nativeTmplConfGroupId`,`nativeTmplId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nativeTmplConfGroup`
--

DROP TABLE IF EXISTS `nativeTmplConfGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nativeTmplConfGroup` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_pid` (`name`,`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `packParam`
--

DROP TABLE IF EXISTS `packParam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packParam` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `test` tinyint(1) unsigned DEFAULT '1',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_UNIQUE` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `packParamConf`
--

DROP TABLE IF EXISTS `packParamConf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packParamConf` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `packParamId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pId_packParamId` (`productId`,`packParamId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `packageName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pid` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `productGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test` tinyint(1) unsigned DEFAULT '1',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform_packageName` (`packageName`,`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productAuth`
--

DROP TABLE IF EXISTS `productAuth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productAuth` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `master` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `editAd` tinyint(1) unsigned DEFAULT '0',
  `viewAd` tinyint(1) unsigned DEFAULT '0',
  `editGameConfig` tinyint(1) unsigned DEFAULT '0',
  `viewGameConfig` tinyint(1) unsigned DEFAULT '0',
  `viewPurchase` tinyint(1) unsigned DEFAULT '0',
  `editPurchase` tinyint(1) unsigned DEFAULT '0',
  `editProduct` tinyint(1) unsigned DEFAULT '0',
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pId_uId` (`productId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productGroup`
--

DROP TABLE IF EXISTS `productGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productGroup` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productGroupAuth`
--

DROP TABLE IF EXISTS `productGroupAuth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productGroupAuth` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productGroupId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `master` tinyint(1) unsigned DEFAULT '0',
  `editAd` tinyint(1) unsigned DEFAULT '0',
  `viewAd` tinyint(1) unsigned DEFAULT '0',
  `editGameConfig` tinyint(1) unsigned DEFAULT '0',
  `viewGameConfig` tinyint(1) unsigned DEFAULT '0',
  `viewPurchase` tinyint(1) unsigned DEFAULT '0',
  `editPurchase` tinyint(1) unsigned DEFAULT '0',
  `editProduct` tinyint(1) unsigned DEFAULT '0',
  `createProduct` tinyint(1) unsigned DEFAULT '0',
  `active` tinyint(1) unsigned DEFAULT '1',
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `groupId_userId` (`productGroupId`,`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userAuth`
--

DROP TABLE IF EXISTS `userAuth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userAuth` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `master` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `editComConf` tinyint(1) unsigned DEFAULT '0',
  `viewComConf` tinyint(1) unsigned DEFAULT '0',
  `createProductGroup` tinyint(1) unsigned DEFAULT '0',
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_UNIQUE` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `versionGroup`
--

DROP TABLE IF EXISTS `versionGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `versionGroup` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `begin` smallint(5) unsigned NOT NULL,
  `type` tinyint(1) unsigned DEFAULT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `productId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) unsigned DEFAULT '1',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name_pid` (`type`,`name`,`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-29 18:10:36
