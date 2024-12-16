const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',  // Your database host
    user: 'root',       // Your database user
    password: 'root',       // Your database password
    database: 'portal_db', // Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the promise-based pool
module.exports = pool.promise();
