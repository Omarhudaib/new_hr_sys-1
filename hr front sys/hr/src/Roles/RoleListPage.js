import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingSpinner from '../LoadingSpinner'; // استيراد مكون التحميل
import api from '../api'; // استيراد دالة `api`

function RoleListPage() {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // تتبع حالة التحميل
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      if (!token || !companyCode) {
        setError('Missing company code or token.');
        setLoading(false); // إيقاف التحميل إذا لم يتم العثور على التوكن أو كود الشركة
        return;
      }

      try {
        const response = await api.get(`/role/${companyCode}`);
        setRoles(response.data);
      } catch (err) {
        setError('Error fetching roles. Please try again later.');
      } finally {
        setLoading(false); // إيقاف التحميل بعد إكمال العملية
      }
    };

    fetchRoles();
  }, [companyCode, token]);

  const handleDelete = async (id) => {
    if (!token || !companyCode) {
      setError('Missing company code or token.');
      return;
    }

    try {
      await api.delete(`/roles/${companyCode}/${id}`);
      setRoles(roles.filter(role => role.id !== id));
    } catch (err) {
      setError('Error deleting role. Please try again later.');
    }
  };

  // تصفية الأدوار بناءً على مصطلح البحث
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return(
    <div className="container-fluid">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container-fluid">
          <span className="text-white navbar-brand fw-bold">Roles Management</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
      
              <li className="nav-item">
                <button
                  className="nav-link btn btn-outline-light me-2 navbar-btn"
                  onClick={() => navigate('/add-role')}
                >
                  Add Role
                </button>
              </li>
            </ul>

            {/* Search Input */}
            <div className="d-flex justify-content-end">
              <input
                type="text"
                className="mt-1 form-control me-2 navbar-search w-50"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </nav>

 
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner /> // Show loading spinner while fetching data
      ) : filteredRoles.length > 0 ? (
        <ul className="mt-3 list-group">
          {filteredRoles.map(role => (
            <li key={role.id} className="list-group-item d-flex justify-content-between align-items-center role-item">
              {role.name}
              <div>
          
                <Link to={`edit-role/${role.id}`} className="bg-transparent border-0"> <i className="bi bi-pencil-fill text-warning" style={{ fontSize: "1.25rem" }}></i></Link>
                <button className="bg-transparent border-0" onClick={() => handleDelete(role.id)}>  <i className="bi bi-trash-fill text-danger" style={{ fontSize: "1.25rem" }}></i></button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3">No roles found.</p>
      )}
    </div>
  );
}

export default RoleListPage;
