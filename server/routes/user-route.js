const express = require('express');
const userRoutes = require('../controllers/user-controller');
const passportService = require('../services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignIn = passport.authenticate('local', { session: false });

const router = express.Router();

router.post('/sign-up', userRoutes.signUp);
router.post('/sign-in', requireSignIn, userRoutes.signIn);
router.post('/sign-out', requireAuth, userRoutes.signOut);
router.post('/exists', userRoutes.exists);

module.exports = router;
