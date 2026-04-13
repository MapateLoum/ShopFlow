const { verifyToken } = require("../utils/auth.utils");
const prisma = require("../utils/prisma");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Non autorisé" });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "SUPER_ADMIN")
    return res.status(403).json({ success: false, message: "Accès refusé" });
  next();
};

const isSeller = (req, res, next) => {
  if (req.user?.role !== "SELLER")
    return res.status(403).json({ success: false, message: "Accès refusé" });
  next();
};

module.exports = { protect, isSuperAdmin, isSeller };
