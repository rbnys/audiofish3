# AudioFish

![Screenshot of AudioFish](https://iili.io/3dvgaXR.jpg)

AudioFish is a social music-playing web app for desktop browsers that allows users to take turns DJ'ing their favorite songs with friends.

This repo contains a React frontend and a Node/Express + MySQL backend.

## Prerequisites

- Node.js (v24 LTS recommended) and npm
- MySQL (local or remote)

## Install

From the repo root, run this command:

```bash
npm install
```

## Environment variables

Create a `.env` file in the repo root (same folder as `package.json`):

```bash
PORT=4001
JWT_SECRET=replace-with-a-long-random-string
YOUTUBE_KEY=your-youtube-data-api-key

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=audiofish
```

Notes:

- `PORT` is optional (defaults to `4001`).
- `MYSQL_PASSWORD` is optional if your local MySQL user has no password.
- `JWT_SECRET` is required for auth.
- `YOUTUBE_KEY` is required for YouTube search/endpoints.

## Database setup

Create a MySQL database that matches `MYSQL_DATABASE` (default: `audiofish`).
You will also need the expected tables. If you do not already have a schema, use the SQL below.

## SQL schema

Run this SQL code agaisnt your database to create the necessary tables: [create_mysql_tables.sql](create_mysql_tables.sql)

## Run (dev)

This runs the backend, frontend, and Sass watcher together:

```bash
npm start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4001

If you prefer to run them separately:

```bash
npm run start-server
npm run start-front
npm run watch:sass
```

## Build

```bash
npm run build
```

If you only need the frontend build:

```bash
npm run build-front
```

## Structure

```text
audiofish3/
├── .env                          # Local environment variables (not committed)
├── .gitignore
├── README.md
├── buildScript.js                # Cleans ./build, then runs react-scripts build
├── create_mysql_tables.sql       # MySQL schema used by the backend
├── old_package.json              # Legacy package manifest kept for reference
├── package-lock.json
├── package.json
├── package.json.OLD              # Legacy package manifest kept for reference
├── public/                       # Static files served as-is by Create React App
│   ├── favicon.ico
│   ├── index.html                # Root HTML document
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── server/                       # Node/Express + Socket.IO + MySQL backend
│   ├── .gitignore
│   ├── db.js                     # Knex MySQL connection configuration
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js                 # Express app entry point
│   ├── socket.js                 # Socket.IO server and in-memory lobby state
│   ├── apis/
│   │   └── youtube.js            # YouTube Data API helper
│   ├── controllers/              # Route handlers / business logic
│   │   ├── lobby-controller.js   # Lobby creation, genres, pathname checks
│   │   ├── songs-controller.js   # Songs and playlists
│   │   ├── user-controller.js    # Sign up / sign in / sign out
│   │   └── youtube-controller.js # YouTube search endpoints
│   ├── routes/                   # Express routers wiring paths to controllers
│   │   ├── lobby-route.js
│   │   ├── songs-route.js
│   │   ├── user-route.js
│   │   └── youtube-route.js
│   └── services/
│       └── passport.js           # Passport local + JWT auth strategies
└── src/                          # React frontend
    ├── index.js                  # React entry point and Redux store setup
    ├── server.js                 # Frontend API base URL
    ├── socket.js                 # Socket.IO client connection
    ├── actions/
    │   └── index.js              # Redux action creators and thunks
    ├── classes/
    │   ├── Song.js               # Song domain model
    │   └── Util.js               # Shared utility functions
    ├── components/               # React components
    │   ├── AddSong.js
    │   ├── App.js                # Root component, router, and modal host
    │   ├── ErrorModal.js         # Generic error modal
    │   ├── GrabSong.js
    │   ├── Home.js               # Landing page: lobby list + "Create Your Lobby"
    │   ├── Icon.js               # SVG sprite icon helper
    │   ├── Loading.js
    │   ├── Lobby.js              # Lobby view
    │   ├── LobbyChat.js
    │   ├── LobbyDJList.js
    │   ├── LobbyHeader.js
    │   ├── LobbySidebar.js
    │   ├── LobbySongBox.js
    │   ├── LogInOrSignUp.js      # Log in / sign up modal
    │   ├── Modal.js              # Reusable modal overlay/wrapper
    │   ├── PlaylistDropdown.js
    │   ├── SongDetails.js
    │   ├── SongPreview.js
    │   ├── SongQueue.js
    │   ├── SongQueueCard.js
    │   ├── SongsTable.js
    │   ├── SongsWindow.js
    │   ├── Tooltip.js
    │   ├── withRouter.js         # HOC for router props
    │   └── forms/                # Redux-form based forms
    │       ├── DeletePlaylistForm.js
    │       ├── DeleteSongForm.js
    │       ├── LobbyForm.js      # Multi-step lobby creation form
    │       ├── MultipleSongsForm.js
    │       ├── PlaylistForm.js
    │       ├── SignInForm.js
    │       ├── SignUpForm.js
    │       └── SongForm.js
    ├── css/
    │   ├── style.css             # Compiled Sass output
    │   └── style.css.map
    ├── img/                      # UI images, icons, and gifs
    ├── reducers/                 # Redux reducers and selectors
    │   ├── authReducer.js
    │   ├── currentPlaylistReducer.js
    │   ├── currentSongReducer.js
    │   ├── currentSongVotesReducer.js
    │   ├── djQueueReducer.js
    │   ├── index.js              # combineReducers and shared selectors
    │   ├── isLoadingReducer.js
    │   ├── isSongTableLoadingReducer.js
    │   ├── lobbyGuestsReducer.js
    │   ├── lobbyMessagesReducer.js
    │   ├── lobbyReducer.js
    │   ├── modalComponentsReducer.js
    │   ├── playlistsReducer.js
    │   ├── songQueueReducer.js
    │   ├── songsFilterReducer.js
    │   ├── songsReducer.js
    │   ├── songsWindowIsOpenReducer.js
    │   ├── usersReducer.js
    │   └── volumeReducer.js
    └── sass/                     # Sass source compiled into src/css
        ├── main.scss
        ├── _base.scss
        └── _components.scss
```