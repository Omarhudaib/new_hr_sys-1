import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../LoadingSpinner';

const EditCompanyPage = () => {
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    additional_information: '',
    image_path: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyCode) {
      setError('Company code is missing.');
      setIsLoading(false);
      return;
    }

    const fetchCompanyData = async () => {
      try {
        const response = await api.get(`/company/${companyCode}`);
        setFormData(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Error fetching company data.');
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/company/${companyCode}`, formData);
      if (response.status === 200) {
        navigate(`/HOME`);
      }
    } catch (err) {
      setError('Failed to update company data.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Edit Company</h2>
      {error && <div className="alert alert-danger text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="name" className="form-label fw-bold">Company Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="image_path" className="form-label fw-bold">Image URL</label>
          <input
            type="text"
            className="form-control"
            id="image_path"
            name="image_path"
            value={formData.image_path}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-12">
          <label htmlFor="additional_information" className="form-label fw-bold">Additional Information</label>
          <textarea
            className="form-control"
            id="additional_information"
            name="additional_information"
            value={formData.additional_information}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="password" className="form-label fw-bold">New Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 d-flex justify-content-center gap-3 mt-3">
          <button type="submit" className="btn btn-primary px-4">Save Changes</button>
        
        </div>
      </form>
    </div>
  );
};

export default EditCompanyPage;
