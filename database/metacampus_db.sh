-- add to npm install to deploy docs
-- npm install pg
-- npm install --save-dev @types/pg
================================

CREATE DATABASE IF NOT EXISTS academy
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- SQL Server
-- CREATE DATABASE academy;
-- GO

-- Switch to the new database
-- USE academy; -- MySQL / MariaDB
\c academy -- PostgreSQL (psql)
-- GO -- SQL Server

-- -------------------------------------------------
-- 2. Drop tables in reverse dependency order
-- -------------------------------------------------
DROP TABLE IF EXISTS student_learning_outcome;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS program;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS student_learning_outcome

-- Admin Users ---------------------------------------
CREATE TABLE admin_user (
admin_id BIGINT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
full_name VARCHAR(100) NULL,
public_key VARCHAR(500) NULL, -- e.g. PEM or JWT public key
private_key VARCHAR(500) NULL, -- encrypted or server-side only
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students ------------------------------------------
CREATE TABLE student (
student_id BIGINT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
date_of_birth DATE NULL,
enrollment_date DATE DEFAULT (CURRENT_DATE),
public_key VARCHAR(500) NULL,
private_key VARCHAR(500) NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs ------------------------------------------
CREATE TABLE program (
program_id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(20) NOT NULL UNIQUE,
name VARCHAR(150) NOT NULL,
description TEXT NULL,
duration_years SMALLINT NOT NULL CHECK (duration_years > 0),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses -------------------------------------------
CREATE TABLE course (
course_id BIGINT PRIMARY KEY AUTO_INCREMENT,
program_id BIGINT NOT NULL,
code VARCHAR(20) NOT NULL,
title VARCHAR(200) NOT NULL,
credits SMALLINT NOT NULL CHECK (credits > 0),
description TEXT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_course_program
FOREIGN KEY (program_id) REFERENCES program(program_id)
ON DELETE RESTRICT ON UPDATE CASCADE,

CONSTRAINT uq_program_code UNIQUE (program_id, code)
);

-- Student Learning Outcomes -------------------------
CREATE TABLE student_learning_outcome (
outcome_id BIGINT PRIMARY KEY AUTO_INCREMENT,
course_id BIGINT NOT NULL,
outcome_name VARCHAR(150) NOT NULL,
description TEXT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_outcome_course
FOREIGN KEY (course_id) REFERENCES course(course_id)
ON DELETE CASCADE ON UPDATE CASCADE,

CONSTRAINT uq_course_outcome UNIQUE (course_id, outcome_name)
);

-- -------------------------------------------------
-- 4. Indexes
-- -------------------------------------------------
CREATE INDEX idx_course_program ON course(program_id);
CREATE INDEX idx_student_email ON student(email);
CREATE INDEX idx_admin_email ON admin_user(email);
CREATE INDEX idx_outcome_course ON student_learning_outcome(course_id);

-- -------------------------------------------------
-- 5. Sample data (uncomment to insert)
-- -------------------------------------------------
/*
-- Admins
INSERT INTO admin_user (username, email, password_hash, full_name, public_key, private_key)
VALUES ('admin1', 'admin@example.edu', 'hashed123', 'Alice Admin', '-----BEGIN PUBLIC KEY-----...', '-----BEGIN PRIVATE KEY-----...');

-- Students
INSERT INTO student (username, email, password_hash, first_name, last_name, public_key, private_key)
VALUES
('jdoe', 'john.doe@student.edu', 'hash456', 'John', 'Doe', '-----BEGIN PUBLIC KEY-----...', NULL),
('asmith', 'anna.smith@student.edu', 'hash789', 'Anna', 'Smith', NULL, NULL);

-- Programs
INSERT INTO program (code, name, description, duration_years)
VALUES ('CS', 'Computer Science', 'Bachelor of Science', 4);

-- Courses
INSERT INTO course (program_id, code, title, credits, description)
VALUES (1, 'CS101', 'Intro to Programming', 3, 'Python basics');

-- Learning Outcomes
INSERT INTO student_learning_outcome (course_id, outcome_name, description)
VALUES
(1, 'Write basic Python scripts', 'Students will be able to create scripts that read input and produce output.'),
(1, 'Understand control structures', 'Master if/else, loops, and functions.');
*/