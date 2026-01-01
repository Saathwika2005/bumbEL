require('dotenv').config();

module.exports = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Session configuration
    session: {
        secret: process.env.SESSION_SECRET || 'bumbel-secret-key-change-in-production',
        name: 'bumbel.sid',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
        }
    },

    // MySQL configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '1234',
        database: process.env.DB_DATABASE || 'bumbEL',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    },

    // Embedding vector dimensions (order matters!)
    embeddingDimensions: [
        // Skills (10)
        'skill_webdev',
        'skill_frontend',
        'skill_backend',
        'skill_ml',
        'skill_ai',
        'skill_data_analysis',
        'skill_uiux',
        'skill_figma',
        'skill_iot',
        'skill_embedded',
        'skill_mobile',
        'skill_cloud',
        'skill_devops',
        'skill_database',
        'skill_cybersecurity',
        // Interests (8)
        'interest_startups',
        'interest_research',
        'interest_competitions',
        'interest_opensource',
        'interest_freelancing',
        'interest_networking',
        'interest_mentorship',
        'interest_hackathons',
        // Experience levels (3)
        'experience_beginner',
        'experience_intermediate',
        'experience_advanced'
    ],

    // Categories
    categories: ['Tech', 'Design', 'Business', 'Science'],

    // Skills by category
    skillsByCategory: {
        Tech: ['skill_webdev', 'skill_frontend', 'skill_backend', 'skill_ml', 'skill_ai', 'skill_data_analysis', 'skill_mobile', 'skill_cloud', 'skill_devops', 'skill_database', 'skill_cybersecurity'],
        Design: ['skill_uiux', 'skill_figma'],
        Science: ['skill_iot', 'skill_embedded'],
        Business: ['interest_startups', 'interest_freelancing']
    },

    // Matching configuration
    matching: {
        maxResults: 20,
        requireOverlap: true
    }
};
