import http from "http";

// Variables without which the server cannot run safely
const REQUIRED_VARIABLES = [
  "PORT",
  "MONG_URI",
  "CORS_ORIGIN",
  "SECRET_ACCESS_TOKEN",
  "API_KEY_SECRET",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_BUCKET_NAME",
];

// Secrets used to sign tokens / hash API keys: must be long and not copied from an example file
const SECRET_VARIABLES = ["SECRET_ACCESS_TOKEN", "API_KEY_SECRET"];
const SECRET_MIN_LENGTH = 32;
const EXAMPLE_SECRET_VALUES = ["secret", "your-secret-token", "your-super-secret-token-change-me", "couverto-api-key-secret"];

/**
 * @function getEnvProblems
 * @description Lists missing or unsafe environment variables. Only variable names are reported, never values.
 * @returns {string[]} Human-readable problems (empty when the configuration is valid).
 */
export const getEnvProblems = (): string[] => {
  const problems: string[] = [];

  for (const name of REQUIRED_VARIABLES) {
    if (!process.env[name]?.trim()) {
      problems.push(`${name} : variable absente`);
    }
  }

  for (const name of SECRET_VARIABLES) {
    const value = process.env[name]?.trim();
    if (!value) continue;
    if (EXAMPLE_SECRET_VALUES.includes(value)) {
      problems.push(`${name} : valeur d'exemple, à remplacer par un secret aléatoire`);
    } else if (value.length < SECRET_MIN_LENGTH) {
      problems.push(`${name} : trop courte (${SECRET_MIN_LENGTH} caractères minimum)`);
    }
  }

  return problems;
};

/**
 * @function startConfigErrorServer
 * @description Starts a minimal HTTP server that answers every request with a 503 listing the configuration
 * problems, so the front can display them. No route, database or socket is started.
 * @param {string[]} problems - Problems returned by getEnvProblems.
 */
export const startConfigErrorServer = (problems: string[]): void => {
  console.error("Server configuration is invalid, the API will not start:");
  problems.forEach((problem) => console.error(` - ${problem}`));

  const body = JSON.stringify({
    error: "Le serveur n'est pas configuré correctement.",
    code: "SERVER_MISCONFIGURED",
    problems,
  });

  const server = http.createServer((req, res) => {
    // CORS_ORIGIN may be the missing variable: echo the origin so the front can read the error
    // (the front sends credentials, so the origin must be echoed explicitly, never "*")
    if (req.headers.origin) {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Vary", "Origin");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(body);
  });

  const port = parseInt(process.env.PORT || "3001");
  server.listen(port, "0.0.0.0", () => {
    console.error(`Configuration error server listening on port ${port}`);
  });
};
