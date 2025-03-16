import React, { useEffect, useState } from 'react';
import axios from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

const Permission = () => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [alert, setAlert] = useState({ message: '', type: '' }); // State for alert
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  // جلب جميع المستخدمين والصلاحيات الخاصة بهم
  const fetchUserPermissions = async () => {
    try {
      const response = await axios.get(`/user-permissions/${companyCode}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setAlert({ message: 'Error fetching user data.', type: 'danger' });
    }
  };

  // جلب جميع الصلاحيات المتاحة
  const fetchAllPermissions = async () => {
    try {
      const response = await axios.get('/permissions');
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setAlert({ message: 'Error fetching permissions.', type: 'danger' });
    }
  };

  // تحديث صلاحيات المستخدم
  const updateUserPermissions = async (userId, newPermissions) => {
    try {
      const data = {
        user_id: userId,
        permissions: newPermissions,
      };
      await axios.put(`/update-permissions/${companyCode}`, data);
      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserPermissions();
        await fetchAllPermissions();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, [companyCode]);

  // فتح النافذة المنبثقة لتعديل الصلاحيات
  const handleEdit = (user) => {
    setSelectedUser(user);
    setSelectedPermissions(user.permissions.map((perm) => perm.id));
    setIsModalOpen(true);
  };

  // إغلاق النافذة المنبثقة
  const handleCloseModal = () => {
    setSelectedUser(null);
    setSelectedPermissions([]);
    setIsModalOpen(false);
  };

  // التعامل مع تغيير الصلاحيات في النافذة المنبثقة
  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // حفظ التغييرات
  const handleSubmit = async () => {
    try {
      const success = await updateUserPermissions(selectedUser.id, selectedPermissions);
      if (success) {
        setAlert({ message: 'Permissions updated successfully', type: 'success' });
        handleCloseModal();
        // تحديث بيانات المستخدمين بعد الحفظ
        await fetchUserPermissions();
      } else {
        setAlert({ message: 'Error updating permissions', type: 'danger' });
      }
    } catch (error) {
      setAlert({ message: 'An error occurred while updating permissions', type: 'danger' });
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center text-primary">User Permission Management</h1>

      {/* Alert Message */}
      {alert.message && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      {/* جدول عرض المستخدمين */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>User Name</th>
              <th>Current Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>
                    {user.permissions.length === 0 ? (
                      <span className="text-muted">No permissions assigned</span>
                    ) : (
                      user.permissions.map((perm) => (
                        <span key={perm.id} className="badge bg-secondary me-1">
                          {perm.name}
                        </span>
                      ))
                    )}
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm" onClick={() => handleEdit(user)}>
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-danger">
                  No users found for this company.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة تعديل الصلاحيات */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">Edit Permissions for {selectedUser?.full_name}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {permissions.map((perm) => (
                  <div key={perm.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                    />
                    <label className="form-check-label">{perm.name}</label>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleSubmit}>Save Changes</button>
                <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permission;
