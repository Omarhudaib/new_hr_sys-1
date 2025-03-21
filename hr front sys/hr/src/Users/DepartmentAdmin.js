import React, { useEffect, useState } from 'react';
import axios from '../api'; // Ensure axios is properly configured

const DepartmentAdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' }); // For storing messages
  const [editingAdmin, setEditingAdmin] = useState(null); // For editing admin
  const [editUserId, setEditUserId] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');

  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, departmentsData, adminsData] = await Promise.all([
          axios.get(`/usersc/${companyCode}`),
          axios.get(`/departments/${companyCode}`),
          axios.get(`/company/${companyCode}/department-admins`)
        ]);
  
        // Log responses for debugging
        console.log("Users Data:", usersData.data);
        console.log("Departments Data:", departmentsData.data);
        console.log("Admins Data:", adminsData.data);
  
        // Extract users and departments
        const users = usersData.data;
        const departments = departmentsData.data;
  
        // Ensure adminsData.data.data exists and is an array
        const adminsArray = Array.isArray(adminsData.data?.data)
          ? adminsData.data.data
          : [];
  
        if (!adminsArray.length) {
          console.warn('No admins found in the response:', adminsData.data);
        }
  
        // Map admins to include user and department details
        const enrichedAdmins = adminsArray.map((admin) => {
          const user = users.find((user) => user.id === admin.user_id);
          const department = departments.find(
            (department) => department.id === admin.department_id
          );
  
          return {
            ...admin,
            user: user || null,
            department: department || null,
          };
        });
  
        setUsers(users);
        setDepartments(departments);
        setAdmins(enrichedAdmins); // Set enriched admins
      } catch (error) {
        console.error('Error fetching data:', error);
        setAdmins([]); // Set admins as empty array in case of error
      }
    };
  
    if (companyCode) {
      fetchData();
    }
  }, [companyCode]);

  // Add Department Admin
  const addDepartmentAdmin = async () => {
    if (!selectedUserId || !selectedDepartmentId) {
      setAlert({
        message: 'Please select both a user and a department.',
        type: 'danger',
      });
      return;
    }

    try {
      const response = await axios.post(
        `/company/${companyCode}/add-department-admin`,
        {
          user_id: selectedUserId,
          department_id: selectedDepartmentId,
        }
      );
      setAlert({
        message: 'Department Admin added successfully.',
        type: 'success',
      });
      setAdmins([...admins, response.data.data]); // Add the new admin
    } catch (error) {
      setAlert({
        message: 'Failed to add Department Admin.',
        type: 'danger',
      });
    }
  };

  // Delete Department Admin
  const deleteDepartmentAdmin = async (adminId) => {
    try {
      await axios.delete(`/company/${companyCode}/department-admin/${adminId}`);
      setAdmins(admins.filter((admin) => admin.id !== adminId));
      setAlert({
        message: 'Department Admin deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      setAlert({
        message: 'Failed to delete Department Admin.',
        type: 'danger',
      });
    }
  };

  // Start editing admin
  const startEdit = (admin) => {
    setEditingAdmin(admin);
    setEditUserId(admin.user.id);
    setEditDepartmentId(admin.department.id);
  };

  // Save edited admin
  const saveEdit = async () => {
    if (!editUserId || !editDepartmentId) {
      setAlert({
        message: 'Please select both a user and a department.',
        type: 'danger',
      });
      return;
    }

    try {
      const response = await axios.put(
        `/company/${companyCode}/department-admin/${editingAdmin.id}`,
        {
          user_id: editUserId,
          department_id: editDepartmentId,
        }
      );

      setAdmins(
        admins.map((admin) =>
          admin.id === editingAdmin.id ? response.data.data : admin
        )
      );
      setAlert({
        message: 'Department Admin updated successfully.',
        type: 'success',
      });
      setEditingAdmin(null); // Reset editing state
    } catch (error) {
      setAlert({
        message: 'Failed to update Department Admin.',
        type: 'danger',
      });
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4 text-center text-primary">Department Admin Management</h1>

      {/* Display alert */}
      {alert.message && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}

      {/* Add or Edit Department Admin */}
      <div className="mb-3">
        <label className="form-label">Select User:</label>
        <select
          className="form-select"
          value={editingAdmin ? editUserId : selectedUserId}
          onChange={(e) =>
            editingAdmin
              ? setEditUserId(e.target.value)
              : setSelectedUserId(e.target.value)
          }
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Select Department:</label>
        <select
          className="form-select"
          value={editingAdmin ? editDepartmentId : selectedDepartmentId}
          onChange={(e) =>
            editingAdmin
              ? setEditDepartmentId(e.target.value)
              : setSelectedDepartmentId(e.target.value)
          }
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.dep_name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-primary"
        onClick={editingAdmin ? saveEdit : addDepartmentAdmin}
      >
        {editingAdmin ? 'Save Changes' : 'Add Department Admin'}
      </button>

      <h2 className="mt-4">Current Department Admins</h2>
      {admins && admins.length > 0 ? (
        <ul className="list-group">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className="list-group-item d-flex justify-content-between"
            >
              {admin.user ? (
                <>
                  {admin.user.first_name} {admin.user.last_name} -{' '}
                  {admin.department
                    ? admin.department.dep_name
                    : 'Department not available'}
                </>
              ) : (
                'User data not available'
              )}
              <button
                className="btn btn-danger"
                onClick={() => deleteDepartmentAdmin(admin.id)}
              >
                Delete
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={() => startEdit(admin)}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No admins available</p>
      )}
    </div>
  );
};

export default DepartmentAdminManagement;