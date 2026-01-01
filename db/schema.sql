-- bumbEL Database Setup Script for MySQL
-- Run this script to create the database and all required tables

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS bumbEL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE bumbEL;

-- =====================================================
-- Users Table - Core user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '👤',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IX_Users_Email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- UserProfiles Table - Extended profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS UserProfiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    branch VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    semester VARCHAR(20),
    category VARCHAR(50) NOT NULL, -- Tech, Design, Business, Science
    looking_for VARCHAR(500),
    bio VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_UserProfiles_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- UserChoices Table - Structured option-based inputs
-- =====================================================
CREATE TABLE IF NOT EXISTS UserChoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    
    -- Skills (Technology)
    skill_webdev TINYINT(1) DEFAULT 0,
    skill_frontend TINYINT(1) DEFAULT 0,
    skill_backend TINYINT(1) DEFAULT 0,
    skill_ml TINYINT(1) DEFAULT 0,
    skill_ai TINYINT(1) DEFAULT 0,
    skill_data_analysis TINYINT(1) DEFAULT 0,
    skill_mobile TINYINT(1) DEFAULT 0,
    skill_cloud TINYINT(1) DEFAULT 0,
    skill_devops TINYINT(1) DEFAULT 0,
    skill_database TINYINT(1) DEFAULT 0,
    skill_cybersecurity TINYINT(1) DEFAULT 0,
    
    -- Skills (Design)
    skill_uiux TINYINT(1) DEFAULT 0,
    skill_figma TINYINT(1) DEFAULT 0,
    
    -- Skills (Science/Hardware)
    skill_iot TINYINT(1) DEFAULT 0,
    skill_embedded TINYINT(1) DEFAULT 0,
    
    -- Interests
    interest_startups TINYINT(1) DEFAULT 0,
    interest_research TINYINT(1) DEFAULT 0,
    interest_competitions TINYINT(1) DEFAULT 0,
    interest_opensource TINYINT(1) DEFAULT 0,
    interest_freelancing TINYINT(1) DEFAULT 0,
    interest_networking TINYINT(1) DEFAULT 0,
    interest_mentorship TINYINT(1) DEFAULT 0,
    interest_hackathons TINYINT(1) DEFAULT 0,

    -- Looking For (structured target skills - selectable)
    looking_webdev TINYINT(1) DEFAULT 0,
    looking_frontend TINYINT(1) DEFAULT 0,
    looking_backend TINYINT(1) DEFAULT 0,
    looking_ml TINYINT(1) DEFAULT 0,
    looking_ai TINYINT(1) DEFAULT 0,
    looking_data_analysis TINYINT(1) DEFAULT 0,
    looking_mobile TINYINT(1) DEFAULT 0,
    looking_cloud TINYINT(1) DEFAULT 0,
    looking_devops TINYINT(1) DEFAULT 0,
    looking_database TINYINT(1) DEFAULT 0,
    looking_cybersecurity TINYINT(1) DEFAULT 0,
    looking_uiux TINYINT(1) DEFAULT 0,
    looking_figma TINYINT(1) DEFAULT 0,
    looking_iot TINYINT(1) DEFAULT 0,
    looking_embedded TINYINT(1) DEFAULT 0,
    
    -- Experience Level (mutually exclusive ideally, but stored as bits)
    experience_beginner TINYINT(1) DEFAULT 0,
    experience_intermediate TINYINT(1) DEFAULT 0,
    experience_advanced TINYINT(1) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_UserChoices_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- UserEmbeddings Table - Custom embedding vectors
-- =====================================================
CREATE TABLE IF NOT EXISTS UserEmbeddings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    embedding_vector JSON NOT NULL, -- JSON array of 0s and 1s
    vector_version INT DEFAULT 1, -- For future embedding changes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_UserEmbeddings_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Swipes Table - User swipe actions
-- =====================================================
CREATE TABLE IF NOT EXISTS Swipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    swiper_id INT NOT NULL,
    target_id INT NOT NULL,
    direction ENUM('left', 'right', 'super') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Swipes_Swiper FOREIGN KEY (swiper_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Swipes_Target FOREIGN KEY (target_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY UQ_Swipes_Pair (swiper_id, target_id),
    INDEX IX_Swipes_Swiper (swiper_id),
    INDEX IX_Swipes_Target (target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Matches Table - Mutual matches between users
-- =====================================================
CREATE TABLE IF NOT EXISTS Matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_a INT NOT NULL,
    user_b INT NOT NULL,
    score DOUBLE, -- Cosine similarity score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Matches_UserA FOREIGN KEY (user_a) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Matches_UserB FOREIGN KEY (user_b) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY UQ_Matches_Pair (user_a, user_b),
    INDEX IX_Matches_UserA (user_a),
    INDEX IX_Matches_UserB (user_b)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sessions Table (for express-session with MySQL store)
-- =====================================================
CREATE TABLE IF NOT EXISTS Sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    INDEX IX_Sessions_Expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
