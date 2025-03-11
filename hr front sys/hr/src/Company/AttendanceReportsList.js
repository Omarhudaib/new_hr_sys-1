import React, { useState, useEffect } from 'react';
import api from '../api';
import { Table, Button, Container, Form, Alert, Modal , Row, Col  } from 'react-bootstrap';

const AttendanceReportsList = () => {
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const [reports, setReports] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (companyCode) {
      fetchReports();
    }
  }, [companyCode]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`/attendance-reports/${companyCode}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const generateReport = async () => {
    try {
      const response = await api.post('/attendance-reports/generate', { month, year, company_code: companyCode });
      setReports(response.data.reports);
      setMessage({ type: 'success', text: 'Report generated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error generating report' });
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    try {
      await api.put(`/attendance-reports/${editingReport.id}`, {
        total_hours: editingReport.total_hours,
        overtime_hours: editingReport.overtime_hours,
        delay_hours: editingReport.delay_hours,
        total_leaves: editingReport.total_leaves,
        final_salary: editingReport.final_salary,
      });

      setMessage({ type: 'success', text: 'Report updated successfully!' });
      fetchReports();
      setShowModal(false);
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error updating report' });
    }
  };

  return (
    <Container >
      <h2 className="mb-4 text-center text-primary">Attendance Reports</h2>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
    <Form className="mb-3">
  <Row className="gap-2 align-items-center">
    <Col xs="5" md="3">
      <Form.Group>
        <Form.Label className="small">Month</Form.Label>
        <Form.Control
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="form-control-sm"
        />
      </Form.Group>
    </Col>

    <Col xs="5" md="3">
      <Form.Group>
        <Form.Label className="small">Year</Form.Label>
        <Form.Control
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="form-control-sm"
        />
      </Form.Group>
    </Col>

    <Col xs="auto mt-4">
      <Button onClick={generateReport} className="btn-sm">
        Generate
      </Button>
    </Col>
  </Row>
</Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Month</th>
            <th>Year</th>
            <th>Total Hours</th>
            <th>Overtime Hours</th>
            <th>Delay Hours</th>
            <th>Leaves</th>
            <th>Final Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.user?.first_name && report.user?.last_name || 'Unknown'}</td>
              <td>{report.month}</td>
              <td>{report.year}</td>
              <td>{report.total_hours}</td>
              <td>{report.overtime_hours}</td>
              <td>{report.delay_hours}</td>
              <td>{report.total_leaves}</td>
              <td>{report.final_salary}</td>
              <td>
                <Button variant="warning" className="me-2" onClick={() => handleEdit(report)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Editing */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingReport && (
            <Form>
              <Form.Group className=''>
                <Form.Label>Employee</Form.Label>
                <Form.Control type="text" value={editingReport.user?.first_name && editingReport.user?.last_name  || 'Unknown'} readOnly />
              </Form.Group>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Control type="number" value={editingReport.month} readOnly />
              </Form.Group>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control type="number" value={editingReport.year} readOnly />
              </Form.Group>
              <Form.Group>
                <Form.Label>Total Hours</Form.Label>
                <Form.Control
                  type="number"
                  value={editingReport.total_hours}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, total_hours: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Overtime Hours</Form.Label>
                <Form.Control
                  type="number"
                  value={editingReport.overtime_hours}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, overtime_hours: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Delay Hours</Form.Label>
                <Form.Control
                  type="number"
                  value={editingReport.delay_hours}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, delay_hours: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Leaves</Form.Label>
                <Form.Control
                  type="number"
                  value={editingReport.total_leaves}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, total_leaves: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Final Salary</Form.Label>
                <Form.Control
                  type="number"
                  value={editingReport.final_salary}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, final_salary: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AttendanceReportsList;
