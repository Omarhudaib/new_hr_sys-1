import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // استدعاء API من الملف
import LoadingSpinner from '../LoadingSpinner'; // Import the LoadingSpinner component

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_id: '',
    first_name: '',
    last_name: '',
    second_name: '',
    middle_name: '',
    user_code: '',
    password: '',
    role_id: '',
    department_id: '',
    additional_information: '',
    image_path: null,
    national_id: '',
    marital_status: '',
    attendtaby: '',
    date_of_birth: '',
    holidays: '',
    salary: '',
    sick_days: '',
    annual_vacations_days: '',
    work_type: '',
  });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  useEffect(() => {
    const companyData = JSON.parse(localStorage.getItem('company'));
    if (companyData && companyData.id) {
      setFormData((prev) => ({ ...prev, company_id: companyData.id }));
    } else {
      navigate('/login');
    }
  }, [navigate]);
  useEffect(() => {
    const storedRoles = localStorage.getItem('roles');
    const storedDepartments = localStorage.getItem('departments');
    
    if (storedRoles && storedDepartments) {
      setRoles(JSON.parse(storedRoles));
      setDepartments(JSON.parse(storedDepartments));
      setLoading(false);
    } else {
      // إجراء الاتصال بـ API فقط في حالة عدم وجود البيانات
      api.get(`/role/${companyCode}`).then((response) => {
        localStorage.setItem('roles', JSON.stringify(response.data));
        setRoles(response.data);
      });
      api.get(`/departments/${companyCode}`).then((response) => {
        localStorage.setItem('departments', JSON.stringify(response.data));
        setDepartments(response.data);
      });
    }
  }, [companyCode]);
  
  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const response = await api.get(`/users/${companyCode}/${id}`);
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [id, companyCode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });
  
    // Log FormData for debugging
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }
  
    try {
      if (id) {
        // Update existing user
        await api.put(`/users/${companyCode}/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new user
        await api.post(`/users/${companyCode}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      navigate('/users');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error saving user:', error);
      }
    }
  };
  return loading ? (
    <LoadingSpinner />
  ) : (
    <div className="mt-3 container-fluid">
    <div className="row">
      <h1 className="mb-4 text-center col-12 text-primary">
        {id ? 'Edit User' : 'Create User'}
      </h1>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="col-12">
        {/* Personal Information Section */}
        <div className="mb-3 row">
          <div className="col-md-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="form-control"
            />
            {errors.first_name && <div className="text-danger">{errors.first_name}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">Middle Name</label>
            <input
              type="text"
              value={formData.middle_name}
              onChange={(e) => handleInputChange('middle_name', e.target.value)}
              className="form-control"
            />
            {errors.middle_name && <div className="text-danger">{errors.middle_name}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="form-control"
            />
            {errors.last_name && <div className="text-danger">{errors.last_name}</div>}
          </div>
          <div className="col-md-3">
            <label className="form-label">Second Name</label>
            <input
              type="text"
              value={formData.second_name}
              onChange={(e) => handleInputChange('second_name', e.target.value)}
              className="form-control"
            />
            {errors.second_name && <div className="text-danger">{errors.second_name}</div>}
          </div>
        </div>
  
        {/* Authentication Section */}
        <div className="mb-3 row">
          <div className="col-md-6">
            <label className="form-label">User Code</label>
            <input
              type="text"
              value={formData.user_code}
              onChange={(e) => handleInputChange('user_code', e.target.value)}
              className="form-control"
            />
            {errors.user_code && <div className="text-danger">{errors.user_code}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="form-control"
            />
            {errors.password && <div className="text-danger">{errors.password}</div>}
          </div>
        </div>
  
        {/* Organizational Section */}
        <div className="mb-3 row">
          <div className="col-md-6">
            <label className="form-label">Role</label>
            <select
              value={formData.role_id}
              onChange={(e) => handleInputChange('role_id', e.target.value)}
              className="form-select"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && <div className="text-danger">{errors.role_id}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Department</label>
            <select
              value={formData.department_id}
              onChange={(e) => handleInputChange('department_id', e.target.value)}
              className="form-select"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.dep_name}
                </option>
              ))}
            </select>
            {errors.department_id && <div className="text-danger">{errors.department_id}</div>}
          </div>
        </div>
  
        {/* Profile Image */}
        <div className="mb-3 row">
          <div className="col-12">
            <label className="form-label">Profile Image</label>
            <input
              type="file"
              onChange={(e) => handleInputChange('image_path', e.target.files[0])}
              className="form-control"
              accept="image/*"
            />
            {errors.image_path && <div className="text-danger">{errors.image_path}</div>}
          </div>
        </div>
  
        {/* Personal Details */}
        <div className="mb-3 row">
          <div className="col-md-6">
            <label className="form-label">National ID</label>
            <input
              type="text"
              value={formData.national_id}
              onChange={(e) => handleInputChange('national_id', e.target.value)}
              className="form-control"
            />
            {errors.national_id && <div className="text-danger">{errors.national_id}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Marital Status</label>
            <select
              value={formData.marital_status}
              onChange={(e) => handleInputChange('marital_status', e.target.value)}
              className="form-select"
            >
              <option value="">Select Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
            {errors.marital_status && <div className="text-danger">{errors.marital_status}</div>}
          </div>
        </div>
        <div className="mb-3 row">
          <div className="col-md-6">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className="form-control"
            />
            {errors.date_of_birth && <div className="text-danger">{errors.date_of_birth}</div>}
          </div>
          <div className="col-md-6">
  <label className="form-label">Annual Vacation</label>
  <input
    type="number"
    value={formData.annual_vacations_days}
    onChange={(e) => handleInputChange('annual_vacations_days', e.target.value)}
    className="form-control"
  />
</div>
        </div>
  
        {/* Employment Details */}
        <div className="mb-3 row">
          <div className="col-md-4">
            <label className="form-label">Salary</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              className="form-control"
            />
            {errors.salary && <div className="text-danger">{errors.salary}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label">Holidays</label>
            <input
              type="number"
              value={formData.holidays}
              onChange={(e) => handleInputChange('holidays', e.target.value)}
              className="form-control"
            />
            {errors.holidays && <div className="text-danger">{errors.holidays}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label">Sick Days</label>
            <input
              type="number"
              value={formData.sick_days}
              onChange={(e) => handleInputChange('sick_days', e.target.value)}
              className="form-control"
            />
            {errors.sick_days && <div className="text-danger">{errors.sick_days}</div>}
          </div>

        </div>
  
        {/* Attendance Settings */}
        <div className="mb-3 row">
          <div className="col-md-6">
            <label className="form-label">Attendance Type</label>
            <select
              value={formData.attendtaby || ''}
              onChange={(e) => handleInputChange('attendtaby', e.target.value)}
              className="form-select"
            >
              <option value="">Select Attendance Type</option>
              <option value="any location">Any Location</option>
              <option value="dep location">Department Location</option>
            </select>
            {errors.attendtaby && <div className="text-danger">{errors.attendtaby}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Job Type for Daman</label>
            <select
              value={formData.work_type || ''}
              onChange={(e) => handleInputChange('work_type', e.target.value)}
              className="form-select"
            >
              <option value="normal">Normal</option>
              <option value="hazardous">Hazardous</option>
            </select>
            {errors.work_type && <div className="text-danger">{errors.work_type}</div>}
          </div>
        </div>
  
        {/* Additional Information */}
        <div className="mb-3 row">
          <div className="col-12">
            <label className="form-label">Additional Information</label>
            <textarea
              value={formData.additional_information}
              onChange={(e) => handleInputChange('additional_information', e.target.value)}
              className="form-control"
              rows={3}
            />
            {errors.additional_information && (
              <div className="text-danger">{errors.additional_information}</div>
            )}
          </div>
        </div>
  
        {/* Submit Button */}
        <div className="row">
          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
              {id ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  );
};

export default UserForm;
