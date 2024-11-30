import React, { useState, useEffect } from 'react';

function HRDashboard() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Fetch employee data specific to HR officer
    const fetchEmployees = async () => {
      const response = await fetch("http://localhost:5000/employees/hr");
      const data = await response.json();
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">HR Officer Dashboard</h1>
      <h2 className="text-2xl mb-4">Employee Records</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Position</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="border px-4 py-2">{employee.name}</td>
              <td className="border px-4 py-2">{employee.position}</td>
              <td className="border px-4 py-2">
                <button className="text-blue-500 hover:text-blue-700">View/Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HRDashboard;
