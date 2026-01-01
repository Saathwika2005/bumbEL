const db = require('../db/connection');

/**
 * UserProfile model for database operations
 */
class UserProfile {
    /**
     * Create or update user profile
     */
    static async upsert(userId, { branch, year, semester, category, lookingFor, bio }) {
        // Check if profile exists
        const existing = await db.queryOne(`
            SELECT id FROM UserProfiles WHERE user_id = ?
        `, [userId]);

        if (existing) {
            // Update
            await db.query(`
                UPDATE UserProfiles
                SET branch = ?,
                    year = ?,
                    semester = ?,
                    category = ?,
                    looking_for = ?,
                    bio = ?,
                    updated_at = NOW()
                WHERE user_id = ?
            `, [branch, year, semester || null, category, lookingFor || null, bio || null, userId]);

            return db.queryOne(`SELECT * FROM UserProfiles WHERE user_id = ?`, [userId]);
        } else {
            // Insert
            const insertId = await db.insert(`
                INSERT INTO UserProfiles (user_id, branch, year, semester, category, looking_for, bio)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [userId, branch, year, semester || null, category, lookingFor || null, bio || null]);

            return db.queryOne(`SELECT * FROM UserProfiles WHERE id = ?`, [insertId]);
        }
    }

    /**
     * Get profile by user ID
     */
    static async findByUserId(userId) {
        return db.queryOne(`
            SELECT * FROM UserProfiles WHERE user_id = ?
        `, [userId]);
    }
}

module.exports = UserProfile;
