import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../LoadingSpinner';

const CheckInForm = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    check_in: '',
    location_in: '',
    latitude_in: '',
    longitude_in: '',
    location_out: '',
    latitude_out: '',
    longitude_out: '',
    check_out: '',
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false); // State to track loading
  const { id } = useParams();
  const navigate = useNavigate();

  // Retrieve the company ID securely from local storage
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  useEffect(() => {
    if (id && companyCode) {
      setLoading(true); // Set loading to true when fetching data
      api
        .get(`/checkins/${companyCode}/${id}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('Error fetching check-in:', error);
        })
        .finally(() => {
          setLoading(false); // Set loading to false once the request is complete
        });
    }
  }, [id, companyCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!companyCode) {
      console.error('Company ID is missing');
      return;
    }

    setLoading(true); // Set loading to true when submitting the form

    const request = id
      ? api.put(`/checkins/${companyCode}/${id}`, formData) // استخدام api.put بدلاً من axios.put
      : api.post(`/checkins/${companyCode}`, formData); // استخدام api.post بدلاً من axios.post

    request
      .then(response => {
        navigate('/checkins');
      })
      .catch(error => {
        if (error.response && error.response.data) {
          setErrors(error.response.data.errors || { message: 'An error occurred' });
        }
        console.error('Error submitting the check-in:', error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false once the request is complete
      });
  };

  return (
    <div className="container-fluid mt-3">
      <h1 className="mb-4">{id ? 'Edit Check-in' : 'Add Check-in'}</h1>
      
      {/* Show the loading spinner while data is being fetched or form is being submitted */}
      {loading && <LoadingSpinner />}

      <form onSubmit={handleSubmit} className="row g-3">
        {errors && (
          <div className="alert alert-danger">
            {Object.entries(errors).map(([key, value]) => (
              <p key={key}>{value}</p>
            ))}
          </div>
        )}
        <div className="col-md-6">
          <label className="form-label">User ID:</label>
          <input
            type="text"
            name="user_id"
            className="form-control"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Check-in Time:</label>
          <input
            type="datetime-local"
            name="check_in"
            className="form-control"
            value={formData.check_in}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Location In:</label>
          <input
            type="text"
            name="location_in"
            className="form-control"
            value={formData.location_in}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Latitude In:</label>
          <input
            type="text"
            name="latitude_in"
            className="form-control"
            value={formData.latitude_in}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Longitude In:</label>
          <input
            type="text"
            name="longitude_in"
            className="form-control"
            value={formData.longitude_in}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Location Out:</label>
          <input
            type="text"
            name="location_out"
            className="form-control"
            value={formData.location_out}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Latitude Out:</label>
          <input
            type="text"
            name="latitude_out"
            className="form-control"
            value={formData.latitude_out}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Longitude Out:</label>
          <input
            type="text"
            name="longitude_out"
            className="form-control"
            value={formData.longitude_out}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Check-out Time:</label>
          <input
            type="datetime-local"
            name="check_out"
            className="form-control"
            value={formData.check_out}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            {id ? 'Update Check-in' : 'Add Check-in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckInForm;
