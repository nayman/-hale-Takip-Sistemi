const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

console.log("Waiting for database to be ready...");

async function checkConnection() {
  const start = Date.now();
  const timeout = 60000; // 60 seconds timeout
  
  while (true) {
    // Create client instance inside the loop or close it properly each time
    const client = new Client({
      connectionString: connectionString,
    });
    
    try {
      await client.connect();
      console.log("Database connection established successfully.");
      await client.end();
      process.exit(0);
    } catch (err) {
      if (Date.now() - start > timeout) {
        console.error("Timeout waiting for database connection.");
        process.exit(1);
      }
      console.log("Database connection failed. Retrying in 2 seconds...");
      // Ensure client is closed/cleaned up
      try {
        await client.end();
      } catch (e) {}
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

checkConnection();
