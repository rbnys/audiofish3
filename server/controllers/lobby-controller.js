const knex = require('../db');
const { upsertLobby } = require('../socket');

const MAX_LOBBY_NAME_LENGTH = 50;
const MAX_PATHNAME_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 255;

const PATHNAME_REGEX = /^[a-z0-9_-]+$/i;

exports.getGenres = async (req, res, next) => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));

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

exports.pathnameExists = async (req, res, next) => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const pathname = (req.body.pathname || '').trim();

    if (!pathname) {
        return res.json({ exists: false });
    }

    knex('user_lobbies')
        .where('pathname', pathname)
        .first('lobby_id')
        .then((lobby) => {
            res.json({ exists: !!lobby });
        })
        .catch((err) => {
            return next(err);
        });
};

exports.createLobby = async (req, res, next) => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    
    try {
        const name = (req.body.name || '').trim();
        const pathname = (req.body.pathname || req.body.url || '').trim();
        const visibility = req.body.visibility;
        const description = (req.body.description || '').trim();
        const genres = Array.isArray(req.body.genres) ? req.body.genres : [];

        if (!name) {
            return res.status(422).send('Please enter a lobby name.');
        }
        if (name.length > MAX_LOBBY_NAME_LENGTH) {
            return res.status(422).send(`Lobby name must not exceed ${MAX_LOBBY_NAME_LENGTH} characters.`);
        }

        if (!pathname) {
            return res.status(422).send('Please enter a URL.');
        }
        if (pathname.length > MAX_PATHNAME_LENGTH) {
            return res.status(422).send(`URL must not exceed ${MAX_PATHNAME_LENGTH} characters.`);
        }
        if (!PATHNAME_REGEX.test(pathname)) {
            return res.status(422).send('URL can only include letters, numbers, underscores, and hyphens.');
        }

        if (visibility !== 'public' && visibility !== 'private') {
            return res.status(422).send('Please choose a visibility option.');
        }

        if (description.length > MAX_DESCRIPTION_LENGTH) {
            return res.status(422).send(`Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`);
        }

        if (genres.length < 1 || genres.length > 5) {
            return res.status(422).send('Please select between 1 and 5 genre tags.');
        }

        const parsedGenreIds = genres.map((genreId) => Number(genreId));
        const uniqueGenreIds = [ ...new Set(parsedGenreIds) ];

        if (uniqueGenreIds.some((genreId) => !Number.isInteger(genreId) || genreId <= 0)) {
            return res.status(422).send('One or more selected genre tags are invalid.');
        }
        if (uniqueGenreIds.length < 1 || uniqueGenreIds.length > 5) {
            return res.status(422).send('Please select between 1 and 5 unique genre tags.');
        }

        const existingLobby = await knex('user_lobbies').where('pathname', pathname).first('lobby_id');
        if (existingLobby) {
            return res.status(422).send('That lobby URL is already taken.');
        }

        const matchingGenres = await knex('genres').whereIn('genre_id', uniqueGenreIds).select('genre_id');
        if (matchingGenres.length !== uniqueGenreIds.length) {
            return res.status(422).send('One or more selected genre tags are invalid.');
        }

        const privacy = visibility === 'private' ? 1 : 0;

        const createdLobby = await knex.transaction(async (trx) => {
            const insertedLobby = await trx('user_lobbies').insert({
                user_id: req.user.user_id,
                pathname,
                name,
                privacy,
                description,
            });

            const lobbyId = insertedLobby[0];

            await trx('lobby_genres').insert(
                uniqueGenreIds.map((genreId) => ({
                    lobby_id: lobbyId,
                    genre_id: genreId,
                }))
            );

            const lobby = await trx('user_lobbies').where('lobby_id', lobbyId).first();
            return lobby;
        });

        upsertLobby({
            ...createdLobby,
            id: createdLobby.lobby_id,
            user_id: req.user.user_id,
            username: req.user.username,
        });

        return res.json(createdLobby);
    } catch (err) {
        return next(err);
    }
};
