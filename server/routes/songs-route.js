const express = require('express');
const songRoutes = require('../controllers/songs-controller');
const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const router = express.Router();

router.post('/playlists', requireAuth, songRoutes.getPlaylistsFromUser);
router.post('/user-songs', requireAuth, songRoutes.getSongsFromUser);
router.post('/create-playlist', requireAuth, songRoutes.createPlaylist);
router.post('/edit-playlist', requireAuth, songRoutes.editPlaylist);
router.post('/delete-playlist', requireAuth, songRoutes.deletePlaylist);
router.post('/add-song', requireAuth, songRoutes.addSongToPlaylist);
router.post('/add-yt-playlist', requireAuth, songRoutes.addSongsFromYoutubePlaylist);
router.post('/edit-song', requireAuth, songRoutes.editSong);
router.post('/delete-song', requireAuth, songRoutes.deleteSong);
// router.post('/scrape-yt-video-data', songRoutes.scrapeYoutubeVideoData);

module.exports = router;
