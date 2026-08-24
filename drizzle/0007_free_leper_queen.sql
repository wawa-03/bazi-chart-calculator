CREATE TABLE `fateReviewRevisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`editorId` int NOT NULL,
	`beforeJson` text NOT NULL,
	`afterJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fateReviewRevisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `fateReviewRevisions` ADD CONSTRAINT `fateReviewRevisions_reviewId_fateReviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `fateReviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fateReviewRevisions` ADD CONSTRAINT `fateReviewRevisions_editorId_users_id_fk` FOREIGN KEY (`editorId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `fate_review_revisions_review_created_idx` ON `fateReviewRevisions` (`reviewId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `fate_review_revisions_editor_created_idx` ON `fateReviewRevisions` (`editorId`,`createdAt`);