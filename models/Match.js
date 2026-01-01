const db = require('../db/connection');

/**
 * Match model for mutual matches between users
 */
class Match {
    /**
     * Create a new match
     * Always stores user_a < user_b to prevent duplicates
     */
    static async create(userA, userB, score = null) {
        // Ensure consistent ordering
        const [smallerId, largerId] = userA < userB ? [userA, userB] : [userB, userA];

        const insertId = await db.insert(`
            INSERT INTO Matches (user_a, user_b, score)
            VALUES (?, ?, ?)
        `, [smallerId, largerId, score]);

        return db.queryOne(`SELECT * FROM Matches WHERE id = ?`, [insertId]);
    }

    /**
     * Check if match exists between two users
     */
    static async exists(userA, userB) {
        const [smallerId, largerId] = userA < userB ? [userA, userB] : [userB, userA];

        const result = await db.queryOne(`
            SELECT id FROM Matches
            WHERE user_a = ? AND user_b = ?
        `, [smallerId, largerId]);

        return !!result;
    }

    /**
     * Get all matches for a user with full profile info
     */
    static async getMatchesForUser(userId) {
        return db.queryAll(`
            SELECT 
                m.id as match_id,
                m.score,
                m.created_at as matched_at,
                u.id,
                u.name,
                u.avatar,
                p.branch,
                p.year,
                p.semester,
                p.category,
                p.looking_for,
                p.bio
            FROM Matches m
            JOIN Users u ON (
                CASE 
                    WHEN m.user_a = ? THEN m.user_b
                    ELSE m.user_a
                END = u.id
            )
            LEFT JOIN UserProfiles p ON u.id = p.user_id
            WHERE m.user_a = ? OR m.user_b = ?
            ORDER BY m.created_at DESC
        `, [userId, userId, userId]);
    }

    /**
     * Get match count for a user
     */
    static async getMatchCount(userId) {
        const result = await db.queryOne(`
            SELECT COUNT(*) as count
            FROM Matches
            WHERE user_a = ? OR user_b = ?
        `, [userId, userId]);
        return result.count;
    }

    /**
     * Get matched user IDs for a user
     */
    static async getMatchedUserIds(userId) {
        const results = await db.queryAll(`
            SELECT 
                CASE 
                    WHEN user_a = ? THEN user_b
                    ELSE user_a
                END as matched_user_id
            FROM Matches
            WHERE user_a = ? OR user_b = ?
        `, [userId, userId, userId]);
        return results.map(r => r.matched_user_id);
    }
}

module.exports = Match;
