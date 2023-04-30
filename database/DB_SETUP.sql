-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema railway
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema railway
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `railway` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `railway` ;

-- -----------------------------------------------------
-- Table `railway`.`location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`location` (
  `location_id` INT NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `city` VARCHAR(45) NULL DEFAULT NULL,
  `state` VARCHAR(45) NULL DEFAULT NULL,
  `country` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE INDEX `location_id_UNIQUE` (`location_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL,
  `first_name` VARCHAR(45) NULL DEFAULT NULL,
  `last_name` VARCHAR(45) NULL DEFAULT NULL,
  `birthday` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`experience`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`experience` (
  `experience_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `title` VARCHAR(45) NULL DEFAULT NULL,
  `description` VARCHAR(1024) NULL DEFAULT NULL,
  `geolocation` POINT NULL DEFAULT NULL,
  `avg_rating` FLOAT NULL DEFAULT NULL,
  `user_user_id` INT NOT NULL,
  PRIMARY KEY (`experience_id`, `location_id`, `user_user_id`),
  UNIQUE INDEX `experience_id_UNIQUE` (`experience_id` ASC) VISIBLE,
  INDEX `fk_experience_location1_idx` (`location_id` ASC) VISIBLE,
  INDEX `fk_experience_user1_idx` (`user_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_experience_location1`
    FOREIGN KEY (`location_id`)
    REFERENCES `railway`.`location` (`location_id`),
  CONSTRAINT `fk_experience_user1`
    FOREIGN KEY (`user_user_id`)
    REFERENCES `railway`.`user` (`user_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`image` (
  `image_id` INT NOT NULL,
  `img_b65` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`image_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`experience_has_image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`experience_has_image` (
  `experience_id` INT NULL DEFAULT NULL,
  `image_id` INT NULL DEFAULT NULL,
  INDEX `fk_experience_has_image_image1_idx` (`image_id` ASC) VISIBLE,
  INDEX `fk_experience_has_image_experience1_idx` (`experience_id` ASC) VISIBLE,
  CONSTRAINT `fk_experience_has_image_experience1`
    FOREIGN KEY (`experience_id`)
    REFERENCES `railway`.`experience` (`experience_id`),
  CONSTRAINT `fk_experience_has_image_image1`
    FOREIGN KEY (`image_id`)
    REFERENCES `railway`.`image` (`image_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`keyword`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`keyword` (
  `keyword_id` INT NOT NULL,
  `keyword` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`keyword_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`experience_has_keyword`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`experience_has_keyword` (
  `experience_id` INT NOT NULL,
  `keyword_id` INT NULL DEFAULT NULL,
  INDEX `fk_experience_has_keywords_keywords1_idx` (`keyword_id` ASC) VISIBLE,
  INDEX `fk_experience_has_keywords_experience1_idx` (`experience_id` ASC) VISIBLE,
  CONSTRAINT `fk_experience_has_keywords_experience1`
    FOREIGN KEY (`experience_id`)
    REFERENCES `railway`.`experience` (`experience_id`),
  CONSTRAINT `fk_experience_has_keywords_keywords1`
    FOREIGN KEY (`keyword_id`)
    REFERENCES `railway`.`keyword` (`keyword_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`trip`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`trip` (
  `trip_id` INT NOT NULL,
  `user_id` INT NULL DEFAULT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`trip_id`),
  UNIQUE INDEX `trip_id_UNIQUE` (`trip_id` ASC) VISIBLE,
  INDEX `fk_trip_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_trip_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `railway`.`user` (`user_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `railway`.`trip_has_experience`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `railway`.`trip_has_experience` (
  `trip_id` INT NOT NULL,
  `experience_id` INT NOT NULL,
  PRIMARY KEY (`trip_id`, `experience_id`),
  INDEX `fk_trip_has_experience_experience1_idx` (`experience_id` ASC) VISIBLE,
  INDEX `fk_trip_has_experience_trip1_idx` (`trip_id` ASC) VISIBLE,
  CONSTRAINT `fk_trip_has_experience_experience1`
    FOREIGN KEY (`experience_id`)
    REFERENCES `railway`.`experience` (`location_id`),
  CONSTRAINT `fk_trip_has_experience_trip1`
    FOREIGN KEY (`trip_id`)
    REFERENCES `railway`.`trip` (`trip_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
