const knex = require('../db');
const sha1 = require('sha1');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const localOptions = { usernameField: 'username' };
const localLogin = new LocalStrategy(localOptions, function(username, password, done) {
	knex('users')
		.where('username', username)
		.andWhere('password', sha1(password))
		.then((user) => {
			if (user.length) {
				return done(null, user[0]);
			} else {
				return done(null, false);
			}
		})
		.catch((err) => {
			return done(err, false);
		});
});

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
	secretOrKey: process.env.JWT_SECRET
};
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
	knex('users')
		.where('user_id', payload.sub)
		.then((user) => {
			if (user.length) {
				done(null, user[0]);
			} else {
				done(null, false);
			}
		})
		.catch((err) => {
			return done(err, false);
		});
});

passport.use(jwtLogin);
passport.use(localLogin);
