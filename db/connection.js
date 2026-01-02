const mysql = require('mysql2/promise');
const config = require('../config');

let pool = null;

/**
 * Get or create the database connection pool
 */
async function getPool() {
    if (pool) {
        return pool;
    }

    try {
        pool = mysql.createPool(config.database);
        // Test connection
        const connection = await pool.getConnection();
        connection.release();
        console.log('✓ Connected to MySQL');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

/**
 * Execute a query with parameters
 * @param {string} queryString - SQL query string with ? placeholders
 * @param {Array} params - Parameters array
 */
async function query(queryString, params = []) {
    const pool = await getPool();
    const [rows] = await pool.execute(queryString, params);
    return rows;
}

/**
 * Execute a query and return the first result
 */
async function queryOne(queryString, params = []) {
    const rows = await query(queryString, params);
    return rows[0] || null;
}

/**
 * Execute a query and return all results
 */
async function queryAll(queryString, params = []) {
    return query(queryString, params);
}

/**
 * Execute an insert and return the insert ID
 */
async function insert(queryString, params = []) {
    const pool = await getPool();
    const [result] = await pool.execute(queryString, params);
    return result.insertId;
}

/**
 * Close the database connection pool
 */
async function close() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection closed');
    }
}

module.exports = {
    getPool,
    query,
    queryOne,
    queryAll,
    insert,
    close
};
