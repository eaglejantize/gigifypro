import cors from "cors";

const allowedOrigins = [
  // Local dev Vite origin (adjust if different)
  "http://localhost:5173",
  // Replit web preview origins (update to your actual)
  "https://<YOUR-REPL-NAME>.<YOUR-USER>.repl.co",
  "https://<YOUR-REPL-NAME>.<YOUR-USER>.repl.dev",
];

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    return cb(null, false);
  },
  credentials: true, // allow cookies/authorization headers
});
export default corsMiddleware;