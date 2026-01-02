const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware');
const MatchingService = require('../services/MatchingService');

/**
 * GET /api/discover
 * Get discover feed with ranked candidates
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const limit = parseInt(req.query.limit) || 20;

        const profiles = await MatchingService.getDiscoverFeed(userId, limit);

        res.json({
            profiles,
            count: profiles.length
        });

    } catch (err) {
        console.error('Discover feed error:', err);
        res.status(500).json({ 
            error: 'Failed to load discover feed',
            message: err.message 
        });
    }
});

module.exports = router;
