import React, { useEffect, useState } from 'react';

const Separation = () => {
  const [separatedEmployees, setSeparatedEmployees] = useState([]);

  useEffect(() => {
    // Fetch separated employees data
    fetch('http://localhost:5000/api/employees/separated')
      .then((response) => response.json())
      .then((data) => setSeparatedEmployees(data))
      .catch((error) => console.error('Error fetching separated employees:', error));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Separated Employees</h1>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Full Name</th>
            <th className="border border-gray-300 p-2">Separation Date</th>
          </tr>
        </thead>
        <tbody>
          {separatedEmployees.map((employee) => (
            <tr key={employee.id}>
              <td className="border border-gray-300 p-2">{employee.full_name}</td>
              <td className="border border-gray-300 p-2">{employee.separation_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Separation;
