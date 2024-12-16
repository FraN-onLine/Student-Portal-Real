const db = require('../database'); // Adjust the path as needed

// Get available subjects for a specific course
async function getAvailableSubjects(course, userId) {
    try {
        const [rows] = await db.query(`
            SELECT s.*
            FROM subjects s
            WHERE s.course = ?
            AND s.id NOT IN (
                SELECT subject_id FROM enrolled_subjects WHERE user_id = ?
            )`,
            [course, userId]
        );
        return rows;
    } catch (error) {
        console.error('Error fetching available subjects:', error);
        throw error;
    }
}


// Get subjects a user is currently enrolled in
async function getEnrolledSubjects(userId) {
    try {
        const [rows] = await db.query(`
            SELECT s.* 
            FROM subjects s
            JOIN enrolled_subjects e ON s.id = e.subject_id
            WHERE e.user_id = ?`, [userId]);
        return rows;
    } catch (error) {
        console.error('Error fetching enrolled subjects:', error);
        throw error;
    }
}

// Enroll a user in a specific subject
async function enrollUserInSubject(userId, subjectId) {
    try {
        const [result] = await db.query(
            'INSERT INTO enrolled_subjects (user_id, subject_id) VALUES (?, ?)',
            [userId, subjectId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error enrolling user in subject:', error);
        throw error;
    }
}

// Unenroll a user from a specific subject
async function unenrollUserFromSubject(userId, subjectId) {
    try {
        const [result] = await db.query(
            'DELETE FROM enrolled_subjects WHERE user_id = ? AND subject_id = ?',
            [userId, subjectId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error unenrolling user from subject:', error);
        throw error;
    }
}

module.exports = {
    getAvailableSubjects,
    getEnrolledSubjects,
    enrollUserInSubject,
    unenrollUserFromSubject
};
