#!/usr/bin/env node
// Dangerous: Clears all users and related data from the database.
// Usage: node scripts/clear_users.js --confirm
// Safety: refuses to run when NODE_ENV=production

const db = require('../db/connection');

const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
    console.error('\nAborting: this script will DELETE ALL USERS and related data.');
    console.error('To proceed, re-run with the --confirm flag:');
    console.error('  node scripts/clear_users.js --confirm\n');
    process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
    console.error('\nRefusing to run in production (NODE_ENV=production).');
    console.error('If you really want to run in production, set NODE_ENV to something else first.');
    process.exit(1);
}

(async () => {
    console.log('\nStarting destructive cleanup: DELETE ALL USERS (and related tables)');

    const pool = await db.getPool();
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const deleted = {};

        // Delete dependent records first for clarity (FK cascade would handle many cases)
        const tables = ['Matches', 'Swipes', 'UserChoices', 'UserEmbeddings', 'UserProfiles'];
        for (const t of tables) {
            const [res] = await conn.query(`DELETE FROM ${t}`);
            deleted[t] = res.affectedRows || 0;
            console.log(`Deleted ${deleted[t]} rows from ${t}`);
        }

        // Delete users (primary)
        const [resUsers] = await conn.query('DELETE FROM Users');
        deleted.Users = resUsers.affectedRows || 0;
        console.log(`Deleted ${deleted.Users} rows from Users`);

        // Clear sessions table as well
        try {
            const [resSessions] = await conn.query('TRUNCATE TABLE Sessions');
            deleted.Sessions = 'TRUNCATED';
            console.log('Truncated Sessions table');
        } catch (err) {
            // If TRUNCATE is unsupported, fallback to DELETE
            const [resSessions] = await conn.query('DELETE FROM Sessions');
            deleted.Sessions = resSessions.affectedRows || 0;
            console.log(`Deleted ${deleted.Sessions} rows from Sessions`);
        }

        // Optionally reset AUTO_INCREMENT
        const resetTables = ['Users','UserProfiles','UserChoices','UserEmbeddings','Swipes','Matches'];
        for (const t of resetTables) {
            try {
                await conn.query(`ALTER TABLE ${t} AUTO_INCREMENT = 1`);
            } catch (err) {
                // ignore if not supported
            }
        }

        await conn.commit();

        console.log('\nDestructive cleanup completed successfully.');
        console.log('Summary:', deleted, '\n');
    } catch (err) {
        console.error('Error during cleanup, rolling back:', err);
        try { await conn.rollback(); } catch (e) {}
        process.exit(1);
    } finally {
        conn.release();
        await db.close();
    }
})();
