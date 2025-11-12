// the database entity interfaces

export interface AdminUser {
admin_id?: number;
username: string;
email: string;
password_hash: string;
full_name?: string | null;
public_key?: string | null;
private_key?: string | null;
created_at?: Date;
updated_at?: Date;
}

export interface Student {
student_id?: number;
username: string;
email: string;
password_hash: string;
first_name: string;
last_name: string;
date_of_birth?: string | null;
enrollment_date?: string;
public_key?: string | null;
private_key?: string | null;
created_at?: Date;
}

export interface Program {
program_id?: number;
code: string;
name: string;
description?: string | null;
duration_years: number;
created_at?: Date;
}

export interface Course {
course_id?: number;
program_id: number;
code: string;
title: string;
credits: number;
description?: string | null;
created_at?: Date;
}

export interface LearningOutcome {
outcome_id?: number;
course_id: number;
outcome_name: string;
description?: string | null;
created_at?: Date;
}