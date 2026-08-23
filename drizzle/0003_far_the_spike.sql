CREATE TABLE `consultationRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`archiveId` int,
	`service` enum('theme_report','annual_manual','deep_reading') NOT NULL,
	`contactMethod` enum('account_email','wechat','other') NOT NULL,
	`contactDetail` varchar(180) NOT NULL,
	`request` text NOT NULL,
	`status` enum('pending','contacted','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultationRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `consultationRequests` ADD CONSTRAINT `consultationRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultationRequests` ADD CONSTRAINT `consultationRequests_archiveId_savedArchives_id_fk` FOREIGN KEY (`archiveId`) REFERENCES `savedArchives`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `consultation_requests_user_created_idx` ON `consultationRequests` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `consultation_requests_status_created_idx` ON `consultationRequests` (`status`,`createdAt`);