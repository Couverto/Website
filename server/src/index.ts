import "dotenv/config";
import { getEnvProblems, startConfigErrorServer } from "./configuration/env.js";

// Refuse to start the API with a missing or unsafe configuration.
// The server modules are imported only once the environment is valid (Firebase is initialized at import time).
const problems = getEnvProblems();
if (problems.length > 0) {
  startConfigErrorServer(problems);
} else {
  await import("./server.js");
}
