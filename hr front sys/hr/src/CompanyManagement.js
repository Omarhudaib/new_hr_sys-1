import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "./api";  // Make sure this is imported correctly

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company_code: "",
    additional_information: "",
    status: "active",
    password: "",
    password_confirmation: "",
    image_path: null,
  });
  const [editCompany, setEditCompany] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const superAdminToken = localStorage.getItem('superAdminToken');  // Fix: no need for response.data.token here

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/superadmin/companies', {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        }
      });
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies", error);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await api.get("/contact", { // Changed this to use api
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      setContactMessages(response.data);
    } catch (error) {
      console.error("Error fetching contact messages", error);
    }
  };
  
  useEffect(() => {
    fetchCompanies();
    fetchContactMessages();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (editCompany) {
      setEditCompany({
        ...editCompany,
        [name]: name === "image_path" ? files?.[0] : value
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "image_path" ? files?.[0] : value
      });
    }
  };

  const handleSubmit = async (method, url, data) => {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }

    try {
      await api({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchCompanies();
    } catch (error) {
      console.error(`Error ${method === "post" ? "adding" : "updating"} company`, error.response?.data);
    }
  };

  const handleStore = () => {
    const headers = {
      Authorization: `Bearer ${superAdminToken}`,
    };
  
    handleSubmit("post", api + '/superadmin/companies', formData, headers);  // Use api for the request
    setFormData({
      name: "",
      company_code: "",
      status: "active",
      password: "",
      password_confirmation: "",
      additional_information: "",
      image_path: null,
    });
  };

  const handleUpdate = () => {
    if (!editCompany) return;
  
    const headers = {
      Authorization: `Bearer ${superAdminToken}`,
    };
  
    handleSubmit("put", api + `/superadmin/companies/${editCompany.company_code}`, editCompany, headers); // Correct URL format
    setEditCompany(null);
  };

  const handleDelete = async (companyCode) => {
    try {
      await api.delete(`/superadmin/companies/${companyCode}`, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company", error.response?.data);
    }
  };

  const handleContactFormSubmit = async () => {
    try {
      await api.post("/superadmin/contact", contactFormData, {  // Correct API endpoint
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      setContactFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      fetchContactMessages(); // Refresh contact messages
    } catch (error) {
      console.error("Error submitting contact message", error.response?.data);
    }
  };

  const handleReply = async (id, replyMessage) => {
    try {
      await api.post(`/superadmin/contact/${id}/reply`, { message: replyMessage }, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      fetchContactMessages(); // Refresh contact messages after reply
    } catch (error) {
      console.error("Error replying to contact message", error.response?.data);
    }
  };

  const handleDeleteContactMessage = async (id) => {
    try {
      await api.delete(`/superadmin/contact/${id}`, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      fetchContactMessages(); // Refresh contact messages after deletion
    } catch (error) {
      console.error("Error deleting contact message", error.response?.data);
    }
  };
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Companies</h2>
      <div className="p-3 mb-4 card">
        <h4>{editCompany ? "Edit Company" : "Add Company"}</h4>
        <div className="row g-2">
          {/* Form fields for company */}
          <div className="col-md-4">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Name"
              value={editCompany ? editCompany.name : formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              name="company_code"
              className="form-control"
              placeholder="Company Code"
              value={editCompany ? editCompany.company_code : formData.company_code}
              onChange={handleChange}
            />
          </div>

         
          <div className="col-md-4">
            <input
              type="file"
              name="image_path"
              className="form-control"
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <select
              name="status"
              className="form-control"
              value={editCompany ? editCompany.status : formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-md-4">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              value={editCompany ? editCompany.password : formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="password"
              name="password_confirmation"
              className="form-control"
              placeholder="Confirm Password"
              value={editCompany ? editCompany.password_confirmation : formData.password_confirmation}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-12">
            <textarea
              name="additional_information"
              className="form-control"
              placeholder="Additional Information"
              value={editCompany ? editCompany.additional_information : formData.additional_information}
              onChange={handleChange}
            />
          </div>
        </div>
        <button className="mt-3 btn btn-success" onClick={editCompany ? handleUpdate : handleStore}>
          {editCompany ? "Update" : "Add"}
        </button>
      </div>

      {/* Companies Table */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Company Code</th>
            <th>Additional information</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.company_code}>
              <td>{company.name}</td>
              <td>{company.company_code}</td>
       
              <td>{company.additional_information}</td>
       
              <td>
                <button
                  className="btn btn-info"
                  onClick={() => setEditCompany(company)}
                >
                  Edit
                </button>
                <button
                  className="ml-2 btn btn-danger"
                  onClick={() => handleDelete(company.company_code)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Contact Form */}
      <div className="p-3 mt-4 card">
        <h4>Contact Us</h4>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={contactFormData.name}
          onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
          className="form-control"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={contactFormData.email}
          onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
          className="form-control"
        />
        <input
          type="text"
          name="phone"
          placeholder="Your Phone"
          value={contactFormData.phone}
          onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
          className="form-control"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={contactFormData.message}
          onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
          className="form-control"
        ></textarea>
        <button onClick={handleContactFormSubmit} className="mt-3 btn btn-primary">
          Send Message
        </button>
      </div>

      {/* Contact Messages */}
      <div className="p-3 mt-4 card">
        <h4>Contact Messages</h4>
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contactMessages.map((message) => (
              <tr key={message.id}>
                <td>{message.name}</td>
                <td>{message.email}</td>
                <td>{message.message}</td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => handleReply(message.id, "Your reply")}
                  >
                    Reply
                  </button>
                  <button
                    className="ml-2 btn btn-danger"
                    onClick={() => handleDeleteContactMessage(message.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Companies;
