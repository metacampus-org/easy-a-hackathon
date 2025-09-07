# JSON Data Organization

This directory contains structured JSON data used throughout the EasyA application.

## Files

1. `courses.json`
   - Contains course configurations including learning objectives, assessment methods, and grading criteria
   - Used by curriculum management and course validation

2. `transcript-schema.json`
   - Defines the structure for student transcripts
   - Used by blockchain smart contracts for transcript verification

3. `enrollment-schema.json`
   - Defines student enrollment data structure
   - Used for tracking course enrollments and completion status

4. `ui-components.json`
   - UI component configuration for shadcn/ui
   - Defines styling and component aliases

5. `tsconfig.json`
   - TypeScript configuration for the project
   - Defines compiler options and module resolution

## Usage

These JSON files serve as the source of truth for data structures in the application. They are used by:
- Smart contracts for data validation
- API endpoints for data consistency
- Frontend components for type checking
- Testing framework for mock data

## Validation

All JSON files should be validated against their respective schemas before deployment.
The structure of these files is critical for blockchain operations and should not be modified without updating the corresponding smart contracts.
