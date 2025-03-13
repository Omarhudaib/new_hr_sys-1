import React, { useState, useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner"; 
import api from "../api";
import { FaEdit } from "react-icons/fa";
import { Button, Form, Table, Spinner, Container } from "react-bootstrap";
const EmployeeEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    rating: '',
    comments: '',
    evaluated_by: '',
    evaluation_date: '',
  });
  const [editing, setEditing] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const companyCode = JSON.parse(localStorage.getItem("company"))?.company_code;

  // Fetch evaluations based on company code
  const fetchEvaluations = async () => {
    if (!companyCode) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/employee-evaluations/${companyCode}`);
      setEvaluations(response.data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users for user_id and evaluated_by dropdowns
  const fetchUsers = async () => {
    if (!companyCode) return;
    try {
      const response = await api.get(`/usersc/${companyCode}`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredEvaluations(
      evaluations.filter(e => 
        e.user.first_name.toLowerCase().includes(term) ||
        e.user.last_name.toLowerCase().includes(term)
      )
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyCode) return;
    try {
      const payload = { 
        ...formData, 
        company_code: companyCode, 
        evaluation_date: new Date().toISOString().split("T")[0] 
      };
      
      if (editing) {
        await api.put(`/employee-evaluations/${companyCode}/${editing}`, payload);
      } else {
        await api.post(`/employee-evaluations/${companyCode}`, payload); // تم تصحيح الخطأ هنا
      }
      
      setFormData({ user_id: "", rating: "", comments: "", evaluated_by: "", evaluation_date: "" });
      setEditing(null);
      fetchEvaluations();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  

  useEffect(() => {
    fetchEvaluations();
    fetchUsers();
  }, [companyCode]);

  return (
    <Container className="mt-4 d_flex">
    <h1 className="mb-3">Employee Evaluations</h1>


    
    
    {isLoading && <Spinner animation="border" className="mb-3 d-block" />}
    
    {/* Evaluation Form */}
    <Form onSubmit={handleSubmit} className="p-3 mb-4 border rounded shadow-sm bg-light ">
      <Form.Group className="mb-3">
        <Form.Label>Select User</Form.Label>
        <Form.Select name="user_id" value={formData.user_id} onChange={handleChange} required>
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Rating (1-30)</Form.Label>
        <Form.Control type="number" name="rating" value={formData.rating} onChange={handleChange} min="1" max="30" required />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Comments</Form.Label>
        <Form.Control as="textarea" name="comments" value={formData.comments} onChange={handleChange} />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Evaluated By</Form.Label>
        <Form.Select name="evaluated_by" value={formData.evaluated_by} onChange={handleChange} required>
          <option value="">Select Evaluator</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      
      <Button type="submit" variant="primary" className="w-100">
        {editing ? "Update Evaluation" : "Create Evaluation"}
      </Button>
    </Form>
    
    {isLoading && <Spinner animation="border" className="mb-3 d-block" />}
    
    {/* Evaluations Table */}
    <Table striped bordered hover responsive className="shadow-sm " style={{ fontSize: '0.85rem', padding: '5px' }}>
  <thead className="table-dark">
    <tr>
      <th style={{ width: '15%' }}>User ID</th>
      <th style={{ width: '10%' }}>Rating</th>
      <th style={{ width: '30%' }}>Comments</th>
      <th style={{ width: '20%' }}>Evaluated By</th>
      <th style={{ width: '15%' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {evaluations.map((evaluation) => (
      <tr key={evaluation.id}>
        <td>{evaluation.user_id}</td>
        <td>{evaluation.rating}</td>
        <td>{evaluation.comments}</td>
        <td>{evaluation.evaluated_by}</td>
        <td>
          <Button variant="warning" onClick={() => setEditing(evaluation.id)} size="sm">
            <FaEdit />
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>


  </Container>
);
};



export default EmployeeEvaluations;
 
