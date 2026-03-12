--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `genre_id` int(11) NOT NULL,
  `tag` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table data for table `genres`
--

INSERT INTO `genres` (`genre_id`, `tag`) VALUES
(1, 'Anything Goes'),
(2, 'Blues'),
(3, 'Experimental'),
(4, 'Country'),
(5, 'Lo-fi'),
(6, 'Jazz'),
(7, 'Pop'),
(8, 'Punk'),
(9, 'Metal'),
(10, 'Rock'),
(11, 'Soft Rock'),
(12, 'Soul/R&B'),
(13, 'Classical'),
(14, 'Folk'),
(15, 'Electronic'),
(16, 'Trance'),
(17, 'Video Game'),
(18, 'Techno'),
(19, 'House'),
(20, 'Hard Rock'),
(21, 'Power Metal'),
(22, 'Americana'),
(23, 'Folk Metal'),
(24, 'Prog Rock'),
(25, 'Instrumental'),
(26, 'Psychedelic'),
(27, 'Gospel'),
(28, 'Alt/Indie Rock'),
(29, 'Funk'),
(30, 'Grunge'),
(31, 'Rap/Hip Hop');

-- --------------------------------------------------------

--
-- Table structure for table `lobby_chat`
--

CREATE TABLE `lobby_chat` (
  `chat_id` int(11) NOT NULL,
  `lobby_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(256) NOT NULL,
  `time_created` bigint(20) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lobby_genres`
--

CREATE TABLE `lobby_genres` (
  `lobby_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `playlist_songs`
--

CREATE TABLE `playlist_songs` (
  `song_id` int(11) NOT NULL,
  `playlist_id` int(11) NOT NULL,
  `yt_id` char(11) NOT NULL,
  `artist` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `length` int(11) NOT NULL,
  `pos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(24) NOT NULL,
  `password` char(40) NOT NULL,
  `active_playlist` int(11) NOT NULL DEFAULT -1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_lobbies`
--

CREATE TABLE `user_lobbies` (
  `lobby_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pathname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `privacy` tinyint(4) NOT NULL DEFAULT 0,
  `description` varchar(256) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_playlists`
--

CREATE TABLE `user_playlists` (
  `playlist_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(24) NOT NULL,
  `deletion_time` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_song_queue`
--

CREATE TABLE `user_song_queue` (
  `user_id` int(11) NOT NULL,
  `pos` int(11) NOT NULL,
  `song_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`genre_id`) USING BTREE;

--
-- Indexes for table `lobby_chat`
--
ALTER TABLE `lobby_chat`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indexes for table `lobby_genres`
--
ALTER TABLE `lobby_genres`
  ADD UNIQUE KEY `ind__lobby_id__genre_id` (`lobby_id`,`genre_id`);

--
-- Indexes for table `playlist_songs`
--
ALTER TABLE `playlist_songs`
  ADD PRIMARY KEY (`song_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_lobbies`
--
ALTER TABLE `user_lobbies`
  ADD PRIMARY KEY (`lobby_id`),
  ADD UNIQUE KEY `pathname` (`pathname`);

--
-- Indexes for table `user_playlists`
--
ALTER TABLE `user_playlists`
  ADD PRIMARY KEY (`playlist_id`);

--
-- Indexes for table `user_song_queue`
--
ALTER TABLE `user_song_queue`
  ADD UNIQUE KEY `ind__user_id__pos` (`user_id`,`pos`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `genre_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `lobby_chat`
--
ALTER TABLE `lobby_chat`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `playlist_songs`
--
ALTER TABLE `playlist_songs`
  MODIFY `song_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_lobbies`
--
ALTER TABLE `user_lobbies`
  MODIFY `lobby_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_playlists`
--
ALTER TABLE `user_playlists`
  MODIFY `playlist_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
