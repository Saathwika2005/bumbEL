const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { requireAuth, handleValidation } = require('../middleware');
const { User, UserProfile, UserChoices, UserEmbedding } = require('../models');

/**
 * GET /api/profile
 * Get current user's full profile
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const profile = await User.getFullProfile(userId);

        if (!profile) {
            return res.status(404).json({ 
                error: 'Profile not found',
                message: 'User profile does not exist'
            });
        }

        const displayChoices = UserChoices.toDisplayFormat(profile.choices);

        res.json({
            profile: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar || '👤',
                branch: profile.branch || '',
                year: profile.year || '',
                semester: profile.semester || '',
                category: profile.category || '',
                lookingFor: (displayChoices.lookingFor || []).join(', '),
                bio: profile.bio || '',
                skills: displayChoices.skills,
                interests: displayChoices.interests,
                experience: displayChoices.experience,
                lookingForChoices: displayChoices.lookingFor || [],
                choices: profile.choices,
                createdAt: profile.created_at
            }
        });

    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ 
            error: 'Failed to load profile',
            message: err.message 
        });
    }
});

/**
 * PUT /api/profile
 * Update current user's profile
 */
router.put('/', requireAuth, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('branch').optional().trim().notEmpty().withMessage('Branch cannot be empty'),
    body('year').optional().trim().notEmpty().withMessage('Year cannot be empty'),
    body('category').optional().isIn(['Tech', 'Design', 'Business', 'Science']).withMessage('Valid category is required'),
    handleValidation
], async (req, res) => {
    try {
        const userId = req.session.userId;
        const { 
            name, avatar,
            branch, year, semester, category, lookingFor, bio,
            choices 
        } = req.body;

        // Update user basic info
        if (name || avatar) {
            await User.update(userId, { name, avatar });
        }

        // Update profile
        if (branch || year || category) {
            const existingProfile = await UserProfile.findByUserId(userId);
            await UserProfile.upsert(userId, {
                branch: branch || existingProfile?.branch,
                year: year || existingProfile?.year,
                semester: semester !== undefined ? semester : existingProfile?.semester,
                category: category || existingProfile?.category,
                lookingFor: lookingFor !== undefined ? lookingFor : existingProfile?.looking_for,
                bio: bio !== undefined ? bio : existingProfile?.bio
            });
        }

        // Update choices and regenerate embedding
        if (choices && typeof choices === 'object') {
            await UserChoices.upsert(userId, choices);
            await UserEmbedding.upsert(userId, choices);
        }

        // Return updated profile
        const profile = await User.getFullProfile(userId);
        const displayChoices = UserChoices.toDisplayFormat(profile.choices);

        res.json({
            message: 'Profile updated successfully',
            profile: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar || '👤',
                branch: profile.branch || '',
                year: profile.year || '',
                semester: profile.semester || '',
                category: profile.category || '',
                lookingFor: profile.looking_for || '',
                bio: profile.bio || '',
                skills: displayChoices.skills,
                interests: displayChoices.interests,
                experience: displayChoices.experience
            }
        });

    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ 
            error: 'Failed to update profile',
            message: err.message 
        });
    }
});

module.exports = router;
