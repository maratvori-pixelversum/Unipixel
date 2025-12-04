import { useState, useEffect } from 'react';

/**
 * Interaction Panel Component
 * Handles communication, trading, and interactions with alien ships and stations
 */
const InteractionPanel = ({ game, target, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('communication');
  const [tradeOffer, setTradeOffer] = useState({ resource: null, quantity: 0, price: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (target) {
      // Set initial message based on target type and race
      if (target.raceName) {
        const greeting = game?.alienRaceSystem?.getGreeting(target.race) || 'Greetings.';
        setMessage(greeting);
      } else if (target.type === 'station') {
        setMessage('Welcome to our station. How may we assist you?');
      }
    }
  }, [target, game]);

  if (!target) return null;

  const isHostile = target.isHostile;
  const raceName = target.raceName || 'Unknown';
  const raceColor = target.raceColor || '#888888';

  const handleTrade = (resourceId, quantity, pricePerUnit) => {
    const totalCost = quantity * pricePerUnit;

    // Validate credits FIRST
    if (game.cargoSystem.credits < totalCost) {
      setMessage('Insufficient credits for this transaction.');
      return;
    }

    // Validate cargo space BEFORE deducting credits
    const resourceWeight = 1; // Default weight, adjust based on resource type
    if (!game.cargoSystem.hasSpace(quantity * resourceWeight)) {
      setMessage('Insufficient cargo space for this transaction.');
      return;
    }

    // All validations passed, now execute transaction atomically
    // Remove credits
    game.cargoSystem.removeCredits(totalCost);

    // Add resource
    const resourceResult = game.resourceSystem.addResource(resourceId, quantity);
    const cargoResult = game.cargoSystem.addCargo(resourceId, quantity, resourceWeight);

    if (resourceResult && cargoResult.success) {
      setMessage(`Transaction complete! Acquired ${quantity} ${resourceId} for ${totalCost} credits.`);
    } else {
      // Rollback transaction if cargo addition failed
      game.cargoSystem.addCredits(totalCost);
      if (resourceResult) {
        game.resourceSystem.removeResource(resourceId, quantity);
      }
      setMessage('Transaction failed: Cargo system error.');
    }
  };

  const handleSell = (resourceId, quantity, pricePerUnit) => {
    const totalValue = quantity * pricePerUnit;

    // Check if player has the resource
    const hasQuantity = game.resourceSystem.getQuantity(resourceId);
    if (hasQuantity < quantity) {
      setMessage(`Insufficient ${resourceId}. You have ${hasQuantity}, need ${quantity}.`);
      return;
    }

    // Remove resource
    game.resourceSystem.removeResource(resourceId, quantity);
    game.cargoSystem.removeCargo(resourceId, quantity);

    // Add credits
    game.cargoSystem.addCredits(totalValue);

    setMessage(`Sold ${quantity} ${resourceId} for ${totalValue} credits.`);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '80%',
      backgroundColor: 'rgba(10, 10, 10, 0.98)',
      border: `3px solid ${raceColor}`,
      boxShadow: `0 0 30px ${raceColor}66`,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      color: '#00ff88'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: `2px solid ${raceColor}`,
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: raceColor, textShadow: `0 0 10px ${raceColor}` }}>
              {target.type === 'station' ? '🏭 ' : '🛸 '}
              {raceName}
            </h2>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
              {target.type === 'station' ? `Station Type: ${target.stationType || 'Trading'}` :
               `Ship Type: ${target.type || 'Unknown'}`}
            </div>
            {!isHostile && (
              <div style={{ fontSize: '12px', color: '#00ff88', marginTop: '5px' }}>
                ✓ Friendly | Open to Trade
              </div>
            )}
            {isHostile && (
              <div style={{ fontSize: '12px', color: '#ff4444', marginTop: '5px' }}>
                ⚠ Hostile | Communication Unavailable
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ff4444',
              border: '2px solid #fff',
              color: '#fff',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            [X] CLOSE
          </button>
        </div>
      </div>

      {/* Tabs (only show for non-hostile) */}
      {!isHostile && (
        <div style={{
          display: 'flex',
          borderBottom: `2px solid ${raceColor}`,
          backgroundColor: '#050505'
        }}>
          <button
            onClick={() => setSelectedTab('communication')}
            style={{
              flex: 1,
              padding: '15px',
              fontSize: '16px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              border: 'none',
              borderRight: '1px solid #333',
              background: selectedTab === 'communication' ? raceColor : 'transparent',
              color: selectedTab === 'communication' ? '#000' : '#888',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            💬 COMMUNICATION
          </button>
          <button
            onClick={() => setSelectedTab('trade')}
            style={{
              flex: 1,
              padding: '15px',
              fontSize: '16px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              border: 'none',
              borderRight: '1px solid #333',
              background: selectedTab === 'trade' ? raceColor : 'transparent',
              color: selectedTab === 'trade' ? '#000' : '#888',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            💰 TRADE
          </button>
          <button
            onClick={() => setSelectedTab('info')}
            style={{
              flex: 1,
              padding: '15px',
              fontSize: '16px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              border: 'none',
              background: selectedTab === 'info' ? raceColor : 'transparent',
              color: selectedTab === 'info' ? '#000' : '#888',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 INFO
          </button>
        </div>
      )}

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
      }}>
        {isHostile ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <div style={{ fontSize: '24px', color: '#ff4444', marginBottom: '10px' }}>
              HOSTILE ENTITY
            </div>
            <div style={{ fontSize: '16px', color: '#888' }}>
              This {target.type === 'station' ? 'station' : 'ship'} is hostile and will not communicate.
              <br />
              Prepare for combat or retreat.
            </div>
          </div>
        ) : (
          <>
            {selectedTab === 'communication' && (
              <div>
                <div style={{
                  backgroundColor: '#0a0a1a',
                  border: '2px solid #4488ff',
                  padding: '20px',
                  marginBottom: '20px',
                  borderRadius: '5px'
                }}>
                  <div style={{ fontSize: '14px', color: '#4488ff', marginBottom: '10px' }}>
                    INCOMING MESSAGE:
                  </div>
                  <div style={{ fontSize: '18px', color: '#00ff88', lineHeight: '1.6' }}>
                    "{message}"
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '16px', marginBottom: '10px', color: '#888' }}>
                    QUICK RESPONSES:
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <button
                      onClick={() => setMessage('Safe travels and prosperous journeys!')}
                      style={{
                        padding: '15px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        background: '#1a1a1a',
                        border: '2px solid #4488ff',
                        color: '#00ff88',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      👋 Greet Friendly
                    </button>
                    <button
                      onClick={() => setSelectedTab('trade')}
                      style={{
                        padding: '15px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        background: '#1a1a1a',
                        border: '2px solid #ffaa00',
                        color: '#00ff88',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      💰 Discuss Trade
                    </button>
                    <button
                      onClick={() => setMessage('We request safe passage through this sector.')}
                      style={{
                        padding: '15px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        background: '#1a1a1a',
                        border: '2px solid #00ff88',
                        color: '#00ff88',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      🛡️ Request Safe Passage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'trade' && (
              <div>
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#00ff88', marginTop: 0 }}>BUY RESOURCES</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {game.resourceSystem && Object.values(game.resourceSystem.resources).slice(0, 6).map(resource => {
                      const buyPrice = Math.floor(resource.baseValue * 1.2);
                      return (
                        <div key={resource.id} style={{
                          border: '2px solid #4488ff',
                          padding: '15px',
                          backgroundColor: '#0a0a1a'
                        }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                            {resource.icon} {resource.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#ffaa00', marginBottom: '10px' }}>
                            {buyPrice} CR each
                          </div>
                          <button
                            onClick={() => handleTrade(resource.id, 10, buyPrice)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '14px',
                              fontFamily: 'monospace',
                              background: '#4488ff',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            BUY 10 ({buyPrice * 10} CR)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 style={{ color: '#00ff88' }}>SELL RESOURCES</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {game.resourceSystem && game.resourceSystem.getOwnedResources().map(resource => {
                      const sellPrice = Math.floor(resource.baseValue * 0.8);
                      return (
                        <div key={resource.id} style={{
                          border: '2px solid #00ff88',
                          padding: '15px',
                          backgroundColor: '#0a1a0a'
                        }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                            {resource.icon} {resource.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>
                            You have: {resource.quantity}
                          </div>
                          <div style={{ fontSize: '14px', color: '#ffaa00', marginBottom: '10px' }}>
                            {sellPrice} CR each
                          </div>
                          <button
                            onClick={() => handleSell(resource.id, Math.min(10, resource.quantity), sellPrice)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '14px',
                              fontFamily: 'monospace',
                              background: '#00ff88',
                              border: 'none',
                              color: '#000',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                            disabled={resource.quantity < 1}
                          >
                            SELL {Math.min(10, resource.quantity)} ({sellPrice * Math.min(10, resource.quantity)} CR)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'info' && (
              <div>
                <h3 style={{ color: '#00ff88', marginTop: 0 }}>RACE INFORMATION</h3>
                {target.raceData && (
                  <div>
                    <div style={{
                      backgroundColor: '#0a0a1a',
                      border: `2px solid ${raceColor}`,
                      padding: '20px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ fontSize: '24px', color: raceColor, marginBottom: '10px' }}>
                        {target.raceData.icon} {target.raceData.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
                        {target.raceData.description}
                      </div>
                      <div style={{ fontSize: '16px', lineHeight: '2' }}>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                          <strong>Relationship:</strong>
                          <span style={{
                            color: target.raceData.relationship === 'friendly' ? '#00ff88' :
                                   target.raceData.relationship === 'hostile' ? '#ff4444' : '#ffaa00',
                            float: 'right'
                          }}>
                            {target.raceData.relationship.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                          <strong>Trading Modifier:</strong>
                          <span style={{ color: '#ffaa00', float: 'right' }}>
                            {(target.raceData.traits.trading * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                          <strong>Technology Level:</strong>
                          <span style={{ color: '#4488ff', float: 'right' }}>
                            {target.raceData.traits.technology < 0.7 ? 'Advanced' :
                             target.raceData.traits.technology < 1.0 ? 'Standard' : 'Developing'}
                          </span>
                        </div>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                          <strong>Aggression:</strong>
                          <span style={{ color: '#ff4444', float: 'right' }}>
                            {(target.raceData.traits.aggression * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#0a0a1a',
                      border: '2px solid #4488ff',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '18px', color: '#4488ff', marginBottom: '10px' }}>
                        HOMEWORLDS
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {target.raceData.homeworlds.map((world, i) => (
                          <div key={i} style={{
                            padding: '8px 15px',
                            backgroundColor: '#1a1a2a',
                            border: '1px solid #4488ff',
                            fontSize: '14px'
                          }}>
                            🌍 {world}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InteractionPanel;
