import { useEffect, useState } from 'react'
import GameContainer from './components/GameContainer'
import ErrorBoundary from './components/ErrorBoundary'
import fontLoader from './utils/FontLoader'
import './components/ui/RetroScrollbar.css'

function App() {
  // PERFORMANCE FIX: Load fonts in background, don't block game startup
  useEffect(() => {
    fontLoader.loadGameFonts()
      .then(() => {
        console.log('All game fonts loaded');
      })
      .catch((error) => {
        console.error('Failed to load fonts:', error);
        // Continue with fallback fonts
      });
  }, []);

  return (
    <ErrorBoundary>
      <GameContainer />
    </ErrorBoundary>
  )
}

export default App
