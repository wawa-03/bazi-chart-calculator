CREATE TABLE `themeNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`archiveId` int NOT NULL,
	`themeKey` varchar(24) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `themeNotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `theme_notes_owner_archive_theme_idx` UNIQUE(`userId`,`archiveId`,`themeKey`)
);
--> statement-breakpoint
ALTER TABLE `themeNotes` ADD CONSTRAINT `themeNotes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `themeNotes` ADD CONSTRAINT `themeNotes_archiveId_savedArchives_id_fk` FOREIGN KEY (`archiveId`) REFERENCES `savedArchives`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `theme_notes_owner_updated_idx` ON `themeNotes` (`userId`,`updatedAt`);