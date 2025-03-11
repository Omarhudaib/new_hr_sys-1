import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../LoadingSpinner';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const CompanyManagementPage = () => {
  const companyCode = JSON.parse(localStorage.getItem('company'))?.company_code;
  const navigate = useNavigate();
 const [settingsMessage, setSettingsMessage] = useState('');
  // State for EditCompanyPage
  const [companyData, setCompanyData] = useState({
    name: '',
    additional_information: '',
    image_path: '',
    password: '',
  });
  const [companyError, setCompanyError] = useState('');
  const [isCompanyLoading, setIsCompanyLoading] = useState(true);

  // State for CompanySettingsPage
  const [settings, setSettings] = useState({
    work_hours: '',
    overtime_rate: '',
    overtime_enabled: false,
    hourly_rate: '',
    style: 'default',
  });
  const [settingsError, setSettingsError] = useState('');
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  // Fetch company data
  useEffect(() => {
    if (!companyCode) {
      setCompanyError('Company code is missing.');
      setIsCompanyLoading(false);
      return;
    }

    const fetchCompanyData = async () => {
      try {
        const response = await api.get(`/company/${companyCode}`);
        setCompanyData(response.data);
        setIsCompanyLoading(false);
      } catch (err) {
        setCompanyError('Error fetching company data.');
        setIsCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyCode]);

  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get(`/companySettings/${companyCode}`);
        setSettings(response.data);
      } catch (err) {
        setSettingsError('Failed to update settings');
      } finally {
        setIsSettingsLoading(false);
      }
    };
    fetchSettings();
  }, [companyCode]);

  // Handle company form changes
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle settings form changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle company form submission
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/company/${companyCode}`, companyData);
      if (response.status === 200) {
        setSettingsMessage('Settings updated successfully');
      }
    } catch (err) {
        setSettingsError('Failed to update settings');
    }
  };

  // Handle settings form submission
 

const handleSettingsSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post(`/companySettings/${companyCode}`, settings);
    setSettingsMessage('Settings updated successfully');
  } catch (err) {
    setSettingsError('Failed to update settings');
  }
};


  if (isCompanyLoading || isSettingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center text-primary">Company Management</h2>
      {settingsMessage && <div className="text-center alert alert-success">{settingsMessage}</div>}

      {/* Edit Company Form */}
      <Row className="mb-5">
        <Col>
          <h3 className="mb-3 text-center text-secondary">Edit Company Information</h3>
          {companyError && <div className="text-center alert alert-danger">{companyError}</div>}
          <Form onSubmit={handleCompanySubmit} className="row g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={companyData.name}
                  onChange={handleCompanyChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="text"
                  name="image_path"
                  value={companyData.image_path}
                  onChange={handleCompanyChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Additional Information</Form.Label>
                <Form.Control
                  as="textarea"
                  name="additional_information"
                  value={companyData.additional_information}
                  onChange={handleCompanyChange}
                  rows="3"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                
                  onChange={handleCompanyChange}
                />
              </Form.Group>
           </Col>

            <Col md={12} className="gap-3 mt-3 d-flex justify-content-center">
              <Button type="submit" variant="primary" className="px-4">
                Save Changes
              </Button>
            </Col>
          </Form>
        </Col>
      </Row>

      {/* Company Settings Form */}
      <Row>
        <Col>
          <h3 className="mb-3 text-center text-secondary">Company Settings</h3>
          {settingsError && <div className="text-center alert alert-danger">{settingsError}</div>}
          <Form onSubmit={handleSettingsSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Work Hours</Form.Label>
                  <Form.Control
                    type="number"
                    name="work_hours"
                    value={settings.work_hours}
                    onChange={handleSettingsChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Overtime Rate</Form.Label>
                  <Form.Control
                    type="number"
                    name="overtime_rate"
                    value={settings.overtime_rate}
                    onChange={handleSettingsChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-2 g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Style</Form.Label>
                  <Form.Select
                    name="style"
                    value={settings.style}
                    onChange={handleSettingsChange}
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Enable Overtime"
                name="overtime_enabled"
                checked={settings.overtime_enabled}
                onChange={handleSettingsChange}
              />
            </Form.Group>

            <div className="mt-4 d-flex justify-content-center">
              <Button type="submit" variant="primary" className="px-4">
                Save Settings
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyManagementPage;