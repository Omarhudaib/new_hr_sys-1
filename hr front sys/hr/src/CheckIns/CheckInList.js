import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // استيراد وحدة api
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Leaflet for map markers

const currentYear = new Date().getFullYear();
const nextYear = currentYear - 1;

const CheckInList = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 50,
    next_page_url: null,
    prev_page_url: null,
  });
  const [filters, setFilters] = useState({
    user_id: '',
    start_date: '',
    end_date: '',
    department: '',
    check_in_time: '',
    check_out_time: '',
    month: '',
  });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
 const [showModal, setShowModal] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const navigate = useNavigate();
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

  useEffect(() => {
    if (!companyCode) {
      console.error('No company ID found in localStorage');
      return;
    }

    // Fetch users and departments once the companyCode is available
    fetchUsers(companyCode);
    fetchDepartments(companyCode);

    // Fetch the first page by default
    fetchCheckIns(pagination.current_page);
  }, [companyCode, filters]); // Re-fetch data whenever filters change

  const fetchUsers = (companyCode) => {
    api.get(`/usersc/${companyCode}`)
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error.response || error.message);
      });
  };
  const openMapModal = (latitude, longitude) => {
    setMapLocation({ latitude, longitude });
    setShowModal(true); // Show the modal
  };

  // Function to close the modal
  const closeMapModal = () => {
    setShowModal(false);
    setMapLocation(null);
  };

  const fetchDepartments = (companyCode) => {
    api.get(`/departments/${companyCode}`)
      .then(response => {
        setDepartments(response.data);
      })
      .catch(error => {
        console.error('Error fetching departments:', error.response || error.message);
      });
  };

  const fetchCheckIns = (page) => {
    setLoading(true); // Set loading to true before fetching data
    const params = new URLSearchParams();

    // Add filters to the params object if they are not empty
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params.append(key, value);
      }
    }

    params.append('page', page);

    api.get(`/checkins/${companyCode}?${params.toString()}`)
      .then(response => {
        const { data, current_page, last_page, next_page_url, prev_page_url } = response.data;
        setCheckIns(data);
        setPagination({ current_page, last_page, next_page_url, prev_page_url });
      })
      .catch(error => {
        console.error('Error fetching check-ins:', error.response || error.message);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after the data is fetched
      });
  };

  const handleEdit = (id) => {
    navigate(`/checkins/edit/${id}`);
  };

  const handleDelete = (id) => {
    api.delete(`/checkins/${companyCode}/${id}`)
      .then(() => {
        setCheckIns(prevCheckIns => prevCheckIns.filter(checkIn => checkIn.id !== id));
      })
      .catch(error => {
        console.error('Error deleting check-in:', error.response || error.message);
      });
  };

  const handleNextPage = () => {
    if (pagination.next_page_url) {
      const nextPage = pagination.current_page + 1;
      fetchCheckIns(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prev_page_url) {
      const prevPage = pagination.current_page - 1;
      fetchCheckIns(prevPage);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to calculate total hours between check-in and check-out times
  const calculateTotalHours = (checkInTime, checkOutTime) => {
    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);

    // Calculate difference in milliseconds
    const diffInMs = checkOutDate - checkInDate;

    // Convert milliseconds to minutes
    const totalMinutes = diffInMs / (1000 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return { hours, minutes }; // Return hours and minutes separately
  };

  return (
    <div className="container-fluid">
      {/* Navbar Section */}
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container-fluid">
          <span className="text-white navbar-brand fw-bold">Department Management</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

        </div>
      </nav>

      {/* Filter Form Section */}
      <div className="mt-3 container-fluid">
        <hr />
        <div className="row">
  {/* User Filter */}
<div className="col-md-6">
  <label htmlFor="user_id">User</label>
  
  {/* Search Box */}
  <input
    type="text"
    className="mb-2 form-control"
    placeholder="Search by name"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)} // Set search query on input change
  />
  
  {/* Select Dropdown */}
  <select
    className="mb-2 form-control"
    name="user_id"
    value={filters.user_id}
    onChange={handleFilterChange}
  >
    <option value="">Select User</option>
    {users
      .filter((user) =>
        `${user.first_name} ${user.second_name} ${user.middle_name} ${user.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) // Filter users based on search query
      )
      .map((user) => (
        <option key={user.id} value={user.id}>
          {user.first_name} {user.second_name} {user.middle_name} {user.last_name}
        </option>
      ))}
  </select>
</div>


          {/* Month Filter */}
          <div className="col-md-2">
            <label htmlFor="month">Month</label>
            <select
              className="mb-2 form-control"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
            >
              <option value="">Select Year and Month</option>
              {[currentYear, nextYear].flatMap((year) =>
                Array.from({ length: 12 }, (_, index) => {
                  const month = index + 1;
                  const monthName = new Date(0, month - 1).toLocaleString("en-US", {
                    month: "long",
                  });
                  return (
                    <option key={`${year}-${month}`} value={`${year}-${month.toString().padStart(2, "0")}`}>
                      {monthName} {year}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Start Date Filter */}
          <div className="col-md-2">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              className="mb-2 form-control"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>

          {/* End Date Filter */}
          <div className="col-md-2">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              className="mb-2 form-control"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <hr />
      </div>


{loading ? (
  <div className="text-center">Loading...</div>
) : (
  <table className="table table-bordered table-sm">
    <thead>
      <tr>
        <th>User</th>
        <th>Check-in Location</th>
        <th>Check-in Time</th>
        <th>Check-out Location</th>
        <th>Check-out Time</th>
        <th>Total Hours</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {checkIns.map((checkIn) => {
        const { hours, minutes } = calculateTotalHours(checkIn.check_in, checkIn.check_out);
        const totalTime = `${hours}:${minutes}`;

        // Conditional styling based on total hours
        let timeClass = '';
        if (hours >= 10) {
          timeClass = 'text-success'; // Green
        } else if (hours < 7) {
          timeClass = 'text-danger'; // Red
        }

        return (
          <tr key={checkIn.id}>
            <td>{checkIn.user_id}</td>
            <td>
              <a
                   onClick={() =>
                    openMapModal(checkIn.latitude_in, checkIn.longitude_in)
                  }
              
              >
                            <i className="bi bi-eye-fill text-primary" style={{ fontSize: "1.25rem" }}> </i>{checkIn.location_in}

              </a>
            </td>
            <td>{checkIn.check_in}</td>
            <td>
            <a
                   onClick={() =>
                    openMapModal(checkIn.latitude_out, checkIn.longitude_out)
                  }
               
              >
                         <i className="bi bi-eye-fill text-primary" style={{ fontSize: "1.25rem" }}> </i>{checkIn.location_out}

              </a>
            </td>
            <td>{checkIn.check_out}</td>
            <td className={timeClass}>{totalTime} hours</td> {/* Apply dynamic class */}
            <td>
              <button
                 className="bg-transparent border-0"
                onClick={() => handleEdit(checkIn.id)}
              >
              <i className="bi bi-pencil-fill text-warning" style={{ fontSize: "1.25rem" }}></i>
              </button>
              
              <button
                 className="bg-transparent border-0"
                onClick={() => handleDelete(checkIn.id)}
              >

<i className="bi bi-trash-fill text-danger" style={{ fontSize: "1.25rem" }}></i>
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
)}
   {/* Bootstrap Modal */}
   {showModal && mapLocation && (
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Location on Google Maps
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeMapModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="400"
                  src={`https://www.google.com/maps?q=${mapLocation.latitude},${mapLocation.longitude}&hl=es;z=14&output=embed`}
                  frameBorder="0"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex="0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
{/* Pagination Section */}
<div className="mt-4 d-flex justify-content-between">
  <button
    className="btn btn-primary btn-sm"
    onClick={handlePrevPage}
    disabled={!pagination.prev_page_url}
  >
    Previous
  </button>
  <button
    className="btn btn-primary btn-sm"
    onClick={handleNextPage}
    disabled={!pagination.next_page_url}
  >
    Next
  </button>
</div>
</div>
  );
};

export default CheckInList;
