require('dotenv').config({ path: 'C:\\Users\\user\\luct-reporting-system\\.env' });

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://luct-reporting-system-sxdo.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '57606583',
  database: process.env.DB_NAME || 'luct_reporting',
  charset: 'utf8mb4'
});

// ==================== PRE-LOADED DATA ====================

// Pre-loaded Users Data
let registeredUsers = [
  // Students
  {
    id: 1001,
    username: 'tankiso',
    email: 'tankiso.ramabolu@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Tankiso Ramabolu',
    phone: '+266 1234 5678',
    department: 'FICT',
    studentNumber: 'ST2024001',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Software Development',
    createdAt: new Date().toISOString()
  },
  {
    id: 1002,
    username: 'tumelo',
    email: 'tumelo.mapa@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Tumelo Mapa',
    phone: '+266 1234 5679',
    department: 'FICT',
    studentNumber: 'ST2024002',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Networking',
    createdAt: new Date().toISOString()
  },
  {
    id: 1003,
    username: 'majara',
    email: 'majara.tsita@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Majara Tsita',
    phone: '+266 1234 5680',
    department: 'FICT',
    studentNumber: 'ST2024003',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Multimedia',
    createdAt: new Date().toISOString()
  },
  {
    id: 1004,
    username: 'silase',
    email: 'silase.molefi@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Silase Molefi',
    phone: '+266 1234 5681',
    department: 'FICT',
    studentNumber: 'ST2024004',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Database Systems',
    createdAt: new Date().toISOString()
  },
  {
    id: 1005,
    username: 'tumelos',
    email: 'tumelo.suoane@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Tumelo Suoane',
    phone: '+266 1234 5682',
    department: 'FICT',
    studentNumber: 'ST2024005',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Web Development',
    createdAt: new Date().toISOString()
  },

  // Lecturers
  {
    id: 2001,
    username: 'liteboho',
    email: 'liteboho.molaoa@limkokwing.ac.ls',
    password: 'password123',
    role: 'lecturer',
    fullName: 'Dr. Liteboho Molaoa',
    phone: '+266 1234 5683',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '2001',
    qualification: 'PhD in Computer Science',
    specialization: 'Web Technologies',
    createdAt: new Date().toISOString()
  },
  {
    id: 2002,
    username: 'palesa',
    email: 'palesa.ntho@limkokwing.ac.ls',
    password: 'password123',
    role: 'lecturer',
    fullName: 'Dr. Palesa Ntho',
    phone: '+266 1234 5684',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '2002',
    qualification: 'MSc in Networking',
    specialization: 'Data Communication',
    createdAt: new Date().toISOString()
  },
  {
    id: 2003,
    username: 'tsekiso',
    email: 'tsekiso.thokoane@limkokwing.ac.ls',
    password: 'password123',
    role: 'lecturer',
    fullName: 'Dr. Tsekiso Thokoane',
    phone: '+266 1234 5685',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '2003',
    qualification: 'MSc in Multimedia',
    specialization: 'Digital Media',
    createdAt: new Date().toISOString()
  },
  {
    id: 2004,
    username: 'takura',
    email: 'takura.bhila@limkokwing.ac.ls',
    password: 'password123',
    role: 'lecturer',
    fullName: 'Dr. Takura Bhila',
    phone: '+266 1234 5686',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '2004',
    qualification: 'PhD in Software Engineering',
    specialization: 'Object-Oriented Programming',
    createdAt: new Date().toISOString()
  },
  {
    id: 2005,
    username: 'masechaba',
    email: 'masechaba.sechaba@limkokwing.ac.ls',
    password: 'password123',
    role: 'lecturer',
    fullName: 'Dr. Masechaba Sechaba',
    phone: '+266 1234 5687',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '2005',
    qualification: 'MBA in Business Technology',
    specialization: 'Organizational Management',
    createdAt: new Date().toISOString()
  },

  // PRL
  {
    id: 3001,
    username: 'nthatisi',
    email: 'nthatisi.mathe@limkokwing.ac.ls',
    password: 'password123',
    role: 'prl',
    fullName: 'Nthatisi Mathe',
    phone: '+266 1234 5688',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '3001',
    qualification: 'PhD in Information Systems',
    specialization: 'Academic Quality Assurance',
    createdAt: new Date().toISOString()
  },

  // PL
  {
    id: 4001,
    username: 'udak',
    email: 'udak.ebisoh@limkokwing.ac.ls',
    password: 'password123',
    role: 'pl',
    fullName: 'Udak Ebisoh',
    phone: '+266 1234 5689',
    department: 'FICT',
    studentNumber: null,
    yearOfStudy: null,
    program: null,
    employeeId: '4001',
    qualification: 'PhD in Computer Science',
    specialization: 'Program Leadership',
    createdAt: new Date().toISOString()
  }
];

// Pre-loaded Courses Data
const availableCourses = [
  {
    id: 1,
    code: 'DIWA2110',
    name: 'Web Application Development',
    lecturer_name: 'Dr. Liteboho Molaoa',
    lecturer_id: 2001,
    credits: 3,
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 25,
    description: 'Learn modern web development with React and Node.js. Build responsive web applications and understand full-stack development principles.',
    course_outline: 'Course Outline:\n\nWeek 1: Introduction to Web Development\nWeek 2: HTML5 & CSS3 Fundamentals\nWeek 3: JavaScript Basics\nWeek 4: React Introduction\nWeek 5: Node.js Backend Development\nWeek 6: Database Integration\nWeek 7: Project Development\nWeek 8: Deployment and Testing',
    classes: [
      { id: 1, name: 'Morning Class', venue: 'Room 101', time: 'Mon 09:00-11:00' },
      { id: 2, name: 'Afternoon Class', venue: 'Room 102', time: 'Tue 14:00-16:00' }
    ]
  },
  {
    id: 2,
    code: 'BIDC1210',
    name: 'Data Communication and Networking',
    lecturer_name: 'Dr. Palesa Ntho',
    lecturer_id: 2002,
    credits: 3,
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 30,
    description: 'Fundamentals of data communication and network protocols. Understand network architectures and communication technologies.',
    course_outline: 'Course Outline:\n\nWeek 1: Network Fundamentals\nWeek 2: OSI Model\nWeek 3: TCP/IP Protocol Suite\nWeek 4: Network Devices\nWeek 5: Wireless Networks\nWeek 6: Network Security\nWeek 7: Practical Networking\nWeek 8: Network Management',
    classes: [
      { id: 3, name: 'Networking Lab', venue: 'Lab 201', time: 'Wed 10:00-12:00' }
    ]
  },
  {
    id: 3,
    code: 'BIMT2110',
    name: 'Multimedia Technology',
    lecturer_name: 'Dr. Tsekiso Thokoane',
    lecturer_id: 2003,
    credits: 3,
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 28,
    description: 'Introduction to multimedia systems and technologies. Learn about digital media creation and manipulation.',
    course_outline: 'Course Outline:\n\nWeek 1: Multimedia Fundamentals\nWeek 2: Digital Imaging\nWeek 3: Audio Processing\nWeek 4: Video Editing\nWeek 5: Animation Techniques\nWeek 6: Interactive Media\nWeek 7: Multimedia Project\nWeek 8: Portfolio Development',
    classes: [
      { id: 4, name: 'Multimedia Lab', venue: 'Lab 301', time: 'Tue 10:00-12:00' }
    ]
  },
  {
    id: 4,
    code: 'BIIC2110',
    name: 'Object Oriented Programming',
    lecturer_name: 'Dr. Takura Bhila',
    lecturer_id: 2004,
    credits: 3,
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 32,
    description: 'Object-oriented programming concepts and practices using modern programming languages and design patterns.',
    course_outline: 'Course Outline:\n\nWeek 1: OOP Principles\nWeek 2: Classes and Objects\nWeek 3: Inheritance & Polymorphism\nWeek 4: Encapsulation & Abstraction\nWeek 5: Design Patterns\nWeek 6: Exception Handling\nWeek 7: Advanced OOP Concepts\nWeek 8: Project Implementation',
    classes: [
      { id: 5, name: 'Programming Lab', venue: 'Room 401', time: 'Thu 10:00-12:00' }
    ]
  },
  {
    id: 5,
    code: 'BICT2210',
    name: 'Concepts of Organizations',
    lecturer_name: 'Dr. Masechaba Sechaba',
    lecturer_id: 2005,
    credits: 3,
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 22,
    description: 'Understanding organizational structures and behavior in technology-driven environments.',
    course_outline: 'Course Outline:\n\nWeek 1: Organizational Theory\nWeek 2: Business Structures\nWeek 3: Organizational Behavior\nWeek 4: Leadership & Management\nWeek 5: Change Management\nWeek 6: IT in Organizations\nWeek 7: Case Studies\nWeek 8: Strategic Planning',
    classes: [
      { id: 6, name: 'Theory Class', venue: 'Lab 1', time: 'Mon 14:00-15:00' }
    ]
  }
];

// Other data storage
let studentModules = [];
let ratingsData = [];
let attendanceRecords = [];
let classAttendanceRecords = [];
let weeklyTopics = [];
let lecturerReports = [];
let classRepresentatives = [
  { student_id: 1001, course_id: 1, course_code: 'DIWA2110', student_name: 'Tankiso Ramabolu' },
  { student_id: 1002, course_id: 2, course_code: 'BIDC1210', student_name: 'Tumelo Mapa' }
];

// Auto-register some sample modules for testing
studentModules.push(
  {
    id: 1,
    student_id: 1001,
    course_id: 1,
    course_code: 'DIWA2110',
    course_name: 'Web Application Development',
    lecturer_name: 'Dr. Liteboho Molaoa',
    class_time: 'Mon 09:00-11:00',
    venue: 'Room 101',
    course_outline: availableCourses[0].course_outline,
    status: 'registered',
    registration_date: new Date().toISOString()
  },
  {
    id: 2,
    student_id: 1001,
    course_id: 2,
    course_code: 'BIDC1210',
    course_name: 'Data Communication and Networking',
    lecturer_name: 'Dr. Palesa Ntho',
    class_time: 'Wed 10:00-12:00',
    venue: 'Lab 201',
    course_outline: availableCourses[1].course_outline,
    status: 'registered',
    registration_date: new Date().toISOString()
  }
);

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed');
    console.log('📋 Using secure demo mode with pre-loaded data...');
  } else {
    console.log('✅ Connected to MySQL Database');
    initializeDatabase();
  }
});

// Database Initialization
function initializeDatabase() {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('student', 'lecturer', 'prl', 'pl') NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      department VARCHAR(100),
      student_number VARCHAR(20) UNIQUE,
      year_of_study INT,
      program VARCHAR(100),
      employee_id VARCHAR(20) UNIQUE,
      qualification VARCHAR(100),
      specialization VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) UNIQUE NOT NULL,
      credits INT DEFAULT 3,
      description TEXT,
      course_outline TEXT,
      faculty VARCHAR(50),
      program VARCHAR(100),
      class_name VARCHAR(50),
      lecturer_id INT,
      lecturer_name VARCHAR(100),
      total_registered INT DEFAULT 0,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS student_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      course_id INT,
      course_code VARCHAR(20),
      course_name VARCHAR(100),
      lecturer_name VARCHAR(100),
      class_time VARCHAR(50),
      venue VARCHAR(100),
      course_outline TEXT,
      status ENUM('registered', 'completed') DEFAULT 'registered',
      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS lecturer_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lecturer_id INT,
      lecturer_name VARCHAR(100),
      faculty_name VARCHAR(100),
      class_name VARCHAR(100),
      week_of_reporting VARCHAR(20),
      date_of_lecture DATE,
      course_name VARCHAR(100),
      course_code VARCHAR(20),
      actual_students_present INT,
      total_registered_students INT,
      venue VARCHAR(100),
      scheduled_lecture_time VARCHAR(50),
      topic_taught TEXT,
      learning_outcomes TEXT,
      recommendations TEXT,
      status ENUM('Pending', 'Approved') DEFAULT 'Pending',
      prl_feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      student_name VARCHAR(100),
      course_id INT,
      course_code VARCHAR(20),
      date DATE,
      status ENUM('Present', 'Absent', 'Late', 'Excused') DEFAULT 'Present',
      marked_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS class_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      course_code VARCHAR(20),
      date DATE,
      attendance_list JSON,
      total_students INT,
      present_count INT,
      marked_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS weekly_topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT,
      course_code VARCHAR(20),
      week VARCHAR(20),
      topics_covered TEXT,
      learning_outcomes TEXT,
      submitted_by VARCHAR(100),
      submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS class_representatives (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      student_name VARCHAR(100),
      course_id INT,
      course_code VARCHAR(20),
      assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      user_name VARCHAR(100),
      user_role VARCHAR(20),
      target_id INT,
      target_type ENUM('lecture', 'course', 'lecturer'),
      rating INT CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  createTables.forEach((query) => {
    db.query(query, (err) => {
      if (err) console.error('Table creation error:', err.message);
    });
  });
}

// Database Middleware
app.use((req, res, next) => {
  if (db.state === 'connected') {
    req.db = db;
  } else {
    req.db = {
      query: (sql, params, callback) => {
        if (callback) callback(null, []);
      }
    };
  }
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Access token required' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luct-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role Middleware
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// FIXED Validation functions
const validateStudentNumber = (studentNumber) => {
  return /^ST\d{7}$/.test(studentNumber); // ST followed by 7 digits
};

const validateEmployeeId = (employeeId) => {
  return /^\d+$/.test(employeeId); // Digits only
};

// ==================== USER MANAGEMENT ENDPOINTS ====================

// Get all users (for admin purposes)
app.get('/api/users', authenticateToken, (req, res) => {
  // Return users without passwords
  const usersWithoutPasswords = registeredUsers.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});

// Add new user
app.post('/api/users', authenticateToken, (req, res) => {
  const { username, email, password, role, fullName, phone, department, studentNumber, employeeId, qualification, specialization, program } = req.body;

  // Validation
  if (!username || !email || !password || !role || !fullName) {
    return res.status(400).json({ error: 'Required fields: username, email, password, role, fullName' });
  }

  // FIXED: Student number validation - ST followed by 7 digits
  if (role === 'student') {
    if (!studentNumber) {
      return res.status(400).json({ error: 'Student number required' });
    }
    if (!validateStudentNumber(studentNumber)) {
      return res.status(400).json({ error: 'Student number must be like ST1234567 (ST followed by 7 digits)' });
    }
  }

  // Validate employee ID (digits only)
  if (['lecturer', 'prl', 'pl'].includes(role)) {
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID required' });
    }
    if (!validateEmployeeId(employeeId)) {
      return res.status(400).json({ error: 'Employee ID must contain digits only' });
    }
  }

  // Check if user already exists
  const existingUser = registeredUsers.find(user => user.username === username || user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    role,
    fullName,
    phone: phone || '',
    department: department || 'FICT',
    studentNumber: studentNumber || null,
    employeeId: employeeId || null,
    program: program || null,
    qualification: qualification || 'N/A',
    specialization: specialization || 'N/A',
    createdAt: new Date().toISOString()
  };

  registeredUsers.push(newUser);
  
  // Return user without password
  const { password: _, ...userResponse } = newUser;
  
  res.status(201).json({ 
    message: 'User added successfully!',
    user: userResponse
  });
});

// Delete user
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  
  const userIndex = registeredUsers.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = registeredUsers.splice(userIndex, 1)[0];
  
  // Also remove user's modules and other data
  studentModules = studentModules.filter(module => module.student_id !== userId);
  classRepresentatives = classRepresentatives.filter(rep => rep.student_id !== userId);
  
  res.json({ 
    message: 'User deleted successfully!',
    user: deletedUser
  });
});

// ==================== COURSE MANAGEMENT ENDPOINTS ====================

// Get all courses
app.get('/api/courses', authenticateToken, (req, res) => {
  res.json(availableCourses);
});

// Add new course
app.post('/api/courses', authenticateToken, (req, res) => {
  const { code, name, lecturer_name, credits, description, faculty, program, class_name, total_registered } = req.body;

  if (!code || !name || !lecturer_name) {
    return res.status(400).json({ error: 'Course code, name, and lecturer are required' });
  }

  // Check if course already exists
  const existingCourse = availableCourses.find(course => course.code === code);
  if (existingCourse) {
    return res.status(400).json({ error: 'Course with this code already exists' });
  }

  const newCourse = {
    id: availableCourses.length + 1,
    code,
    name,
    lecturer_name,
    lecturer_id: Date.now(), // Generate temporary ID
    credits: credits || 3,
    faculty: faculty || 'FICT',
    program: program || 'BSc in Information Technology',
    class_name: class_name || 'BSCITY2S1',
    total_registered: total_registered || 0,
    description: description || 'Course description not available.',
    course_outline: 'Course outline will be available soon.',
    classes: [
      { id: 1, name: 'Main Class', venue: 'To be assigned', time: 'To be scheduled' }
    ]
  };

  availableCourses.push(newCourse);
  
  res.status(201).json({ 
    message: 'Course added successfully!',
    course: newCourse
  });
});

// Delete course
app.delete('/api/courses/:id', authenticateToken, (req, res) => {
  const courseId = parseInt(req.params.id);
  
  const courseIndex = availableCourses.findIndex(course => course.id === courseId);
  
  if (courseIndex === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const deletedCourse = availableCourses.splice(courseIndex, 1)[0];
  
  // Also remove course modules and representatives
  studentModules = studentModules.filter(module => module.course_id !== courseId);
  classRepresentatives = classRepresentatives.filter(rep => rep.course_id !== courseId);
  
  res.json({ 
    message: 'Course deleted successfully!',
    course: deletedCourse
  });
});

// ==================== FIXED AUTHENTICATION ENDPOINTS ====================
app.post('/api/register-enhanced', async (req, res) => {
  const { username, email, password, role, fullName, phone, department, studentNumber, yearOfStudy, employeeId, qualification, specialization, program } = req.body;

  console.log('📝 Registration attempt:', { username, email, role });

  // Validation
  if (!username || !email || !password || !role || !fullName || !phone || !department) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // FIXED: Student number validation - ST followed by 7 digits
  if (role === 'student') {
    if (!studentNumber) {
      return res.status(400).json({ error: 'Student number required' });
    }
    if (!validateStudentNumber(studentNumber)) {
      return res.status(400).json({ error: 'Student number must be like ST1234567 (ST followed by 7 digits)' });
    }
  }

  // Validate employee ID (digits only)
  if (['lecturer', 'prl', 'pl'].includes(role)) {
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID required' });
    }
    if (!validateEmployeeId(employeeId)) {
      return res.status(400).json({ error: 'Employee ID must contain digits only' });
    }
  }

  // Check if user already exists
  const existingUser = registeredUsers.find(user => user.username === username || user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    role,
    fullName,
    phone,
    department,
    studentNumber: studentNumber || null,
    employeeId: employeeId || null,
    program: program || null,
    yearOfStudy: yearOfStudy || null,
    qualification: qualification || 'N/A',
    specialization: specialization || 'N/A',
    createdAt: new Date().toISOString()
  };

  // Add to registered users
  registeredUsers.push(newUser);
  
  console.log('✅ User registered:', username);

  // Return user without password
  const userResponse = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    fullName: newUser.fullName,
    phone: newUser.phone,
    department: newUser.department,
    studentNumber: newUser.studentNumber,
    employeeId: newUser.employeeId,
    program: newUser.program
  };
  
  return res.status(201).json({ 
    message: 'Registration successful! You can now login with your credentials.',
    user: userResponse 
  });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Login attempt:', { username });

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Check in registered users first
  const user = registeredUsers.find(u => u.username === username);
  
  if (!user) {
    console.log('❌ User not found:', username);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Check password
  if (user.password !== password) {
    console.log('❌ Invalid password for user:', username);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  console.log('✅ Login successful for:', username);

  // Create user response without password
  const userResponse = {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    department: user.department,
    studentNumber: user.studentNumber,
    employeeId: user.employeeId,
    program: user.program
  };

  const token = jwt.sign({ 
    id: user.id, 
    role: user.role,
    username: user.username 
  }, process.env.JWT_SECRET || 'luct-secret', { expiresIn: '24h' });
  
  res.json({ 
    token, 
    user: userResponse,
    message: `Login successful as ${user.role}`
  });
});

// ==================== STUDENT ENDPOINTS ====================
app.get('/api/student/available-courses', authenticateToken, requireRole(['student']), (req, res) => {
  res.json(availableCourses);
});

// Register for a module
app.post('/api/student/register-module', authenticateToken, requireRole(['student']), (req, res) => {
  const { course_id, course_code, course_name, lecturer_name } = req.body;
  
  if (!course_id || !course_code || !course_name) {
    return res.status(400).json({ error: 'Course information required' });
  }

  // Check if already registered
  const existingModule = studentModules.find(
    module => module.student_id === req.user.id && module.course_id === course_id
  );

  if (existingModule) {
    return res.status(400).json({ error: 'You are already registered for this course' });
  }

  // Find course details
  const course = availableCourses.find(c => c.id === parseInt(course_id));
  
  // Create new module registration
  const newModule = {
    id: Date.now(),
    student_id: req.user.id,
    course_id: parseInt(course_id),
    course_code: course_code,
    course_name: course_name,
    lecturer_name: lecturer_name || 'Not Assigned',
    class_time: course?.classes[0]?.time || 'To be scheduled',
    venue: course?.classes[0]?.venue || 'To be assigned',
    course_outline: course?.course_outline || 'Course outline will be available soon.',
    status: 'registered',
    registration_date: new Date().toISOString()
  };

  studentModules.push(newModule);
  
  console.log('✅ Module registered:', { 
    student: req.user.username, 
    course: course_code
  });

  res.json({ 
    message: 'Module registered successfully!',
    module: newModule
  });
});

// Delete a module
app.delete('/api/student/delete-module', authenticateToken, requireRole(['student']), (req, res) => {
  const { module_id } = req.body;
  
  if (!module_id) {
    return res.status(400).json({ error: 'Module ID required' });
  }

  const moduleIndex = studentModules.findIndex(
    module => module.id === parseInt(module_id) && module.student_id === req.user.id
  );

  if (moduleIndex === -1) {
    return res.status(404).json({ error: 'Module not found or access denied' });
  }

  const deletedModule = studentModules.splice(moduleIndex, 1)[0];
  
  console.log('🗑️ Module deleted:', { 
    student: req.user.username, 
    course: deletedModule.course_code
  });

  res.json({ 
    message: 'Module unregistered successfully!',
    deleted_module: deletedModule
  });
});

// Get student's registered modules
app.get('/api/student/modules', authenticateToken, requireRole(['student']), (req, res) => {
  const userModules = studentModules.filter(module => module.student_id === req.user.id);
  res.json(userModules);
});

// Check if student is a class representative
app.get('/api/student/classrep-status', authenticateToken, requireRole(['student']), (req, res) => {
  const isClassRep = classRepresentatives.some(rep => rep.student_id === req.user.id);
  
  res.json({
    isClassRep: isClassRep,
    representatives: isClassRep ? classRepresentatives : []
  });
});

// ==================== LECTURER ENDPOINTS ====================

// Get lecturer's classes
app.get('/api/lecturer/classes', authenticateToken, requireRole(['lecturer']), (req, res) => {
  const userClasses = availableCourses.filter(course => course.lecturer_id === req.user.id);
  res.json(userClasses);
});

// Submit lecturer report
app.post('/api/lecturer/submit-report', authenticateToken, requireRole(['lecturer']), (req, res) => {
  const {
    faculty_name,
    class_name,
    week_of_reporting,
    date_of_lecture,
    course_name,
    course_code,
    actual_students_present,
    total_registered_students,
    venue,
    scheduled_lecture_time,
    topic_taught,
    learning_outcomes,
    recommendations
  } = req.body;

  // Validation
  if (!faculty_name || !class_name || !week_of_reporting || !date_of_lecture || !course_name || !course_code || 
      !actual_students_present || !total_registered_students || !venue || !scheduled_lecture_time || !topic_taught) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  const newReport = {
    id: lecturerReports.length + 1,
    lecturer_id: req.user.id,
    lecturer_name: req.user.fullName,
    faculty_name,
    class_name,
    week_of_reporting,
    date_of_lecture,
    course_name,
    course_code,
    actual_students_present: parseInt(actual_students_present),
    total_registered_students: parseInt(total_registered_students),
    venue,
    scheduled_lecture_time,
    topic_taught,
    learning_outcomes: learning_outcomes || '',
    recommendations: recommendations || '',
    status: 'Pending',
    prl_feedback: '',
    created_at: new Date().toISOString()
  };

  lecturerReports.push(newReport);
  
  console.log('✅ Lecturer report submitted:', { 
    lecturer: req.user.username, 
    course: course_code,
    week: week_of_reporting
  });

  res.json({ 
    message: 'Report submitted successfully!',
    report: newReport
  });
});

// Get lecturer's reports
app.get('/api/lecturer/reports', authenticateToken, requireRole(['lecturer']), (req, res) => {
  const userReports = lecturerReports.filter(report => report.lecturer_id === req.user.id);
  res.json(userReports);
});

// Lecturer timetable
app.get('/api/lecturer/timetable', authenticateToken, requireRole(['lecturer']), (req, res) => {
  const userCourses = availableCourses.filter(course => course.lecturer_id === req.user.id);
  
  const timetableData = [
    ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ['08:00-09:00', '', '', '', '', ''],
    ['09:00-10:00', '', '', '', '', ''],
    ['10:00-11:00', '', '', '', '', ''],
    ['11:00-12:00', '', '', '', '', ''],
    ['14:00-15:00', '', '', '', '', ''],
    ['15:00-16:00', '', '', '', '', '']
  ];

  // Fill in the timetable with actual classes
  userCourses.forEach(course => {
    course.classes.forEach(cls => {
      const dayMap = {
        'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5
      };
      
      const timeMap = {
        '09:00-11:00': 2,
        '10:00-12:00': 3,
        '14:00-16:00': 5
      };

      const day = cls.time.split(' ')[0];
      const timeRange = cls.time.split(' ')[1];
      
      if (dayMap[day] && timeMap[timeRange]) {
        timetableData[timeMap[timeRange]][dayMap[day]] = `${course.code}\\n${cls.venue}`;
      }
    });
  });

  const ws = xlsx.utils.aoa_to_sheet(timetableData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Lecturer Timetable');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=lecturer_timetable_${req.user.username}.xlsx`);
  res.send(buffer);
});

// ==================== PRL ENDPOINTS ====================

// Get all courses for PRL
app.get('/api/prl/courses', authenticateToken, requireRole(['prl']), (req, res) => {
  res.json(availableCourses);
});

// Get reports for PRL review
app.get('/api/prl/reports', authenticateToken, requireRole(['prl']), (req, res) => {
  res.json(lecturerReports);
});

// PRL feedback on reports
app.post('/api/prl/feedback', authenticateToken, requireRole(['prl']), (req, res) => {
  const { report_id, feedback } = req.body;
  
  if (!report_id || !feedback) {
    return res.status(400).json({ error: 'Report ID and feedback are required' });
  }

  const reportIndex = lecturerReports.findIndex(report => report.id === parseInt(report_id));
  
  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  lecturerReports[reportIndex].prl_feedback = feedback;
  lecturerReports[reportIndex].status = 'Approved';
  
  res.json({ 
    message: 'Feedback submitted successfully!',
    report: lecturerReports[reportIndex]
  });
});

// PRL Monitoring Data
app.get('/api/prl/monitoring', authenticateToken, requireRole(['prl']), (req, res) => {
  const monitoringData = [
    {
      course_name: 'Web Application Development',
      lecturer: 'Dr. Liteboho Molaoa',
      attendance_rate: 85.5,
      performance_score: 'B+',
      avg_rating: 4.2,
      total_students: 25,
      reports_submitted: 8,
      last_updated: '2024-01-15'
    },
    {
      course_name: 'Data Communication and Networking',
      lecturer: 'Dr. Palesa Ntho',
      attendance_rate: 92.0,
      performance_score: 'A-',
      avg_rating: 4.5,
      total_students: 30,
      reports_submitted: 7,
      last_updated: '2024-01-14'
    },
    {
      course_name: 'Multimedia Technology',
      lecturer: 'Dr. Tsekiso Thokoane',
      attendance_rate: 78.0,
      performance_score: 'B',
      avg_rating: 3.8,
      total_students: 28,
      reports_submitted: 6,
      last_updated: '2024-01-13'
    },
    {
      course_name: 'Object Oriented Programming',
      lecturer: 'Dr. Takura Bhila',
      attendance_rate: 88.0,
      performance_score: 'A',
      avg_rating: 4.3,
      total_students: 32,
      reports_submitted: 9,
      last_updated: '2024-01-16'
    },
    {
      course_name: 'Concepts of Organizations',
      lecturer: 'Dr. Masechaba Sechaba',
      attendance_rate: 82.0,
      performance_score: 'B+',
      avg_rating: 4.0,
      total_students: 22,
      reports_submitted: 5,
      last_updated: '2024-01-12'
    }
  ];
  res.json(monitoringData);
});

// PRL Classes Overview
app.get('/api/prl/classes', authenticateToken, requireRole(['prl']), (req, res) => {
  const classesData = availableCourses.map(course => ({
    id: course.id,
    code: course.code,
    name: course.name,
    lecturer: course.lecturer_name,
    program: course.program,
    class_name: course.class_name,
    total_students: course.total_registered,
    schedule: course.classes.map(cls => `${cls.time} - ${cls.venue}`).join(', '),
    status: 'Active'
  }));
  res.json(classesData);
});

// ==================== PL ENDPOINTS ====================

// Get all courses for PL
app.get('/api/pl/courses', authenticateToken, requireRole(['pl']), (req, res) => {
  res.json(availableCourses);
});

// Get PRL reports for PL
app.get('/api/pl/reports', authenticateToken, requireRole(['pl']), (req, res) => {
  const approvedReports = lecturerReports.filter(report => report.status === 'Approved');
  res.json(approvedReports);
});

// PL Monitoring Data
app.get('/api/pl/monitoring', authenticateToken, requireRole(['pl']), (req, res) => {
  const monitoringData = [
    {
      program: 'BSc in Information Technology',
      total_courses: 12,
      total_students: 450,
      total_lecturers: 15,
      average_attendance: 85.2,
      average_rating: 4.1,
      completion_rate: '92%',
      last_updated: '2024-01-15'
    },
    {
      program: 'BSc in Software Engineering with Multimedia',
      total_courses: 10,
      total_students: 320,
      total_lecturers: 12,
      average_attendance: 87.5,
      average_rating: 4.3,
      completion_rate: '94%',
      last_updated: '2024-01-14'
    },
    {
      program: 'Diploma in Information Technology',
      total_courses: 8,
      total_students: 280,
      total_lecturers: 10,
      average_attendance: 83.0,
      average_rating: 3.9,
      completion_rate: '89%',
      last_updated: '2024-01-13'
    }
  ];
  res.json(monitoringData);
});

// PL Classes Overview
app.get('/api/pl/classes', authenticateToken, requireRole(['pl']), (req, res) => {
  const classesData = [
    {
      program: 'BSc in Information Technology',
      classes: [
        { name: 'BSCITY1S1', total_students: 120, active_courses: 6 },
        { name: 'BSCITY1S2', total_students: 115, active_courses: 6 },
        { name: 'BSCITY2S1', total_students: 110, active_courses: 5 },
        { name: 'BSCITY2S2', total_students: 105, active_courses: 5 }
      ]
    },
    {
      program: 'BSc in Software Engineering with Multimedia',
      classes: [
        { name: 'BSSEM1S1', total_students: 85, active_courses: 5 },
        { name: 'BSSEM1S2', total_students: 80, active_courses: 5 },
        { name: 'BSSEM2S1', total_students: 75, active_courses: 5 }
      ]
    }
  ];
  res.json(classesData);
});

// PL Lecturers Overview
app.get('/api/pl/lecturers', authenticateToken, requireRole(['pl']), (req, res) => {
  const lecturers = registeredUsers.filter(user => user.role === 'lecturer').map(lecturer => ({
    id: lecturer.id,
    name: lecturer.fullName,
    employee_id: lecturer.employeeId,
    qualification: lecturer.qualification,
    specialization: lecturer.specialization,
    courses_assigned: availableCourses.filter(course => course.lecturer_id === lecturer.id).length,
    total_students: availableCourses.filter(course => course.lecturer_id === lecturer.id)
      .reduce((sum, course) => sum + course.total_registered, 0),
    average_rating: 4.2,
    status: 'Active'
  }));
  res.json(lecturers);
});

// ==================== RATING SYSTEM (FOR ALL ROLES) ====================

// Submit rating
app.post('/api/ratings', authenticateToken, (req, res) => {
  const { target_id, target_type, rating, comment } = req.body;
  
  if (!target_id || !target_type || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Valid target ID, target type, and rating (1-5) are required' });
  }

  const newRating = {
    id: ratingsData.length + 1,
    user_id: req.user.id,
    user_name: req.user.fullName,
    user_role: req.user.role,
    target_id: parseInt(target_id),
    target_type: target_type,
    rating: parseInt(rating),
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  ratingsData.push(newRating);
  
  console.log('✅ Rating submitted:', { 
    user: req.user.username, 
    target_type: target_type,
    rating: rating
  });

  res.json({ 
    message: 'Rating submitted successfully!',
    rating: newRating
  });
});

// Get ratings
app.get('/api/ratings', authenticateToken, (req, res) => {
  const userRatings = ratingsData.filter(rating => rating.user_id === req.user.id);
  res.json(userRatings);
});

// Get ratings summary for PRL and PL
app.get('/api/ratings/summary', authenticateToken, requireRole(['prl', 'pl']), (req, res) => {
  const summary = availableCourses.map(course => {
    const courseRatings = ratingsData.filter(r => r.target_type === 'course' && r.target_id === course.id);
    const avgRating = courseRatings.length > 0 
      ? courseRatings.reduce((sum, r) => sum + r.rating, 0) / courseRatings.length 
      : 0;
    
    return {
      course_id: course.id,
      course_code: course.code,
      course_name: course.name,
      lecturer: course.lecturer_name,
      total_ratings: courseRatings.length,
      average_rating: Math.round(avgRating * 10) / 10,
      ratings_breakdown: {
        5: courseRatings.filter(r => r.rating === 5).length,
        4: courseRatings.filter(r => r.rating === 4).length,
        3: courseRatings.filter(r => r.rating === 3).length,
        2: courseRatings.filter(r => r.rating === 2).length,
        1: courseRatings.filter(r => r.rating === 1).length
      }
    };
  });
  
  res.json(summary);
});

// ==================== ATTENDANCE SYSTEM ====================
app.post('/api/student/mark-attendance', authenticateToken, requireRole(['student']), (req, res) => {
  const { course_id, date, present, student_name } = req.body;
  
  if (!course_id || !date) {
    return res.status(400).json({ error: 'Course ID and date are required' });
  }

  // Find course details
  const module = studentModules.find(m => m.course_id === course_id && m.student_id === req.user.id);
  if (!module) {
    return res.status(404).json({ error: 'Course not found or not registered' });
  }

  // Create attendance record
  const attendanceRecord = {
    id: attendanceRecords.length + 1,
    student_id: req.user.id,
    student_name: student_name || req.user.username,
    course_id: parseInt(course_id),
    course_code: module.course_code,
    date: date,
    status: present ? 'Present' : 'Absent',
    marked_by: 'Self',
    created_at: new Date().toISOString()
  };

  attendanceRecords.push(attendanceRecord);
  
  console.log('✅ Attendance marked:', { 
    student: req.user.username, 
    course: module.course_code,
    date: date,
    status: attendanceRecord.status
  });

  res.json({ 
    message: 'Attendance marked successfully!',
    record: attendanceRecord
  });
});

// Get student's attendance records
app.get('/api/student/attendance', authenticateToken, requireRole(['student']), (req, res) => {
  const userAttendance = attendanceRecords.filter(record => record.student_id === req.user.id);
  
  // Add some sample records for demo
  if (userAttendance.length === 0) {
    const sampleRecords = [
      {
        id: 1,
        student_id: req.user.id,
        student_name: req.user.username,
        course_id: 1,
        course_code: 'DIWA2110',
        date: '2024-01-15',
        status: 'Present',
        marked_by: 'Self'
      },
      {
        id: 2,
        student_id: req.user.id,
        student_name: req.user.username,
        course_id: 2,
        course_code: 'BIDC1210',
        date: '2024-01-16',
        status: 'Present',
        marked_by: 'Class Rep'
      }
    ];
    userAttendance.push(...sampleRecords);
  }
  
  res.json(userAttendance);
});

// Generate attendance report
app.get('/api/student/attendance-report', authenticateToken, requireRole(['student']), (req, res) => {
  const userAttendance = attendanceRecords.filter(record => record.student_id === req.user.id);
  
  const reportData = [
    ['Date', 'Course Code', 'Course Name', 'Status', 'Marked By'],
    ...userAttendance.map(record => [
      record.date,
      record.course_code,
      studentModules.find(m => m.course_id === record.course_id)?.course_name || 'N/A',
      record.status,
      record.marked_by
    ])
  ];

  const ws = xlsx.utils.aoa_to_sheet(reportData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Attendance Report');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');
  res.send(buffer);
});

// Student timetable
app.get('/api/student/timetable', authenticateToken, requireRole(['student']), (req, res) => {
  const userModules = studentModules.filter(module => module.student_id === req.user.id);
  
  const timetableData = [
    ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ['08:00-09:00', '', '', '', '', ''],
    ['09:00-10:00', '', '', '', '', ''],
    ['10:00-11:00', '', '', '', '', ''],
    ['11:00-12:00', '', '', '', '', ''],
    ['14:00-15:00', '', '', '', '', ''],
    ['15:00-16:00', '', '', '', '', '']
  ];

  // Fill in the timetable with registered courses
  userModules.forEach(module => {
    const course = availableCourses.find(c => c.id === module.course_id);
    if (course && course.classes) {
      course.classes.forEach(cls => {
        const dayMap = {
          'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5
        };
        
        const timeMap = {
          '09:00-11:00': 2,
          '10:00-12:00': 3,
          '14:00-16:00': 5
        };

        const day = cls.time.split(' ')[0];
        const timeRange = cls.time.split(' ')[1];
        
        if (dayMap[day] && timeMap[timeRange]) {
          timetableData[timeMap[timeRange]][dayMap[day]] = `${course.code}\\n${cls.venue}`;
        }
      });
    }
  });

  const ws = xlsx.utils.aoa_to_sheet(timetableData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Student Timetable');
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=student_timetable_${req.user.username}.xlsx`);
  res.send(buffer);
});

// ==================== MONITORING AND REPORTS ====================
app.get('/api/monitoring', authenticateToken, (req, res) => {
  const monitoringData = [
    {
      course_name: 'Web Application Development',
      attendance_rate: 85.5,
      performance_score: 'B+',
      avg_rating: 4.2,
      last_updated: '2024-01-15'
    },
    {
      course_name: 'Data Communication and Networking',
      attendance_rate: 92.0,
      performance_score: 'A-',
      avg_rating: 4.5,
      last_updated: '2024-01-14'
    },
    {
      course_name: 'Multimedia Technology',
      attendance_rate: 78.0,
      performance_score: 'B',
      avg_rating: 3.8,
      last_updated: '2024-01-13'
    }
  ];
  res.json(monitoringData);
});

// ==================== NEW MISSING ENDPOINTS ====================

// Reports endpoint for ReportsView component
app.get('/api/reports', authenticateToken, (req, res) => {
  let userReports = [];
  
  if (req.user.role === 'lecturer') {
    userReports = lecturerReports.filter(report => report.lecturer_id === req.user.id);
  } else if (req.user.role === 'prl' || req.user.role === 'pl') {
    userReports = lecturerReports;
  } else if (req.user.role === 'student') {
    // Students might see some report data, or return empty
    userReports = [];
  }
  
  res.json(userReports);
});

// Get report history for a lecturer
app.get('/api/reports/history', authenticateToken, requireRole(['lecturer']), (req, res) => {
  const { lecturer_id } = req.query;
  const userReports = lecturerReports.filter(report => report.lecturer_id === parseInt(lecturer_id) || report.lecturer_id === req.user.id);
  res.json(userReports);
});

// Get class details
app.get('/api/class-details/:classId', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.classId);
  const classItem = availableCourses.find(course => 
    course.classes && course.classes.some(cls => cls.id === classId)
  );
  
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  res.json({
    total_registered_students: classItem.total_registered,
    venue: classItem.classes[0]?.venue || 'Not assigned',
    scheduled_time: classItem.classes[0]?.time || 'Not scheduled'
  });
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: db.state === 'connected' ? 'Connected' : 'Demo Mode',
    pre_loaded_data: {
      users: registeredUsers.length,
      courses: availableCourses.length,
      student_modules: studentModules.length,
      lecturer_reports: lecturerReports.length,
      ratings: ratingsData.length
    }
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 LUCT Professional University System running on port ${PORT}`);
  console.log(`📊 Database: ${db.state === 'connected' ? 'MySQL Connected' : 'Demo Mode with Pre-loaded Data'}`);
  console.log(`👥 Pre-loaded Users: ${registeredUsers.length} users`);
  console.log(`📚 Pre-loaded Courses: ${availableCourses.length} courses`);
  console.log(`🎓 Faculty: FICT - Faculty of Information and Communication Technology`);
  console.log(`🎯 Program: BSc in Information Technology (BSCITY2S1)`);
  console.log(`🔐 Test Login: Use any pre-loaded username with password "password123"`);
  console.log(`✅ All System Modules: Student, Lecturer, PRL, PL - Fully Functional`);
  console.log(`⭐ Rating System: Available for all roles`);
  console.log(`📅 Timetables: Available for students and lecturers`);
  console.log(`📋 Reporting: Complete lecturer reporting system`);
  console.log(`🏫 Limkokwing University of Creative Technology - Lesotho Campus`);
});
