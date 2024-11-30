import React, { useState, useEffect } from 'react';

function UserDashboard() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    // Fetch the specific employee data for the logged-in user
    const fetchEmployee = async () => {
      const response = await fetch("http://localhost:5000/employees/me");
      const data = await response.json();
      setEmployee(data);
    };
    fetchEmployee();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">User Dashboard</h1>
      {employee ? (
        <div>
          <h2 className="text-2xl mb-4">Welcome, {employee.name}</h2>
          <p><strong>Position:</strong> {employee.position}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Contact:</strong> {employee.contact}</p>
        </div>
      ) : (
        <p>Loading employee data...</p>
      )}
    </div>
  );
}

export default UserDashboard;
