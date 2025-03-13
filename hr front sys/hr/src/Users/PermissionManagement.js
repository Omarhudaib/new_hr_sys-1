import React, { useEffect, useState } from 'react';
import axios from '../api';

const UserPermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [alert, setAlert] = useState({ message: '', type: '' }); // State for alert
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, permissionsData] = await Promise.all([
          axios.get(`/usersc/${companyCode}`),
          axios.get('/permissions')
        ]);
        setUsers(usersData.data);
        setPermissions(permissionsData.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    if (companyCode) {
      fetchData();
    }
  }, [companyCode]);

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedUserId || selectedPermissions.length === 0) {
      setAlert({ message: 'Please select a user and at least one permission.', type: 'danger' });
      return;
    }

    try {
      const data = {
        user_id: selectedUserId,
        permissions: selectedPermissions
      };
      await axios.post(`/assign-permissions/${companyCode}`, data);
      setAlert({ message: 'Permissions assigned successfully.', type: 'success' });
      setSelectedUserId('');
      setSelectedPermissions([]);
      const updatedUsers = await axios.get(`/usersc/${companyCode}`);
      setUsers(updatedUsers.data);
    } catch (error) {
      setAlert({ message: 'An error occurred while updating permissions.', type: 'danger' });
      console.error(error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container">
        <h1 className="mb-4 text-center text-primary text-uppercase fw-bold">User Permission Management</h1>

        {/* Displaying the alert message */}
        {alert.message && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}

        <div className="mx-auto shadow-sm card rounded-3">
          <div className="card-body">
            {/* User selection */}
            <div className="mb-3">
              <label className="form-label fw-bold">User:</label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.second_name} {user.middle_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Permissions selection */}
            <div className="mb-3">
              <h3 className="text-secondary text-uppercase">Select Permissions:</h3>
              <div className="border-0 shadow-sm card">
                <div className="card-body">
                  <div className="row">
                    {permissions.length > 0 ? (
                      permissions.map((perm, index) => (
                        <div key={perm.id} className="col-md-6">
                          <div className="mb-2 form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`perm-${perm.id}`}
                              checked={selectedPermissions.includes(perm.id)}
                              onChange={() => handlePermissionChange(perm.id)}
                              style={{ transform: "scale(1.2)" }} // Enlarging checkbox
                            />
                            <label className="form-check-label ms-2" htmlFor={`perm-${perm.id}`}>
                              {perm.name}
                            </label>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-danger">No permissions available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="d-grid">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!selectedUserId || selectedPermissions.length === 0}
              >
                Assign Permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionManagement;
