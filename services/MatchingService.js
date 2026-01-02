const db = require('../db/connection');
const { UserEmbedding, Swipe, Match } = require('../models');
const config = require('../config');

/**
 * Matching service - handles candidate discovery and ranking
 */
class MatchingService {
    /**
     * Get discover feed for a user
     * Returns candidates ranked by bidirectional skill matching
     * Super likes from others appear first!
     */
    static async getDiscoverFeed(userId, limit = 20) {
        // Get current user's data
        const currentUser = await this.getUserMatchData(userId);
        if (!currentUser || !currentUser.choices) {
            return [];
        }

        // Get users to exclude (self, already swiped, already matched)
        const excludeIds = await this.getExcludedUserIds(userId);
        excludeIds.add(userId);

        // Get users who super-liked the current user (they appear first!)
        const superLikers = await this.getSuperLikers(userId, excludeIds);
        console.log(`[Discover] User ${userId}: Found ${superLikers.size} super likers:`, Array.from(superLikers));

        // Get all potential candidates with their data
        const candidates = await this.getAllCandidates(excludeIds);
        console.log(`[Discover] Total candidates: ${candidates.length}`);

        // Filter and score candidates using bidirectional skill matching
        const scoredCandidates = [];

        for (const candidate of candidates) {
            // Check if this person super-liked us (huge priority boost!)
            const isSuperLiker = superLikers.has(candidate.user.id);

            // Calculate bidirectional match score
            let matchScore = { myLookingMatchesTheirSkills: 0, theirLookingMatchesMySkills: 0, total: 0 };
            if (candidate.choices) {
                matchScore = this.calculateBidirectionalMatch(
                    currentUser.choices,
                    candidate.choices
                );
            }

            // Skip if no matches AND not a super liker
            if (matchScore.total === 0 && !isSuperLiker) continue;

            if (isSuperLiker) {
                console.log(`[Discover] Super liker found: ${candidate.user.name} (ID: ${candidate.user.id}), rank: ${matchScore.total + 1000}`);
            }

            scoredCandidates.push({
                ...candidate,
                matchScore: matchScore.total,
                matchDetails: matchScore,
                isSuperLiker,
                // Super likers get massive priority boost (1000 points)
                rank: matchScore.total + (isSuperLiker ? 1000 : 0)
            });
        }

        // Sort by rank descending (super likers first, then by match score)
        scoredCandidates.sort((a, b) => b.rank - a.rank);
        
        console.log(`[Discover] Top 5 candidates:`, scoredCandidates.slice(0, 5).map(c => ({ name: c.user.name, rank: c.rank, isSuperLiker: c.isSuperLiker })));

        // Return top N candidates formatted for the frontend
        return scoredCandidates.slice(0, limit).map(c => this.formatForFrontend(c));
    }

    /**
     * Calculate bidirectional skill matching score
     * Returns count of:
     * - How many of my "looking_for" match their "skills"
     * - How many of their "looking_for" match my "skills"
     */
    static calculateBidirectionalMatch(myChoices, theirChoices) {
        const skillFields = [
            'webdev', 'frontend', 'backend', 'ml', 'ai', 'data_analysis',
            'mobile', 'cloud', 'devops', 'database', 'cybersecurity',
            'uiux', 'figma', 'iot', 'embedded'
        ];

        let myLookingMatchesTheirSkills = 0;
        let theirLookingMatchesMySkills = 0;

        for (const field of skillFields) {
            const lookingKey = `looking_${field}`;
            const skillKey = `skill_${field}`;

            // Count: what I'm looking for that they have
            if (myChoices[lookingKey] && theirChoices[skillKey]) {
                myLookingMatchesTheirSkills++;
            }

            // Count: what they're looking for that I have
            if (theirChoices[lookingKey] && myChoices[skillKey]) {
                theirLookingMatchesMySkills++;
            }
        }

        return {
            myNeedsMetByThem: myLookingMatchesTheirSkills,
            theirNeedsMetByMe: theirLookingMatchesMySkills,
            total: myLookingMatchesTheirSkills + theirLookingMatchesMySkills
        };
    }

    /**
     * Get user's matching data (profile, choices)
     */
    static async getUserMatchData(userId) {
        const result = await db.queryOne(`
            SELECT 
                u.id, u.name, u.avatar,
                p.branch, p.year, p.semester, p.category, p.looking_for, p.bio
            FROM Users u
            LEFT JOIN UserProfiles p ON u.id = p.user_id
            WHERE u.id = ?
        `, [userId]);

        if (!result) return null;

        // Get choices
        const choices = await db.queryOne(`
            SELECT * FROM UserChoices WHERE user_id = ?
        `, [userId]);

        return {
            user: result,
            profile: result.branch ? {
                branch: result.branch,
                year: result.year,
                semester: result.semester,
                category: result.category,
                looking_for: result.looking_for,
                bio: result.bio
            } : null,
            choices: choices || {}
        };
    }

    /**
     * Get all user IDs to exclude from discover feed
     */
    static async getExcludedUserIds(userId) {
        const excludeIds = new Set();

        // Get swiped users
        const swipedIds = await Swipe.getSwipedUserIds(userId);
        swipedIds.forEach(id => excludeIds.add(id));

        // Get matched users
        const matchedIds = await Match.getMatchedUserIds(userId);
        matchedIds.forEach(id => excludeIds.add(id));

        return excludeIds;
    }

    /**
     * Get users who super-liked the current user (and haven't been swiped on yet)
     */
    static async getSuperLikers(userId, excludeIds) {
        const excludeArray = Array.from(excludeIds);
        
        let query = `
            SELECT swiper_id FROM Swipes
            WHERE target_id = ? AND direction = 'super'
        `;
        const params = [userId];

        if (excludeArray.length > 0) {
            query += ` AND swiper_id NOT IN (${excludeArray.map(() => '?').join(', ')})`;
            params.push(...excludeArray);
        }

        const results = await db.queryAll(query, params);
        return new Set(results.map(r => r.swiper_id));
    }

    /**
     * Get all candidates with their data (excluding specified IDs)
     */
    static async getAllCandidates(excludeIds) {
        const excludeArray = Array.from(excludeIds);
        
        // Build exclusion clause
        let excludeClause = '';
        if (excludeArray.length > 0) {
            excludeClause = `WHERE u.id NOT IN (${excludeArray.join(',')})`;
        }

        const results = await db.queryAll(`
            SELECT 
                u.id, u.name, u.avatar,
                p.branch, p.year, p.semester, p.category, p.looking_for, p.bio
            FROM Users u
            LEFT JOIN UserProfiles p ON u.id = p.user_id
            ${excludeClause}
        `);

        // Enrich with choices
        const candidates = [];
        
        for (const r of results) {
            const choices = await db.queryOne(`
                SELECT * FROM UserChoices WHERE user_id = ?
            `, [r.id]);

            // Include all users - even without choices (super likers might not have filled profile)
            candidates.push({
                user: r,
                profile: r.branch ? {
                    branch: r.branch,
                    year: r.year,
                    semester: r.semester,
                    category: r.category,
                    looking_for: r.looking_for,
                    bio: r.bio
                } : null,
                choices: choices || null
            });
        }

        return candidates;
    }

    /**
     * Format candidate data for frontend consumption
     */
    static formatForFrontend(candidate) {
        const { UserChoices } = require('../models');
        const displayChoices = UserChoices.toDisplayFormat(candidate.choices);

        return {
            id: candidate.user.id,
            name: candidate.user.name,
            avatar: candidate.user.avatar || '👤',
            branch: candidate.profile?.branch || 'Unknown',
            year: candidate.profile?.year || 'Unknown',
            semester: candidate.profile?.semester || '',
            category: candidate.profile?.category || 'Tech',
            lookingFor: (displayChoices.lookingFor || []).join(', '),
            bio: candidate.profile?.bio || '',
            skills: displayChoices.skills,
            interests: displayChoices.interests,
            experience: displayChoices.experience,
            matchScore: candidate.matchScore || 0,
            matchDetails: candidate.matchDetails || null
        };
    }

    /**
     * Process a swipe and check for match
     */
    static async processSwipe(swiperId, targetId, direction) {
        // Record the swipe
        await Swipe.create(swiperId, targetId, direction);

        // If left swipe, no match possible
        if (direction === 'left') {
            return { matched: false };
        }

        // Check for reciprocal right swipe
        const isReciprocal = await Swipe.hasReciprocalRightSwipe(swiperId, targetId);

        if (isReciprocal) {
            // Check if match already exists (shouldn't, but safety check)
            const matchExists = await Match.exists(swiperId, targetId);
            
            if (!matchExists) {
                // Calculate bidirectional match score for the match record
                const swiperData = await this.getUserMatchData(swiperId);
                const targetData = await this.getUserMatchData(targetId);
                
                let score = null;
                if (swiperData?.choices && targetData?.choices) {
                    const matchResult = this.calculateBidirectionalMatch(
                        swiperData.choices,
                        targetData.choices
                    );
                    score = matchResult.total;
                }

                // Create the match
                await Match.create(swiperId, targetId, score);
                
                return { 
                    matched: true, 
                    matchedUserId: targetId,
                    score 
                };
            }
        }

        return { matched: false };
    }
}

module.exports = MatchingService;