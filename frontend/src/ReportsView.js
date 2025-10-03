import React, { useState, useEffect } from 'react';
import './App.css';

const ReportsView = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'https://luct-reporting-backend-x1cx.onrender.com';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('Failed to fetch reports:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-view">
        <div className="reports-header">
          <h2>📊 Loading Reports...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-view">
      <div className="reports-header">
        <h2>📊 Submitted Reports</h2>
        <p>View all your lecture reports and tracking history</p>
      </div>

      {reports.length === 0 ? (
        <div className="no-reports">
          <div className="no-reports-icon">📝</div>
          <h3>No Reports Submitted Yet</h3>
          <p>Start by submitting your first lecture report!</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report, index) => (
            <div key={report.id || index} className="report-card">
              <div className="report-header">
                <h3>{report.course_name} - {report.class_name}</h3>
                <span className={`status ${report.status?.toLowerCase() || 'pending'}`}>
                  {report.status || 'Pending'}
                </span>
              </div>
              <div className="report-details">
                <div className="detail">
                  <strong>Date:</strong> {report.date_of_lecture || report.lecture_date}
                </div>
                <div className="detail">
                  <strong>Week:</strong> {report.week_of_reporting || report.week}
                </div>
                <div className="detail">
                  <strong>Students Present:</strong> {report.actual_students_present || report.students_present}/{report.total_registered_students}
                </div>
                <div className="detail">
                  <strong>Topic:</strong> {report.topic_taught}
                </div>
                <div className="detail">
                  <strong>Venue:</strong> {report.venue}
                </div>
                {report.prl_feedback && (
                  <div className="detail feedback">
                    <strong>PRL Feedback:</strong> {report.prl_feedback}
                  </div>
                )}
              </div>
              <div className="report-actions">
                <button className="view-btn">View Details</button>
                {report.status === 'Pending' && (
                  <button className="edit-btn">Edit</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsView;
