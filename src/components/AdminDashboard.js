import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

const AdminDashboard = () => {
  const [student, setStudent] = useState({ name: '', email: '', password: '', PRN: '', batchId: '', programId: '', divisionId: '' });
  const [faculty, setFaculty] = useState({ name: '', email: '', password: '' });
  const [course, setCourse] = useState({ name: '', credit: '', facultyId: '' });
  const [batch, setBatch] = useState({ name: '', startYear: '', endYear: '' });
  const [program, setProgram] = useState({ name: '', description: '' });
  const [division, setDivision] = useState({ name: '', programId: '' });
  const [message, setMessage] = useState('');
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch programs, batches, and divisions for dropdowns
  useEffect(() => {
    const fetchProgramsBatchesDivisions = async () => {
      try {
        const programResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/programs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setPrograms(programResponse.data);

        const batchResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/batches`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setBatches(batchResponse.data);

        const divisionResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/divisions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setDivisions(divisionResponse.data);
      } catch (err) {
        console.error('Failed to fetch programs, batches, or divisions.');
      }
    };
    fetchProgramsBatchesDivisions();
  }, [token]);

  // Handle input change for dynamic forms
  const handleChange = (e, setFunc) => {
    const { name, value } = e.target;
    setFunc(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to clear form data
  const clearForm = (setFunc, initialState) => {
    setFunc(initialState);
  };

  // Add a new student
  const addStudent = async () => {
    if (!student.name || !student.email || !student.password || !student.PRN || !student.batchId || !student.programId || !student.divisionId) {
      setMessage('Please fill in all student fields.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, 
        student, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      setMessage(`Student added successfully: ${response.data.name}`);
      clearForm(setStudent, { name: '', email: '', password: '', PRN: '', batchId: '', programId: '', divisionId: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add student.';
      setMessage(errorMsg);
      console.error('Error adding student:', errorMsg);
    }
  };

  // Add a new faculty
  const addFaculty = async () => {
    if (!faculty.name || !faculty.email || !faculty.password) {
      setMessage('Please fill in all faculty fields.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/register/faculty`, 
        faculty, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      setMessage(`Faculty added successfully: ${response.data.name}`);
      clearForm(setFaculty, { name: '', email: '', password: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add faculty.';
      setMessage(errorMsg);
      console.error('Error adding faculty:', errorMsg);
    }
  };

  // Add a new course
  const addCourse = async () => {
    if (!course.name || !course.credit || !course.facultyId) {
      setMessage('Please fill in all course fields.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/courses`, 
        {
          name: course.name,
          credit: parseInt(course.credit, 10), // Ensure credit is sent as a number
          facultyId: course.facultyId
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      setMessage(`Course added successfully: ${response.data.course.name}`);
      clearForm(setCourse, { name: '', credit: '', facultyId: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add course.';
      setMessage(errorMsg);
      console.error('Error adding course:', errorMsg);
    }
  };

  // Add a new batch
  const addBatch = async () => {
    if (!batch.name || !batch.startYear || !batch.endYear) {
      setMessage('Please fill in all batch fields.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/add-batch`, 
        batch, 
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );
      setMessage(`Batch added successfully: ${response.data.batch.name}`);
      clearForm(setBatch, { name: '', startYear: '', endYear: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add batch.';
      setMessage(errorMsg);
      console.error('Error adding batch:', errorMsg);
    }
  };

  // Add a new program
  const addProgram = async () => {
    if (!program.name) {
      setMessage('Please fill in the program name.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/add-program`, 
        program, 
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );
      setMessage(`Program added successfully: ${response.data.program.name}`);
      clearForm(setProgram, { name: '', description: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add program.';
      setMessage(errorMsg);
      console.error('Error adding program:', errorMsg);
    }
  };

  // Add a new division
  const addDivision = async () => {
    if (!division.name || !division.programId) {
      setMessage('Please fill in all division fields.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/add-division`, 
        division, 
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );
      setMessage(`Division added successfully: ${response.data.division.name}`);
      clearForm(setDivision, { name: '', programId: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add division.';
      setMessage(errorMsg);
      console.error('Error adding division:', errorMsg);
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {/* Add Student Form */}
      <div className="form-section">
        <h3>Add Student</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={student.name}
          onChange={(e) => handleChange(e, setStudent)}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={student.email}
          onChange={(e) => handleChange(e, setStudent)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={student.password}
          onChange={(e) => handleChange(e, setStudent)}
        />
        <input
          type="text"
          name="PRN"
          placeholder="PRN"
          value={student.PRN}
          onChange={(e) => handleChange(e, setStudent)}
        />
        <select
          name="batchId"
          value={student.batchId}
          onChange={(e) => handleChange(e, setStudent)}
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch._id} value={batch._id}>{batch.name}</option>
          ))}
        </select>
        <select
          name="programId"
          value={student.programId}
          onChange={(e) => handleChange(e, setStudent)}
        >
          <option value="">Select Program</option>
          {programs.map((program) => (
            <option key={program._id} value={program._id}>{program.name}</option>
          ))}
        </select>
        <select
          name="divisionId"
          value={student.divisionId}
          onChange={(e) => handleChange(e, setStudent)}
        >
          <option value="">Select Division</option>
          {divisions.filter(division => division.programId === student.programId).map((division) => (
            <option key={division._id} value={division._id}>{division.name}</option>
          ))}
        </select>
        <button onClick={addStudent}>Add Student</button>
      </div>

      {/* Add Faculty Form */}
      <div className="form-section">
        <h3>Add Faculty</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={faculty.name}
          onChange={(e) => handleChange(e, setFaculty)}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={faculty.email}
          onChange={(e) => handleChange(e, setFaculty)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={faculty.password}
          onChange={(e) => handleChange(e, setFaculty)}
        />
        <button onClick={addFaculty}>Add Faculty</button>
      </div>

      {/* Add Course Form */}
      <div className="form-section">
        <h3>Add Course</h3>
        <input
          type="text"
          name="name"
          placeholder="Course Name"
          value={course.name}
          onChange={(e) => handleChange(e, setCourse)}
        />
        <input
          type="number"
          name="credit"
          placeholder="Credit"
          value={course.credit}
          onChange={(e) => handleChange(e, setCourse)}
        />
        <input
          type="text"
          name="facultyId"
          placeholder="Faculty ID"
          value={course.facultyId}
          onChange={(e) => handleChange(e, setCourse)}
        />
        <button onClick={addCourse}>Add Course</button>
      </div>

      {/* Add Batch Form */}
      <div className="form-section">
        <h3>Add Batch</h3>
        <input
          type="text"
          name="name"
          placeholder="Batch Name"
          value={batch.name}
          onChange={(e) => handleChange(e, setBatch)}
        />
        <input
          type="number"
          name="startYear"
          placeholder="Start Year"
          value={batch.startYear}
          onChange={(e) => handleChange(e, setBatch)}
        />
        <input
          type="number"
          name="endYear"
          placeholder="End Year"
          value={batch.endYear}
          onChange={(e) => handleChange(e, setBatch)}
        />
        <button onClick={addBatch}>Add Batch</button>
      </div>

      {/* Add Program Form */}
      <div className="form-section">
        <h3>Add Program</h3>
        <input
          type="text"
          name="name"
          placeholder="Program Name"
          value={program.name}
          onChange={(e) => handleChange(e, setProgram)}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={program.description}
          onChange={(e) => handleChange(e, setProgram)}
        />
        <button onClick={addProgram}>Add Program</button>
      </div>

      {/* Add Division Form */}
      <div className="form-section">
        <h3>Add Division</h3>
        <input
          type="text"
          name="name"
          placeholder="Division Name"
          value={division.name}
          onChange={(e) => handleChange(e, setDivision)}
        />
        <select
          name="programId"
          value={division.programId}
          onChange={(e) => handleChange(e, setDivision)}
        >
          <option value="">Select Program</option>
          {programs.map((program) => (
            <option key={program._id} value={program._id}>{program.name}</option>
          ))}
        </select>
        <button onClick={addDivision}>Add Division</button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AdminDashboard;
