import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faClock, 
  faCalendarAlt, 
  faUserClock, 
  faMapMarkerAlt,
  faUsers,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState({
    pending_leave_requests: [],
    missed_check_ins: []
  });
  const [dailyCheckIns, setDailyCheckIns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [dailyDataModal, setDailyDataModal] = useState({ show: false, data: [] });
  const [showEmployeeTable, setShowEmployeeTable] = useState(true);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  // 2. Update month/year states to be controlled
  const [month, setMonth] = useState(formData.month);
  const [year, setYear] = useState(formData.year);
  
  // 3. Create form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setMonth(formData.month);
    setYear(formData.year);
  };
  // Summary statistics
  const totalEmployees = dashboardData?.detailed_summary?.length || 0;
  const totalHours = dashboardData?.detailed_summary?.reduce((sum, emp) => sum + emp.total_hours, 0) || 0;
  const pendingLeaves = notifications.pending_leave_requests.length;
  const missedCheckouts = notifications.missed_check_ins.length;

  useEffect(() => {
    const companyData = JSON.parse(localStorage.getItem("company"));
    companyData ? setCompany(companyData) : navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (company) {
      Promise.all([
        api.get(`/company/${company.company_code}/dashboard/${month}/${year}`),
        api.get(`/notifications/${company.company_code}`),
        api.get(`/checkins/dailyCheckIns/${company.company_code}`)
      ]).then(([dashboardRes, notificationsRes, checkinsRes]) => {
        setDashboardData(dashboardRes.data);
        setNotifications(notificationsRes.data);
        setDailyCheckIns(checkinsRes.data);
      }).catch(console.error);
    }
  }, [company, month, year]);

  const openMapModal = (latitude, longitude) => {
    setMapLocation({ latitude, longitude });
    setShowModal(true);
  };

  const closeMapModal = () => setShowModal(false);

  const openDailyDataModal = (dailyData) => setDailyDataModal({ show: true, data: dailyData });
  const closeDailyDataModal = () => setDailyDataModal({ show: false, data: [] });

  return (
    <div className="py-4 container-fluid">


      <div className="mb-4 row">
        <div className="mb-4 col-xl-3 col-md-6">
          <div className="shadow-sm card border-start-primary h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
                </div>
                <div>
                  <div className="small text-muted">Total Employees</div>
                  <div className="h4">{totalEmployees}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 col-xl-3 col-md-6">
          <div className="shadow-sm card border-start-success h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon={faChartBar} size="2x" className="text-success" />
                </div>
                <div>
                  <div className="small text-muted">Total Hours</div>
                  <div className="h4">{totalHours.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 col-xl-3 col-md-6">
          <div className="shadow-sm card border-start-warning h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon={faUserClock} size="2x" className="text-warning" />
                </div>
                <div>
                  <div className="small text-muted">Pending Leaves</div>
                  <div className="h4">{pendingLeaves}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
    



        <div className="mb-4 col-xl-3 col-md-6">
          <div className="shadow-sm card border-start-danger h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FontAwesomeIcon icon={faClock} size="2x" className="text-danger" />
                </div>
                <div>
                  <div className="small text-muted">Missed Checkouts</div>
                  <div className="h4">{missedCheckouts}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Chart Section */}
        <div className="mb-4 col-xl-8">
          <div className="shadow-sm card h-100">
            <div className="flex bg-white card-header d-flex align-items-center">
              <h5 className="m-0">
                <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                Employee Performance Overview
              </h5>
              
            </div>
            <div className="card-body">
              {dashboardData?.detailed_summary?.length > 0 ? (
                <div style={{ height: '400px' }}>
                  <Bar
                    data={{
                      labels: dashboardData.detailed_summary.map(emp => emp.user_name),
                      datasets: [
                        {
                          label: 'Total Hours',
                          data: dashboardData.detailed_summary.map(emp => emp.total_hours),
                          backgroundColor: 'rgba(54, 162, 235, 0.6)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                        },
                        {
                          label: 'Overtime Hours',
                          data: dashboardData.detailed_summary.map(emp => emp.overtime_hours),
                          backgroundColor: 'rgba(255, 206, 86, 0.6)',
                          borderColor: 'rgba(255, 206, 86, 1)',
                        },
                        {
                          label: 'Delay Hours',
                          data: dashboardData.detailed_summary.map(emp => emp.delay_hours),
                          backgroundColor: 'rgba(255, 99, 132, 0.6)',
                          borderColor: 'rgba(255, 99, 132, 1)',
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                      },
                      scales: {
                        x: { stacked: false },
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="py-5 text-center text-muted">No chart data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-4 col-xl-4">
          <div className="shadow-sm card h-100">
            <div className="bg-white card-header">
              <h5 className="m-0">
                <FontAwesomeIcon icon={faBell} className="me-2 text-warning" />
                Notifications
              </h5>
            </div>
            <div className="p-0 card-body">
              {notifications.pending_leave_requests.length > 0 || notifications.missed_check_ins.length > 0 ? (
                <div className="list-group list-group-flush">
                  {notifications.pending_leave_requests.map((request) => (
                    <div key={request.id} className="list-group-item">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-3 text-warning" />
                        <div>
                          <strong>{request.user.first_name} {request.user.last_name}</strong>
                          <div className="text-muted small">Pending leave request</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.missed_check_ins.map((checkIn) => (
                    <div key={checkIn.id} className="list-group-item">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faClock} className="me-3 text-danger" />
                        <div>
                          <strong>{checkIn.user.first_name} {checkIn.user.last_name}</strong>
                          <div className="text-muted small">Missed checkout on {checkIn.check_in}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center text-muted">No notifications</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="shadow-sm card">
        <div className="bg-white card-header dfle d-flex align-items-center justify-content-between">
          <h2 className="m-0">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            Employee Details
</h2>
            
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-auto">
        <label htmlFor="month" className="form-label">Month</label>
        <input
          id="month"
          type="number"
          className="form-control"
          min="1"
          max="12"
          value={formData.month}
          onChange={(e) => setFormData({ 
            ...formData, 
            month: parseInt(e.target.value) 
          })}
        />
      </div>
      <div className="col-auto">
        <label htmlFor="year" className="form-label">Year</label>
        <input
          id="year"
          type="number"
          className="form-control"
          min="2000"
          value={formData.year}
          onChange={(e) => setFormData({ 
            ...formData, 
            year: parseInt(e.target.value) 
          })}
        />
      </div>
      <div className="col-auto">
        <button type="submit" className="btn btn-primary">
          Update Data
        </button>
      </div>
    </form>
     
          

        </div>
        
        <div className="p-0 card-body">
          <div className="table-responsive">
            <table className="table mb-0 table-hover">
              <thead className="bg-light">
                <tr>
                  <th>Employee</th>
                  <th className="text-end">Total Hours</th>
                  <th className="text-end">Overtime</th>
                  <th className="text-end">Delay</th>
                  <th className="text-end">Salary</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.detailed_summary?.map(employee => (
                  <tr key={employee.user_id}>
                    <td>
                    
                      <div className="d-flex align-items-center">
                      <div className="text-white avatar-sm bg-primary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px', fontSize: '20px' }}>
  {employee.user_name[0]}
</div>

                        <div>
                          <div className="fw-semibold">{employee.user_name}</div>
                          <div className="text-muted small">ID: {employee.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">{employee.total_hours}h</td>
                    <td className="text-end text-warning">{employee.overtime_hours}h</td>
                    <td className="text-end text-danger">{employee.delay_hours}h</td>
                    <td className="text-end">${employee.final_salary}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openDailyDataModal(employee.daily_data)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}

      
      {/* Daily Data Modal */}
      {dailyDataModal.show && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Daily Work Entries</h5>
                <button type="button" className="btn-close" onClick={closeDailyDataModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Work Hours</th>
                      <th>Overtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyDataModal.data.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.date}</td>
                        <td>{entry.check_in}</td>
                        <td>{entry.check_out || 'N/A'}</td>
                        <td>{entry.work_hours}</td>
                        <td>{entry.overtime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
            {/* Map Modal */}
            {showModal && mapLocation && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Location on Google Maps</h5>
                <button type="button" className="btn-close" onClick={closeMapModal} aria-label="Close"></button>
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
      {/* Add modals here (same as before but styled similarly) */}
    </div>
  );
};

export default Dashboard;
  