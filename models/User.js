const bcrypt = require('bcrypt');
const db = require('../db/connection');

const SALT_ROUNDS = 12;

/**
 * User model for database operations
 */
class User {
    /**
     * Create a new user
     */
    static async create({ name, email, password, avatar = '👤' }) {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const insertId = await db.insert(`
            INSERT INTO Users (name, email, password_hash, avatar)
            VALUES (?, ?, ?, ?)
        `, [name, email.toLowerCase(), passwordHash, avatar]);

        // Fetch the created user
        return db.queryOne(`
            SELECT id, name, email, avatar, created_at
            FROM Users WHERE id = ?
        `, [insertId]);
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        return db.queryOne(`
            SELECT id, name, email, password_hash, avatar, created_at
            FROM Users
            WHERE email = ?
        `, [email.toLowerCase()]);
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        return db.queryOne(`
            SELECT id, name, email, avatar, created_at
            FROM Users
            WHERE id = ?
        `, [id]);
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Update user basic info
     */
    static async update(id, { name, avatar }) {
        await db.query(`
            UPDATE Users
            SET name = COALESCE(?, name),
                avatar = COALESCE(?, avatar),
                updated_at = NOW()
            WHERE id = ?
        `, [name || null, avatar || null, id]);

        return db.queryOne(`
            SELECT id, name, email, avatar FROM Users WHERE id = ?
        `, [id]);
    }

    /**
     * Check if email exists
     */
    static async emailExists(email) {
        const result = await db.queryOne(`
            SELECT COUNT(*) as count FROM Users WHERE email = ?
        `, [email.toLowerCase()]);
        return result.count > 0;
    }

    /**
     * Get user with full profile
     */
    static async getFullProfile(userId) {
        const user = await db.queryOne(`
            SELECT 
                u.id, u.name, u.email, u.avatar, u.created_at,
                p.branch, p.year, p.semester, p.category, p.looking_for, p.bio
            FROM Users u
            LEFT JOIN UserProfiles p ON u.id = p.user_id
            WHERE u.id = ?
        `, [userId]);

        if (!user) return null;

        // Get choices
        const choices = await db.queryOne(`
            SELECT * FROM UserChoices WHERE user_id = ?
        `, [userId]);

        return { ...user, choices };
    }
}

module.exports = User;
