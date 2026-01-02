const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { requireAuth, handleValidation } = require('../middleware');
const { Swipe } = require('../models');
const MatchingService = require('../services/MatchingService');

/**
 * POST /api/swipe
 * Record a swipe action
 */
router.post('/', requireAuth, [
    body('targetId').isInt().withMessage('Target user ID is required'),
    body('direction').isIn(['left', 'right', 'super']).withMessage('Valid direction is required'),
    handleValidation
], async (req, res) => {
    try {
        const swiperId = req.session.userId;
        const { targetId, direction } = req.body;

        // Prevent self-swipe
        if (swiperId === targetId) {
            return res.status(400).json({ 
                error: 'Invalid swipe',
                message: 'Cannot swipe on yourself'
            });
        }

        // Check if already swiped
        const existing = await Swipe.exists(swiperId, targetId);
        if (existing) {
            return res.status(400).json({ 
                error: 'Already swiped',
                message: 'You have already swiped on this user'
            });
        }

        // Process the swipe
        const result = await MatchingService.processSwipe(swiperId, targetId, direction);

        res.json({
            success: true,
            direction,
            matched: result.matched,
            matchedUserId: result.matchedUserId || null
        });

    } catch (err) {
        console.error('Swipe error:', err);
        res.status(500).json({ 
            error: 'Swipe failed',
            message: err.message 
        });
    }
});

module.exports = router;
