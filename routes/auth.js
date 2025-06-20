const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { addToken } = require('../utils/tokenBlacklist');

const router = express.Router();

// Generate Tokens
const generateAccessToken = (user) =>
  jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: '7d' });

// Register
// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const exists = await User.findOne({ username });
//     if (exists) return res.status(400).json({ message: 'User already exists' });

//     const hash = await bcrypt.hash(password, 10);
//     await User.create({ username, password: hash });
//     res.json({ message: 'Registered successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) return res.status(400).json({ message: 'Username or Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ message: 'Invalid credentials' });

//     const payload = { username: user.username };
//     const accessToken = generateAccessToken(payload);
//     const refreshToken = generateRefreshToken(payload);

//     res.json({ accessToken, refreshToken });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { username: user.username, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// Logout
router.post('/logout', (req, res) => {
  const { token } = req.body;
  addToken(token); // blacklist access token
  res.json({ message: 'Logged out' });
});

module.exports = router;