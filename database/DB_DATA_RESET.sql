Use `railway`;

SET FOREIGN_KEY_CHECKS=0;

/*
	CLEARS TABLES
*/
TRUNCATE TABLE `railway`.`location`;
TRUNCATE TABLE `railway`.`experience`;
TRUNCATE TABLE `railway`.`keyword`;
TRUNCATE TABLE `railway`.`experience_has_keyword`;

/*
	LOCATION INSERT
*/
INSERT INTO `railway`.`location`
	(`location_id`,
	`name`,
	`city`,
	`state`,
	`country`)
VALUES
	(0,
	'',
	'New York City',
	'New York',
	'United States')
	,(1,
	'',
	'Houston',
	'Texas',
	'United States')
	,(2,
	'',
	'Los Angeles',
	'California',
	'United States')
	,(3,
	'',
	'Las Vegas',
	'Nevada',
	'United States')
	,(4,
	'',
	'Denver',
	'Colorado',
	'United States')
;

/*
	EXPERIENCE INSERT
*/
INSERT INTO `railway`.`experience`
	(`experience_id`,
	`location_id`,
	`title`,
	`description`,
	`geolocation`,
	`avg_rating`,
	`user_user_id`)
VALUES
	(0,
	0,
	'Statue of Liberty',
	'Cool statue on little island',
	NULL,
	4.9,
	0)
    ,(1,
	0,
	'Museum of Modern Art',
	'Fantastic art museum',
	NULL,
	4.4,
	0)
    ,(2,
	0,
	'NY Zoo',
	'Lots of animals',
	NULL,
	4.0,
	0)
    ,(3,
	1,
	'Houston Natural Science Museum',
	'Whoa science',
	NULL,
	5.0,
	1)
	,(4,
	1,
	'BBQ @ Pinkertons',
	'Best BBQ eva',
	NULL,
	4.5,
	1)
	,(5,
	1,
	'Hike at park',
	'Great park',
	NULL,
	4.1,
	1)
	,(6,
	2,
	'Run in park',
	'Fun trails',
	NULL,
	4.1,
	3)
;

/*
	KEYWORD INSERT
*/
INSERT INTO `railway`.`keyword`
(`keyword_id`,
`keyword`)
VALUES
	(0,
	'fun')
    ,(1,
	'history')
    ,(2,
	'art')
    ,(3,
	'exercise')
    ,(4,
	'food')
;

INSERT INTO `railway`.`experience_has_keyword`
(`experience_id`,
`keyword_id`)
VALUES
	(0,
	0)
    ,(2,
	0)
    ,(5,
	0)
	,(0,
	1)
	,(0,
	3)
	,(3,
	2)
	,(5,
	3)
	,(6,
	3)
	,(4,
	4)
;


SET FOREIGN_KEY_CHECKS=1;
