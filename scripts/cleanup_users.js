#!/usr/bin/env node
/**
 * Delete users whose email doesn't match a pattern
 */

require('dotenv').config();
const db = require('../db/connection');

(async () => {
    await db.getPool();
    
    // Count users to delete
    const [before] = await db.queryAll('SELECT COUNT(*) as c FROM Users WHERE email NOT LIKE "%.cs23@rvce.edu.in"');
    console.log('Users to delete:', before.c);
    
    // Delete them
    const deleted = await db.query('DELETE FROM Users WHERE email NOT LIKE "%.cs23@rvce.edu.in"');
    console.log('Deleted:', deleted.affectedRows);
    
    // Count remaining
    const [after] = await db.queryAll('SELECT COUNT(*) as c FROM Users');
    console.log('Remaining users:', after.c);
    
    await db.close();
})();
