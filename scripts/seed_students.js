#!/usr/bin/env node
/**
 * Seed script: imports students from CSV and creates accounts
 * - Password: 12345678 for all
 * - Randomly assigns skills and looking_for choices
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../db/connection');

const CSV_PATH = path.join(__dirname, 'students.csv');

// All skill and looking_for field names
const SKILL_FIELDS = [
    'skill_webdev', 'skill_frontend', 'skill_backend', 'skill_ml', 'skill_ai',
    'skill_data_analysis', 'skill_mobile', 'skill_cloud', 'skill_devops',
    'skill_database', 'skill_cybersecurity', 'skill_uiux', 'skill_figma',
    'skill_iot', 'skill_embedded'
];

const LOOKING_FIELDS = [
    'looking_webdev', 'looking_frontend', 'looking_backend', 'looking_ml', 'looking_ai',
    'looking_data_analysis', 'looking_mobile', 'looking_cloud', 'looking_devops',
    'looking_database', 'looking_cybersecurity', 'looking_uiux', 'looking_figma',
    'looking_iot', 'looking_embedded'
];

const INTEREST_FIELDS = [
    'interest_startups', 'interest_research', 'interest_competitions',
    'interest_opensource', 'interest_freelancing', 'interest_networking',
    'interest_mentorship', 'interest_hackathons'
];

const EXPERIENCE_LEVELS = ['experience_beginner', 'experience_intermediate', 'experience_advanced'];

const CATEGORIES = ['Tech', 'Design', 'Business', 'Science'];
const AVATARS = ['👤', '👩‍💻', '👨‍💻', '🎨', '🚀', '💡', '🔬', '📊', '🎯', '⚡'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

function parseCSV(content) {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const students = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip header rows (lines that don't start with a number followed by comma)
        const match = line.match(/^(\d+),(.+)/);
        if (!match) continue;

        const parts = line.split(',');
        if (parts.length < 5) continue;

        const slNo = parseInt(parts[0], 10);
        const name = parts[1]?.trim();
        const usn = parts[2]?.trim();
        const section = parts[3]?.trim();
        const email = parts[4]?.trim();

        if (!name || !email || !email.includes('@')) continue;

        students.push({ slNo, name, usn, section, email });
    }

    return students;
}

function randomSubset(arr, minCount, maxCount) {
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateChoices() {
    const choices = {};

    // Random skills (2-6)
    const skills = randomSubset(SKILL_FIELDS, 2, 6);
    SKILL_FIELDS.forEach(f => choices[f] = skills.includes(f) ? 1 : 0);

    // Random looking_for (2-5)
    const looking = randomSubset(LOOKING_FIELDS, 2, 5);
    LOOKING_FIELDS.forEach(f => choices[f] = looking.includes(f) ? 1 : 0);

    // Random interests (1-4)
    const interests = randomSubset(INTEREST_FIELDS, 1, 4);
    INTEREST_FIELDS.forEach(f => choices[f] = interests.includes(f) ? 1 : 0);

    // Random experience level (one)
    const exp = pickRandom(EXPERIENCE_LEVELS);
    EXPERIENCE_LEVELS.forEach(f => choices[f] = f === exp ? 1 : 0);

    return choices;
}

function getBranchFromSection(section) {
    if (section.includes('CSE')) return 'Computer Science & Engineering';
    if (section.includes('CY')) return 'Cybersecurity';
    if (section.includes('CD')) return 'Computer Science (Data Science)';
    return 'Computer Science & Engineering';
}

(async () => {
    console.log('\n=== Student Seed Script ===\n');

    // Read CSV
    let csvContent;
    try {
        csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    } catch (err) {
        console.error('Could not read CSV file at:', CSV_PATH);
        console.error('Trying alternate location...');
        // Try current directory
        const altPath = path.join(__dirname, 'students.csv');
        if (fs.existsSync(altPath)) {
            csvContent = fs.readFileSync(altPath, 'utf-8');
        } else {
            console.error('Please place the CSV file at:', altPath);
            process.exit(1);
        }
    }

    const students = parseCSV(csvContent);
    console.log(`Parsed ${students.length} students from CSV\n`);

    if (students.length === 0) {
        console.error('No valid students found in CSV');
        process.exit(1);
    }

    // Hash password once (same for all)
    const passwordHash = await bcrypt.hash('12345678', 10);

    const pool = await db.getPool();
    let created = 0, skipped = 0;

    for (const student of students) {
        const conn = await pool.getConnection();
        try {
            // Check if email already exists
            const [existing] = await conn.query('SELECT id FROM Users WHERE email = ?', [student.email.toLowerCase()]);
            if (existing.length > 0) {
                console.log(`Skipping (exists): ${student.email}`);
                skipped++;
                continue;
            }

            await conn.beginTransaction();

            // Create user
            const avatar = pickRandom(AVATARS);
            const [userResult] = await conn.query(
                'INSERT INTO Users (name, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
                [student.name, student.email.toLowerCase(), passwordHash, avatar]
            );
            const userId = userResult.insertId;

            // Create profile
            const branch = getBranchFromSection(student.section);
            const year = pickRandom(YEARS);
            const semester = pickRandom(SEMESTERS);
            const category = pickRandom(CATEGORIES);
            const bio = `Hi, I'm ${student.name} from ${branch}. Looking for teammates!`;

            await conn.query(
                `INSERT INTO UserProfiles (user_id, branch, year, semester, category, looking_for, bio)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, branch, year, semester, category, '', bio]
            );

            // Create choices (random skills & looking_for)
            const choices = generateChoices();
            const choiceFields = [...SKILL_FIELDS, ...LOOKING_FIELDS, ...INTEREST_FIELDS, ...EXPERIENCE_LEVELS];
            const choiceValues = choiceFields.map(f => choices[f] || 0);

            await conn.query(
                `INSERT INTO UserChoices (user_id, ${choiceFields.join(', ')})
                 VALUES (?, ${choiceFields.map(() => '?').join(', ')})`,
                [userId, ...choiceValues]
            );

            await conn.commit();
            created++;
            console.log(`Created: ${student.name} (${student.email})`);

        } catch (err) {
            console.error(`Error creating ${student.name}:`, err.message);
            try { await conn.rollback(); } catch (e) {}
            skipped++;
        } finally {
            conn.release();
        }
    }

    console.log(`\n=== Done ===`);
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total students in CSV: ${students.length}\n`);

    await db.close();
})();
