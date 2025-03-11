import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner'; // Import the LoadingSpinner component
import api from '../api'; // Import the api instance

const AddRolePage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to track loading status
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      setLoading(true); // Set loading to true when the request starts

      // Get company code and company ID from localStorage
      const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
      const companyId = JSON.parse(localStorage.getItem('company'))?.id;

      if (!companyCode || !companyId) {
        setError('Company data is missing.');
        setLoading(false);
        return;
      }

      const newRole = { name, company_id: companyId };

      // Use api instance instead of axios
      await api.post(`/roles/${companyCode}`, newRole);

      setLoading(false); // Set loading to false after the request is complete
      navigate('/role'); // Redirect to role list page
    } catch (err) {
      console.error(err);
      setError('Error adding role.');
      setLoading(false); // Set loading to false if there's an error
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="p-4 text-center shadow-sm card w-50">
        <h2 className="mb-4">Add New Role</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <LoadingSpinner /> // Display the spinner while loading
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="roleName" className="form-label">Role Name</label>
              <input 
                id="roleName"
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter Role Name" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">Add Role</button>
          </form>
        )}

        <div className="mt-3">
          <button 
            className="btn btn-secondary w-100" 
            onClick={() => navigate('/role')}
          >
            Back to Roles
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRolePage;