import express from 'express';
import cors from 'cors';
import { saveGameRouter } from './routes/savegame.js';
import { leaderboardRouter } from './routes/leaderboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/savegame', saveGameRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PixelVerse API Server Running' });
});

app.listen(PORT, () => {
  console.log(`🚀 PixelVerse API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
