const db = require('../database');


// Get available subjects for a specific course
async function getAvailableSubjects(course) {
    const query = 'SELECT * FROM subjects WHERE course = ?';
    try {
        const [rows] = await db.promise().query(query, [course]);
        return rows;
    } catch (error) {
        console.error('Error fetching available subjects:', error);
        throw error;
    }
}


// Get subjects a user is currently enrolled in
async function getEnrolledSubjects(userId) {
    const query = `
        SELECT s.* 
        FROM subjects s
        INNER JOIN enrolled_subjects e ON s.id = e.subject_id
        WHERE e.user_id = ?`;
    try {
        const [rows] = await db.promise().query(query, [userId]);
        return rows;
    } catch (error) {
        console.error('Error fetching enrolled subjects:', error);
        throw error;
    }
}

async function enrollUserInSubject(userId, subjectId) {
    const query = 'INSERT INTO enrolled_subjects (user_id, subject_id) VALUES (?, ?)';
    try {
        const [result] = await db.promise().query(query, [userId, subjectId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error enrolling user in subject:', error);
        return false;
    }
}



module.exports = {
    getAvailableSubjects,
    getEnrolledSubjects,
};
