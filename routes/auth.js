const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { User, UserProfile, UserChoices, UserEmbedding } = require('../models');
const { requireNoAuth, handleValidation } = require('../middleware');

/**
 * POST /api/auth/register
 * Register a new user with full profile
 */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('branch').trim().notEmpty().withMessage('Branch is required'),
    body('year').trim().notEmpty().withMessage('Year is required'),
    body('category').isIn(['Tech', 'Design', 'Business', 'Science']).withMessage('Valid category is required'),
    handleValidation
], async (req, res) => {
    try {
        const { 
            name, email, password, avatar,
            branch, year, semester, category, lookingFor, bio,
            choices 
        } = req.body;

        // Check if email already exists
        const exists = await User.emailExists(email);
        if (exists) {
            return res.status(400).json({ 
                error: 'Email already registered',
                message: 'An account with this email already exists'
            });
        }

        // Create user
        const user = await User.create({ name, email, password, avatar });

        // Create profile
        await UserProfile.upsert(user.id, {
            branch,
            year,
            semester,
            category,
            lookingFor,
            bio
        });

        // Create choices if provided
        if (choices && typeof choices === 'object') {
            await UserChoices.upsert(user.id, choices);
            
            // Generate and store embedding
            await UserEmbedding.upsert(user.id, choices);
        }

        // Create session
        req.session.userId = user.id;
        req.session.userName = user.name;

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            error: 'Registration failed',
            message: err.message 
        });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation
], async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Verify password
        const isValid = await User.verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Create session
        req.session.userId = user.id;
        req.session.userName = user.name;

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            error: 'Login failed',
            message: err.message 
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout and destroy session
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Logout failed',
                message: err.message 
            });
        }
        res.clearCookie('bumbel.sid');
        res.json({ message: 'Logout successful' });
    });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ 
            error: 'Not authenticated',
            message: 'Please log in'
        });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.status(401).json({ 
                error: 'User not found',
                message: 'Please log in again'
            });
        }

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('Auth check error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
