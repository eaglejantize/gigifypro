import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import corsMiddleware from "./cors";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

// Session (tune secret + cookie flags)
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",   // if frontend & API are on SAME origin/port; use 'none' if cross-site
    secure: false,     // set true if you’re on https (replit prod) + using SameSite 'none'
  }
}));

// ... your routes: app.use("/api", api)

export default app;