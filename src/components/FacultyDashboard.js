import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const FacultyDashboard = () => {
  // State variables for batch, program, and division filtering
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [studentsList, setStudentsList] = useState([]);

  // State variables for course and marks management
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [marksMap, setMarksMap] = useState(new Map());
  const [verificationStatusMap, setVerificationStatusMap] = useState(new Map());
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch batches, programs, and divisions
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const batchResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/batches`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setBatches(batchResponse.data);

        const programResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/programs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setPrograms(programResponse.data);

        const divisionResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/divisions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setDivisions(divisionResponse.data);
      } catch (err) {
        setError('Failed to fetch batches, programs, or divisions.');
      }
    };

    fetchDropdownData();
  }, [token]);

  // Fetch courses assigned to the faculty
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/faculty/courses`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (err) {
        setError('Failed to fetch courses.');
      }
    };

    fetchCourses();
  }, [token]);

  // Handle student filtering based on batch, program, and division
  const handleFilterStudents = async () => {
    if (!selectedBatch || !selectedProgram || !selectedDivision) {
      setError('Please select batch, program, and division.');
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/students/filtered-students?batchId=${selectedBatch}&programId=${selectedProgram}&divisionId=${selectedDivision}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      setStudentsList(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch students.');
    }
  };

  // Handle selecting a component to enter marks
  const handleSelectComponent = async (courseId, component, courseName) => {
    setSelectedCourseId(courseId);
    setSelectedComponent(component);
    document.getElementById('component-name').innerText = component;
    document.getElementById('course-name').innerText = courseName;
    document.getElementById('marks-entry-section').style.display = 'block';

    try {
      const marksResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/faculty/marks?courseId=${courseId}&component=${component}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const marksData = new Map();
      const verificationData = new Map();
      marksResponse.data.forEach((markEntry) => {
        marksData.set(markEntry.studentId, markEntry.marks);
        verificationData.set(markEntry.studentId, markEntry.verificationStatus);
      });

      setMarksMap(marksData);
      setVerificationStatusMap(verificationData);
    } catch (err) {
      setError('Failed to fetch marks for students.');
    }
  };

  // Handle entering new marks for students
  const handleMarkChange = (studentId, value) => {
    setMarksMap((prev) => new Map(prev.set(studentId, value)));
  };

  // Handle saving marks
  const handleSubmitMarks = async () => {
    const marksData = [];
    studentsList.forEach((student) => {
      const mark = marksMap.get(student._id) || '';
      if (mark !== '') {
        marksData.push({
          studentId: student._id,
          courseId: selectedCourseId,
          component: selectedComponent,
          marks: mark,
        });
      }
    });

    if (marksData.length === 0) {
      alert('Please enter marks for at least one student.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/faculty/marks`, { marks: marksData }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      alert('Marks saved successfully!');
      refreshMarksTable();
    } catch (err) {
      alert('Failed to save marks.');
    }
  };

  // Handle updating marks for individual students
  const handleUpdateMark = async (studentId) => {
    const mark = marksMap.get(studentId);
    if (mark === undefined || mark === '') {
      alert('Please enter a mark before updating.');
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/faculty/marks`, {
        studentId,
        courseId: selectedCourseId,
        component: selectedComponent,
        marks: mark,
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      alert('Mark updated successfully!');
      refreshMarksTable();
    } catch (err) {
      alert('Failed to update mark.');
    }
  };

  // Refresh marks table after saving/updating marks
  const refreshMarksTable = async () => {
    try {
      const marksResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/faculty/marks?courseId=${selectedCourseId}&component=${selectedComponent}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const marksData = new Map();
      const verificationData = new Map();
      marksResponse.data.forEach((markEntry) => {
        marksData.set(markEntry.studentId, markEntry.marks);
        verificationData.set(markEntry.studentId, markEntry.verificationStatus);
      });
      setMarksMap(marksData);
      setVerificationStatusMap(verificationData);
    } catch (err) {
      alert('Failed to refresh marks table.');
    }
  };

  return (
    <div className="container">
      <h2>Faculty Dashboard</h2>
      {error && <p className="error">{error}</p>}

      {/* Filtering Section */}
      <div className="filter-section">
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
          <option value="">Select Batch</option>
          {batches.map(batch => (
            <option key={batch._id} value={batch._id}>{batch.name}</option>
          ))}
        </select>

        <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
          <option value="">Select Program</option>
          {programs.map(program => (
            <option key={program._id} value={program._id}>{program.name}</option>
          ))}
        </select>

        <select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)}>
          <option value="">Select Division</option>
          {divisions.filter(division => division.programId === selectedProgram).map(division => (
            <option key={division._id} value={division._id}>{division.name}</option>
          ))}
        </select>

        <button onClick={handleFilterStudents}>Filter Students</button>
      </div>

      {/* Courses Section */}
      <div id="assigned-courses">
        {courses.length === 0 ? (
          <p>No courses assigned</p>
        ) : (
          courses.map((course) => (
            <div key={course._id}>
              <h3>{course.name} (Credits: {course.credit})</h3>
              {getCAButtons(course)}
            </div>
          ))
        )}
      </div>

      {/* Marks Entry Section */}
      <div id="marks-entry-section" style={{ display: 'none' }}>
        <h3>
          Enter Marks for <span id="component-name"></span> - <span id="course-name"></span>
        </h3>
        <table id="marks-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>PRN</th>
              <th>Saved Marks</th>
              <th>Verification Status</th>
              <th>Enter New Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentsList.length === 0 ? (
              <tr>
                <td colSpan="6">No students enrolled in this course</td>
              </tr>
            ) : (
              studentsList.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.PRN}</td>
                  <td>{marksMap.get(student._id) === 0 ? '0' : marksMap.get(student._id) || 'No marks entered'}</td>
                  <td>{verificationStatusMap.get(student._id) || 'Not Verified'}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marksMap.get(student._id) || ''}
                      onChange={(e) => handleMarkChange(student._id, e.target.value)}
                      placeholder="Enter Marks"
                    />
                  </td>
                  <td>
                    <button onClick={() => handleUpdateMark(student._id)}>Update</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <button onClick={handleSubmitMarks}>Save All Marks</button>
      </div>
    </div>
  );

  function getCAButtons(course) {
    let buttons = [];
    buttons.push(
      <button key="CA1" onClick={() => handleSelectComponent(course._id, 'CA1', course.name)}>
        Enter CA1 Marks
      </button>
    );
    if (course.credit >= 2) {
      buttons.push(
        <button key="CA2" onClick={() => handleSelectComponent(course._id, 'CA2', course.name)}>
          Enter CA2 Marks
        </button>
      );
    }
    if (course.credit >= 3) {
      buttons.push(
        <button key="CA3" onClick={() => handleSelectComponent(course._id, 'CA3', course.name)}>
          Enter CA3 Marks
        </button>
      );
    }
    if (course.credit === 4) {
      buttons.push(
        <button key="CA4" onClick={() => handleSelectComponent(course._id, 'CA4', course.name)}>
          Enter CA4 Marks
        </button>
      );
    }
    buttons.push(
      <button key="ESE" onClick={() => handleSelectComponent(course._id, 'ESE', course.name)}>
        Enter ESE Marks
      </button>
    );
    return buttons;
  }
};

export default FacultyDashboard;
