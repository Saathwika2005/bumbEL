const db = require('../db/connection');
const config = require('../config');

/**
 * UserChoices model for structured option-based inputs
 */
class UserChoices {
    /**
     * Get all choice field names
     */
    static getChoiceFields() {
        return [
            // Skills
            'skill_webdev', 'skill_frontend', 'skill_backend', 'skill_ml', 'skill_ai',
            'skill_data_analysis', 'skill_mobile', 'skill_cloud', 'skill_devops',
            'skill_database', 'skill_cybersecurity', 'skill_uiux', 'skill_figma',
            'skill_iot', 'skill_embedded',
            // Interests
            'interest_startups', 'interest_research', 'interest_competitions',
            'interest_opensource', 'interest_freelancing', 'interest_networking',
            'interest_mentorship', 'interest_hackathons',
            // Looking For (structured target skills)
            'looking_webdev', 'looking_frontend', 'looking_backend', 'looking_ml', 'looking_ai',
            'looking_data_analysis', 'looking_mobile', 'looking_cloud', 'looking_devops', 'looking_database',
            'looking_cybersecurity', 'looking_uiux', 'looking_figma', 'looking_iot', 'looking_embedded',
            // Experience
            'experience_beginner', 'experience_intermediate', 'experience_advanced'
        ];
    }

    /**
     * Create or update user choices
     */
    static async upsert(userId, choices) {
        const fields = this.getChoiceFields();
        
        // Check if choices exist
        const existing = await db.queryOne(`
            SELECT id FROM UserChoices WHERE user_id = ?
        `, [userId]);

        // Build values array: userId first, then all choice fields
        const values = fields.map(field => choices[field] ? 1 : 0);

        if (existing) {
            // Update - values array needs field values first, then userId at the end
            const setClause = fields.map(f => `${f} = ?`).join(', ');
            await db.query(`
                UPDATE UserChoices
                SET ${setClause}, updated_at = NOW()
                WHERE user_id = ?
            `, [...values, userId]);

            return db.queryOne(`SELECT * FROM UserChoices WHERE user_id = ?`, [userId]);
        } else {
            // Insert
            const fieldList = ['user_id', ...fields].join(', ');
            const placeholders = ['?', ...fields.map(() => '?')].join(', ');
            
            const insertId = await db.insert(`
                INSERT INTO UserChoices (${fieldList})
                VALUES (${placeholders})
            `, [userId, ...values]);

            return db.queryOne(`SELECT * FROM UserChoices WHERE id = ?`, [insertId]);
        }
    }

    /**
     * Get choices by user ID
     */
    static async findByUserId(userId) {
        return db.queryOne(`
            SELECT * FROM UserChoices WHERE user_id = ?
        `, [userId]);
    }

    /**
     * Get all users' choices (for matching)
     */
    static async getAll() {
        return db.queryAll(`SELECT * FROM UserChoices`);
    }

    /**
     * Convert choices to display-friendly format
     */
    static toDisplayFormat(choices) {
        if (!choices) return { skills: [], interests: [], experience: null };

        const skills = [];
        const interests = [];
        let experience = null;

        const skillLabels = {
            skill_webdev: 'Web Development',
            skill_frontend: 'Frontend',
            skill_backend: 'Backend',
            skill_ml: 'Machine Learning',
            skill_ai: 'AI',
            skill_data_analysis: 'Data Analysis',
            skill_mobile: 'Mobile Development',
            skill_cloud: 'Cloud Computing',
            skill_devops: 'DevOps',
            skill_database: 'Database',
            skill_cybersecurity: 'Cybersecurity',
            skill_uiux: 'UI/UX Design',
            skill_figma: 'Figma',
            skill_iot: 'IoT',
            skill_embedded: 'Embedded Systems'
        };

        const interestLabels = {
            interest_startups: 'Startups',
            interest_research: 'Research',
            interest_competitions: 'Competitions',
            interest_opensource: 'Open Source',
            interest_freelancing: 'Freelancing',
            interest_networking: 'Networking',
            interest_mentorship: 'Mentorship',
            interest_hackathons: 'Hackathons'
        };

        for (const [key, label] of Object.entries(skillLabels)) {
            if (choices[key]) skills.push({ name: label, category: 'tech' });
        }

        for (const [key, label] of Object.entries(interestLabels)) {
            if (choices[key]) interests.push(label);
        }

        if (choices.experience_beginner) experience = 'Beginner';
        else if (choices.experience_intermediate) experience = 'Intermediate';
        else if (choices.experience_advanced) experience = 'Advanced';

        // Build lookingFor list from looking_* flags
        const lookingLabels = {
            looking_webdev: 'Web Development',
            looking_frontend: 'Frontend',
            looking_backend: 'Backend',
            looking_ml: 'Machine Learning',
            looking_ai: 'AI',
            looking_data_analysis: 'Data Analysis',
            looking_mobile: 'Mobile Development',
            looking_cloud: 'Cloud Computing',
            looking_devops: 'DevOps',
            looking_database: 'Database',
            looking_cybersecurity: 'Cybersecurity',
            looking_uiux: 'UI/UX Design',
            looking_figma: 'Figma',
            looking_iot: 'IoT',
            looking_embedded: 'Embedded Systems'
        };

        const lookingFor = [];
        for (const [key, label] of Object.entries(lookingLabels)) {
            if (choices[key]) lookingFor.push(label);
        }

        return { skills, interests, experience, lookingFor };
    }
}

module.exports = UserChoices;
