import React, { useState, useEffect } from 'react';

const Resign = () => {
  const [resignedEmployees, setResignedEmployees] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/employees') // Assuming this endpoint returns resigned employees
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setResignedEmployees(data))
      .catch((error) => {
        console.error('Error fetching resigned employees:', error);
        setError('Failed to load resigned employees. Please try again later.');
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resigned Employees</h1>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm md:text-base">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Last Name</th>
              <th className="border border-gray-300 p-2">First Name</th>
              <th className="border border-gray-300 p-2">Middle Name</th>
              <th className="border border-gray-300 p-2">Suffix</th>
              <th className="border border-gray-300 p-2">Full Name</th>
              <th className="border border-gray-300 p-2">Designation</th>
              <th className="border border-gray-300 p-2">OFfice</th>
              <th className="border border-gray-300 p-2">Sex</th>
              <th className="border border-gray-300 p-2">Date of Birth</th>
              <th className="border border-gray-300 p-2">Age</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Resignation Date</th>
            </tr>
          </thead>
          <tbody>
            {resignedEmployees.length > 0 ? (
              resignedEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="border border-gray-300 p-2 text-center">{employee.id}</td>
                  <td className="border border-gray-300 p-2">{employee.last_name || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.first_name || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.middle_name || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.suffix || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.full_name || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.designation || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.office || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{employee.sex || 'N/A'}</td>
                  <td className="border border-gray-300 p-2">{formatDate(employee.date_of_birth)}</td>
                  <td className="border border-gray-300 p-2 text-center">{employee.age ?? 'N/A'}</td>
                  <td className="border border-gray-300 p-2 text-center">{employee.status || 'N/A'}</td>
                  <td className="border border-gray-300 p-2 text-center">{formatDate(employee.resignation_date) || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="border border-gray-300 p-2 text-center">
                  No resigned employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Resign;
