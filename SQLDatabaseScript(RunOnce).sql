CREATE DATABASE portal_db;

USE portal_db;

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
    course VARCHAR(10) NOT NULL
);

INSERT INTO subjects (name, type, course) VALUES
('CMPSC 116 Database Systems', 'Major', 'BSCS'),
('CMPSC 131 Data Structures', 'Major', 'BSCS'),
('SOCSC 03 Understanding The Self', 'Minor', 'BSCS'),
('HUM 12 Reading Visual Arts', 'Minor', 'BSCS'),
('IT 16 Database Systems', 'Major', 'BSIT'),
('SOCSC 03 Understanding The Self', 'Minor', 'BSIT'),
('HUM 12 Reading Visual Arts', 'Minor', 'BSIT');


CREATE TABLE enrolled_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);
