import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';  // Import the LoadingSpinner component

const DepartmentPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

    useEffect(() => {
        if (!companyCode) {
            navigate('/login'); // Redirect to login if no companyCode is found
        } else {
            fetchDepartments();
        }
    }, [companyCode, navigate]);

    useEffect(() => {
        if (!companyCode) {
            navigate('/login'); // Redirect to login if no companyCode is found
        } else {
            const storedDepartments = localStorage.getItem('departments'); // Check if departments are already stored
            if (storedDepartments) {
                setDepartments(JSON.parse(storedDepartments)); // Load departments from localStorage
                setLoading(false);
            } else {
                fetchDepartments(); // Fetch departments if not in localStorage
            }
        }
    }, [companyCode, navigate]);
    
    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await api.get(`/departments/${companyCode}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const departmentsData = Array.isArray(response.data) ? response.data : [response.data];
            setDepartments(departmentsData || []);
            localStorage.setItem('departments', JSON.stringify(departmentsData)); // Store the departments in localStorage
        } catch (err) {
            setError('Failed to fetch departments. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    

    const handleAddDepartment = () => {
        navigate('/departments/create'); // Navigate to the add department page
    };

    const handleEdit = (id) => {
        navigate(`/departments/edit/${id}`); // Navigate to the edit department page
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                const response = await api.delete(`/departments/${companyCode}/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });
                if (response.status === 200) {
                    setDepartments(departments.filter(dep => dep.id !== id)); // Remove from state
                    alert('Department deleted successfully.');
                } else {
                    setError('Unable to delete the department.');
                }
            } catch (err) {
                setError('Failed to delete the department. Please try again.');
            }
        }
    };

    // Filter departments based on the search query
    const filteredDepartments = departments.filter((department) =>
        department.dep_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.loc_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container-fluid">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-primary">
                <div className="container-fluid">
                    <span className="text-white navbar-brand fw-bold">Department Management</span>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav d-flex align-items-center ">
                     
  
                            <li className="nav-item ">
                                {/* Search Bar */}
                                <input
                                    type="text"
                                    className="form-control ms-3"
                                    placeholder="Search Departments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>


            {/* Loading Spinner */}
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p className="mt-3 text-danger">{error}</p>
            ) : (
                // Table for Departments
                <div className="table-responsive">
                    <table className="table mt-3 table-bordered table-striped department-table">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>Department Name</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((department, index) => (
                                    <tr key={department.id}>
                                        <td>{index + 1}</td>
                                        <td>{department.dep_name}</td>
                                        <td>{department.loc_name} 
                                            <a
                                                href={`https://www.google.com/maps?q=${department.latitude},${department.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-transparent border-0"
                                            >
                                                <i className="bi bi-eye-fill text-primary" style={{ fontSize: "1.25rem" }}></i>
                                            </a>
                                        </td>
                                        <td>
                                            <button
                                                className="bg-transparent border-0"
                                                onClick={() => handleEdit(department.id)}
                                            >
                                                <i className="bi bi-pencil-fill text-warning" style={{ fontSize: "1.25rem" }}></i>
                                            </button>
                                            <button
                                                className="bg-transparent border-0"
                                                onClick={() => handleDelete(department.id)}
                                            >
                                                <i className="bi bi-trash-fill text-danger" style={{ fontSize: "1.25rem" }}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No departments found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DepartmentPage;
