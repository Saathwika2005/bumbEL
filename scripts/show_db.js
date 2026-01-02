#!/usr/bin/env node
/**
 * Script to display database contents
 * Usage: node scripts/show_db.js [table]
 * Tables: users, profiles, choices, all (default: users)
 */

require('dotenv').config();
const db = require('../db/connection');

const args = process.argv.slice(2);
const table = args[0] || 'users';

async function showUsers() {
    const users = await db.queryAll(`
        SELECT u.id, u.name, u.email, u.avatar, u.created_at,
               p.branch, p.year, p.category
        FROM Users u
        LEFT JOIN UserProfiles p ON u.id = p.user_id
        ORDER BY u.id
        LIMIT 50
    `);
    
    console.log('\n=== Users (showing first 50) ===\n');
    console.table(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email.substring(0, 30) + (u.email.length > 30 ? '...' : ''),
        avatar: u.avatar,
        branch: u.branch?.substring(0, 20) || '-',
        year: u.year || '-',
        category: u.category || '-'
    })));
    
    const [{ total }] = await db.queryAll('SELECT COUNT(*) as total FROM Users');
    console.log(`Total users: ${total}\n`);
}

async function showProfiles() {
    const profiles = await db.queryAll(`
        SELECT u.name, p.*
        FROM UserProfiles p
        JOIN Users u ON u.id = p.user_id
        ORDER BY p.user_id
        LIMIT 30
    `);
    
    console.log('\n=== Profiles (showing first 30) ===\n');
    console.table(profiles.map(p => ({
        user_id: p.user_id,
        name: p.name,
        branch: p.branch?.substring(0, 25) || '-',
        year: p.year,
        semester: p.semester,
        category: p.category,
        bio: p.bio?.substring(0, 30) + '...' || '-'
    })));
}

async function showChoices() {
    const choices = await db.queryAll(`
        SELECT u.name, c.*
        FROM UserChoices c
        JOIN Users u ON u.id = c.user_id
        ORDER BY c.user_id
        LIMIT 20
    `);
    
    console.log('\n=== User Choices (showing first 20) ===\n');
    
    for (const c of choices) {
        const skills = [];
        const looking = [];
        const interests = [];
        let experience = '-';
        
        // Extract skills
        if (c.skill_webdev) skills.push('WebDev');
        if (c.skill_frontend) skills.push('Frontend');
        if (c.skill_backend) skills.push('Backend');
        if (c.skill_ml) skills.push('ML');
        if (c.skill_ai) skills.push('AI');
        if (c.skill_data_analysis) skills.push('DataAnalysis');
        if (c.skill_mobile) skills.push('Mobile');
        if (c.skill_cloud) skills.push('Cloud');
        if (c.skill_devops) skills.push('DevOps');
        if (c.skill_database) skills.push('Database');
        if (c.skill_cybersecurity) skills.push('Cybersec');
        if (c.skill_uiux) skills.push('UI/UX');
        if (c.skill_figma) skills.push('Figma');
        if (c.skill_iot) skills.push('IoT');
        if (c.skill_embedded) skills.push('Embedded');
        
        // Extract looking_for
        if (c.looking_webdev) looking.push('WebDev');
        if (c.looking_frontend) looking.push('Frontend');
        if (c.looking_backend) looking.push('Backend');
        if (c.looking_ml) looking.push('ML');
        if (c.looking_ai) looking.push('AI');
        if (c.looking_data_analysis) looking.push('DataAnalysis');
        if (c.looking_mobile) looking.push('Mobile');
        if (c.looking_cloud) looking.push('Cloud');
        if (c.looking_devops) looking.push('DevOps');
        if (c.looking_database) looking.push('Database');
        if (c.looking_cybersecurity) looking.push('Cybersec');
        if (c.looking_uiux) looking.push('UI/UX');
        if (c.looking_figma) looking.push('Figma');
        if (c.looking_iot) looking.push('IoT');
        if (c.looking_embedded) looking.push('Embedded');
        
        // Extract interests
        if (c.interest_startups) interests.push('Startups');
        if (c.interest_research) interests.push('Research');
        if (c.interest_competitions) interests.push('Competitions');
        if (c.interest_opensource) interests.push('OpenSource');
        if (c.interest_freelancing) interests.push('Freelancing');
        if (c.interest_networking) interests.push('Networking');
        if (c.interest_mentorship) interests.push('Mentorship');
        if (c.interest_hackathons) interests.push('Hackathons');
        
        // Experience
        if (c.experience_beginner) experience = 'Beginner';
        if (c.experience_intermediate) experience = 'Intermediate';
        if (c.experience_advanced) experience = 'Advanced';
        
        console.log(`[${c.user_id}] ${c.name}`);
        console.log(`    Skills:     ${skills.join(', ') || '-'}`);
        console.log(`    Looking:    ${looking.join(', ') || '-'}`);
        console.log(`    Interests:  ${interests.join(', ') || '-'}`);
        console.log(`    Experience: ${experience}`);
        console.log('');
    }
}

async function showStats() {
    const [users] = await db.queryAll('SELECT COUNT(*) as c FROM Users');
    const [profiles] = await db.queryAll('SELECT COUNT(*) as c FROM UserProfiles');
    const [choices] = await db.queryAll('SELECT COUNT(*) as c FROM UserChoices');
    const [swipes] = await db.queryAll('SELECT COUNT(*) as c FROM Swipes');
    const [matches] = await db.queryAll('SELECT COUNT(*) as c FROM Matches');
    
    console.log('\n=== Database Stats ===\n');
    console.table({
        Users: users.c,
        Profiles: profiles.c,
        Choices: choices.c,
        Swipes: swipes.c,
        Matches: matches.c
    });
}

(async () => {
    try {
        await db.getPool();
        
        switch (table.toLowerCase()) {
            case 'users':
                await showUsers();
                break;
            case 'profiles':
                await showProfiles();
                break;
            case 'choices':
                await showChoices();
                break;
            case 'stats':
                await showStats();
                break;
            case 'all':
                await showStats();
                await showUsers();
                await showProfiles();
                await showChoices();
                break;
            default:
                console.log('Usage: node scripts/show_db.js [users|profiles|choices|stats|all]');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await db.close();
    }
})();
