const express = require('express');
const lobbyRoutes = require('../controllers/lobby-controller');
const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

const router = express.Router();

router.post('/genres', requireAuth, lobbyRoutes.getGenres);
router.post('/pathname-exists', requireAuth, lobbyRoutes.pathnameExists);
router.post('/create', requireAuth, lobbyRoutes.createLobby);

module.exports = router;
