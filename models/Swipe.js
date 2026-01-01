const db = require('../db/connection');

/**
 * Swipe model for tracking user swipe actions
 */
class Swipe {
    /**
     * Record a swipe
     */
    static async create(swiperId, targetId, direction) {
        // Validate direction
        if (!['left', 'right', 'super'].includes(direction)) {
            throw new Error('Invalid swipe direction');
        }

        const insertId = await db.insert(`
            INSERT INTO Swipes (swiper_id, target_id, direction)
            VALUES (?, ?, ?)
        `, [swiperId, targetId, direction]);

        return db.queryOne(`SELECT * FROM Swipes WHERE id = ?`, [insertId]);
    }

    /**
     * Check if user has already swiped on target
     */
    static async exists(swiperId, targetId) {
        return db.queryOne(`
            SELECT id, direction FROM Swipes
            WHERE swiper_id = ? AND target_id = ?
        `, [swiperId, targetId]);
    }

    /**
     * Check for reciprocal right swipe (for match detection)
     */
    static async hasReciprocalRightSwipe(swiperId, targetId) {
        const result = await db.queryOne(`
            SELECT id FROM Swipes
            WHERE swiper_id = ? 
            AND target_id = ?
            AND direction IN ('right', 'super')
        `, [targetId, swiperId]);
        return !!result;
    }

    /**
     * Get all users that a user has swiped on
     */
    static async getSwipedUserIds(userId) {
        const results = await db.queryAll(`
            SELECT target_id FROM Swipes WHERE swiper_id = ?
        `, [userId]);
        return results.map(r => r.target_id);
    }

    /**
     * Get swipe history for a user
     */
    static async getHistory(userId) {
        return db.queryAll(`
            SELECT s.*, u.name as target_name
            FROM Swipes s
            JOIN Users u ON s.target_id = u.id
            WHERE s.swiper_id = ?
            ORDER BY s.created_at DESC
        `, [userId]);
    }
}

module.exports = Swipe;
