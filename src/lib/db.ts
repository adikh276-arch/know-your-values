import { Pool, neonConfig } from "@neondatabase/serverless";

// Allow connection from browser
neonConfig.fetchConnectionCache = true;

const connectionString = (import.meta.env?.VITE_DATABASE_URL) || "";

if (!connectionString) {
    console.warn("VITE_DATABASE_URL is not defined. Check your environment variables.");
}

export const pool = new Pool({
    connectionString: connectionString,
});

export const sql = async (text: string, params?: any[]) => {
    try {
        const res = await pool.query(text, params || []);
        return res;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
};

export const query = sql;
