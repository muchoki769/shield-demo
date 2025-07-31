require("dotenv").config();
const pgSession = require("connect-pg-simple");


// const { Pool } = require("pg");


const isProduction = process.env.NODE_ENV === "production";

const connectionString =  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;


// const pool = new Pool({
//     connectionString: isProduction ? process.env.DATABASE_URL : connectionString
// });
// const pool = new Pool({
//     connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
//     ssl: {
//         rejectUnauthorized: false
//     },
//     max: 20,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 5000
// });

// const store = new pgSession({
//     pool: pool,
//     tableName:"user_sessions",
//     createTableIfMissing: true,
//     ttl: 86400,
//     pruneSessionInterval: 3600
// })

// module.exports = { store };

module.exports = function(session) {
  const Pool = require('pg').Pool;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
     ssl: {
        rejectUnauthorized: false
    },
   
  });

  const PgSession = pgSession(session);
  
  return new PgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    ttl: 86400, // 1 day in seconds
    pruneSessionInterval: 3600 // Cleanup every hour
  });
};



