import { Pool, neonConfig } from "@neondatabase/serverless";

// Optional: allow connection from browser for development if needed
// neonConfig.fetchConnectionCache = true;

const connectionString = (import.meta.env?.VITE_DATABASE_URL) || "";

export const pool = new Pool({
    connectionString: connectionString,
});

export const query = async (text: string, params?: any[]) => {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
};

// For simpler queries
export const sql = async (text: string, params?: any[]) => {
    return query(text, params);
}
