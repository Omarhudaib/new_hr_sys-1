import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LoadingSpinner from '../LoadingSpinner';  // Import the LoadingSpinner component


// Define a custom icon
const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const DepartmentEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        dep_name: '',
        loc_name: '',
        latitude: '',
        longitude: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;

    const fetchLocationName = async (lat, lng) => {
        try {
            const response = await api.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                },
            });

            return response.data?.display_name || 'Unknown location';
        } catch (error) {
            console.error('Error fetching location name:', error);
            return 'Error fetching location';
        }
    };

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('Authorization token is missing.');
                    setIsLoading(false);
                    return;
                }
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const response = await api.get(
                    `/department/${id}/${companyCode}`,
                    { headers }
                );
                setFormData(response.data);
                setIsLoading(false);
            } catch (err) {
                setError('Error fetching department data. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchDepartment();
    }, [id, companyCode]);

    const handleChange = (e) => {
        let value = e.target.value;
        if (['latitude', 'longitude'].includes(e.target.name)) {
            value = value.replace(/[^0-9.-]/g, ''); // Allow only numbers, periods, and hyphens
        }
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Invalid latitude or longitude.');
            return;
        }

        try {
            const updatedDepartment = {
                ...formData,
                company_code: companyCode,
                latitude: lat,
                longitude: lng,
            };

            const headers = {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            };

            const response = await api.put(
                `/departments/${companyCode}/${id}`,
                updatedDepartment,
                { headers }
            );

            if (response.status === 200) {
                navigate('/departments');
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Error updating department. Please try again later.');
            }
        }
    };

    const handleMapClick = async (event) => {
        const { lat, lng } = event.latlng;

        const locationName = await fetchLocationName(lat, lng);

        setFormData({
            ...formData,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            loc_name: locationName,
        });
    };

    if (isLoading) {
        return <LoadingSpinner />; // Display the LoadingSpinner while loading data
    }

    const latitude = parseFloat(formData.latitude) || 51.505;
    const longitude = parseFloat(formData.longitude) || -0.09;

    return (
        <>
            {error && <div className="alert alert-danger">{error}</div>}
           
            <div className="p-4 shadow-sm card" style={{ width: '100%', height: '100%' }}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-1 form-group">
                        <label htmlFor="dep_name">Department Name</label>
                        <input
                            type="text"
                            id="dep_name"
                            name="dep_name"
                            className="form-control"
                            placeholder="Enter department name"
                            value={formData.dep_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-1 form-group">
                        <label htmlFor="loc_name">Location Name</label>
                        <input
                            type="text"
                            id="loc_name"
                            name="loc_name"
                            className="form-control"
                            placeholder="Enter location name"
                            value={formData.loc_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-1 form-group">
                        <label htmlFor="latitude">Latitude</label>
                        <input
                            type="text"
                            id="latitude"
                            name="latitude"
                            className="form-control"
                            placeholder="Enter latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-1 form-group">
                        <label htmlFor="longitude">Longitude</label>
                        <input
                            type="text"
                            id="longitude"
                            name="longitude"
                            className="form-control"
                            placeholder="Enter longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ height: '200px', width: '100%' }}>
                        <MapContainer
                            center={[latitude, longitude]}
                            zoom={13}
                            style={{ width: '100%', height: '100%' }}
                            whenCreated={(map) => map.on('click', handleMapClick)}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            />
                            <Marker
                                position={[latitude, longitude]}
                                draggable={true}
                                icon={customIcon}
                                eventHandlers={{
                                    dragend: async (event) => {
                                        const { lat, lng } = event.target.getLatLng();
                                        const locationName = await fetchLocationName(lat, lng);

                                        setFormData({
                                            ...formData,
                                            latitude: lat.toFixed(6),
                                           longitude: lng.toFixed(6),
                                            loc_name: locationName,
                                        });
                                    },
                                }}
                            >
                                <Popup>{formData.loc_name || 'Unknown location'}</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
        
  <button type="submit" className="mt-2 btn btn-primary">Save Changes</button>

                </form>
            </div>
        </>
    );
};

export default DepartmentEditorPage;
