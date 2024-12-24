/* 
CRUD Functionalities:
Create - Make User
Read - Display and get details
Update - Update Details
Delete - delete user

in models/subjects.js
Subjects display their own crud functionalities (aside from creation)
each user can update and delete from subject list making use of sql queries
*/

const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Serve static files (like videos, images, CSS, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'AHHHHHAHHHAHHHAHHHstayinalive',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('public'));
app.use(express.static('models'));
app.set('view engine', 'ejs');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase(); // Get file extension
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase(); // Clean up file name
        const uniqueSuffix = Date.now(); // Add timestamp for uniqueness
        cb(null, `${name}-${uniqueSuffix}${ext}`); // Final filename: cleanname-timestamp.ext
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            req.fileValidationError = 'Only .jpg, .jpeg, and .png files are allowed!';
            return cb(null, false); // Reject the file
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});

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

// Home Route
app.get('/', (req, res) => {
    res.render('login', { message: '' });;
});

// The register page
app.get('/register', (req, res) => {
    res.render('register', { message: '' }); // Initial message is empty
});

// Handles the register post request 
app.post('/register', (req, res) => {
    const { name, email, password, course } = req.body;

    // Initialize an error message variable
    let errorMessage = '';

    // rquires all fields
    if (!name || !email || !password || !course) {
        errorMessage = 'All fields are required!';
    } else if (password.length > 16) {
        // Additional validation for password length
        errorMessage = 'Password must not exceed 16 characters.';
    } else {
        // Additional validation for email format, supposedly we'll allow more emails pero really difficult to implement each one
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net)$/i;
        if (!emailRegex.test(email)) {
            errorMessage = 'Email must end with a valid domain (.com or .net).';
        }
    }

    // If there is an error message, rerender the register page
    if (errorMessage) {
        return res.render('register', { message: errorMessage });
    }

    // Check if email already exists in the database to not cause reduduncys or overriding
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
            db.query(
                'INSERT INTO users (name, email, password, course) VALUES (?, ?, ?, ?)', 
                [name, email, hashedPassword, course], 
                (err, result) => {
                    if (err) {
                        return res.render('register', { message: 'Registration failed. Please try again.' });
                    }
                    // Successful registration
                    res.render('register', { message: 'Registration successful!' });
                }
            );
        });
    });
});


// Login Page
app.get('/login', (req, res) => {
    res.render('login', { message: '' }); // Initial message is empty
});

// handle Login Post req
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Requires both fields
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
            req.session.address = user.address || '';
            req.session.phone_number = user.phone_number || '';;
            req.session.profile_picture = user.profile_picture
            res.redirect('/dashboard');
        });
    });
});

// Dashboard Route
app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    // Gets user's profile from the database
    const query = 'SELECT name, email, course, address, phone_number, profile_picture FROM users WHERE id = ?';

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
                address: user.address || '',
                phone_number: user.phone_number || '',
                profile_picture: user.profile_picture || '/default-profile.png',
                enrolledSubjects: [] // Update this if enrolled subjects data is needed
            }
        });
    });
});
const { getAvailableSubjects, getEnrolledSubjects, enrollUserInSubject, unenrollUserFromSubject } = require('./models/subjects');


// Display enrollment page
app.get('/enrollment', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            console.error('User not found in session');
            return res.redirect('/login');
        }

        // Fetch subjects for the user's course
        const availableSubjects = await getAvailableSubjects(user.course, user.id);

        // Fetch subjects the user is already enrolled in
        const enrolledSubjects = await getEnrolledSubjects(user.id);

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



//  Handle subject enrollment
app.post('/enroll', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id; // Get the logged-in user ID
    const subjectId = req.body.subjectId; // Get the subject ID from the form

    try {
        const success = await enrollUserInSubject(userId, subjectId);
        if (success) {
            res.redirect('/enrollment');
        } else {
            res.status(400).send('Unable to enroll in the selected subject.');
        }
    } catch (error) {
        console.error('Error enrolling user:', error);
        res.status(500).send('An error occurred while enrolling in the subject.');
    }
});


// Handle subject unenrollment
app.post('/unenroll', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id; // Get the logged-in user ID
    const subjectId = req.body.subjectId; // Get the subject ID from the form

    try {
        const success = await unenrollUserFromSubject(userId, subjectId);
        if (success) {
            res.redirect('/enrollment');
        } else {
            res.status(400).send('Unable to unenroll from the selected subject.');
        }
    } catch (error) {
        console.error('Error unenrolling user:', error);
        res.status(500).send('An error occurred while unenrolling from the subject.');
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


app.post('/dashboard/edit', upload.single('profile_picture'), (req, res) => {
    const { address, phone_number } = req.body;
    const userId = req.session.user.id;

    let profile_picture = req.session.user.profile_picture; 
    let errorMessage = '';

    // Validate phone number
    if (phone_number && !/^\+?\d{10,15}$/.test(phone_number)) {
        errorMessage = 'Phone number must be valid and between 10 to 15 digits.';
    }

    if (address.length > 50) {
        errorMessage = 'Address must not exceed 50 characters.';
    }

    // Check for upload errors from multer so we can update profile
    if (req.fileValidationError) {
        errorMessage = req.fileValidationError;
    } else if (req.file) {
        profile_picture = `/uploads/${req.file.filename}`;
    }

    // If there is an error, render the dashboard with the error message
    if (errorMessage) {
        return res.render('dashboard', {
            user: {
                name: req.session.user.name,
                email: req.session.user.email,
                course: req.session.user.course,
                address: req.session.user.address,
                phone_number: req.session.user.phone_number,
                profile_picture: req.session.user.profile_picture
            },
            errorMessage: errorMessage // Send error message to the form
        });
    }

    // Prepare fields to update
    const updates = [];
    const params = [];
    if (address) {
        updates.push('address = ?');
        params.push(address);
    }
    if (phone_number) {
        updates.push('phone_number = ?');
        params.push(phone_number);
    }
    if (req.file) {
        updates.push('profile_picture = ?');
        params.push(profile_picture);
    }

    if (updates.length === 0) {
        return res.render('dashboard', {
            user: req.session.user,
            errorMessage: 'No valid fields to update.'
        });
    }

    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.query(sql, params, (err) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.render('dashboard', {
                user: req.session.user,
                errorMessage: 'An error occurred while updating your profile.'
            });
        }

        // Update session
        if (address) req.session.user.address = address;
        if (phone_number) req.session.user.phone_number = phone_number;
        if (req.file) req.session.user.profile_picture = profile_picture;

        res.redirect('/dashboard');
    });
});

// Delete Account Route
app.post('/delete-account', (req, res) => {
    const userId = req.session.userId; // Assuming session stores the logged-in user ID

    if (!userId) {
        return res.status(403).render('dashboard', { errorMessage: 'You must be logged in to delete your account.' });
    }

    // Delete the user from the database
    const deleteQuery = 'DELETE FROM users WHERE id = ?';

    db.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting account:', err);
            return res.status(500).render('dashboard', { errorMessage: 'An error occurred while deleting your account.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).render('dashboard', { errorMessage: 'User not found.' });
        }

        // Clear the session
        req.session.destroy(err => {
            if (err) {
                console.error('Error clearing session:', err);
                return res.status(500).render('dashboard', { errorMessage: 'An error occurred while logging out.' });
            }

            // Redirect to homepage or login page after account deletion
            res.redirect('/');
        });
    });
});


module.exports = router;



// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
