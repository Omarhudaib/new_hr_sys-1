import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner'; // استيراد مكون التحميل
import api from '../api'; // استيراد دالة `api`

const EditRolePage = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  
  // Retrieve companyCode from localStorage
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (!companyCode) {
          setError('Company code is not available.');
          setLoading(false);
          return;
        }

        const response = await api.get(`/roles/${companyCode}/${id}`);
        setName(response.data.name);
        setLoading(false); // Set loading to false when data is fetched
      } catch (err) {
        setError('Error fetching role data.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };
    fetchRole();
  }, [id, token, companyCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedRole = { name };
      // Use companyCode in the URL to update the role
      await api.put(`/roles/${companyCode}/${id}`, updatedRole);
      navigate('/role'); // Redirect to the role list page after updating
    } catch (err) {
      setError('Error updating role.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow-sm w-50 text-center">
      <h2 className="mb-4">Edit Role</h2>
      
      {loading ? (
        <LoadingSpinner /> // Show loading spinner while fetching role data
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="roleName" className="form-label">Role Name</label>
            <input 
              type="text" 
              id="roleName"
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter role name" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary">Update Role</button>
        </form>
      )}

      <div className="mt-4">
        <button className="btn btn-secondary" onClick={() => navigate('/role')}>
          Back to Roles
        </button>
      </div>
    </div>   </div>   
  );
};

export default EditRolePage;
