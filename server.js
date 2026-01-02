require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const db = require('./db/connection');
const { 
    authRoutes, 
    discoverRoutes, 
    swipeRoutes, 
    matchesRoutes, 
    profileRoutes 
} = require('./routes');

const app = express();

// =====================================================
// Middleware
// =====================================================

// CORS configuration
app.use(cors({
    origin: true, // Allow same origin
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Session configuration
app.use(session({
    ...config.session,
    store: undefined // Using default memory store for simplicity
    // For production, use connect-mssql-v2 or similar
}));

// CSRF protection (simple implementation)
app.use((req, res, next) => {
    // Skip CSRF for GET requests and API calls with proper session
    if (req.method === 'GET' || req.session.userId) {
        return next();
    }
    next();
});

// Static files (serve frontend)
app.use(express.static(path.join(__dirname)));

// =====================================================
// API Routes
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        session: !!req.session.userId
    });
});

// =====================================================
// Frontend Routes (SPA fallback)
// =====================================================

// Serve registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve main app (fallback to index.html)
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// =====================================================
// Error Handling
// =====================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
    });
});

// =====================================================
// Server Startup
// =====================================================

async function startServer() {
    try {
        // Initialize database connection
        await db.getPool();
        console.log('✓ Database connected');

        // Start server
        const port = config.port;
        app.listen(port, () => {
            console.log(`\n🐝 bumbEL server running on http://localhost:${port}`);
            console.log(`   Environment: ${config.nodeEnv}`);
            console.log(`\n   Routes:`);
            console.log(`   - Frontend: http://localhost:${port}`);
            console.log(`   - Register: http://localhost:${port}/register`);
            console.log(`   - Login:    http://localhost:${port}/login`);
            console.log(`   - API:      http://localhost:${port}/api/*\n`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down...');
    await db.close();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
