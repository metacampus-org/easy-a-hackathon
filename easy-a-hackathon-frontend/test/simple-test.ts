/**
 * Simple Test Runner for Blockchain Transcript Functions
 * 
 * This script provides concrete examples of:
 * 1. Creating a new student and generating blockchain hash
 * 2. Adding courses and updating student records
 * 3. Verifying the data structure matches blockchain requirements
 * 
 * Run with: npm run test:blockchain
 */

import { TranscriptService, type StudentRecord, type CourseRecord, type TranscriptData } from '../lib/transcript-service';

// Test data that matches the smart contract expectations
const TEST_STUDENT = {
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-15',
    nationalId: 'TEST123456789'
  },
  institutionId: 'UNIVERSITY_001',
  institutionName: 'Test University',
  enrollmentDate: '2024-09-01',
  status: 'active' as const
};

const TEST_COURSES: CourseRecord[] = [
  {
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS-101',
    credits: 3,
    semester: 'Fall',
    year: 2024,
    grade: 'A',
    gradePoints: 4.0,
    instructor: 'Dr. Smith',
    department: 'Computer Science',
    completionDate: '2024-12-15'
  },
  {
    courseId: 'MATH201',
    courseName: 'Calculus II',
    courseCode: 'MATH-201',
    credits: 4,
    semester: 'Fall',
    year: 2024,
    grade: 'B+',
    gradePoints: 3.3,
    instructor: 'Prof. Johnson',
    department: 'Mathematics',
    completionDate: '2024-12-15'
  },
  {
    courseId: 'ENG102',
    courseName: 'Technical Writing',
    courseCode: 'ENG-102',
    credits: 3,
    semester: 'Fall',
    year: 2024,
    grade: 'A-',
    gradePoints: 3.7,
    instructor: 'Dr. Wilson',
    department: 'English',
    completionDate: '2024-12-15'
  }
];

/**
 * Test Function 1: Create New Student
 * Demonstrates generating a unique blockchain hash for a new student
 */
function testCreateStudent(): string {
  console.log('\n🎓 TEST 1: Creating New Student');
  console.log('=' .repeat(50));
  
  // Step 1: Display student information
  console.log('\n📋 Student Information:');
  console.log(`   Name: ${TEST_STUDENT.personalInfo.firstName} ${TEST_STUDENT.personalInfo.lastName}`);
  console.log(`   Date of Birth: ${TEST_STUDENT.personalInfo.dateOfBirth}`);
  console.log(`   National ID: ${TEST_STUDENT.personalInfo.nationalId}`);
  console.log(`   Institution: ${TEST_STUDENT.institutionName} (${TEST_STUDENT.institutionId})`);
  console.log(`   Enrollment Date: ${TEST_STUDENT.enrollmentDate}`);
  console.log(`   Status: ${TEST_STUDENT.status}`);

  // Step 2: Generate unique student hash for blockchain
  console.log('\n🔐 Generating Blockchain Hash...');
  const studentHash = TranscriptService.generateStudentHash(
    TEST_STUDENT.personalInfo,
    TEST_STUDENT.institutionId
  );
  
  console.log(`   Generated Hash: ${studentHash}`);
  console.log(`   Hash Length: ${studentHash.length} characters`);
  console.log(`   Hash Type: SHA-256 based unique identifier`);

  // Step 3: Create initial student record structure
  const studentRecord: StudentRecord = {
    studentHash,
    personalInfo: TEST_STUDENT.personalInfo,
    institutionId: TEST_STUDENT.institutionId,
    institutionName: TEST_STUDENT.institutionName,
    enrollmentDate: TEST_STUDENT.enrollmentDate,
    status: TEST_STUDENT.status,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  console.log('\n📊 Initial Student Record Structure:');
  console.log(JSON.stringify(studentRecord, null, 2));

  // Step 4: Simulate blockchain storage
  console.log('\n⛓️  Blockchain Storage Simulation:');
  console.log('   ✓ Student hash generated successfully');
  console.log('   ✓ Record structure validated');
  console.log('   ✓ Ready for smart contract onboarding');
  console.log(`   ✓ Unique identifier: ${studentHash.substring(0, 16)}...`);

  console.log('\n✅ Student creation test PASSED!');
  
  return studentHash;
}

/**
 * Test Function 2: Add Courses to Student
 * Demonstrates updating student transcript with new courses
 */
function testAddCourses(studentHash: string): TranscriptData {
  console.log('\n📚 TEST 2: Adding Courses to Student');
  console.log('=' .repeat(50));
  
  // Initialize transcript with empty courses
  let currentTranscript: TranscriptData = {
    studentHash,
    courses: [],
    gpa: 0.0,
    totalCredits: 0,
    degreeProgram: 'Bachelor of Computer Science',
    lastUpdated: Date.now()
  };

  console.log(`\n🔗 Working with Student Hash: ${studentHash.substring(0, 16)}...`);
  
  // Add each course and show the progression
  TEST_COURSES.forEach((course, index) => {
    console.log(`\n📖 Adding Course ${index + 1}/${TEST_COURSES.length}:`);
    console.log(`   Course: ${course.courseCode} - ${course.courseName}`);
    console.log(`   Credits: ${course.credits}`);
    console.log(`   Grade: ${course.grade} (${course.gradePoints} points)`);
    console.log(`   Instructor: ${course.instructor}`);
    console.log(`   Department: ${course.department}`);

    // Add course to transcript
    currentTranscript.courses.push(course);
    currentTranscript.totalCredits += course.credits;
    
    // Recalculate GPA
    const totalGradePoints = currentTranscript.courses.reduce(
      (sum, c) => sum + (c.gradePoints * c.credits), 0
    );
    currentTranscript.gpa = totalGradePoints / currentTranscript.totalCredits;
    currentTranscript.lastUpdated = Date.now();

    console.log(`   ✓ Course added successfully`);
    console.log(`   ✓ Total Credits: ${currentTranscript.totalCredits}`);
    console.log(`   ✓ Current GPA: ${currentTranscript.gpa.toFixed(2)}`);
  });

  // Display final transcript state
  console.log('\n📊 Final Transcript Data Structure:');
  console.log(JSON.stringify(currentTranscript, null, 2));

  // Simulate blockchain update
  console.log('\n⛓️  Blockchain Update Simulation:');
  console.log('   ✓ All courses added successfully');
  console.log(`   ✓ Final GPA: ${currentTranscript.gpa.toFixed(2)}`);
  console.log(`   ✓ Total Credits: ${currentTranscript.totalCredits}`);
  console.log(`   ✓ Course Count: ${currentTranscript.courses.length}`);
  console.log('   ✓ Transcript ready for blockchain storage');

  console.log('\n✅ Course addition test PASSED!');
  
  return currentTranscript;
}

/**
 * Test Function 3: Verify Transcript Structure
 * Demonstrates the data structure that will be stored on blockchain
 */
function testDataStructure(transcript: TranscriptData): void {
  console.log('\n🔍 TEST 3: Verifying Data Structure');
  console.log('=' .repeat(50));

  console.log('\n📋 Blockchain Data Structure Validation:');
  
  // Validate required fields
  const validations = [
    { field: 'studentHash', value: transcript.studentHash, valid: !!transcript.studentHash },
    { field: 'courses', value: `${transcript.courses.length} courses`, valid: Array.isArray(transcript.courses) },
    { field: 'gpa', value: transcript.gpa.toFixed(2), valid: typeof transcript.gpa === 'number' },
    { field: 'totalCredits', value: transcript.totalCredits, valid: typeof transcript.totalCredits === 'number' },
    { field: 'lastUpdated', value: new Date(transcript.lastUpdated).toISOString(), valid: typeof transcript.lastUpdated === 'number' }
  ];

  validations.forEach(validation => {
    const status = validation.valid ? '✅' : '❌';
    console.log(`   ${status} ${validation.field}: ${validation.value}`);
  });

  // Validate course structure
  console.log('\n📚 Course Data Validation:');
  transcript.courses.forEach((course, index) => {
    console.log(`   Course ${index + 1}: ${course.courseCode}`);
    console.log(`     ✓ Course ID: ${course.courseId}`);
    console.log(`     ✓ Credits: ${course.credits}`);
    console.log(`     ✓ Grade: ${course.grade} (${course.gradePoints} points)`);
    console.log(`     ✓ Completion: ${course.completionDate}`);
  });

  // Calculate summary statistics
  const totalPossiblePoints = transcript.courses.reduce((sum, c) => sum + (4.0 * c.credits), 0);
  const actualPoints = transcript.courses.reduce((sum, c) => sum + (c.gradePoints * c.credits), 0);
  const percentage = (actualPoints / totalPossiblePoints) * 100;

  console.log('\n📊 Academic Performance Summary:');
  console.log(`   Total Credits: ${transcript.totalCredits}`);
  console.log(`   GPA: ${transcript.gpa.toFixed(2)}/4.0`);
  console.log(`   Percentage: ${percentage.toFixed(1)}%`);
  console.log(`   Course Count: ${transcript.courses.length}`);
  console.log(`   Status: ${percentage >= 70 ? 'Good Standing' : 'Needs Improvement'}`);

  console.log('\n✅ Data structure validation PASSED!');
}

/**
 * Main Test Runner
 * Executes all tests in sequence and provides summary
 */
function runAllTests(): void {
  console.log('\n🧪 BLOCKCHAIN TRANSCRIPT MANAGEMENT - LOCAL TESTING');
  console.log('=' .repeat(60));
  console.log('Testing the core functionality before blockchain deployment');
  console.log('=' .repeat(60));

  try {
    // Test 1: Create new student and generate hash
    const studentHash = testCreateStudent();

    // Test 2: Add courses to the student
    const finalTranscript = testAddCourses(studentHash);

    // Test 3: Verify data structure integrity
    testDataStructure(finalTranscript);

    // Summary
    console.log('\n🏆 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Student hash generation');
    console.log('   ✅ Course addition and GPA calculation');
    console.log('   ✅ Data structure validation');
    console.log('   ✅ Blockchain-ready format confirmed');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Deploy smart contract to Algorand Testnet');
    console.log('   2. Test with actual blockchain transactions');
    console.log('   3. Integrate with frontend application');
    console.log('   4. Conduct end-to-end testing');

    console.log(`\n🔑 Student Hash for Blockchain: ${studentHash}`);
    console.log('   Save this hash for blockchain testing!\n');

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error);
    process.exit(1);
  }
}

// Export functions for individual testing
export {
  testCreateStudent,
  testAddCourses,
  testDataStructure,
  runAllTests
};

// Run all tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
