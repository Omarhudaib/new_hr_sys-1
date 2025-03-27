import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import LoadingSpinner from "../LoadingSpinner";

const EmployeeEvaluation = () => {
  const navigate = useNavigate();
  const company = JSON.parse(localStorage.getItem("company"));
  const companyCode = company?.id;

  const [users, setUsers] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/co/evaluat", {
        params: { companyCode },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const submitEvaluation = async (userId) => {
    const evaluationData = evaluations[userId];
    if (!evaluationData?.rating) {
      alert("Please provide a rating.");
      return;
    }

    try {
      await api.post(`/co/evaluations/${companyCode}`, {
        ...evaluationData,
        user_id: userId,
        company_id: companyCode,
      });

      alert("Evaluation saved successfully.");
      fetchUsers();
    } catch (error) {
      alert("Evaluation submission failed.");
    }
  };

  return (
    <>

      <div className="container mt-4">
        <h2>Employee Evaluations</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <form>
            <div className="row">
              {users.map((user) => (
                <div key={user.id} className="col-md-4">
                  <div className="p-3 mb-3 card">
                    <h5>{user.first_name} {user.last_name}</h5>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={evaluations[user.id]?.rating || 1}
                      onChange={(e) => setEvaluations({
                        ...evaluations,
                        [user.id]: { ...evaluations[user.id], rating: e.target.value },
                      })}
                    />
                    <textarea
                      className="mt-2 form-control"
                      placeholder="Add comments"
                      value={evaluations[user.id]?.comments || ""}
                      onChange={(e) => setEvaluations({
                        ...evaluations,
                        [user.id]: { ...evaluations[user.id], comments: e.target.value },
                      })}
                    ></textarea>
                    <button type="button" className="mt-2 btn btn-primary" onClick={() => submitEvaluation(user.id)}>Save</button>
                  </div>
                </div>
              ))}
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EmployeeEvaluation;
