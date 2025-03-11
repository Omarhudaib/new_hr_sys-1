import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import LoadingSpinner from '../LoadingSpinner';  // Import the LoadingSpinner component
import api from '../api'; // Import the api instance
const LeaveTypesPage = () => {
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const token = localStorage.getItem('authToken');

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({ status: 'inactive' });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);  // Track loading state
  const [error, setError] = useState(null);  // For error handling
  const [success, setSuccess] = useState(null);  // For success messages

  const predefinedLeaveTypes = ['holidays', 'sick_days', 'annual_vacations_days'];

  useEffect(() => {
    if (companyCode) {
      setLoading(true); // Set loading to true when data is being fetched
      api.get(`/leave_types/${companyCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setLeaveTypes(response.data);
        setLoading(false);  // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error('Error fetching leave types:', error);
        setError('Error fetching leave types.');
        setLoading(false);  // Set loading to false even on error
      });
    }
  }, [companyCode, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = `/leave_types/${companyCode}/${selectedId}`;
    const method = 'put';

    api({
      method,
      url,
      data: { status: formData.status },
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      setLeaveTypes(leaveTypes.map((leaveType) => 
        leaveType.id === selectedId ? { ...leaveType, status: response.data.status } : leaveType
      ));
      setShow(false);
      setFormData({ status: 'inactive' });
      setEditMode(false);
      setSuccess('Status updated successfully!');
    })
    .catch((error) => {
      console.error('Error submitting status update:', error);
      setError('Error updating status.');
    });
  };

  const handleEdit = (leaveType) => {
    setSelectedId(leaveType.id);
    setFormData({ status: leaveType.status });
    setEditMode(true);
    setShow(true);
  };

  return (
    <div className="container mt-2">
      <h2 className='mb-4 text-center text-primary'>Leave Types</h2>

      {/* Success/Error Messages */}
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Loading Spinner */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((leaveType) => (
              <tr key={leaveType.id}>
                <td>{leaveType.name}</td>
                <td>{leaveType.description}</td>
                <td>{leaveType.status}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(leaveType)}>Edit Status</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for editing the status */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Status' : 'Edit Leave Type Status'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              {editMode ? 'Update' : 'Update Status'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LeaveTypesPage;
