const { validationResult } = require('express-validator');

/**
 * Validation error handler middleware
 */
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array() 
        });
    }
    next();
}

module.exports = { handleValidation };
