import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import jwt from 'jsonwebtoken';  // Import JWT package
import cron from 'node-cron';


const { Pool } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Utility function for error handling
const handleError = (res, message, status = 500) => {
    return res.status(status).json({ message });
};

// Routes

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (err) {
        console.error('Database connection failed:', err);
        handleError(res, 'Database connection failed');
    }
});

// Authentication: User login with JWT token generation
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return handleError(res, 'Username and password are required', 400);
    }

    try {
        // Fetch user and associated roles
        const result = await pool.query(
            'SELECT u.id, u.username, u.password, ARRAY_AGG(r.name) AS roles ' +
            'FROM users u ' +
            'LEFT JOIN user_roles ur ON ur.user_id = u.id ' +
            'LEFT JOIN roles r ON ur.role_id = r.id ' +
            'WHERE u.username = $1 ' +
            'GROUP BY u.id',
            [username]
        );

        if (result.rows.length === 0) {
            return handleError(res, 'User not found', 404);
        }

        const user = result.rows[0];

        // Check if the password matches (assuming plain text, NOT recommended)
        if (password === user.password) {
            // Create JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username, roles: user.roles },
                process.env.JWT_SECRET,  // Secret key from environment
                { expiresIn: '1h' }  // Token expiration time (optional)
            );

            res.status(200).json({
                message: 'Login successful',
                token,  // Send token to client
                user: {
                    id: user.id,
                    username: user.username,
                    roles: user.roles,
                },
            });
        } else {
            handleError(res, 'Incorrect password', 401);
        }
    } catch (err) {
        console.error('Login error:', err);
        handleError(res, 'Internal server error');
    }
});

// Middleware for token validation
const protect = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

    if (!token) {
        return handleError(res, 'Token is required', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token
        req.user = decoded;  // Attach the user to the request object
        next();
    } catch (err) {
        return handleError(res, 'Invalid or expired token', 401);
    }
};

// Middleware for admin authorization
const isAdmin = (req, res, next) => {
    if (!req.user.roles.includes('Admin')) {
        return handleError(res, 'Not authorized as an admin', 403);
    }
    next();
};

// Get all users (Admin only)
app.get('/api/users', protect, isAdmin, async (req, res) => {
    try {
        // Fetch all users with their roles
        const result = await pool.query(
            'SELECT u.id, u.username, ARRAY_AGG(r.name) AS roles ' +
            'FROM users u ' +
            'LEFT JOIN user_roles ur ON ur.user_id = u.id ' +
            'LEFT JOIN roles r ON ur.role_id = r.id ' +
            'GROUP BY u.id'
        );
        if (result.rows.length === 0) {
            return handleError(res, 'No users found', 404);
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        handleError(res, 'Error fetching users');
    }
});

// Update user role(s) (Admin only)
app.put('/api/users/:id/roles', protect, isAdmin, async (req, res) => {
    const { roles } = req.body; // roles should be an array

    if (!Array.isArray(roles) || roles.length === 0) {
        return handleError(res, 'Roles must be an array with at least one role', 400);
    }

    try {
        // Remove existing roles for the user
        await pool.query('DELETE FROM user_roles WHERE user_id = $1', [req.params.id]);

        // Assign new roles
        const rolePromises = roles.map(role => 
            pool.query(
                'INSERT INTO user_roles (user_id, role_id) ' +
                'SELECT $1, id FROM roles WHERE name = $2',
                [req.params.id, role]
            )
        );
        await Promise.all(rolePromises);

        res.json({ message: 'User roles updated successfully' });
    } catch (err) {
        console.error('Error updating user roles:', err);
        handleError(res, 'Error updating user roles');
    }
});

// Register new user (Admin only)
app.post('/api/users', protect, isAdmin, async (req, res) => {
    const { username, password, roles } = req.body;

    if (!username || !password || !Array.isArray(roles) || roles.length === 0) {
        return handleError(res, 'Username, password, and roles are required', 400);
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            return handleError(res, 'Username already exists', 400);
        }

        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, password]  // Store password in plain text (NOT recommended)
        );

        const userId = result.rows[0].id;

        // Assign roles to the user
        const rolePromises = roles.map(role =>
            pool.query(
                'INSERT INTO user_roles (user_id, role_id) ' +
                'SELECT $1, id FROM roles WHERE name = $2',
                [userId, role]
            )
        );
        await Promise.all(rolePromises);

        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error creating user:', err);
        handleError(res, 'Error creating user');
    }
});

app.post('/api/employees', async (req, res) => {
    const {
        last_name,
        first_name,
        middle_name,
        suffix,
        designation,
        office,
        sex,
        date_of_birth,
        status = 'active', // Default status to 'active'
    } = req.body;

    // Validate mandatory fields
    if (!last_name || !first_name || !sex || !date_of_birth) {
        return handleError(
            res,
            'Last name, first name, sex, and date of birth are required',
            400
        );
    }

    // Generate full name
    const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}${suffix ? ' ' + suffix : ''}`;

    try {
        // Insert new employee into the database
        const result = await pool.query(
            `
            INSERT INTO employees 
            (last_name, first_name, middle_name, suffix, designation, office, sex, date_of_birth, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *
            `,
            [last_name, first_name, middle_name, suffix, designation, office, sex, date_of_birth, status]
        );

        // Send success response
        res.status(201).json({
            message: 'Employee created successfully',
            employee: result.rows[0],
        });
    } catch (err) {
        console.error('Error creating employee:', err);
        handleError(res, 'Error creating employee');
    }
});



app.get('/api/employees', async (req, res) => {
    const { status } = req.query; // Optional query parameter for filtering

    try {
        let query = `
            SELECT 
                id, 
                last_name, 
                first_name, 
                middle_name, 
                suffix,
                designation,
                office,
                sex, 
                date_of_birth, 
                full_name, 
                EXTRACT(YEAR FROM AGE(date_of_birth)) AS age,
                status,
                resignation_date
            FROM employees
        `;

        // Only add WHERE clause if status is provided
        const queryParams = [];
        if (status) {
            query += ' WHERE status = $1';
            queryParams.push(status); // Add the status to the query parameters
        }

        const result = await pool.query(query, queryParams); // Use queryParams for parameterized query
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).send(err.message);
    }
});



//Update Employee Status API
app.put('/api/employees/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).send({ message: 'Invalid status value' });
  }

  try {
    const result = await db.query(
      'UPDATE Employees SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Employee not found' });
    }

    res.status(200).send({ employee: result.rows[0] });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
}); 

app.put('/api/employees/:id/resignation_date', async (req, res) => {
    const { id } = req.params; // Employee ID from the request parameters
    const { status, resignation_date } = req.body; // Status and resignation_date from the request body
  
    try {
        // First, check if the employee exists and their current status
        const result = await pool.query(
          'SELECT status FROM employees WHERE id = $1',
          [id] // This is the first parameter being passed
        );
  
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
  
        const currentStatus = result.rows[0].status;
  
        if (currentStatus === 'Inactive') {
            return res.status(400).json({ error: 'Employee is already resigned' });
        }
  
        // Proceed with updating the status and resignation date
        const updateResult = await pool.query(
          'UPDATE employees SET status = $1, resignation_date = $2 WHERE id = $3 RETURNING *',
          [status, resignation_date, id] // Parameters for the update query
        );
  
        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: 'Employee not found during update' });
        }
  
        res.status(200).json(updateResult.rows[0]); // Return the updated employee details
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});


  
  



// Schedule a cron job to update ages daily at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled job: Updating employee ages...');
    try {
        // Update employee ages based on their date_of_birth
        await pool.query(`
            UPDATE employees 
            SET age = EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))
        `);
        console.log('Employee ages updated successfully.');
    } catch (err) {
        console.error('Error updating employee ages:', err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
