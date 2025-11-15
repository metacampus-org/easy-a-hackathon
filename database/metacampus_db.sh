
#!/bin/bash
sudo apt install postgresql postgresql-contrib   
sudo systemctl start postgresql   
sudo systemctl status postgresql   
sudo -u postgres psql -c "CREATE DATABASE metacampus_db;"
sudo -u postgres psql -c "CREATE USER user WITH PASSWORD password;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE metacampus_db TO user;"

sudo -i -u postgres psql -d metacampus_db

DROP TABLE IF EXISTS student_learning_outcome;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS program;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS admin_user;
DROP TABLE IF EXISTS student_learning_outcome;

CREATE TABLE admin_user (
admin_id BIGINT PRIMARY KEY,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(255) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
full_name VARCHAR(100) NULL,
public_key VARCHAR(500) NULL, 
private_key VARCHAR(500) NULL, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student (
student_id BIGINT PRIMARY KEY,
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

CREATE TABLE program (
program_id BIGINT PRIMARY KEY,
code VARCHAR(20) NOT NULL UNIQUE,
name VARCHAR(150) NOT NULL,
description TEXT NULL,
duration_years SMALLINT NOT NULL CHECK (duration_years > 0),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course (
course_id BIGINT PRIMARY KEY,
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

CREATE TABLE student_learning_outcome (
outcome_id BIGINT PRIMARY KEY,
course_id BIGINT NOT NULL,
outcome_name VARCHAR(150) NOT NULL,
description TEXT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_outcome_course
FOREIGN KEY (course_id) REFERENCES course(course_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT uq_course_outcome UNIQUE (course_id, outcome_name)
);

CREATE INDEX idx_course_program ON course(program_id);
CREATE INDEX idx_student_email ON student(email);
CREATE INDEX idx_admin_email ON admin_user(email);
CREATE INDEX idx_outcome_course ON student_learning_outcome(course_id);

/* Sample data (uncomment to insert)
-- Admins
INSERT INTO admin_user (admin_id, username, email, password_hash, full_name, public_key, private_key)
VALUES ('001','admin1', 'admin@example.edu', 'hashed123', 'Alice Admin', '-----BEGIN PUBLIC KEY-----...', '-----BEGIN PRIVATE KEY-----...');

-- Students
INSERT INTO student (student_id, username, email, password_hash, first_name, last_name, public_key, private_key)
VALUES
('001', 'jdoe', 'john.doe@student.edu', 'hash456', 'John', 'Doe', '-----BEGIN PUBLIC KEY-----...', NULL),
('002', 'asmith', 'anna.smith@student.edu', 'hash789', 'Anna', 'Smith', NULL, NULL);

-- Programs
INSERT INTO program (program_id, code, name, description, duration_years)
VALUES ('001', 'CS', 'Computer Science', 'Bachelor of Science', 4);

-- Courses
INSERT INTO course (course_id, program_id, code, title, credits, description)
VALUES (1, '001', 'CS101', 'Intro to Programming', 3, 'Python basics');

-- Learning Outcomes
INSERT INTO student_learning_outcome (outcome_id, course_id, outcome_name, description)
VALUES
(1, 1, 'Write basic Python scripts', 'Students will be able to create scripts that read input and produce output.'),
(2, 1, 'Understand control structures', 'Master if/else, loops, and functions.');
*/