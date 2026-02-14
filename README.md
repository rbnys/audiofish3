![Screenshot of AudioFish](https://iili.io/3dvgaXR.jpg)

# AudioFish

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