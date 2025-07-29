import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { connectDB, isDatabaseConnected } from "./config/database";
import { initializeMockData } from "./services/mockData";
import { configurePassport } from "./config/passport";
import { handleDemo } from "./routes/demo";
import { signup, signin, signupWithOTP, googleAuth, googleCallback, sendOTP, verifyOTP, clearOTPForEmail } from "./routes/auth";
import { getNotes, createNote, updateNote, deleteNote } from "./routes/notes";
import { authenticateToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Connect to MongoDB (or use mock data if unavailable)
  connectDB().then(() => {
    if (!isDatabaseConnected()) {
      initializeMockData();
    }
  });

  // Configure passport
  configurePassport();

  // Middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session middleware for passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/signup-otp", signupWithOTP);
  app.post("/api/auth/signin", signin);
  app.post("/api/auth/send-otp", sendOTP);
  app.post("/api/auth/verify-otp", verifyOTP);
  app.post("/api/auth/clear-otp", clearOTPForEmail);

  // Google OAuth routes
  app.get("/api/auth/google", googleAuth);
  app.get("/api/auth/google/callback", googleCallback);

  // Protected notes routes
  app.get("/api/notes", authenticateToken, getNotes);
  app.post("/api/notes", authenticateToken, createNote);
  app.put("/api/notes/:id", authenticateToken, updateNote);
  app.delete("/api/notes/:id", authenticateToken, deleteNote);

  return app;
}
