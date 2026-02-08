const knex = require('../db');
const sha1 = require('sha1');
const jwt = require('jwt-simple');
const config = require('../config');

function getUserToken(userId) {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: userId, iat: timestamp }, config.secret);
}

exports.signUp = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(422).send('You must provide a username and password.');
    }
    if (username.length < 2) {
        return res.status(422).send('Username must be at least 2 characters long.');
    }
    if (username.length > 16) {
        return res.status(422).send('Username must not exceed 16 characters.');
    }
    if (!username.match(/^[a-z0-9_]+$/i)) {
        return res.status(422).send('Username can only include letters, numbers, and underscores.');
    }
    if (password.length < 6) {
        return res.status(422).send('Password must be at least 6 characters long.');
    }
    if (password.length > 255) {
        return res.status(422).send('Password must not exceed 255 characters.');
    }

    const existingUser = await knex('users').where('username', username);

    if (existingUser.length > 0) {
        return res.status(422).send('That username is already taken!');
    }

    knex('users')
        .insert({
            username: username,
            password: sha1(password),
        })
        .then((userId) => {
            knex('users')
                .where('user_id', userId[0])
                .then((user) => {
                    res.json({
                        token: getUserToken(user[0].user_id),
                        userId: user[0].user_id,
                        username: user[0].username,
                    });
                })
                .catch((err) => {
                    return next(err);
                });
        })
        .catch((err) => {
            return next(err);
        });
};

exports.signIn = async (req, res) => {
    res.send({ token: getUserToken(req.user.user_id), userId: req.user.user_id, username: req.user.username });
};

exports.signOut = async (req, res) => {
    req.logout();
};

exports.exists = async (req, res, next) => {
    const { username } = req.body;

    if (!username) return res.json(false);

    knex('users')
        .where('username', username)
        .then((user) => {
            res.json(user.length > 0); // Return true if username already exists in DB
        })
        .catch((err) => {
            return next(err);
        });
};
