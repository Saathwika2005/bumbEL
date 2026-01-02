/**
 * Authentication middleware
 */

/**
 * Require authenticated session
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Please log in to continue' 
    });
}

/**
 * Optional auth - attach user if logged in
 */
function optionalAuth(req, res, next) {
    // User info is attached via session
    next();
}

/**
 * Require no auth (for login/register)
 */
function requireNoAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return res.status(400).json({ 
            error: 'Already authenticated',
            message: 'You are already logged in'
        });
    }
    next();
}

module.exports = {
    requireAuth,
    optionalAuth,
    requireNoAuth
};
