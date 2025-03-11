import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = {
      email,
      password
    };

    try {
      // Send a POST request to the Laravel login endpoint
      const response = await axios.post('https://newhrsys-production.up.railway.app/api/super-admin/login', data);

      // If successful, store the token in localStorage or state
      localStorage.setItem('superAdminToken', response.data.token);

      // Optionally redirect or show success message
      alert('Login successful!');
      // Redirect to another page (for example dashboard)
      window.location.href = '/SuperAdmin'; // Replace with your actual dashboard route

    } catch (err) {
      setError('The provided credentials are incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="p-4 card">
        <h3 className="mb-4">Super Admin Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
