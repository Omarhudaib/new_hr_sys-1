import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // استيراد وحدة api
import LoadingSpinner from '../LoadingSpinner'; // Import the LoadingSpinner component

const UserCheckIns = () => {
  const { userId } = useParams();
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    // Fetch check-ins for a specific user using api
    api.get(`/checkins/user/${userId}`)
      .then(response => {
        setCheckIns(response.data);
        setIsLoading(false); // Set loading to false once data is fetched
      })
      .catch(error => {
        console.error('There was an error fetching user check-ins!', error);
        setIsLoading(false); // Set loading to false even on error
      });
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner />; // Show the loading spinner while loading
  }

  return (
    <div>
      <h1>User Check-ins</h1>
      <table>
        <thead>
          <tr>
            <th>Location In</th>
            <th>Location Out</th>
            <th>Check-in Time</th>
            <th>Check-out Time</th>
          </tr>
        </thead>
        <tbody>
          {checkIns.map(checkIn => (
            <tr key={checkIn.id}>
              <td>{checkIn.location_in}</td>
              <td>{checkIn.location_out}</td>
              <td>{checkIn.check_in}</td>
              <td>{checkIn.check_out}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserCheckIns;
