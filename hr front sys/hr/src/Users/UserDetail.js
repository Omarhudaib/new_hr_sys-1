import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../LoadingSpinner'; // Import the LoadingSpinner component
import UserImage from '../user.jpg'; 

const UserDetail = () => {
  const { id } = useParams(); // User ID from the URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get companyCode from localStorage or any other context
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const permissions = JSON.parse(localStorage.getItem('permissions')) ; // Get stored permissions

  useEffect(() => {
    if (!companyCode) {
      console.error('Company code is missing');
      setLoading(false);
      return;
    }

    // API request with both companyCode and user ID, including permissions in headers
    api.get(`/users/${companyCode}/${id}`, {
      headers: { 'User-Permissions': JSON.stringify(permissions) } // Send permissions in headers
    })
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user details:', error.response ? error.response.data : error.message);
        setLoading(false);
      });
  }, [companyCode, id, permissions]); // Re-fetch when companyCode, id, or permissions changes

  if (loading) {
    return <LoadingSpinner />; // Show custom loading spinner while fetching data
  }

  if (!user) {
    return (
      <div className="container mt-1 text-center">
        <h3>User not found</h3>
        <p>404 - The requested user does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="border-0 shadow-lg card rounded-3">
        <div className="p-2 card-body">
          <div className="row g-4">
            {/* User Image Section */}
            <div className="text-center col-md-4">
              <div className="d-flex justify-content-center">
                {user.image_path ? (
                  <img
                    src={`https://newhrsys-production.up.railway.app/storage/${user.image_path}`}
                    alt="User"
                    className="shadow-sm img-fluid rounded-circle"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <img
                    src={UserImage}
                    alt="User"
                    className="shadow-sm img-fluid rounded-circle"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>

            {/* User Information Section */}
            <div className="col-md-8">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>ID:</strong>
                  <span>{user.id}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Name:</strong>
                  <span>{`${user.first_name} ${user.middle_name || ''} ${user.last_name}`}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>User Code:</strong>
                  <span>{user.user_code}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Role:</strong>
                  <span>{user.role?.name || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Department:</strong>
                  <span>{user.department?.dep_name || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Date of Birth:</strong>
                  <span>{user.date_of_birth || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Marital Status:</strong>
                  <span>{user.marital_status || 'N/A'}</span>
                </li>
              </ul>
            </div>

            {/* Additional Information Section */}
            <div className="col-md-12">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>National ID:</strong>
                  <span>{user.national_id || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Salary:</strong>
                  <span>{user.salary ? `$${user.salary}` : 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Holidays:</strong>
                  <span>{user.holidays || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Sick Days:</strong>
                  <span>{user.sick_days || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Annual Vacations:</strong>
                  <span>{user.annual_vacations_days || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>Additional Info:</strong>
                  <span>{user.additional_information || 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
