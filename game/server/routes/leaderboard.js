import express from 'express';

export const leaderboardRouter = express.Router();

// In-memory leaderboard (replace with database in production)
const leaderboard = [];

// Submit score
leaderboardRouter.post('/submit', (req, res) => {
  try {
    const { playerId, playerName, score, kills } = req.body;

    // Validate required fields exist
    if (!playerId || !playerName || score === undefined || kills === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate data types and constraints
    if (typeof playerId !== 'string' || playerId.length > 100) {
      return res.status(400).json({ error: 'Invalid playerId format' });
    }

    if (typeof playerName !== 'string' || playerName.length < 1 || playerName.length > 50) {
      return res.status(400).json({ error: 'Invalid playerName: must be 1-50 characters' });
    }

    // Sanitize playerName to prevent XSS
    const sanitizedName = playerName.replace(/[<>\"'&]/g, '');
    if (sanitizedName.length === 0) {
      return res.status(400).json({ error: 'Invalid playerName: contains only special characters' });
    }

    if (!Number.isInteger(score) || score < 0 || score > 999999999) {
      return res.status(400).json({ error: 'Invalid score: must be a positive integer' });
    }

    if (!Number.isInteger(kills) || kills < 0 || kills > 999999) {
      return res.status(400).json({ error: 'Invalid kills: must be a positive integer' });
    }

    const entry = {
      playerId: playerId.trim(),
      playerName: sanitizedName.trim(),
      score,
      kills,
      timestamp: Date.now()
    };

    // Add or update entry
    const existingIndex = leaderboard.findIndex(e => e.playerId === playerId);
    if (existingIndex !== -1) {
      // Only update if new score is higher
      if (score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex] = entry;
      }
    } else {
      leaderboard.push(entry);
    }

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep only top 100
    if (leaderboard.length > 100) {
      leaderboard.length = 100;
    }

    res.json({
      success: true,
      message: 'Score submitted successfully',
      rank: leaderboard.findIndex(e => e.playerId === playerId) + 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Get leaderboard
leaderboardRouter.get('/top/:limit?', (req, res) => {
  try {
    const limit = parseInt(req.params.limit || '10');

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit: must be between 1 and 100' });
    }
    const topScores = leaderboard.slice(0, Math.min(limit, 100));

    res.json({
      success: true,
      leaderboard: topScores
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get player rank
leaderboardRouter.get('/rank/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;

    // Validate playerId
    if (!playerId || typeof playerId !== 'string' || playerId.length > 100) {
      return res.status(400).json({ error: 'Invalid playerId' });
    }
    const rank = leaderboard.findIndex(e => e.playerId === playerId);

    if (rank === -1) {
      return res.status(404).json({ error: 'Player not found in leaderboard' });
    }

    res.json({
      success: true,
      rank: rank + 1,
      entry: leaderboard[rank],
      total: leaderboard.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get player rank' });
  }
});
