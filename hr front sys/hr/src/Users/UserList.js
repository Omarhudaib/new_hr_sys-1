import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
const userImage = '../user.jpg';  // This will reference the image in the public folder

const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('table');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyCode) return;
  
    const cachedUsers = localStorage.getItem('users');
    if (cachedUsers) {
      setUsers(JSON.parse(cachedUsers));
      setIsLoading(false);
    } else {
      setIsLoading(true);
      api.get(`/usersc/${companyCode}`)
        .then(response => {
          const usersData = Array.isArray(response.data) ? response.data : [response.data];
          setUsers(usersData);
          localStorage.setItem('users', JSON.stringify(usersData));  // Cache the data
        })
        .catch(error => console.error('Error fetching users:', error))
        .finally(() => setIsLoading(false));
    }
  }, [companyCode]);
  

  const handleDelete = (id) => {
    api.delete(`/users/${id}`)
      .then(() => setUsers(users.filter(user => user.id !== id)))
      .catch(error => console.error('Error deleting user:', error));
  };

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      {/* Navigation Bar */}
      <nav className="rounded shadow-sm navbar navbar-expand-lg navbar-dark bg-primary ">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold text-light">Users</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={() => setViewType(viewType === 'table' ? 'card' : 'table')}
                >
                  Switch to {viewType === 'table' ? 'Card' : 'Table'} View
                </button>
              </li>
            </ul>
            <form className="d-flex ms-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </div>
      </nav>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        viewType === 'table' ? (
          <div className="mt-1 table-responsive">
            <table className="table text-center table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Image</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                    <div className="me-3">
                      <img
                        src={userImage} // استخدم الصورة المحلية بدلاً من تحميلها من السيرفر
                        alt="User"
                        width="80"
                        height="80"
                        className="border rounded-circle"
                      />
                    </div>



                    </td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.role ? user.role.name : 'N/A'}</td>
                    <td>{user.department ? user.department.dep_name : 'N/A'}</td>
                    <td>
                      <Link to={`/users/${user.id}`} className="btn btn-outline-primary btn-sm me-1">
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link to={`/users/edit/${user.id}`} className="btn btn-outline-warning btn-sm me-1">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => handleDelete(user.id)} className="btn btn-outline-danger btn-sm">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="row">
            {filteredUsers.map(user => (
              <div key={user.id} className="col-md-4">
                <div className="mb-3 border-0 shadow-sm card">
                  <div className="card-body d-flex align-items-center">
                    {/* Image */}
                    <div className="me-3">
                    <div className="me-3">
                      <img
                        src={userImage} // استخدم الصورة المحلية بدلاً من تحميلها من السيرفر
                        alt="User"
                        width="80"
                        height="80"
                        className="border rounded-circle"
                      />
                    </div>



                    </div>

                    {/* User Info */}
                    <div>
                      <h6 className="fw-bold">{user.first_name} {user.last_name}</h6>
                      <p className="mb-1"><strong>Role:</strong> {user.role ? user.role.name : 'N/A'}</p>
                      <p className="mb-1"><strong>Department:</strong> {user.department ? user.department.dep_name : 'N/A'}</p>
                      <div className="d-flex">
                        <Link to={`/users/${user.id}`} className="btn btn-outline-primary btn-sm me-1">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link to={`/users/edit/${user.id}`} className="btn btn-outline-warning btn-sm me-1">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button onClick={() => handleDelete(user.id)} className="btn btn-outline-danger btn-sm">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default UserList;
