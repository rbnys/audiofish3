const express = require('express');
const youtubeRoutes = require('../controllers/youtube-controller');
const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const router = express.Router();

router.post('/search-videos', requireAuth, youtubeRoutes.searchVideos);
router.post('/search-playlists', requireAuth, youtubeRoutes.searchPlaylists);
router.post('/video-from-id', requireAuth, youtubeRoutes.getVideoFromId);
router.post('/playlist-from-id', requireAuth, youtubeRoutes.getPlaylistFromId);

module.exports = router;
