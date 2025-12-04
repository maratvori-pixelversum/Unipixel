import express from 'express';

export const saveGameRouter = express.Router();

// In-memory storage (replace with database in production)
const savedGames = new Map();

// Save game state
saveGameRouter.post('/save', (req, res) => {
  try {
    const { playerId, gameState } = req.body;

    if (!playerId || !gameState) {
      return res.status(400).json({ error: 'Missing playerId or gameState' });
    }

    const saveData = {
      playerId,
      gameState,
      timestamp: Date.now()
    };

    savedGames.set(playerId, saveData);

    res.json({
      success: true,
      message: 'Game saved successfully',
      timestamp: saveData.timestamp
    });
  } catch (error) {
    console.error('Failed to save game:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Load game state
saveGameRouter.get('/load/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;

    const saveData = savedGames.get(playerId);

    if (!saveData) {
      return res.status(404).json({ error: 'No save data found' });
    }

    res.json({
      success: true,
      gameState: saveData.gameState,
      timestamp: saveData.timestamp
    });
  } catch (error) {
    console.error('Failed to load game:', error);
    res.status(500).json({ error: 'Failed to load game' });
  }
});

// List all saves for a player
saveGameRouter.get('/list/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const saveData = savedGames.get(playerId);

    res.json({
      success: true,
      saves: saveData ? [saveData] : []
    });
  } catch (error) {
    console.error('Failed to list saves:', error);
    res.status(500).json({ error: 'Failed to list saves' });
  }
});

// Delete save
saveGameRouter.delete('/delete/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;

    if (savedGames.has(playerId)) {
      savedGames.delete(playerId);
      res.json({ success: true, message: 'Save deleted successfully' });
    } else {
      res.status(404).json({ error: 'No save data found' });
    }
  } catch (error) {
    console.error('Failed to delete save:', error);
    res.status(500).json({ error: 'Failed to delete save' });
  }
});
