// Import dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');

// Import routes
const userRouter = require('./routes/user-route');
const songsRouter = require('./routes/songs-route');
const youtubeRoutes = require('./routes/youtube-route');

// Import socket creator
const initSocket = require('./socket');

// Set default port for express app
const PORT = process.env.PORT || 4001;

// Create express app
const app = express();

// Apply middleware
// Note: Keep this at the top, above routes
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create socket.io server
const http = require('http').createServer(app);
initSocket(http);

// Implement books route
app.use('/user', userRouter);
app.use('/songs', songsRouter);
app.use('/youtube', youtubeRoutes);

// Implement 500 error route
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something is broken.');
});

// Implement 404 error route
app.use(function (req, res, next) {
    res.status(404).send('Sorry we could not find that.');
});

// Start express app
http.listen(PORT, function () {
    console.log(`Server is running on: ${PORT}`);
});
