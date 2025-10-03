import React, { useState, useEffect } from 'react';
import './EnhancedReportForm.css'; // Use a separate CSS file for styling

const EnhancedReportForm = ({ user }) => {
  const [formData, setFormData] = useState({
    faculty_name: 'FICT - Faculty of Information and Communication Technology',
    class_name: '',
    week: '',
    lecture_date: '',
    course_name: '',
    course_code: '',
    lecturer_name: user.fullName || '',
    students_present: '',
    total_registered_students: '',
    venue: '',
    scheduled_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: '',
    supporting_docs: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [weekOptions] = useState(Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`));
  const [reportHistory, setReportHistory] = useState([]);
  const API_BASE_URL = 'https://luct-reporting-backend-x1cx.onrender.com'; // Match with App.js

  const facultyOptions = [
    'FICT - Faculty of Information and Communication Technology',
  ];

  useEffect(() => {
    loadDropdownOptions();
    loadReportHistory();
  }, []);

  const loadDropdownOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const coursesResponse = await fetch(`${API_BASE_URL}/api/pl/courses?faculty=FICT`, { headers });
      if (coursesResponse.ok) setCourseOptions(await coursesResponse.json());

      const classesResponse = await fetch(`${API_BASE_URL}/api/lecturer/classes?faculty=FICT`, { headers });
      if (classesResponse.ok) setClassOptions(await classesResponse.json());
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadReportHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/lecturer/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) setReportHistory(await response.json());
    } catch (error) {
      console.error('Error loading report history:', error);
    }
  };

  const loadClassDetails = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/class-details/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          total_registered_students: data.total_registered_students || '',
          venue: data.venue || '',
          scheduled_time: data.scheduled_time || '',
        }));
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'class_name' && value) {
      const selectedClass = classOptions.find(c => c.name === value);
      if (selectedClass) {
        loadClassDetails(selectedClass.id);
        setFormData(prev => ({
          ...prev,
          course_name: selectedClass.course_name || '',
          course_code: selectedClass.course_code || '',
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date('2025-10-01').toISOString().split('T')[0]; // Current date

    if (!formData.faculty_name) newErrors.faculty_name = 'Faculty name is required';
    if (!formData.class_name) newErrors.class_name = 'Class name is required';
    if (!formData.week) newErrors.week = 'Week of reporting is required';
    if (!formData.lecture_date) newErrors.lecture_date = 'Lecture date is required';
    else if (new Date(formData.lecture_date) > new Date(today))
      newErrors.lecture_date = 'Lecture date cannot be in the future';
    if (!formData.course_name) newErrors.course_name = 'Course name is required';
    if (!formData.course_code) newErrors.course_code = 'Course code is required';
    if (!formData.lecturer_name) newErrors.lecturer_name = 'Lecturer name is required';

    if (!formData.students_present || formData.students_present <= 0)
      newErrors.students_present = 'Valid number of students present is required';
    if (formData.students_present > (formData.total_registered_students || Infinity))
      newErrors.students_present = 'Students present cannot exceed total registered students';
    if (!formData.total_registered_students || formData.total_registered_students <= 0)
      newErrors.total_registered_students = 'Total registered students is required';

    if (!formData.venue) newErrors.venue = 'Venue is required';
    if (!formData.scheduled_time) newErrors.scheduled_time = 'Scheduled time is required';
    if (!formData.topic_taught) newErrors.topic_taught = 'Topic taught is required';
    if (!formData.learning_outcomes) newErrors.learning_outcomes = 'Learning outcomes are required';
    if (!formData.recommendations) newErrors.recommendations = 'Recommendations are required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const reportData = {
        faculty_name: formData.faculty_name,
        class_name: formData.class_name,
        week_of_reporting: formData.week,
        date_of_lecture: formData.lecture_date,
        course_name: formData.course_name,
        course_code: formData.course_code,
        actual_students_present: parseInt(formData.students_present),
        total_registered_students: parseInt(formData.total_registered_students),
        venue: formData.venue,
        scheduled_lecture_time: formData.scheduled_time,
        topic_taught: formData.topic_taught,
        learning_outcomes: formData.learning_outcomes,
        recommendations: formData.recommendations,
      };

      const response = await fetch(`${API_BASE_URL}/api/lecturer/submit-report`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        alert('Report submitted successfully!');
        setFormData({
          faculty_name: 'FICT - Faculty of Information and Communication Technology',
          class_name: '',
          week: '',
          lecture_date: '',
          course_name: '',
          course_code: '',
          lecturer_name: user.fullName || '',
          students_present: '',
          total_registered_students: '',
          venue: '',
          scheduled_time: '',
          topic_taught: '',
          learning_outcomes: '',
          recommendations: '',
          supporting_docs: null,
        });
        loadReportHistory();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Submission failed'));
      }
    } catch (error) {
      alert('Submission error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = () => {
    if (formData.students_present && formData.total_registered_students) {
      return (formData.students_present / formData.total_registered_students * 100).toFixed(1);
    }
    return 0;
  };

  const handleEditReport = (reportId) => {
    const report = reportHistory.find(r => r.id === reportId);
    if (report) {
      setFormData({ 
        ...report, 
        week: report.week_of_reporting,
        lecture_date: report.date_of_lecture,
        students_present: report.actual_students_present,
        total_registered_students: report.total_registered_students,
        scheduled_time: report.scheduled_lecture_time,
        supporting_docs: null 
      });
    }
  };

  return (
    <div className="enhanced-report-form">
      <div className="form-header">
        <h2>📊 Lecturer Reporting Form</h2>
        <p>Complete all fields below to submit your lecture report</p>
      </div>

      <div className="report-history">
        <h3>Previous Reports</h3>
        {reportHistory.length > 0 ? (
          <ul>
            {reportHistory.map(report => (
              <li key={report.id}>
                {report.date_of_lecture} - {report.course_name} ({report.status})
                <button onClick={() => handleEditReport(report.id)}>Edit</button>
              </li>
            ))}
          </ul>
        ) : <p>No previous reports found.</p>}
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <details className="form-section" open>
          <summary>Basic Information</summary>
          <div className="form-row">
            <div className="form-group">
              <label>Faculty Name *</label>
              <select
                name="faculty_name"
                value={formData.faculty_name}
                onChange={handleChange}
                className={errors.faculty_name ? 'error' : ''}
              >
                <option value="">Select Faculty</option>
                {facultyOptions.map((faculty, index) => (
                  <option key={index} value={faculty}>{faculty}</option>
                ))}
              </select>
              {errors.faculty_name && <span className="error-message">{errors.faculty_name}</span>}
            </div>
            <div className="form-group">
              <label>Class Name *</label>
              <select
                name="class_name"
                value={formData.class_name}
                onChange={handleChange}
                className={errors.class_name ? 'error' : ''}
              >
                <option value="">Select Class</option>
                {classOptions.map((classItem, index) => (
                  <option key={index} value={classItem.name}>{classItem.name}</option>
                ))}
              </select>
              {errors.class_name && <span className="error-message">{errors.class_name}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Week of Reporting *</label>
              <select
                name="week"
                value={formData.week}
                onChange={handleChange}
                className={errors.week ? 'error' : ''}
              >
                <option value="">Select Week</option>
                {weekOptions.map((week, index) => (
                  <option key={index} value={week}>{week}</option>
                ))}
              </select>
              {errors.week && <span className="error-message">{errors.week}</span>}
            </div>
            <div className="form-group">
              <label>Date of Lecture *</label>
              <input
                type="date"
                name="lecture_date"
                value={formData.lecture_date}
                onChange={handleChange}
                className={errors.lecture_date ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.lecture_date && <span className="error-message">{errors.lecture_date}</span>}
            </div>
          </div>
        </details>

        <details className="form-section" open>
          <summary>Course & Lecturer Details</summary>
          <div className="form-row">
            <div className="form-group">
              <label>Course Name *</label>
              <select
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                className={errors.course_name ? 'error' : ''}
              >
                <option value="">Select Course</option>
                {courseOptions.map((course, index) => (
                  <option key={index} value={course.name}>{course.name}</option>
                ))}
              </select>
              {errors.course_name && <span className="error-message">{errors.course_name}</span>}
            </div>
            <div className="form-group">
              <label>Course Code *</label>
              <input
                type="text"
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                className={errors.course_code ? 'error' : ''}
                placeholder="e.g., DIWA2110"
              />
              {errors.course_code && <span className="error-message">{errors.course_code}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Lecturer's Name *</label>
              <input
                type="text"
                name="lecturer_name"
                value={formData.lecturer_name}
                onChange={handleChange}
                className={errors.lecturer_name ? 'error' : ''}
                readOnly
              />
              {errors.lecturer_name && <span className="error-message">{errors.lecturer_name}</span>}
            </div>
            <div className="form-group">
              <label>Scheduled Lecture Time *</label>
              <input
                type="time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                className={errors.scheduled_time ? 'error' : ''}
              />
              {errors.scheduled_time && <span className="error-message">{errors.scheduled_time}</span>}
            </div>
          </div>
        </details>

        <details className="form-section" open>
          <summary>Attendance & Venue</summary>
          <div className="form-row">
            <div className="form-group">
              <label>Actual Students Present *</label>
              <input
                type="number"
                name="students_present"
                value={formData.students_present}
                onChange={handleChange}
                className={errors.students_present ? 'error' : ''}
                min="0"
                max={formData.total_registered_students || 100}
              />
              {errors.students_present && <span className="error-message">{errors.students_present}</span>}
            </div>
            <div className="form-group">
              <label>Total Registered Students *</label>
              <input
                type="number"
                name="total_registered_students"
                value={formData.total_registered_students}
                onChange={handleChange}
                className={errors.total_registered_students ? 'error' : ''}
                min="1"
                readOnly
              />
              {errors.total_registered_students && <span className="error-message">{errors.total_registered_students}</span>}
            </div>
          </div>
          {formData.students_present && formData.total_registered_students && (
            <div className="attendance-info">
              <div className="attendance-rate">Attendance Rate: <strong>{calculateAttendanceRate()}%</strong></div>
              <div className="attendance-bar">
                <div className="attendance-fill" style={{ width: `${calculateAttendanceRate()}%` }}></div>
              </div>
            </div>
          )}
          <div className="form-group full-width">
            <label>Venue of the Class *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className={errors.venue ? 'error' : ''}
              placeholder="e.g., Room 101, Building A"
            />
            {errors.venue && <span className="error-message">{errors.venue}</span>}
          </div>
        </details>

        <details className="form-section" open>
          <summary>Teaching Content</summary>
          <div className="form-group full-width">
            <label>Topic Taught *</label>
            <input
              type="text"
              name="topic_taught"
              value={formData.topic_taught}
              onChange={handleChange}
              className={errors.topic_taught ? 'error' : ''}
              placeholder="Brief description of the topic covered"
            />
            {errors.topic_taught && <span className="error-message">{errors.topic_taught}</span>}
          </div>
          <div className="form-group full-width">
            <label>Learning Outcomes of the Topic *</label>
            <textarea
              name="learning_outcomes"
              value={formData.learning_outcomes}
              onChange={handleChange}
              className={errors.learning_outcomes ? 'error' : ''}
              placeholder="List the learning outcomes achieved in this lecture..."
              rows="4"
            />
            {errors.learning_outcomes && <span className="error-message">{errors.learning_outcomes}</span>}
          </div>
          <div className="form-group full-width">
            <label>Lecturer's Recommendations *</label>
            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              className={errors.recommendations ? 'error' : ''}
              placeholder="Provide recommendations for improvement or follow-up actions..."
              rows="4"
            />
            {errors.recommendations && <span className="error-message">{errors.recommendations}</span>}
          </div>
          <div className="form-group full-width">
            <label>Supporting Documents</label>
            <input
              type="file"
              name="supporting_docs"
              onChange={handleChange}
              accept="application/pdf,image/*"
            />
          </div>
        </details>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : '📤 Submit Report'}
          </button>
          <button
            type="button"
            className="clear-btn"
            onClick={() => setFormData({
              faculty_name: 'FICT - Faculty of Information and Communication Technology',
              class_name: '',
              week: '',
              lecture_date: '',
              course_name: '',
              course_code: '',
              lecturer_name: user.fullName || '',
              students_present: '',
              total_registered_students: '',
              venue: '',
              scheduled_time: '',
              topic_taught: '',
              learning_outcomes: '',
              recommendations: '',
              supporting_docs: null,
            })}
          >
            🗑️ Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedReportForm;
