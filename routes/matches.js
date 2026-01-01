const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware');
const { Match, UserChoices } = require('../models');

/**
 * GET /api/matches
 * Get all matches for the current user
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        const matches = await Match.getMatchesForUser(userId);

        // Enrich with choices display data
        const enrichedMatches = await Promise.all(matches.map(async (match) => {
            const choices = await UserChoices.findByUserId(match.id);
            const displayChoices = UserChoices.toDisplayFormat(choices);

            return {
                matchId: match.match_id,
                matchedAt: match.matched_at,
                score: match.score,
                user: {
                    id: match.id,
                    name: match.name,
                    avatar: match.avatar || '👤',
                    branch: match.branch || 'Unknown',
                    year: match.year || 'Unknown',
                    semester: match.semester || '',
                    category: match.category || 'Tech',
                    lookingFor: (displayChoices.lookingFor || []).join(', '),
                    bio: match.bio || '',
                    skills: displayChoices.skills,
                    interests: displayChoices.interests,
                    experience: displayChoices.experience
                }
            };
        }));

        res.json({
            matches: enrichedMatches,
            count: enrichedMatches.length
        });

    } catch (err) {
        console.error('Get matches error:', err);
        res.status(500).json({ 
            error: 'Failed to load matches',
            message: err.message 
        });
    }
});

/**
 * GET /api/matches/count
 * Get match count for the current user
 */
router.get('/count', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const count = await Match.getMatchCount(userId);
        
        res.json({ count });

    } catch (err) {
        console.error('Match count error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
