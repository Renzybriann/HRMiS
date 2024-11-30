import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HRDashboard from './pages/HRDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import EmployeeList from './components/EmployeeList.jsx';
import Resign from './components/Resign.jsx'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<EmployeeList/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/resign" element={<Resign />} />
      </Routes>
    </div>
  );
}

export default App;
