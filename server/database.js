import { neon } from "@neondatabase/serverless";

let cachedClient;

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("La conexión PostgreSQL no está configurada.");
  if (!cachedClient) cachedClient = neon(connectionString);
  return cachedClient;
}
