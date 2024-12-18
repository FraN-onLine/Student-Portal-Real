
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
-- alter table users modify  profile_picture VARCHAR(255) DEFAULT 'public/uploads/default-profile.png';
-- alter table users modify  profile_picture VARCHAR(255) DEFAULT '/uploads/default-profile.png';

INSERT INTO subjects (name, type, course, course_code) VALUES
('Hitler and his world domination', 'Major', 'BSCS', 'CMPSC 420'),
('Get Freaky with Kim Jong Un', 'Major', 'BSCS', 'CMPSC 696'),
('Was 9-11 real?', 'Major', 'BSIT', 'IT 088'),
('Bomb Creation', 'Major', 'BSIT', 'IT 999');


INSERT INTO subjects (name, type, course, course_code) VALUES
('How to Fix a Refridgerator', 'Major', 'BSIT', 'IT 01'),
('Airconditioners and How they work', 'Major', 'BSIT', 'IT 02'),
('How to take a shower and the importance of it', 'Major', 'BSCS', 'CMPSC 01'),
('How to deal with having no job', 'Major', 'BSCS', 'CMPSC 02'),
('McDonalds Fundamentals', 'Major', 'BSCS', 'CMPSC 100'),
('Digital Design', 'Major', 'BSCS', 'CMPSC 121'),
('Discrete Structures', 'Major', 'BSCS', 'CMPSC 134')
