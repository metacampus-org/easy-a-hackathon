// the CRUD functions

import pool from './db';
import {
AdminUser, Student, Program, Course, LearningOutcome
} from './types';

// === ADMIN USER ===
export const createAdmin = async (data: AdminUser): Promise<AdminUser> => {
const query = `
INSERT INTO admin_user
(username, email, password_hash, full_name, public_key, private_key)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *
`;
const values = [
data.username, data.email, data.password_hash,
data.full_name || null, data.public_key || null, data.private_key || null
];
const { rows } = await pool.query(query, values);
return rows[0] as AdminUser;
};

export const getAdminById = async (id: number): Promise<AdminUser | null> => {
const { rows } = await pool.query('SELECT * FROM admin_user WHERE admin_id = $1', [id]);
return (rows[0] as AdminUser) || null;
};

export const updateAdmin = async (id: number, data: Partial<AdminUser>): Promise<AdminUser | null> => {
const updates: string[] = [];
const values: any[] = [];
let paramIndex = 1;

if (data.username) { updates.push(`username = $${paramIndex++}`); values.push(data.username); }
if (data.email) { updates.push(`email = $${paramIndex++}`); values.push(data.email); }
if (data.password_hash) { updates.push(`password_hash = $${paramIndex++}`); values.push(data.password_hash); }
if (data.full_name !== undefined) { updates.push(`full_name = $${paramIndex++}`); values.push(data.full_name); }
if (data.public_key !== undefined) { updates.push(`public_key = $${paramIndex++}`); values.push(data.public_key); }
if (data.private_key !== undefined) { updates.push(`private_key = $${paramIndex++}`); values.push(data.private_key); }

if (updates.length === 0) return null;

updates.push(`updated_at = NOW()`);
values.push(id);

const query = `
UPDATE admin_user
SET ${updates.join(', ')}
WHERE admin_id = $${paramIndex}
RETURNING *
`;

const { rows } = await pool.query(query, values);
return (rows[0] as AdminUser) || null;
};

export const deleteAdmin = async (id: number): Promise<boolean> => {
const { rowCount } = await pool.query('DELETE FROM admin_user WHERE admin_id = $1', [id]);
return rowCount > 0;
};

// === STUDENT ===
export const createStudent = async (data: Student): Promise<Student> => {
const query = `
INSERT INTO student
(username, email, password_hash, first_name, last_name, date_of_birth, public_key, private_key)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *
`;
const values = [
data.username, data.email, data.password_hash,
data.first_name, data.last_name,
data.date_of_birth || null, data.public_key || null, data.private_key || null
];
const { rows } = await pool.query(query, values);
return rows[0] as Student;
};

export const getStudentById = async (id: number): Promise<Student | null> => {
const { rows } = await pool.query('SELECT * FROM student WHERE student_id = $1', [id]);
return (rows[0] as Student) || null;
};

export const updateStudent = async (id: number, data: Partial<Student>): Promise<Student | null> => {
const updates: string[] = [];
const values: any[] = [];
let paramIndex = 1;

if (data.username) { updates.push(`username = $${paramIndex++}`); values.push(data.username); }
if (data.email) { updates.push(`email = $${paramIndex++}`); values.push(data.email); }
if (data.password_hash) { updates.push(`password_hash = $${paramIndex++}`); values.push(data.password_hash); }
if (data.first_name) { updates.push(`first_name = $${paramIndex++}`); values.push(data.first_name); }
if (data.last_name) { updates.push(`last_name = $${paramIndex++}`); values.push(data.last_name); }
if (data.date_of_birth !== undefined) { updates.push(`date_of_birth = $${paramIndex++}`); values.push(data.date_of_birth); }
if (data.public_key !== undefined) { updates.push(`public_key = $${paramIndex++}`); values.push(data.public_key); }
if (data.private_key !== undefined) { updates.push(`private_key = $${paramIndex++}`); values.push(data.private_key); }

if (updates.length === 0) return null;

values.push(id);
const query = `
UPDATE student
SET ${updates.join(', ')}
WHERE student_id = $${paramIndex}
RETURNING *
`;

const { rows } = await pool.query(query, values);
return (rows[0] as Student) || null;
};

export const deleteStudent = async (id: number): Promise<boolean> => {
const { rowCount } = await pool.query('DELETE FROM student WHERE student_id = $1', [id]);
return rowCount > 0;
};

// === PROGRAM ===
export const createProgram = async (data: Program): Promise<Program> => {
const query = `
INSERT INTO program (code, name, description, duration_years)
VALUES ($1, $2, $3, $4)
RETURNING *
`;
const values = [data.code, data.name, data.description || null, data.duration_years];
const { rows } = await pool.query(query, values);
return rows[0] as Program;
};

export const getProgramById = async (id: number): Promise<Program | null> => {
const { rows } = await pool.query('SELECT * FROM program WHERE program_id = $1', [id]);
return (rows[0] as Program) || null;
};

export const updateProgram = async (id: number, data: Partial<Program>): Promise<Program | null> => {
const updates: string[] = [];
const values: any[] = [];
let paramIndex = 1;

if (data.code) { updates.push(`code = $${paramIndex++}`); values.push(data.code); }
if (data.name) { updates.push(`name = $${paramIndex++}`); values.push(data.name); }
if (data.description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(data.description); }
if (data.duration_years) { updates.push(`duration_years = $${paramIndex++}`); values.push(data.duration_years); }

if (updates.length === 0) return null;

values.push(id);
const query = `
UPDATE program
SET ${updates.join(', ')}
WHERE program_id = $${paramIndex}
RETURNING *
`;

const { rows } = await pool.query(query, values);
return (rows[0] as Program) || null;
};

export const deleteProgram = async (id: number): Promise<boolean> => {
const { rowCount } = await pool.query('DELETE FROM program WHERE program_id = $1', [id]);
return rowCount > 0;
};

// === COURSE ===
export const createCourse = async (data: Course): Promise<Course> => {
const query = `
INSERT INTO course (program_id, code, title, credits, description)
VALUES ($1, $2, $3, $4, $5)
RETURNING *
`;
const values = [data.program_id, data.code, data.title, data.credits, data.description || null];
const { rows } = await pool.query(query, values);
return rows[0] as Course;
};

export const getCourseById = async (id: number): Promise<Course | null> => {
const { rows } = await pool.query('SELECT * FROM course WHERE course_id = $1', [id]);
return (rows[0] as Course) || null;
};

export const updateCourse = async (id: number, data: Partial<Course>): Promise<Course | null> => {
const updates: string[] = [];
const values: any[] = [];
let paramIndex = 1;

if (data.program_id) { updates.push(`program_id = $${paramIndex++}`); values.push(data.program_id); }
if (data.code) { updates.push(`code = $${paramIndex++}`); values.push(data.code); }
if (data.title) { updates.push(`title = $${paramIndex++}`); values.push(data.title); }
if (data.credits) { updates.push(`credits = $${paramIndex++}`); values.push(data.credits); }
if (data.description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(data.description); }

if (updates.length === 0) return null;

values.push(id);
const query = `
UPDATE course
SET ${updates.join(', ')}
WHERE course_id = $${paramIndex}
RETURNING *
`;

const { rows } = await pool.query(query, values);
return (rows[0] as Course) || null;
};

export const deleteCourse = async (id: number): Promise<boolean> => {
const { rowCount } = await pool.query('DELETE FROM course WHERE course_id = $1', [id]);
return rowCount > 0;
};

// === LEARNING OUTCOME ===
export const createOutcome = async (data: LearningOutcome): Promise<LearningOutcome> => {
const query = `
INSERT INTO student_learning_outcome (course_id, outcome_name, description)
VALUES ($1, $2, $3)
RETURNING *
`;
const values = [data.course_id, data.outcome_name, data.description || null];
const { rows } = await pool.query(query, values);
return rows[0] as LearningOutcome;
};

export const getOutcomeById = async (id: number): Promise<LearningOutcome | null> => {
const { rows } = await pool.query('SELECT * FROM student_learning_outcome WHERE outcome_id = $1', [id]);
return (rows[0] as LearningOutcome) || null;
};

export const updateOutcome = async (id: number, data: Partial<LearningOutcome>): Promise<LearningOutcome | null> => {
const updates: string[] = [];
const values: any[] = [];
let paramIndex = 1;

if (data.course_id) { updates.push(`course_id = $${paramIndex++}`); values.push(data.course_id); }
if (data.outcome_name) { updates.push(`outcome_name = $${paramIndex++}`); values.push(data.outcome_name); }
if (data.description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(data.description); }

if (updates.length === 0) return null;

values.push(id);
const query = `
UPDATE student_learning_outcome
SET ${updates.join(', ')}
WHERE outcome_id = $${paramIndex}
RETURNING *
`;

const { rows } = await pool.query(query, values);
return (rows[0] as LearningOutcome) || null;
};

export const deleteOutcome = async (id: number): Promise<boolean> => {
const { rowCount } = await pool.query('DELETE FROM student_learning_outcome WHERE outcome_id = $1', [id]);
return rowCount > 0;
};
