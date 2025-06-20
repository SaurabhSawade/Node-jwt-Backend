require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/auth');

const app = express();

app.use(cors({ origin: 'node-jwt-frontend-ku6iytt6x-saurabhsawades-projects.vercel.app', credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api', authRoutes);

// Protected route
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, secure data here.` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));