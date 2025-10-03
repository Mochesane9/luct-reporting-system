import React, { useState, useEffect } from 'react';
import './Reportform.css'; // Use a separate CSS file for styling

const ReportForm = ({ user }) => {
  const [formData, setFormData] = useState({
    faculty_id: '',
    class_id: '',
    week: '',
    lecture_date: '',
    course_id: '',
    lecturer_id: user.id,
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
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [weekOptions] = useState(Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`));
  const API_BASE_URL = 'https://luct-reporting-backend-x1cx.onrender.com'; // Match with App.js and reportRoutes.js

  useEffect(() => {
    loadDropdownOptions();
  }, []);

  const loadDropdownOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch faculties (simplified as departments for now)
      setFacultyOptions([
        { id: 1, name: 'FICT - Faculty of Information and Communication Technology' },
      ]);

      // Fetch classes
      const classesResponse = await fetch(`${API_BASE_URL}/api/lecturer/classes?faculty=FICT`, { headers });
      if (classesResponse.ok) setClassOptions(await classesResponse.json());

      // Fetch courses
      const coursesResponse = await fetch(`${API_BASE_URL}/api/pl/courses?faculty=FICT`, { headers });
      if (coursesResponse.ok) setCourseOptions(await coursesResponse.json());
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadClassDetails = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/class-details/${classId}`, { headers: { 'Authorization': `Bearer ${token}` } });
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

    if (name === 'class_id' && value) {
      const selectedClass = classOptions.find(c => c.id === parseInt(value));
      if (selectedClass) {
        loadClassDetails(selectedClass.id);
        setFormData(prev => ({
          ...prev,
          course_id: selectedClass.course_id || '',
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date('2025-10-01').toISOString().split('T')[0]; // Current date

    if (!formData.faculty_id) newErrors.faculty_id = 'Faculty ID is required';
    if (!formData.class_id) newErrors.class_id = 'Class ID is required';
    if (!formData.week) newErrors.week = 'Week of reporting is required';
    if (!formData.lecture_date) newErrors.lecture_date = 'Lecture date is required';
    else if (new Date(formData.lecture_date) > new Date(today)) newErrors.lecture_date = 'Lecture date cannot be in the future';
    if (!formData.course_id) newErrors.course_id = 'Course ID is required';
    if (!formData.students_present || formData.students_present <= 0) newErrors.students_present = 'Valid student count is required';
    if (formData.students_present > (formData.total_registered_students || Infinity)) newErrors.students_present = 'Students present cannot exceed total registered students';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.scheduled_time) newErrors.scheduled_time = 'Scheduled time is required';
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
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'supporting_docs' && formData[key]) formDataToSend.append(key, formData[key]);
        else if (key !== 'supporting_docs') formDataToSend.append(key, formData[key]);
      }
      formDataToSend.append('lecturer_id', user.id);

      const response = await fetch(`${API_BASE_URL}/api/submit-enhanced-report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Report submitted successfully!');
        setFormData({
          faculty_id: '',
          class_id: '',
          week: '',
          lecture_date: '',
          course_id: '',
          lecturer_id: user.id,
          students_present: '',
          total_registered_students: '',
          venue: '',
          scheduled_time: '',
          topic_taught: '',
          learning_outcomes: '',
          recommendations: '',
          supporting_docs: null,
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
              <label>Faculty ID *</label>
              <select
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
                className={errors.faculty_id ? 'error' : ''}
              >
                <option value="">Select Faculty</option>
                {facultyOptions.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
              {errors.faculty_id && <span className="error-message">{errors.faculty_id}</span>}
            </div>
            <div className="form-group">
              <label>Class ID *</label>
              <select
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                className={errors.class_id ? 'error' : ''}
              >
                <option value="">Select Class</option>
                {classOptions.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                ))}
              </select>
              {errors.class_id && <span className="error-message">{errors.class_id}</span>}
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
                {weekOptions.map(week => (
                  <option key={week} value={week}>{week}</option>
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
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Course ID *</label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                className={errors.course_id ? 'error' : ''}
              >
                <option value="">Select Course</option>
                {courseOptions.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              {errors.course_id && <span className="error-message">{errors.course_id}</span>}
            </div>
            <div className="form-group">
              <label>Students Present *</label>
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
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                className={errors.scheduled_time ? 'error' : ''}
              />
              {errors.scheduled_time && <span className="error-message">{errors.scheduled_time}</span>}
            </div>
            <div className="form-group">
              <label>Supporting Documents</label>
              <input
                type="file"
                name="supporting_docs"
                onChange={handleChange}
                accept="application/pdf,image/*"
              />
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
            faculty_id: '',
            class_id: '',
            week: '',
            lecture_date: '',
            course_id: '',
            lecturer_id: user.id,
            students_present: '',
            total_registered_students: '',
            venue: '',
            scheduled_time: '',
            topic_taught: '',
            learning_outcomes: '',
            recommendations: '',
            supporting_docs: null,
          })}>
            🗑️ Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
