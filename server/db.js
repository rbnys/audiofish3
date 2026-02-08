// Import path module
const path = require('path');

// Create connection to SQLite database
const connection = {
	host: '127.0.0.1',
	port: 3306,
	user: 'root',
	database: 'audiofish2'
}
if (process.env.DB_PASSWORD) {
	connection.password = process.env.DB_PASSWORD;
}

const knex = require('knex')({
	client: 'mysql2',
	connection,
	useNullAsDefault: true
});

// Just for debugging purposes:
// Log all data in "books" table
// knex.select('*').from('books').then((data) => console.log('data:', data)).catch((err) => console.log(err));

// Export the database
module.exports = knex;
