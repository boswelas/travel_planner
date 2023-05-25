CREATE TABLE `experience` (
  `experience_id` int NOT NULL AUTO_INCREMENT,
  `location_id` int NOT NULL,
  `title` varchar(45) DEFAULT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `geolocation` point DEFAULT NULL,
  `avg_rating` float DEFAULT NULL,
  PRIMARY KEY (`experience_id`,`location_id`),
  UNIQUE KEY `experience_id_UNIQUE` (`experience_id`),
  KEY `fk_experience_location1_idx` (`location_id`),
  FULLTEXT KEY `title` (`title`,`description`),
  FULLTEXT KEY `title_2` (`title`),
  FULLTEXT KEY `description` (`description`),
  FULLTEXT KEY `title_3` (`title`,`description`),
  CONSTRAINT `fk_experience_location1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `experience_has_image` (
  `experience_id` int DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  KEY `fk_experience_has_image_image1_idx` (`image_id`),
  KEY `fk_experience_has_image_experience1_idx` (`experience_id`),
  CONSTRAINT `fk_experience_has_image_image1` FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `experience_has_keyword` (
  `experience_id` int NOT NULL,
  `keyword_id` int DEFAULT NULL,
  KEY `fk_experience_has_keywords_keywords1_idx` (`keyword_id`),
  KEY `fk_experience_has_keywords_experience1_idx` (`experience_id`),
  CONSTRAINT `fk_experience_has_keywords_experience1` FOREIGN KEY (`experience_id`) REFERENCES `experience` (`experience_id`),
  CONSTRAINT `fk_experience_has_keywords_keywords1` FOREIGN KEY (`keyword_id`) REFERENCES `keyword` (`keyword_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `image` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `img_url` longtext,
  PRIMARY KEY (`image_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `keyword` (
  `keyword_id` int NOT NULL AUTO_INCREMENT,
  `keyword` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`keyword_id`),
  FULLTEXT KEY `keyword` (`keyword`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `location` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE KEY `location_id_UNIQUE` (`location_id`),
  FULLTEXT KEY `city` (`city`),
  FULLTEXT KEY `state` (`state`),
  FULLTEXT KEY `country` (`country`),
  FULLTEXT KEY `city_2` (`city`),
  FULLTEXT KEY `city_3` (`city`,`state`,`country`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip` (
  `trip_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(128) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `background_photo` int DEFAULT '0',
  PRIMARY KEY (`trip_id`),
  UNIQUE KEY `trip_id_UNIQUE` (`trip_id`),
  KEY `fk_trip_user1_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trip_has_experience` (
  `trip_id` int NOT NULL,
  `experience_id` int NOT NULL,
  PRIMARY KEY (`trip_id`,`experience_id`),
  KEY `fk_trip_has_experience_experience1_idx` (`experience_id`),
  KEY `fk_trip_has_experience_trip1_idx` (`trip_id`),
  CONSTRAINT `fk_trip_has_experience_experience1` FOREIGN KEY (`experience_id`) REFERENCES `experience` (`experience_id`),
  CONSTRAINT `fk_trip_has_experience_trip1` FOREIGN KEY (`trip_id`) REFERENCES `trip` (`trip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user` (
  `user_id` varchar(128) NOT NULL,
  `email` varchar(100) NOT NULL,
  `displayName` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  CONSTRAINT `fk_trip_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_rating` (
  `experience_id` int NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `rating` int DEFAULT NULL,
  PRIMARY KEY (`experience_id`,`user_id`),
  KEY `fk_rating_experience1_idx` (`experience_id`),
  KEY `fk_rating_user1_idx` (`user_id`),
  CONSTRAINT `fk_rating_experience1` FOREIGN KEY (`experience_id`) REFERENCES `experience` (`experience_id`),
  CONSTRAINT `fk_rating_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
