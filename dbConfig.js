const {Pool} = require('pg');
// const { neon } = require("@neondatabase/serverless");
// const Pool = neon(process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL ,
    // user: process.env.PGUSER,
    // password: process.env.PGPASSWORD,
    // host: process.env.PGHOST,
    // database: process.env.PGDATABASE,
    // port: process.env.PGPORT,
    // ssl: process.env.NODE_ENV === 'production' ? {
    //     rejectUnauthorized: false
    // } : false,
    ssl: {
        rejectUnauthorized: false
    },
   
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.query('SELECT NOW()')
 .then(() => console.log('Connected to NEONDB succesfully'))
 .catch(err => console.error('Database connection error:', err));


 pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
 })

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool
};
// module.exports = pool;
