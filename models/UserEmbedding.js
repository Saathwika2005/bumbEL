const db = require('../db/connection');
const config = require('../config');

/**
 * UserEmbedding model for custom embedding vectors
 */
class UserEmbedding {
    /**
     * Generate embedding vector from user choices
     * This creates a deterministic, fixed-length binary vector
     */
    static generateVector(choices) {
        const dimensions = config.embeddingDimensions;
        const vector = [];

        for (const dim of dimensions) {
            // Convert boolean/bit to 1 or 0
            vector.push(choices[dim] ? 1 : 0);
        }

        return vector;
    }

    /**
     * Create or update embedding for a user
     */
    static async upsert(userId, choices) {
        const vector = this.generateVector(choices);
        const vectorJson = JSON.stringify(vector);

        // Check if embedding exists
        const existing = await db.queryOne(`
            SELECT id FROM UserEmbeddings WHERE user_id = ?
        `, [userId]);

        if (existing) {
            await db.query(`
                UPDATE UserEmbeddings
                SET embedding_vector = ?,
                    updated_at = NOW()
                WHERE user_id = ?
            `, [vectorJson, userId]);

            return db.queryOne(`SELECT * FROM UserEmbeddings WHERE user_id = ?`, [userId]);
        } else {
            const insertId = await db.insert(`
                INSERT INTO UserEmbeddings (user_id, embedding_vector)
                VALUES (?, ?)
            `, [userId, vectorJson]);

            return db.queryOne(`SELECT * FROM UserEmbeddings WHERE id = ?`, [insertId]);
        }
    }

    /**
     * Get embedding by user ID
     */
    static async findByUserId(userId) {
        const result = await db.queryOne(`
            SELECT * FROM UserEmbeddings WHERE user_id = ?
        `, [userId]);

        if (result && result.embedding_vector) {
            result.vector = JSON.parse(result.embedding_vector);
        }

        return result;
    }

    /**
     * Get all embeddings (for matching calculations)
     */
    static async getAll() {
        const results = await db.queryAll(`SELECT * FROM UserEmbeddings`);
        
        return results.map(r => ({
            ...r,
            vector: JSON.parse(r.embedding_vector)
        }));
    }

    /**
     * Calculate cosine similarity between two vectors
     * Returns value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
     */
    static cosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0; // Handle zero vectors
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Check if two users have minimum overlap for matching
     * Requires at least one shared skill or same category
     */
    static hasMinimumOverlap(choicesA, choicesB, profileA, profileB) {
        // Check category overlap
        if (profileA && profileB && profileA.category === profileB.category) {
            return true;
        }

        // Check skill overlap (any shared skill = true)
        const skillFields = config.embeddingDimensions.filter(d => d.startsWith('skill_'));
        
        for (const skill of skillFields) {
            if (choicesA[skill] && choicesB[skill]) {
                return true;
            }
        }

        return false;
    }
}

module.exports = UserEmbedding;
