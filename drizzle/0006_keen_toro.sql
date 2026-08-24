CREATE TABLE `fateReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`archiveId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`reviewStatus` enum('pending','in_review','published') NOT NULL DEFAULT 'pending',
	`structureVerdict` varchar(160),
	`congGeVerdict` enum('undetermined','none','cong_strong','cong_weak','other') NOT NULL DEFAULT 'undetermined',
	`specialCombinationVerdict` text,
	`rationale` text,
	`displayCopy` text,
	`reviewerId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fateReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `fate_reviews_archive_idx` UNIQUE(`archiveId`)
);
--> statement-breakpoint
CREATE TABLE `fateRuleVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleKey` varchar(64) NOT NULL,
	`version` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`body` text NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`editorId` int NOT NULL,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fateRuleVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `fate_rule_versions_key_version_idx` UNIQUE(`ruleKey`,`version`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','astrologer','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `fateReviews` ADD CONSTRAINT `fateReviews_archiveId_savedArchives_id_fk` FOREIGN KEY (`archiveId`) REFERENCES `savedArchives`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fateReviews` ADD CONSTRAINT `fateReviews_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fateReviews` ADD CONSTRAINT `fateReviews_reviewerId_users_id_fk` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fateRuleVersions` ADD CONSTRAINT `fateRuleVersions_editorId_users_id_fk` FOREIGN KEY (`editorId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `fate_reviews_owner_status_idx` ON `fateReviews` (`ownerUserId`,`reviewStatus`);--> statement-breakpoint
CREATE INDEX `fate_reviews_reviewer_updated_idx` ON `fateReviews` (`reviewerId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `fate_rule_versions_status_key_idx` ON `fateRuleVersions` (`status`,`ruleKey`,`version`);--> statement-breakpoint
CREATE INDEX `fate_rule_versions_editor_updated_idx` ON `fateRuleVersions` (`editorId`,`updatedAt`);