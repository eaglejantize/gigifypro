import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Serve static files from the Vite build output (default: dist)
const clientDist = path.resolve(process.cwd(), "dist");
app.use(express.static(clientDist, { index: false }));

// SPA fallback: return index.html for unknown GET routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error("Error sending index.html:", err);
      res.status(500).send("Server error");
    }
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
});

export default app;
