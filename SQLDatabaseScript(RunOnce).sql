
-- CREATE DATABASE portal_db;

USE portal_db;

/*
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    course VARCHAR(50) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT 'default-profile.png'
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Major', 'Minor') NOT NULL,
    course VARCHAR(10) NOT NULL,
    course_code VARCHAR(50) NOT NULL
);

INSERT INTO subjects (name, type, course, course_code) VALUES
('Database Systems', 'Major', 'BSCS', 'CMPSC 116'),
('Data Structures', 'Major', 'BSCS', 'CMPSC 131'),
('Understanding The Self', 'Minor', 'BSCS', 'SOCSC 03'),
('Reading Visual Arts', 'Minor', 'BSCS', 'HUM 12' ),
('Database Systems', 'Major', 'BSIT', 'IT 16'),
('Understanding The Self', 'Minor', 'BSIT', 'SOCSC 03'),
('Reading Visual Arts', 'Minor', 'BSIT', 'HUM12');


CREATE TABLE enrolled_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);
*/

/*
ALTER TABLE users 
ADD COLUMN address VARCHAR(255),
ADD COLUMN phone_number VARCHAR(15); -- To store the file path of the uploaded image
*/
alter table users modify  profile_picture VARCHAR(255) DEFAULT 'public/uploads/default-profile.png'
