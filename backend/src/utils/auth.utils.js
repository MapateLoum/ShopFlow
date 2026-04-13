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

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const otpExpiresAt = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  return d;
};

module.exports = { generateOTP, generateToken, verifyToken, otpExpiresAt };
