import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../LoadingSpinner';

const MissingCheckoutsPage = () => {
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const [missingCheckouts, setMissingCheckouts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!companyCode) {
      setError('Company code is missing.');
      setIsLoading(false);
      return;
    }

    const fetchMissingCheckouts = async () => {
      try {
        const response = await api.get(`/missing-checkouts/${companyCode}`);
        setMissingCheckouts(response.data);
      } catch (err) {
        setError('Error fetching missing checkouts.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingCheckouts();
  }, [companyCode]);

  const handleEdit = (id) => {
    navigate(`/checkins/edit/${id}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center text-danger">Missing Check-Outs</h2>
      {error && <div className="text-center alert alert-danger">{error}</div>}

      {missingCheckouts.length === 0 ? (
        <p className="text-center">No missing check-outs found.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Check-In Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {missingCheckouts.map((record, index) => (
              <tr key={record.id}>
                <td>{index + 1}</td>
                <td>{record.user?.first_name && record.user?.last_name || 'Unknown'}</td>
                <td>{new Date(record.check_in).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEdit(record.id)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MissingCheckoutsPage;
