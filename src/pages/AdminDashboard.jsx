import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetching users from the server
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Authorization token is missing or expired. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Unauthorized. Please log in again.');
                        localStorage.removeItem('token');
                    } else {
                        throw new Error('Failed to fetch users');
                    }
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('An error occurred while fetching users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center mb-6">Admin Dashboard</h1>

                {loading ? (
                    <div className="text-center text-xl text-blue-600">Loading...</div>
                ) : error ? (
                    <div className="text-center text-xl text-red-600">{error}</div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">User List</h2>
                        <ul>
                            {users.map((user) => (
                                <li key={user.id} className="border-b py-2">
                                    <div className="font-semibold text-gray-800">
                                        {user.username}
                                    </div>
                                    <div className="text-gray-600">
                                        Roles: {user.roles?.join(', ') || 'No roles assigned'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
