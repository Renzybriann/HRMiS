import pkg from 'pg'; // Default import for the pg module
import bcrypt from 'bcryptjs';

const { Pool } = pkg; // Destructure the Pool class from the imported pg package

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'human_resource',
    password: 'admin123',
    port: 5432,
});

async function updatePasswords() {
    try {
        const result = await pool.query('SELECT * FROM users');
        for (let user of result.rows) {
            // Skip users who already have a hashed password
            if (user.password && user.password.includes('$2a$')) {
                console.log(`Password for user ${user.username} is already hashed`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);
            await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
            console.log(`Password for user ${user.username} updated`);
        }
    } catch (err) {
        console.error('Error updating passwords', err);
    } finally {
        // Close the pool connection after the task is done
        await pool.end();
    }
}

updatePasswords();
