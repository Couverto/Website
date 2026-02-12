import { createServer } from "http";
import { app } from "./app.js";
import { connectToDatabase } from "./database/connectToDB.js";
import { initSockets } from "./sockets/socket.js";
import { initReviewScheduler } from "./cron/reviewScheduler.js";

/**
 * Initializes the HTTP server, connects to the database, and sets up WebSockets.
 */
export function initServer() {
  // Connect to the database
  connectToDatabase();

  // Create an HTTP server using the Express app
  const httpServer = createServer(app);

  // Initialize WebSocket connections
  initSockets(httpServer);

  // Initialize Cron Jobs
  initReviewScheduler();

  // Ensure the PORT environment variable is defined
  if (!process.env.PORT) {
    console.error("Please specify the port number for the HTTP server with the environment variable PORT in the .env file.");
    process.exit(1);
  }

  // Start the HTTP server on the specified port
  httpServer.listen(parseInt(process.env.PORT), "0.0.0.0", () => {
    console.log("Server listening on port", process.env.PORT, "🚀");
  });
}

// Start the server
initServer();
