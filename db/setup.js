/**
 * Database setup script for MySQL
 * Run with: npm run db:setup
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

async function setupDatabase() {
    let connection = null;
    
    try {
        console.log('Connecting to MySQL...');
        console.log(`Host: ${config.database.host}`);
        console.log(`Database: ${config.database.database}`);
        
        // First connect without database to create it if needed
        connection = await mysql.createConnection({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            multipleStatements: true
        });
        
        console.log('✓ Connected to MySQL');

        // Create database if not exists
        await connection.execute(
            `CREATE DATABASE IF NOT EXISTS \`${config.database.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        console.log('✓ Database ensured');

        // Switch to the database
        await connection.changeUser({ database: config.database.database });
        console.log(`✓ Using database: ${config.database.database}`);

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Remove comments and execute
        const cleanedSchema = schema
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');

        await connection.query(cleanedSchema);

        console.log('✓ Schema executed successfully');
        console.log('\n✓ Database setup complete!');

    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
