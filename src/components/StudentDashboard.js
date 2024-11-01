import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css';

const StudentDashboard = () => {
  const [marksResult, setMarksResult] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const viewComponentMarks = async (component) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students/marks/component?component=${component}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setMarksResult(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch marks for this component.');
      setMarksResult([]);
    }
  };

  const viewEntireResult = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students/marks/entire-result`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setMarksResult(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch the entire result.');
      setMarksResult([]);
    }
  };

  const verifyMarks = async (courseId, component) => {
    try {
      if (!courseId || !component) {
        console.error('Missing courseId or component:', { courseId, component });
        alert('Invalid data. Please try again.');
        return;
      }

      console.log('Verifying marks:', { courseId, component });
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/students/marks/verify`, {
        courseId,
        component,
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      console.log('Verification response:', response.data);
      alert('Marks verified successfully!');
      // Refresh the marks to update the verification status
      viewComponentMarks(component);
    } catch (err) {
      console.error('Verification error:', err.response || err.message);
      alert('Failed to verify marks.');
    }
  };

  return (
    <div className="container">
      <div id="student-dashboard">
        <h2>Student Dashboard</h2>
        {error && <p className="error">{error}</p>}
        <button onClick={() => viewComponentMarks('CA1')}>View CA1 Marks</button>
        <button onClick={() => viewComponentMarks('CA2')}>View CA2 Marks</button>
        <button onClick={() => viewComponentMarks('CA3')}>View CA3 Marks</button>
        <button onClick={() => viewComponentMarks('CA4')}>View CA4 Marks</button>
        <button onClick={() => viewComponentMarks('ESE')}>View ESE Marks</button>
        <button onClick={viewEntireResult}>View Entire Result</button>
        <div id="marks-result">
          {marksResult.length === 0 ? (
            <p>No marks found</p>
          ) : (
            <table>
              <thead>
                {typeof marksResult[0]?.marks !== 'undefined' ? (
                  <tr>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Verification Status</th>
                    <th>Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Course</th>
                    <th>Total CAs</th>
                    <th>Avg CAs</th>
                    <th>ESE</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {marksResult.map((mark, index) => {
                  console.log('Mark object:', mark);
                  let courseId;

                  // Extract courseId based on the structure of mark
                  if (mark.course && typeof mark.course === 'object' && mark.course._id) {
                    courseId = mark.course._id;
                  } else if (mark.courseId) {
                    courseId = mark.courseId;
                  } else {
                    console.error('Unable to determine courseId for mark:', mark);
                  }

                  // Ensure courseId is valid before rendering the verify button
                  return (
                    <tr key={index}>
                      {typeof mark.marks !== 'undefined' ? (
                        <>
                          <td>{mark.course?.name || mark.course}</td>
                          <td>{mark.marks}</td>
                          <td>{mark.verificationStatus || 'Not Verified'}</td>
                          <td>
                            {courseId && mark.verificationStatus !== 'Verified' ? (
                              <button onClick={() => verifyMarks(courseId, mark.component)}>Verify</button>
                            ) : (
                              <span>Cannot verify</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{mark.course}</td>
                          <td>{mark.totalCAs}</td>
                          <td>{mark.avgCAs}</td>
                          <td>{mark.ESE}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
