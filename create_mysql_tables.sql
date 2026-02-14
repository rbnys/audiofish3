CREATE TABLE `lobby_chat` (
	`chat_id` int(11) NOT NULL,
	`lobby_id` int(11) NOT NULL,
	`user_id` int(11) NOT NULL,
	`message` varchar(256) NOT NULL,
	`time_created` bigint(20) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `playlist_songs` (
	`song_id` int(11) NOT NULL,
	`playlist_id` int(11) NOT NULL,
	`yt_id` char(11) NOT NULL,
	`artist` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`length` int(11) NOT NULL,
	`pos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `users` (
	`user_id` int(11) NOT NULL,
	`username` varchar(24) NOT NULL,
	`password` char(40) NOT NULL,
	`active_playlist` int(11) NOT NULL DEFAULT -1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `user_lobbies` (
	`lobby_id` int(11) NOT NULL,
	`user_id` int(11) NOT NULL,
	`pathname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`privacy` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `user_playlists` (
	`playlist_id` int(11) NOT NULL,
	`user_id` int(11) NOT NULL,
	`name` varchar(24) NOT NULL,
	`deletion_time` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `user_song_queue` (
	`user_id` int(11) NOT NULL,
	`pos` int(11) NOT NULL,
	`song_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

ALTER TABLE `lobby_chat`
	ADD PRIMARY KEY (`chat_id`);

ALTER TABLE `playlist_songs`
	ADD PRIMARY KEY (`song_id`);

ALTER TABLE `users`
	ADD PRIMARY KEY (`user_id`);

ALTER TABLE `user_lobbies`
	ADD PRIMARY KEY (`lobby_id`);

ALTER TABLE `user_playlists`
	ADD PRIMARY KEY (`playlist_id`);

ALTER TABLE `user_song_queue`
	ADD UNIQUE KEY `ind__user_id__pos` (`user_id`,`pos`);

ALTER TABLE `lobby_chat`
	MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `playlist_songs`
	MODIFY `song_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
	MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_lobbies`
	MODIFY `lobby_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_playlists`
	MODIFY `playlist_id` int(11) NOT NULL AUTO_INCREMENT;