import React, { useState, useEffect } from 'react';
import api from '../api'; // تأكد من وجود ملف api.js يحتوي على إعدادات axios
import { Form, Button, Container, Alert } from 'react-bootstrap';

const AttendanceReportForm = ({ reportId }) => {
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  const [formData, setFormData] = useState({
    user_id: '',
    company_code: companyCode,
    month: '',
    year: '',
    total_hours: '',
    overtime_hours: '',
    delay_hours: '',
    total_leaves: '',
    final_hours: ''
  });

  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // جلب تقرير الحضور عند التعديل
  useEffect(() => {
    if (reportId) {
      api.get(`/attendance-reports/${companyCode}/${reportId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(err => {
          setError('Error loading report');
          console.error(err);
        });
    }
  }, [reportId, companyCode]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = reportId ? 'put' : 'post';
    const url = reportId
      ? `/attendance-reports/${reportId}`
      : '/attendance-reports/';

    api[method](url, formData)
      .then(response => {
        setMessage(reportId ? 'Report updated successfully' : 'Report created successfully');
        setError(null); // Reset error message if successful
      })
      .catch(err => {
        setError('There was an error submitting the report');
        console.error(err);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container>
      <h2>{reportId ? 'Edit' : 'Create'} Attendance Report</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="user_id">
          <Form.Label>User ID</Form.Label>
          <Form.Control
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="month">
          <Form.Label>Month</Form.Label>
          <Form.Control
            type="number"
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="year">
          <Form.Label>Year</Form.Label>
          <Form.Control
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="total_hours">
          <Form.Label>Total Hours</Form.Label>
          <Form.Control
            type="number"
            name="total_hours"
            value={formData.total_hours}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="overtime_hours">
          <Form.Label>Overtime Hours</Form.Label>
          <Form.Control
            type="number"
            name="overtime_hours"
            value={formData.overtime_hours}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="delay_hours">
          <Form.Label>Delay Hours</Form.Label>
          <Form.Control
            type="number"
            name="delay_hours"
            value={formData.delay_hours}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="total_leaves">
          <Form.Label>Total Leaves</Form.Label>
          <Form.Control
            type="number"
            name="total_leaves"
            value={formData.total_leaves}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="final_hours">
          <Form.Label>Final Hours</Form.Label>
          <Form.Control
            type="number"
            name="final_hours"
            value={formData.final_hours}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          {reportId ? 'Update' : 'Create'} Report
        </Button>
      </Form>
    </Container>
  );
};

export default AttendanceReportForm;
