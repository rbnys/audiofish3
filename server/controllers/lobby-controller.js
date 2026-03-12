const knex = require('../db');

exports.getGenres = async (req, res, next) => {
    knex('genres')
        .select('genre_id', 'tag')
        .orderBy('tag', 'asc')
        .then((genres) => {
            res.json(genres);
        })
        .catch((err) => {
            return next(err);
        });
};
