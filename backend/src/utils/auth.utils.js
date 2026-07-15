const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Token courte durée pour les liens "magiques" envoyés par email
// (ex: retrouver mes commandes) — distinct du token de session vendeur
const generateShortToken = (payload, expiresIn = "30m") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const otpExpiresAt = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  return d;
};

module.exports = { generateOTP, generateToken, generateShortToken, verifyToken, otpExpiresAt };