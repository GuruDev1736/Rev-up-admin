import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "204.12.233.228",
  user: "guruprasad_root",
  password: "Guruprasad#1736",
  database: "guruprasad_revup",
});

try {
  const connection = await db.getConnection();
  console.log("Database connected successfully");
  connection.release();
} catch (err) {
  console.log("Database connection failed:", err.message);
}
