import React, { useState, useEffect } from 'react';
import './App.css';

const ReportsView = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://luct-reporting-system-27vd.onrender.com/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
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
                <span className="report-week">{report.week}</span>
              </div>
              <div className="report-details">
                <div className="detail">
                  <strong>Date:</strong> {report.lecture_date}
                </div>
                <div className="detail">
                  <strong>Students Present:</strong> {report.students_present}/{report.total_registered_students}
                </div>
                <div className="detail">
                  <strong>Topic:</strong> {report.topic_taught}
                </div>
                <div className="detail">
                  <strong>Venue:</strong> {report.venue}
                </div>
              </div>
              <div className="report-actions">
                <button className="view-btn">View Details</button>
                <button className="edit-btn">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsView;
