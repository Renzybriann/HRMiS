import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResigned, setShowResigned] = useState(false); // Toggle resigned employees view
 const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    designation: '',
    office: '',
    sex: '',
    date_of_birth: '',
    status: 'Active', // Default status
  });
  const filteredEmployees = employees.filter((employee) =>
    showResigned ? employee.status === "Inactive" : employee.status === "Active"
  );
  
  const navigate = useNavigate(); // Initialize useNavigate

  
  useEffect(() => {
    fetch('http://localhost:5000/api/employees')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setEmployees(data))
      .catch((error) => {
        console.error('Error fetching employees:', error);
        setError('Failed to load employee data. Please try again later.');
      });
  }, []);

  const handleAddNew = () => {
    setShowAddForm(true); // Show the form
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Ensure status is explicitly set to "Active"
    const employeeData = { ...newEmployee, status: 'Active' };

    fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEmployees((prevEmployees) => [...prevEmployees, data.employee]);

        // Reset the form
        setNewEmployee({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          designation: '',
          office: '',
          sex: '',
          date_of_birth: '',
          status: 'Active',
        });

        // Hide the form
        setShowAddForm(false);
      })
      .catch((error) => {
        console.error('Error adding employee:', error);
        setError('Failed to add new employee. Please try again later.');
      });
  };

  const handleResign = (id) => {
    // Find the employee by ID to check their current status
    const employee = employees.find((emp) => emp.id === id);
  
    // Only proceed if the employee is currently "Active"
    if (employee && employee.status === "Active") {
      const resignationDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
  
      fetch(`http://localhost:5000/api/employees/${id}/resignation_date`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Inactive", resignation_date: resignationDate }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((updatedEmployee) => {
          // Update the local state to reflect the resignation
          setEmployees((prev) =>
            prev.map((emp) =>
              emp.id === id ? { ...emp, status: "Inactive", resignation_date: resignationDate } : emp
            )
          );
          alert("Employee status updated to 'Inactive' successfully!");
        })
        .catch((error) => {
          console.error("Error updating employee status:", error);
          alert("Failed to resign the employee. Please try again.");
        });
    } else {
      alert("The employee is already resigned or not found.");
    }
  };
  
  
  

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleViewResigned = () => {
    navigate('/resign');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Employee List</h1>

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
            </tr>
          </thead>
          <tbody>
          {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
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
                  <td className="border border-gray-300 p-2">
                    {employee.resignation_date ? formatDate(employee.resignation_date) : 'N/A'}
                  </td>

                <td className="border border-gray-300 p-2 text-center">
                  {employee.status === 'Active' && (
                    <button
                    onClick={() => handleResign(employee.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    aria-label={`Resign employee ${employee.full_name || employee.id}`}
                  >
                    Resign
                  </button>
                  
                  )}
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Object.keys(employees[0] || {}).length + 1} className="border border-gray-300 p-2 text-center">
                  No employees found.
                </td>

              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="button-group mt-4 flex justify-center gap-4">
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New
        </button>

        <button
          onClick={handleViewResigned}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          View Resigned Employees
        </button>
        
      </div>

      {showAddForm && (
        <div className="mt-6 p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                name="first_name"
                value={newEmployee.first_name}
                onChange={handleFormChange}
                placeholder="First Name"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="last_name"
                value={newEmployee.last_name}
                onChange={handleFormChange}
                placeholder="Last Name"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="middle_name"
                value={newEmployee.middle_name}
                onChange={handleFormChange}
                placeholder="Middle Name"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="suffix"
                value={newEmployee.suffix}
                onChange={handleFormChange}
                placeholder="Suffix"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="designation"
                value={newEmployee.designation}
                onChange={handleFormChange}
                placeholder="Designation"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="office"
                value={newEmployee.office}
                onChange={handleFormChange}
                placeholder="Office"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <select
                name="sex"
                value={newEmployee.sex}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="date"
                name="date_of_birth"
                value={newEmployee.date_of_birth}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
