import React, { useState, useEffect } from 'react';
import './Reportform.css'; // Use a separate CSS file for styling

const ReportForm = ({ user }) => {
  const [formData, setFormData] = useState({
    faculty_name: 'FICT - Faculty of Information and Communication Technology',
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: '',
    course_name: '',
    course_code: '',
    lecturer_name: user.fullName || '',
    actual_students_present: '',
    total_registered_students: '',
    venue: '',
    scheduled_lecture_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [weekOptions] = useState(Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`));
  const API_BASE_URL = 'https://luct-reporting-backend-x1cx.onrender.com'; // Match with App.js and reportRoutes.js

  const facultyOptions = [
    'FICT - Faculty of Information and Communication Technology',
  ];

  useEffect(() => {
    loadDropdownOptions();
  }, []);

  const loadDropdownOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch classes
      const classesResponse = await fetch(`${API_BASE_URL}/api/lecturer/classes`, { headers });
      if (classesResponse.ok) setClassOptions(await classesResponse.json());

      // Fetch courses
      const coursesResponse = await fetch(`${API_BASE_URL}/api/courses`, { headers });
      if (coursesResponse.ok) setCourseOptions(await coursesResponse.json());
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadClassDetails = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/class-details/${classId}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          total_registered_students: data.total_registered_students || '',
          venue: data.venue || '',
          scheduled_lecture_time: data.scheduled_time || '',
        }));
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'class_name' && value) {
      const selectedClass = classOptions.find(c => c.name === value);
      if (selectedClass) {
        loadClassDetails(selectedClass.id);
        setFormData(prev => ({
          ...prev,
          course_name: selectedClass.name || '',
          course_code: selectedClass.code || '',
        }));
      }
    }

    if (name === 'course_name' && value) {
      const selectedCourse = courseOptions.find(c => c.name === value);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          course_code: selectedCourse.code || '',
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date('2025-10-01').toISOString().split('T')[0]; // Current date

    if (!formData.faculty_name) newErrors.faculty_name = 'Faculty name is required';
    if (!formData.class_name) newErrors.class_name = 'Class name is required';
    if (!formData.week_of_reporting) newErrors.week_of_reporting = 'Week of reporting is required';
    if (!formData.date_of_lecture) newErrors.date_of_lecture = 'Lecture date is required';
    else if (new Date(formData.date_of_lecture) > new Date(today)) newErrors.date_of_lecture = 'Lecture date cannot be in the future';
    if (!formData.course_name) newErrors.course_name = 'Course name is required';
    if (!formData.course_code) newErrors.course_code = 'Course code is required';
    if (!formData.lecturer_name) newErrors.lecturer_name = 'Lecturer name is required';
    if (!formData.actual_students_present || formData.actual_students_present <= 0) newErrors.actual_students_present = 'Valid student count is required';
    if (formData.actual_students_present > (formData.total_registered_students || Infinity)) newErrors.actual_students_present = 'Students present cannot exceed total registered students';
    if (!formData.total_registered_students || formData.total_registered_students <= 0) newErrors.total_registered_students = 'Total registered students is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.scheduled_lecture_time) newErrors.scheduled_lecture_time = 'Scheduled time is required';
    if (!formData.topic_taught.trim()) newErrors.topic_taught = 'Topic taught is required';
    if (!formData.learning_outcomes.trim()) newErrors.learning_outcomes = 'Learning outcomes are required';
    if (!formData.recommendations.trim()) newErrors.recommendations = 'Recommendations are required';

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
        week_of_reporting: formData.week_of_reporting,
        date_of_lecture: formData.date_of_lecture,
        course_name: formData.course_name,
        course_code: formData.course_code,
        lecturer_name: formData.lecturer_name,
        actual_students_present: parseInt(formData.actual_students_present),
        total_registered_students: parseInt(formData.total_registered_students),
        venue: formData.venue,
        scheduled_lecture_time: formData.scheduled_lecture_time,
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

      const data = await response.json();
      if (response.ok) {
        alert('Report submitted successfully!');
        setFormData({
          faculty_name: 'FICT - Faculty of Information and Communication Technology',
          class_name: '',
          week_of_reporting: '',
          date_of_lecture: '',
          course_name: '',
          course_code: '',
          lecturer_name: user.fullName || '',
          actual_students_present: '',
          total_registered_students: '',
          venue: '',
          scheduled_lecture_time: '',
          topic_taught: '',
          learning_outcomes: '',
          recommendations: '',
        });
      } else {
        alert('Error: ' + (data.error || 'Submission failed'));
      }
    } catch (error) {
      alert('Submission error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form">
      <div className="form-header">
        <h2>📝 Submit Lecture Report</h2>
        <p>Complete all fields to submit your report</p>
      </div>
      <form onSubmit={handleSubmit} className="report-form-content">
        <div className="form-section">
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
                {classOptions.map(classItem => (
                  <option key={classItem.id} value={classItem.name}>{classItem.name}</option>
                ))}
              </select>
              {errors.class_name && <span className="error-message">{errors.class_name}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Week of Reporting *</label>
              <select
                name="week_of_reporting"
                value={formData.week_of_reporting}
                onChange={handleChange}
                className={errors.week_of_reporting ? 'error' : ''}
              >
                <option value="">Select Week</option>
                {weekOptions.map(week => (
                  <option key={week} value={week}>{week}</option>
                ))}
              </select>
              {errors.week_of_reporting && <span className="error-message">{errors.week_of_reporting}</span>}
            </div>
            <div className="form-group">
              <label>Date of Lecture *</label>
              <input
                type="date"
                name="date_of_lecture"
                value={formData.date_of_lecture}
                onChange={handleChange}
                className={errors.date_of_lecture ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date_of_lecture && <span className="error-message">{errors.date_of_lecture}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
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
                {courseOptions.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
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
                readOnly
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
              <label>Students Present *</label>
              <input
                type="number"
                name="actual_students_present"
                value={formData.actual_students_present}
                onChange={handleChange}
                className={errors.actual_students_present ? 'error' : ''}
                min="0"
                max={formData.total_registered_students || 100}
              />
              {errors.actual_students_present && <span className="error-message">{errors.actual_students_present}</span>}
            </div>
          </div>
          <div className="form-row">
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
            <div className="form-group">
              <label>Venue *</label>
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
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Scheduled Time *</label>
              <input
                type="time"
                name="scheduled_lecture_time"
                value={formData.scheduled_lecture_time}
                onChange={handleChange}
                className={errors.scheduled_lecture_time ? 'error' : ''}
              />
              {errors.scheduled_lecture_time && <span className="error-message">{errors.scheduled_lecture_time}</span>}
            </div>
          </div>
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
            <label>Learning Outcomes *</label>
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
            <label>Recommendations *</label>
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
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : '📤 Submit Report'}
          </button>
          <button type="button" className="clear-btn" onClick={() => setFormData({
            faculty_name: 'FICT - Faculty of Information and Communication Technology',
            class_name: '',
            week_of_reporting: '',
            date_of_lecture: '',
            course_name: '',
            course_code: '',
            lecturer_name: user.fullName || '',
            actual_students_present: '',
            total_registered_students: '',
            venue: '',
            scheduled_lecture_time: '',
            topic_taught: '',
            learning_outcomes: '',
            recommendations: '',
          })}>
            🗑️ Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
