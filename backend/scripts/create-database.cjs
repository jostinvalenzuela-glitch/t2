// Solo crea la base propia del proyecto si no existe; no borra datos.
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const database = process.env.DB_DATABASE;
  if (!database || !/^[a-zA-Z0-9_]+$/.test(database)) {
    throw new Error('DB_DATABASE debe contener solo letras, números y guion bajo.');
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Base ${database} disponible.`);
  } finally {
    await connection.end();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
