import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '../LoadingSpinner'; // Import the LoadingSpinner component
import api from '../api';

const AddDepartmentPage = () => {
    const [department, setDepartment] = useState({
        dep_name: '',
        loc_name: '',
        latitude: '',
        longitude: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();
    const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

    // Custom icon for the map
    const customIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    // Function to fetch location name based on coordinates
    const fetchLocationName = async (lat, lng) => {
        try {
            const response = await api.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                },
            });

            if (response.data && response.data.display_name) {
                return response.data.display_name;
            } else {
                return 'Unknown location';
            }
        } catch (error) {
            console.error('Error fetching location name:', error);
            return 'Error fetching location';
        }
    };

    const handleChange = (e) => {
        setDepartment({
            ...department,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading

        const lat = parseFloat(department.latitude);
        const lng = parseFloat(department.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Invalid latitude or longitude.');
            setIsLoading(false); // Stop loading
            return;
        }

        try {
            const locationName = await fetchLocationName(lat, lng);

            const response = await api.post(`/departments/${companyCode}`, {
                ...department,
                loc_name: locationName, // Add the location name
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            setSuccess('Department added successfully!');
            navigate(`/departments`); // Redirect to departments list page
        } catch (err) {
            setError('Failed to add department. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const LocationMarker = ({ setDepartment }) => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setDepartment(prevState => ({
                    ...prevState,
                    latitude: lat,
                    longitude: lng,
                }));
            },
        });

        return null;
    };

    return (
   <>
     
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isLoading && <LoadingSpinner />} {/* Show loading spinner when loading */}

            <div className="p-4 shadow-sm card" style={{ width: '100%' }}>
            <form onSubmit={handleSubmit}>
                <div className="">
                    <label htmlFor="dep_name" className="form-label">Department Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="dep_name"
                        name="dep_name"
                        value={department.dep_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="">
                    <label htmlFor="loc_name" className="form-label">Location</label>
                    <input
                        type="text"
                        className="form-control"
                        id="loc_name"
                        name="loc_name"
                        value={department.loc_name}
                        onChange={handleChange}
                        required
                        disabled
                    />
                </div>
                <div className="">
                    <label htmlFor="latitude" className="form-label">Latitude</label>
                    <input
                        type="number"
                        className="form-control"
                        id="latitude"
                        name="latitude"
                        value={department.latitude}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="">
                    <label htmlFor="longitude" className="form-label">Longitude</label>
                    <input
                        type="number"
                        className="form-control"
                        id="longitude"
                        name="longitude"
                        value={department.longitude}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ height: "200px" }}>
                    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker setDepartment={setDepartment} />
                        {department.latitude && department.longitude && (
                            <Marker position={[department.latitude, department.longitude]} icon={customIcon}>
                                <Popup>
                                    {department.loc_name}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
                <button type="submit" className="mt-2 btn btn-primary">Add Department</button>
            </form>
        </div>      
      </>  
    );
};

export default AddDepartmentPage;
