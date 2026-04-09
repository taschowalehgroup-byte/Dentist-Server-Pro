const express = require("express");
const cors    = require("cors");
const path    = require("path");

// Wait for DB to initialise before accepting requests
const { ready } = require("./config/database");

// Import middleware
const authMiddleware = require("./middleware/auth");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Import routes
const authRoutes         = require("./routes/auth");
const patientsRoutes     = require("./routes/patients");
const appointmentsRoutes = require("./routes/appointments");
const doctorsRoutes      = require("./routes/doctors");
const financeRoutes      = require("./routes/finance");
const inventoryRoutes    = require("./routes/inventory");
const statsRoutes        = require("./routes/stats");
const usersRoutes        = require("./routes/users");
const treatmentsRoutes   = require("./routes/treatments");
const settingsRoutes     = require("./routes/settings");

// ── App Setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(authMiddleware);

// Serve JS files from the backend public/js directory
app.use("/js",               express.static(path.join(__dirname, "public", "js")));
app.use("/backend/public/js",express.static(path.join(__dirname, "public", "js")));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/patients",     patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/doctors",      doctorsRoutes);
app.use("/api/transactions", financeRoutes);
app.use("/api/inventory",    inventoryRoutes);
app.use("/api/users",        usersRoutes);
app.use("/api/treatments",   treatmentsRoutes);
app.use("/api/settings",     settingsRoutes);
app.use("/api",              statsRoutes);

// ── Error Handling ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server (after DB is ready) ──────────────────────────────────────
const PORT = process.env.PORT || 3000;

ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n  🦷 DentCare Pro Server`);
      console.log(`  ─────────────────────`);
      console.log(`  Port:     ${PORT}`);
      console.log(`  Frontend: http://localhost:${PORT}`);
      console.log(`  API:      http://localhost:${PORT}/api\n`);
    });
  })
  .catch(err => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
