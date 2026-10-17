require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Security HTTP Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  next();
});

// 2. Restricted CORS Configuration (Prevents unauthorized cross-origin requests)
const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`CORS policy violation: Origin ${origin} not permitted.`),
      );
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-analyst-key"],
    credentials: true,
  }),
);

// 3. Rate Limiting Middleware (Protects against DoS & brute-force abuse)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP address. Please try again after 15 minutes.",
  },
});

const mutationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 45, // Max 45 mutations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Rate limit exceeded for write operations. Please throttle your requests.",
  },
});

app.get("/", (req, res) => {
  res.send("Hello World Api is running successfully");
});

app.use("/api", generalLimiter);
app.use("/api/transactions", (req, res, next) => {
  if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    return mutationLimiter(req, res, next);
  }
  next();
});

// 4. Request Body Parser with payload size limit
app.use(express.json({ limit: "100kb" }));

// 5. Request logger for audit & diagnostics
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "FraudRadar Backend API",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Mount Routes
app.use("/api", transactionRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Central Secure Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.name, err.message);

  // CORS error
  if (err.message && err.message.includes("CORS policy violation")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // Malformed JSON payload syntax error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
  }

  // Mongoose invalid ObjectId CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid format for resource identifier at path: ${err.path}`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "Duplicate key error: A transaction with this reference already exists",
    });
  }

  // Generic fallback without leaking internal database stack traces
  const isDev = process.env.NODE_ENV === "development";
  res.status(err.status || 500).json({
    success: false,
    message: isDev
      ? err.message
      : "An unexpected internal server error occurred",
  });
});

// Connect to MongoDB and start Express server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 FraudRadar Backend Server Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🔒 Security: Rate Limiting & Analyst Auth Active`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error("Failed to start server due to database connection error.");
    process.exit(1);
  }
}

startServer();
