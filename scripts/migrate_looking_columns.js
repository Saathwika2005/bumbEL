#!/usr/bin/env node
/**
 * Migration: Add looking_* columns to UserChoices table
 */

require('dotenv').config();
const db = require('../db/connection');

const LOOKING_COLUMNS = [
    'looking_webdev',
    'looking_frontend',
    'looking_backend',
    'looking_ml',
    'looking_ai',
    'looking_data_analysis',
    'looking_mobile',
    'looking_cloud',
    'looking_devops',
    'looking_database',
    'looking_cybersecurity',
    'looking_uiux',
    'looking_figma',
    'looking_iot',
    'looking_embedded'
];

(async () => {
    console.log('\n=== Migration: Add looking_* columns ===\n');

    const pool = await db.getPool();

    for (const col of LOOKING_COLUMNS) {
        try {
            await pool.query(`ALTER TABLE UserChoices ADD COLUMN ${col} TINYINT(1) DEFAULT 0`);
            console.log(`Added column: ${col}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column already exists: ${col}`);
            } else {
                console.error(`Error adding ${col}:`, err.message);
            }
        }
    }

    console.log('\n=== Migration complete ===\n');
    await db.close();
})();
