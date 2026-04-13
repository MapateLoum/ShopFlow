require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/auth.routes");
const sellerRoutes = require("./routes/seller.routes");
const storeRoutes = require("./routes/store.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const prisma = new PrismaClient();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ← preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ShopFlow API running" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`🚀 ShopFlow API démarrée sur le port ${PORT}`);
});

module.exports = app;