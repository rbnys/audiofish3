// Import path module
const path = require('path');

// Create connection to MySQL database
const connection = {
	host: process.env.MYSQL_HOST || '127.0.0.1',
	port: process.env.MYSQL_PORT || 3306,
	user: process.env.MYSQL_USER || 'root',
	database: process.env.MYSQL_DATABASE || 'audiofish',
}
if (process.env.MYSQL_PASSWORD) {
	connection.password = process.env.MYSQL_PASSWORD;
}

const knex = require('knex')({
	client: 'mysql2',
	connection,
	useNullAsDefault: true
});

// Export the database
module.exports = knex;
