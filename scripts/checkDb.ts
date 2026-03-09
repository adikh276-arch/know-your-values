import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    try {
        console.log('--- DB Check ---');
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));

        if (tables.rows.some(r => r.table_name === 'reflections')) {
            const count = await pool.query("SELECT COUNT(*) FROM reflections");
            console.log('Reflections count:', count.rows[0].count);

            const latest = await pool.query("SELECT * FROM reflections ORDER BY created_at DESC LIMIT 1");
            console.log('Latest reflection:', latest.rows[0]);
        }

        if (tables.rows.some(r => r.table_name === 'users')) {
            const users = await pool.query("SELECT COUNT(*) FROM users");
            console.log('Users count:', users.rows[0].count);
        }

        await pool.end();
    } catch (err) {
        console.error('Check failed:', err);
    }
}

check();
