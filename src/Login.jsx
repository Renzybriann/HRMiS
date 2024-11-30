import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Hook to navigate to different routes

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Logging in with", username, password);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        // Store the token in localStorage
        localStorage.setItem("token", data.token);

        // Check if user data and their roles exist
        if (data.user && data.user.roles && data.user.roles.length > 0) {
          // Store role-based specific data in localStorage (Optional)
          localStorage.setItem("roles", JSON.stringify(data.user.roles));

          // Prioritize Admin role if it exists
          if (data.user.roles.includes("Admin")) {
            console.log("Navigating to admin-dashboard");
            navigate("/admin-dashboard"); // Redirect to admin dashboard
          } else if (data.user.roles.includes("HR Officer")) {
            console.log("Navigating to hr-dashboard");
            navigate("/hr-dashboard"); // Redirect to HR dashboard if no Admin role
          } else if (data.user.roles.includes("User")) {
            console.log("Navigating to user-dashboard");
            navigate("/user-dashboard"); // Redirect to user dashboard
          } else {
            setErrorMessage("Invalid user role.");
          }
        } else {
          setErrorMessage("Invalid user data returned from the server.");
        }
      } else {
        setErrorMessage(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
