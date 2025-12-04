import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Game } from '../engine/Game';

const SpaceGame = forwardRef(({ initialState, onStateChange }, ref) => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [fps, setFps] = useState(60);
  const [gameState, setGameState] = useState('loading');
  const [showControlHints, setShowControlHints] = useState(true);
  const [error, setError] = useState(null);

  // Expose game instance methods to parent via ref
  useImperativeHandle(ref, () => ({
    getGameState: () => {
      if (gameRef.current) {
        return {
          ...initialState,
          playtime: gameRef.current.playtime || 0,
          credits: gameRef.current.credits || initialState?.credits || 0,
          systemsExplored: gameRef.current.discoveredSystems?.size || 0,
          player: {
            ...initialState?.player,
            hp: gameRef.current.player?.hp || 100,
            maxHp: gameRef.current.player?.maxHp || 100,
            shield: gameRef.current.player?.shield || 100,
            maxShield: gameRef.current.player?.maxShield || 100,
            x: gameRef.current.player?.x || 0,
            y: gameRef.current.player?.y || 0,
          },
        };
      }
      return initialState || {};
    },
    loadGameState: async (state) => {
      if (gameRef.current && gameRef.current.loadState) {
        await gameRef.current.loadState(state);
      }
    },
    applySettings: (settings) => {
      if (gameRef.current && gameRef.current.applySettings) {
        gameRef.current.applySettings(settings);
      }
    },
    destroy: () => {
      if (gameRef.current && gameRef.current.destroy) {
        gameRef.current.destroy();
      }
    },
  }), []); // Empty deps - refs are stable and game instance is accessed via ref

  useEffect(() => {
    // Add global error handlers to catch any crashes
    const handleGlobalError = (event) => {
      // Suppress generic "Script error" messages (cross-origin errors with no useful info)
      if (event.message === 'Script error.' && event.lineno === 0 && event.colno === 0) {
        event.preventDefault(); // Prevent error from showing
        // Silent suppression - don't log anything
        return;
      }

      // Log actual errors with details
      console.error('[SpaceGame] ========================================');
      console.error('[SpaceGame] GLOBAL ERROR CAUGHT!');
      console.error('[SpaceGame] Error:', event.error);
      console.error('[SpaceGame] Message:', event.message);
      console.error('[SpaceGame] Filename:', event.filename);
      console.error('[SpaceGame] Line:', event.lineno, 'Column:', event.colno);
      console.error('[SpaceGame] ========================================');
    };

    const handleUnhandledRejection = (event) => {
      // Suppress if it's null/undefined (not a real error)
      if (!event.reason) {
        event.preventDefault(); // Prevent default error display
        // Silent suppression - don't log anything
        return;
      }

      // Also suppress empty/generic rejections
      if (event.reason === '' || event.reason === 'Script error.') {
        event.preventDefault();
        return;
      }

      console.error('[SpaceGame] ========================================');
      console.error('[SpaceGame] UNHANDLED PROMISE REJECTION!');
      console.error('[SpaceGame] Reason:', event.reason);
      console.error('[SpaceGame] Promise:', event.promise);
      console.error('[SpaceGame] ========================================');
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('[SpaceGame] Canvas ref not available');
      return () => {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }

    // Prevent re-initialization if game already exists
    if (gameRef.current) {
      return () => {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }

    // CRITICAL FIX: Ensure canvas has dimensions before Game constructor runs
    // Without this, the canvas context might not be available
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = 1920;
      canvas.height = 1080;
    }

    // Verify canvas can get 2D context before proceeding
    const testCtx = canvas.getContext('2d', { alpha: false });
    if (!testCtx) {
      console.error('[SpaceGame] CRITICAL: Cannot get 2D context from canvas!');
      setError({
        message: 'Failed to initialize canvas 2D context',
        stack: 'Canvas element exists but getContext("2d") returned null',
        name: 'CanvasInitializationError'
      });
      setGameState('error');
      return;
    }

    let game = null;
    let fpsInterval = null;
    let stateUpdateInterval = null;
    let initializationComplete = false;
    let isMounted = true; // Track if component is still mounted

    // Async initialization function
    const initializeGame = async () => {
      try {
        // Check if component is still mounted before proceeding
        if (!isMounted) {
          return;
        }

        // Pass full configuration to Game constructor
        try {
          game = new Game(canvas, initialState || {});
        } catch (gameError) {
          // Suppress null/undefined errors silently
          if (!gameError || gameError === 'Script error.') {
            return; // Silent suppression - don't log or re-throw
          }

          console.error('[SpaceGame] ========================================');
          console.error('[SpaceGame] GAME CONSTRUCTOR THREW AN ERROR!');
          console.error('[SpaceGame] Error:', gameError);
          console.error('[SpaceGame] Error message:', gameError.message);
          console.error('[SpaceGame] Error stack:', gameError.stack);
          console.error('[SpaceGame] ========================================');
          throw gameError; // Re-throw to be caught by outer try-catch
        }

        // Check again if component is still mounted
        if (!isMounted) {
          if (game && game.destroy) {
            game.destroy();
          }
          return;
        }

        gameRef.current = game;

        // Apply initial state if provided (only for loaded games, not new games)
        if (initialState && initialState.playtime > 0 && game.loadState) {
          await game.loadState(initialState);
        }

        // Check if still mounted before setting state
        if (!isMounted) {
          if (game && game.destroy) {
            game.destroy();
          }
          gameRef.current = null;
          return;
        }

        // Set game state to playing immediately - game can render while sprites generate
        // Sprites will generate in background, and game will use them when ready
        setGameState('playing');

        // Log sprite generation progress (non-blocking)
        if (game.spriteGenerationPromise) {
          game.spriteGenerationPromise.catch(err => {
            // Suppress null/undefined errors
            if (!err || err === 'Script error.') {
              return; // Silent suppression
            }
          });
        }
        fpsInterval = setInterval(() => {
          if (isMounted && game && game.fps !== undefined) {
            setFps(Math.floor(game.fps));
          }
        }, 500);

        // Periodic state updates to parent (disabled to prevent loops)
        // stateUpdateInterval = setInterval(() => {
        //   if (game && onStateChange) {
        //     const currentState = {
        //       playtime: game.playtime || 0,
        //       credits: game.credits || 0,
        //       systemsExplored: game.discoveredSystems?.size || 0,
        //     };
        //     onStateChange(currentState);
        //   }
        // }, 5000); // Every 5 seconds instead of 1

        initializationComplete = true;

      } catch (error) {
        // Suppress null/undefined errors silently
        if (!error || error === 'Script error.') {
          return; // Silent suppression - don't log anything
        }

        console.error('[SpaceGame] !!! CRITICAL ERROR DURING INITIALIZATION !!!');
        console.error('[SpaceGame] Error:', error);
        console.error('[SpaceGame] Message:', error.message);
        console.error('[SpaceGame] Stack:', error.stack);

        // Only update state if component is still mounted
        if (isMounted) {
          // Store error for display
          setError({
            message: error.message || 'Unknown error during game initialization',
            stack: error.stack,
            name: error.name || 'Error'
          });
          setGameState('error');
        }

        // Cleanup on error
        if (game && game.destroy) {
          try {
            game.destroy();
          } catch (err) {
            console.error('[SpaceGame] Error during cleanup:', err);
          }
        }
        gameRef.current = null;
        if (fpsInterval) clearInterval(fpsInterval);
        if (stateUpdateInterval) clearInterval(stateUpdateInterval);
      }
    };

    // Start async initialization
    // CRITICAL FIX: Add catch handler to prevent unhandled promise rejection
    initializeGame().catch(err => {
      // Suppress null/undefined errors silently
      if (!err || err === 'Script error.') {
        return; // Silent suppression
      }
      console.error('[SpaceGame] Unhandled error in initializeGame:', err);
      if (isMounted) {
        setError({
          message: err.message || 'Unknown error during game initialization',
          stack: err.stack,
          name: err.name || 'Error'
        });
        setGameState('error');
      }
    });

    return () => {
      console.log('[SpaceGame] === CLEANUP: Destroying game instance ===');
      isMounted = false; // Mark component as unmounted

      // Remove global error handlers
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);

      // Clean up game instance using gameRef to ensure we get the latest value
      if (gameRef.current && gameRef.current.destroy) {
        try {
          gameRef.current.destroy();
        } catch (err) {
          console.error('[SpaceGame] Error during game destroy:', err);
        }
      }
      gameRef.current = null;

      if (fpsInterval) clearInterval(fpsInterval);
      if (stateUpdateInterval) clearInterval(stateUpdateInterval);
    };
  }, []); // Empty dependencies - only initialize once!

  // Auto-hide control hints after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControlHints(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          border: '3px solid #ff4444',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '80%',
          maxHeight: '80%',
          overflow: 'auto',
          color: '#ff4444',
          fontFamily: 'monospace',
          textShadow: '0 0 10px #ff4444',
          boxShadow: '0 0 20px rgba(255, 68, 68, 0.5)',
          zIndex: 10000
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            ⚠ CRITICAL SYSTEM ERROR ⚠
          </div>
          <div style={{
            fontSize: '16px',
            marginBottom: '15px',
            color: '#ffaa44'
          }}>
            <strong>Error Type:</strong> {error.name}
          </div>
          <div style={{
            fontSize: '14px',
            marginBottom: '20px',
            color: '#ffffff',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ff4444'
          }}>
            <strong style={{color: '#ffaa44'}}>Message:</strong><br/>
            {error.message}
          </div>
          {error.stack && (
            <details style={{marginTop: '15px'}}>
              <summary style={{
                cursor: 'pointer',
                color: '#ffaa44',
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                📋 Technical Details (Stack Trace)
              </summary>
              <pre style={{
                fontSize: '10px',
                color: '#cccccc',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}>
                {error.stack}
              </pre>
            </details>
          )}
          <div style={{
            marginTop: '25px',
            padding: '15px',
            backgroundColor: 'rgba(255, 170, 68, 0.1)',
            border: '1px solid #ffaa44',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#ffaa44'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>🔧 Troubleshooting:</div>
            <div style={{color: '#ffffff'}}>
              1. Press F12 to open Browser Console for more details<br/>
              2. Check the error message above<br/>
              3. Try refreshing the page<br/>
              4. Report this error with the stack trace to developers
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            opacity: 0.7
          }}>
            Press F5 to reload the page
          </div>
        </div>
      )}

      {/* Control Hints - Heavily pixelated retro style */}
      {showControlHints && gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#000000',
          padding: '0',
          border: '4px solid #2244aa',
          borderRadius: '0',
          imageRendering: 'pixelated',
          boxShadow: '0 0 0 2px #000000, 0 0 20px rgba(34, 68, 170, 0.5)',
          zIndex: 1000
        }}>
          {/* Pixelated header bar */}
          <div style={{
            backgroundColor: '#2244aa',
            padding: '6px 12px',
            borderBottom: '2px solid #000000',
            fontFamily: 'monospace',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            imageRendering: 'pixelated'
          }}>
            [ CONTROLS ]
          </div>

          {/* Pixelated content */}
          <div style={{
            padding: '12px 16px',
            fontFamily: 'monospace',
            fontSize: '9px',
            lineHeight: '1.8',
            color: '#cccccc',
            imageRendering: 'pixelated'
          }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#44ff44' }}>WASD</span> /
              <span style={{ color: '#44ff44' }}>ARROWS</span> = MOVE |
              <span style={{ color: '#ff4444' }}>SPACE</span> = FIRE |
              <span style={{ color: '#ff44ff' }}>SHIFT</span> = WARP
            </div>
            <div>
              <span style={{ color: '#ffaa44' }}>X</span>=BRAKE |
              <span style={{ color: '#44ffff' }}>Z</span>=SHIELD |
              <span style={{ color: '#ffff44' }}>F</span>=MINE |
              <span style={{ color: '#ff8844' }}>M</span>=MAP |
              <span style={{ color: '#44ff88' }}>I</span>=INV
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
});

SpaceGame.displayName = 'SpaceGame';

export default SpaceGame;
