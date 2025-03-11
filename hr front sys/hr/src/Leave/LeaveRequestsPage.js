import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../LoadingSpinner';

const LeaveRequestsPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    status: 'pending',
    reason: '',
    image: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  // Fetch users
  useEffect(() => {
    if (companyCode) {
      api.get(`/usersc/${companyCode}`)
        .then((response) => setUsers(response.data))
        .catch((error) => console.error('Error fetching users:', error));
    }
  }, [companyCode]);

  // Fetch leave types
  useEffect(() => {
    if (companyCode) {
      api.get(`/leave_types/${companyCode}`)
        .then((response) => setLeaveTypes(response.data))
        .catch((error) => console.error('Error fetching leave types:', error));
    }
  }, [companyCode]);

  // Fetch leave requests
  useEffect(() => {
    if (companyCode) {
      const statusQuery = formData.status ? `?status=${formData.status}` : ''; // Add status filter to query
      api.get(`/leave_requests/${companyCode}${statusQuery}`)
      .then((response) => {
        console.log('Leave Requests Response:', response.data);
        setLeaveRequests(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
        .catch((error) => {
          console.error('Error fetching leave requests:', error);
          setError('Error fetching leave requests. Please try again.');
        });
    }
  }, [companyCode, formData.status]);
  
  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!formData.user_id || !formData.leave_type_id || !formData.start_date || !formData.end_date) {
      setError('All fields are required.');
      return;
    }
  
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Start date cannot be after end date.');
      return;
    }
  
    const url = editMode
      ? `/leave_requests/${companyCode}/${selectedId}`
      : `/leave_requests/${companyCode}`;
    const method = editMode ? 'post' : 'post';
  
    const requestData = new FormData();
    requestData.append('user_id', formData.user_id);
    requestData.append('leave_type_id', formData.leave_type_id);
    requestData.append('start_date', formData.start_date);
    requestData.append('end_date', formData.end_date);
    requestData.append('status', formData.status);
    requestData.append('reason', formData.reason);
    if (formData.image) {
      requestData.append('image', formData.image);
    }
  
    try {
      const response = await api({
        method,
        url,
        data: requestData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setError('');
      if (editMode) {
        setLeaveRequests(
          leaveRequests.map((leaveRequest) =>
            leaveRequest.id === selectedId ? response.data : leaveRequest
          )
        );
      } else {
        setLeaveRequests([...leaveRequests, response.data]);
      }
      setShow(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting leave request:', error.response?.data || error.message);
      setError('Error submitting leave request. Please try again.');
    }
  };
  // Handle delete
  const handleDelete = (id) => {
    api
      .delete(`/leave_requests/${companyCode}/${id}`)
      .then(() => {
        setLeaveRequests(leaveRequests.filter((leaveRequest) => leaveRequest.id !== id));
      })
      .catch((error) => console.error('Error deleting leave request:', error));
  };
  const handleStatusChange = async (e, leaveRequestId) => {
    const updatedStatus = e.target.value;
  
    // تحديث الحالة محليًا أولاً
    const updatedLeaveRequests = leaveRequests.map((leaveRequest) =>
      leaveRequest.id === leaveRequestId
        ? { ...leaveRequest, status: updatedStatus }
        : leaveRequest
    );
    setLeaveRequests(updatedLeaveRequests);
  
    // Send the full updated leave request to the server
    try {
      const response = await api.put(`/leave_requests/${companyCode}/${leaveRequestId}`, {
        user_id: updatedLeaveRequests[0].user_id, // Update with the new user_id
        leave_type_id: updatedLeaveRequests[0].leave_type_id, // Update with the new leave_type_id
        start_date: updatedLeaveRequests[0].start_date, // Update with the new start_date
        end_date: updatedLeaveRequests[0].end_date, // Update with the new end_date
        status: updatedStatus, // Updated status
        reason: updatedLeaveRequests[0].reason, // Update with the reason
        image: updatedLeaveRequests[0].image, // Include the image if it exists
      });
  
      // If the response contains the updated data, update the local state
      if (response.data) {
        const updatedData = response.data; // Assume the response contains the updated data
        setLeaveRequests((prevState) =>
          prevState.map((leaveRequest) =>
            leaveRequest.id === updatedData.id
              ? { ...leaveRequest, status: updatedData.status }
              : leaveRequest
          )
        );
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      setError('Error updating status. Please try again.');
  
      // If an error occurs, revert the local update
      setLeaveRequests(leaveRequests);
    }
  };
  

  
  
  // Handle edit
  const handleEdit = (leaveRequest) => {
    setSelectedId(leaveRequest.id);
    setFormData({
      user_id: leaveRequest.user_id,
      leave_type_id: leaveRequest.leave_type_id,
      start_date: leaveRequest.start_date,
      end_date: leaveRequest.end_date,
      status: leaveRequest.status,
      reason: leaveRequest.reason,
      image: null, // Reset file input
      image_path: leaveRequest.image_path, // Include existing image path
    });
    setEditMode(true);
    setShow(true);
  };
  // Reset form data
  const resetForm = () => {
    setFormData({
      user_id: '',
      leave_type_id: '',
      start_date: '',
      end_date: '',
      status: 'pending',
      reason: '',
      image: null,
    });
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="container-fluid">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container-fluid">
          <span className="text-white navbar-brand fw-bold">Leave Requests</span>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link to="/home" className="nav-link btn btn-outline-light me-2 navbar-btn">HomePage</Link>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-outline-light me-2 navbar-btn" onClick={() => navigate('/leave_types')}>Leave</button>
              </li>
              <Button variant="nav-link btn btn-outline-light me-2 navbar-btn" onClick={() => setShow(true)} className="navbar-btn">
                Create Leave Request
              </Button>
            </ul>
          </div>
        </div>
        
      </nav>

   
      <Form.Group controlId="formStatusFilter" className="mt-3">
        <Form.Label>Filter by Status</Form.Label>
        <Form.Control
          as="select"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Form.Control>
      </Form.Group>
      {/* Error Message */}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      {/* Show Loading Spinner while data is being fetched */}
      {loading ? (
        <LoadingSpinner />
      ) : (
     
     
<Table striped bordered hover className="mt-3 leave-table">
  <thead>
    <tr>
      <th>User</th>
      <th>Leave Type</th>
      <th>Start Date</th>
      <th>End Date</th>
      <th>Status</th>
      <th>Image</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {leaveRequests.map((leaveRequest) => (
      <tr key={leaveRequest.id}>
        <td>{leaveRequest.user?.first_name || 'N/A'}</td>
        <td>{leaveRequest.leave_type?.name || 'N/A'}</td>
        <td>{leaveRequest.start_date}</td>
        <td>{leaveRequest.end_date}</td>
        <td>
          <Form.Control
            as="select"
            value={leaveRequest.status}
            onChange={(e) => handleStatusChange(e, leaveRequest.id)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Form.Control>
        </td>
        <td>
          {leaveRequest.image_path ? (
            <div className="mt-2">
              <button
                className="bg-transparent border-0"
                onClick={() => {
                  // Open a new window to display the image
                  const newWindow = window.open("", "_blank", "width=600,height=600");
                  newWindow.document.write(
                    `<html><head><title>Leave Request Image</title></head><body style="text-align:center;">` +
                    `<img src="https://newhrsys-production.up.railway.app/storage/${leaveRequest.image_path}" alt="Leave Request" style="max-width:100%; height:auto;" />` +
                    `</body></html>`
                  );
                }}
              >
                <i className="bi bi-eye-fill text-primary" style={{ fontSize: "1.25rem" }}></i>
              </button>
            </div>
          ) : (
            <span>No image</span>
          )}
        </td>
        <td>
          <Button variant="warning" onClick={() => handleEdit(leaveRequest)} className="bg-transparent border-0">
            <i className="bi bi-pencil-fill text-warning" style={{ fontSize: "1.25rem" }}></i>
          </Button>
          <Button variant="danger" onClick={() => handleDelete(leaveRequest.id)} className="bg-transparent border-0">
            <i className="bi bi-trash-fill text-danger" style={{ fontSize: "1.25rem" }}></i>
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

      )}

      {/* Modal for Create/Edit Leave Request */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Leave Request' : 'Create Leave Request'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUser" className="mt-3">
              <Form.Label>User</Form.Label>
              <Form.Control
                as="select"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formLeaveType" className="mt-3">
              <Form.Label>Leave Type</Form.Label>
              <Form.Control
                as="select"
                name="leave_type_id"
                value={formData.leave_type_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((leaveType) => (
                  <option key={leaveType.id} value={leaveType.id}>
                    {leaveType.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formStartDate" className="mt-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEndDate" className="mt-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formStatus" className="mt-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formReason" className="mt-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              />
            </Form.Group>

          
            <Form.Group controlId="formImage" className="mt-3">
    <Form.Label>Upload Image</Form.Label>
    <Form.Control
      type="file"
      name="image"
      onChange={handleFileChange}
    />
    {editMode && formData.image_path && (
      <div className="mt-2">
        <img
          src={`https://newhrsys-production.up.railway.app/storage/${formData.image_path}`}
          alt="Leave Request"
          width="450" height="350"
          onError={(e) => {
            console.error("Image failed to load:", e.target.src);
            e.target.style.display = "none";
          }}
        />
      </div>
    )}
  </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              {editMode ? 'Update' : 'Create'} Leave Request
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LeaveRequestsPage;