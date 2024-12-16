const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'AHHHHHAHHHAHHHAHHHstayinalive',
    resave: false,
    saveUninitialized: true
}));

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'portal_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        next(); // User is authenticated
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
}


// Serve static files (e.g., CSS, JS)
app.use(express.static('public'));
app.use(express.static('models'));
// EJS Setup
app.set('view engine', 'ejs');

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register', { message: '' }); // Initial message is empty
});

// Handle Register Post Request
app.post('/register', (req, res) => {
    const { name, email, password, course } = req.body;

    // Basic validation
    if (!name || !email || !password || !course) {
        return res.render('register', { message: 'All fields are required!' });
    }

    // Check if email already exists in the database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.render('register', { message: 'An error occurred. Please try again later.' });
        }

        if (result.length > 0) {
            return res.render('register', { message: 'Email already exists. Please choose another one.' });
        }

        // Hash the password before saving
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.render('register', { message: 'An error occurred while hashing the password.' });
            }

            // Insert new user into the database
            db.query('INSERT INTO users (name, email, password, course) VALUES (?, ?, ?, ?)', 
                [name, email, hashedPassword, course], (err, result) => {
                    if (err) {
                        return res.render('register', { message: 'Registration failed. Please try again.' });
                    }
                    // Successful registration, redirect to login page
                    res.redirect('/login');
                });
        });
    });
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { message: '' }); // Initial message is empty
});

// Handle Login Post Request
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
        return res.render('login', { message: 'Both fields are required.' });
    }

    // Check if the email exists in the database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            return res.render('login', { message: 'An error occurred. Please try again later.' });
        }

        if (result.length === 0) {
            return res.render('login', { message: 'No user found with this email.' });
        }

        const user = result[0];
        // Compare the entered password with the stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.render('login', { message: 'An error occurred during login.' });
            }

            if (!isMatch) {
                return res.render('login', { message: 'Incorrect password. Please try again.' });
            }

            // Successful login, set session and redirect to dashboard
            req.session.userId = user.id;
            req.session.userName = user.name;
            req.session.userCourse = user.course;
            req.session.user = user;
            res.redirect('/dashboard');
        });
    });
});

// Dashboard Route
app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    // Fetch the user's profile data from the database
    const query = 'SELECT name, email, course FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            console.error('No user found for ID:', userId);
            return res.status(404).send('User not found');
        }

        const user = results[0];

        // Render the dashboard with the user's data
        res.render('dashboard', {
            user: {
                name: user.name,
                email: user.email,
                course: user.course,
                enrolledSubjects: [] // Update this if enrolled subjects data is needed
            }
        });
    });
});

// Assuming these helper functions interact with your database:
const { getAvailableSubjects, getEnrolledSubjects, enrollUserInSubject, unenrollUserFromSubject } = require('./models/subjects');


// GET /enrollment - Display enrollment page
app.get('/enrollment', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            console.error('User not found in session');
            return res.redirect('/login');
        }

        // Fetch subjects for the user's course
        const availableSubjects = await getAvailableSubjects(user.userCourse);

        // Fetch subjects the user is already enrolled in
        const enrolledSubjects = await getEnrolledSubjects(user.userId);

        // Pass data to the enrollment view
        res.render('enrollment', {
            user: user,
            subjects: availableSubjects,
            enrolledSubjects: enrolledSubjects
        });
    } catch (error) {
        console.error('Error loading enrollment page:', error);
        res.status(500).send('An error occurred while loading the enrollment page.');
    }
});



// POST /enroll - Handle subject enrollment
app.post('/enroll', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const subjectId = req.body.subjectId;

        if (!subjectId) {
            return res.status(400).send('No subject selected.');
        }

        const success = await enrollUserInSubject(userId, subjectId);

        if (success) {
            console.log(`User ${userId} successfully enrolled in subject ${subjectId}`);
            return res.redirect('/enrollment');
        } else {
            return res.status(400).send('Failed to enroll in the subject.');
        }
    } catch (error) {
        console.error('Error enrolling in subject:', error);
        res.status(500).send('An error occurred during enrollment.');
    }
});


// POST /unenroll - Handle subject unenrollment
app.post('/unenroll', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const subjectId = req.body.subjectId;

        if (!subjectId) {
            return res.status(400).send('No subject selected for unenrollment.');
        }

        const success = await unenrollUserFromSubject(userId, subjectId);

        if (success) {
            console.log(`User ${userId} successfully unenrolled from subject ${subjectId}`);
            return res.redirect('/enrollment');
        } else {
            return res.status(400).send('Failed to unenroll from the subject.');
        }
    } catch (error) {
        console.error('Error unenrolling from subject:', error);
        res.status(500).send('An error occurred during unenrollment.');
    }
});



// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Failed to logout');
        }
        res.redirect('/login');
    });
});

app.post('/update-profile', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { name, email, course } = req.body;

    db.query(
        'UPDATE users SET name = ?, email = ?, course = ? WHERE id = ?',
        [name, email, course, userId],
        (err) => {
            if (err) {
                console.error("Error updating user profile:", err);
                return res.status(500).send('Server Error');
            }
            res.redirect('/dashboard'); // Redirect back to dashboard after update
        }
    );
});



// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
