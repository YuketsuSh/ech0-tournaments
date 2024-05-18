CREATE TABLE IF NOT EXISTS `leaderboard` (
  `LeaderboardID` int NOT NULL AUTO_INCREMENT,
  `TournamentID` int DEFAULT NULL,
  `ClanTag` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Score` int DEFAULT NULL,
  `Position` int DEFAULT NULL,
  PRIMARY KEY (`LeaderboardID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `registrations` (
  `RegistrationID` int NOT NULL AUTO_INCREMENT,
  `TournamentID` int DEFAULT NULL,
  `UserID` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `ClanTag` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Players` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`RegistrationID`),
  KEY `TournamentID` (`TournamentID`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`TournamentID`) REFERENCES `tournaments` (`TournamentID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tournaments` (
  `TournamentID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Date` datetime NOT NULL,
  `Type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Duration` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `Channel` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`TournamentID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
