import { useState, useEffect } from 'react';

// Constants for trading and upgrades
const TRADE_MARKUP = 1.5; // 1.5x markup for buying resources
const CARGO_UPGRADE_AMOUNT = 50; // Units added per upgrade
const CARGO_UPGRADE_COST = 5000; // Credits cost for cargo upgrade

/**
 * Enhanced Inventory Screen Component
 * Displays player's cargo, resources, and credits with buy/sell/throw functionality
 */
const InventoryScreen = ({ game, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('cargo');
  const [cargoData, setCargoData] = useState(null);
  const [resourceData, setResourceData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    // Validate game instance and required systems
    if (game &&
        typeof game === 'object' &&
        game.cargoSystem &&
        game.resourceSystem &&
        typeof game.cargoSystem.getAllCargo === 'function' &&
        typeof game.resourceSystem.getOwnedResources === 'function') {
      setCargoData(game.cargoSystem);
      setResourceData(game.resourceSystem);
    }
  }, [game, updateTrigger]);

  // Validate that game systems are properly initialized
  if (!game || !game.cargoSystem || !game.resourceSystem) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#ff4444',
        fontFamily: 'monospace',
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        border: '2px solid #ff4444'
      }}>
        Game systems not initialized
      </div>
    );
  }

  if (!cargoData || !resourceData) {
    return null;
  }

  const capacityPercent = cargoData.getCapacityUsage();
  const allCargo = cargoData.getAllCargo();
  const ownedResources = resourceData.getOwnedResources();
  const totalValue = resourceData.getTotalValue();

  // Handle selling a resource
  const handleSell = (resourceId, quantity) => {
    const resource = resourceData.getResource(resourceId);
    if (!resource) return;

    // Use Math.round to prevent floating point precision issues
    const sellPrice = Math.round(resource.baseValue * quantity);
    const removed = cargoData.removeCargo(resourceId, quantity);

    if (removed.success) {
      cargoData.addCredits(sellPrice);
      resourceData.removeResource(resourceId, quantity);
      setUpdateTrigger(prev => prev + 1);
      alert(`Sold ${quantity}x ${resource.name} for ${sellPrice} CR`);
    }
  };

  // Handle buying a resource (simplified - would need market integration)
  const handleBuy = (resourceId, quantity) => {
    const resource = resourceData.getResource(resourceId);
    if (!resource) return;

    const buyPrice = Math.floor(resource.baseValue * quantity * TRADE_MARKUP);

    if (cargoData.credits < buyPrice) {
      alert('Insufficient credits!');
      return;
    }

    if (!cargoData.hasSpace(quantity)) {
      alert('Insufficient cargo space!');
      return;
    }

    const added = cargoData.addCargo(resourceId, quantity, 1);
    if (added.success) {
      cargoData.removeCredits(buyPrice);
      resourceData.addResource(resourceId, quantity);
      setUpdateTrigger(prev => prev + 1);
      alert(`Bought ${quantity}x ${resource.name} for ${buyPrice} CR`);
    }
  };

  // Handle throwing (jettisoning) a resource
  const handleThrow = (resourceId, quantity) => {
    const resource = resourceData.getResource(resourceId);
    if (!resource) return;

    if (confirm(`Jettison ${quantity}x ${resource.name} into space? This cannot be undone!`)) {
      const removed = cargoData.removeCargo(resourceId, quantity);
      if (removed.success) {
        resourceData.removeResource(resourceId, quantity);
        setUpdateTrigger(prev => prev + 1);
        alert(`Jettisoned ${quantity}x ${resource.name} into space`);
      }
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#00ff88'
    }}>
      {/* Header */}
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        padding: '20px',
        border: '3px solid #00ff88',
        backgroundColor: '#0a0a0a',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '32px', textShadow: '0 0 10px #00ff88' }}>
            ◆ INVENTORY ◆
          </h1>
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

        {/* Credits Display */}
        <div style={{
          marginTop: '15px',
          fontSize: '24px',
          color: '#ffaa00',
          textShadow: '0 0 8px #ffaa00'
        }}>
          💰 CREDITS: {cargoData.credits.toLocaleString()}
        </div>

        {/* Cargo Capacity */}
        <div style={{ marginTop: '15px' }}>
          <div style={{ fontSize: '16px', marginBottom: '5px' }}>
            CARGO: {cargoData.currentCapacity} / {cargoData.maxCapacity} units
            ({capacityPercent.toFixed(1)}% full)
          </div>
          <div style={{
            width: '100%',
            height: '25px',
            border: '2px solid #00ff88',
            backgroundColor: '#0a0a0a',
            position: 'relative'
          }}>
            <div style={{
              width: `${capacityPercent}%`,
              height: '100%',
              backgroundColor: capacityPercent > 90 ? '#ff4444' : capacityPercent > 75 ? '#ffaa00' : '#00ff88',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        display: 'flex',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => setSelectedTab('cargo')}
          style={{
            flex: 1,
            padding: '15px',
            fontSize: '18px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            border: '3px solid #00ff88',
            background: selectedTab === 'cargo' ? '#00ff88' : '#0a0a0a',
            color: selectedTab === 'cargo' ? '#000' : '#00ff88',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📦 CARGO ({allCargo.length})
        </button>
        <button
          onClick={() => setSelectedTab('resources')}
          style={{
            flex: 1,
            padding: '15px',
            fontSize: '18px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            border: '3px solid #00ff88',
            background: selectedTab === 'resources' ? '#00ff88' : '#0a0a0a',
            color: selectedTab === 'resources' ? '#000' : '#00ff88',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💎 RESOURCES ({ownedResources.length})
        </button>
        <button
          onClick={() => setSelectedTab('stats')}
          style={{
            flex: 1,
            padding: '15px',
            fontSize: '18px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            border: '3px solid #00ff88',
            background: selectedTab === 'stats' ? '#00ff88' : '#0a0a0a',
            color: selectedTab === 'stats' ? '#000' : '#00ff88',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📊 STATS
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        height: '500px',
        border: '3px solid #00ff88',
        backgroundColor: '#0a0a0a',
        padding: '20px',
        overflowY: 'auto',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
      }}>
        {selectedTab === 'cargo' && (
          <div>
            <h2 style={{ color: '#00ff88', marginTop: 0 }}>CARGO HOLD</h2>
            {allCargo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '20px' }}>
                No cargo loaded
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                {allCargo.map(({ resourceId, quantity }) => {
                  const resource = resourceData.getResource(resourceId);
                  if (!resource) return null;

                  const rarityColor = {
                    'common': '#888888',
                    'uncommon': '#4488ff',
                    'rare': '#ff00ff'
                  }[resource.rarity] || '#888888';

                  return (
                    <div key={resourceId} style={{
                      border: `2px solid ${rarityColor}`,
                      padding: '15px',
                      backgroundColor: '#111111',
                      boxShadow: `0 0 10px ${rarityColor}44`,
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>
                        {resource.icon}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center', color: '#00ff88' }}>
                        {resource.name}
                      </div>
                      <div style={{ color: rarityColor, fontSize: '11px', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                        [{resource.rarity.toUpperCase()}]
                      </div>
                      <div style={{ fontSize: '16px', color: '#00ff88', marginBottom: '5px' }}>
                        Quantity: <span style={{ float: 'right', fontWeight: 'bold' }}>{quantity}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#ffaa00', marginBottom: '5px' }}>
                        Unit Value: <span style={{ float: 'right' }}>{resource.baseValue} CR</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#ffaa00', marginBottom: '10px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                        Total: <span style={{ float: 'right', fontWeight: 'bold' }}>{(quantity * resource.baseValue).toLocaleString()} CR</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '12px', fontStyle: 'italic' }}>
                        {resource.description}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleBuy(resourceId, 1)}
                          style={{
                            padding: '8px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            backgroundColor: '#00aa00',
                            color: '#fff',
                            border: '2px solid #00ff88',
                            cursor: 'pointer',
                            borderRadius: '3px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#00ff88'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#00aa00'}
                        >
                          BUY +1
                        </button>
                        <button
                          onClick={() => handleSell(resourceId, 1)}
                          style={{
                            padding: '8px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            backgroundColor: '#aa6600',
                            color: '#fff',
                            border: '2px solid #ffaa00',
                            cursor: 'pointer',
                            borderRadius: '3px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#ffaa00'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#aa6600'}
                        >
                          SELL -1
                        </button>
                        <button
                          onClick={() => handleThrow(resourceId, 1)}
                          style={{
                            padding: '8px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            backgroundColor: '#aa0000',
                            color: '#fff',
                            border: '2px solid #ff4444',
                            cursor: 'pointer',
                            borderRadius: '3px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#ff4444'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#aa0000'}
                        >
                          THROW -1
                        </button>
                      </div>

                      {/* Bulk Actions */}
                      {quantity >= 10 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginTop: '5px' }}>
                          <button
                            onClick={() => handleBuy(resourceId, 10)}
                            style={{
                              padding: '6px',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              backgroundColor: '#005500',
                              color: '#00ff88',
                              border: '1px solid #00ff88',
                              cursor: 'pointer',
                              borderRadius: '3px'
                            }}
                          >
                            BUY +10
                          </button>
                          <button
                            onClick={() => handleSell(resourceId, Math.min(10, quantity))}
                            style={{
                              padding: '6px',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              backgroundColor: '#553300',
                              color: '#ffaa00',
                              border: '1px solid #ffaa00',
                              cursor: 'pointer',
                              borderRadius: '3px'
                            }}
                          >
                            SELL -{Math.min(10, quantity)}
                          </button>
                          <button
                            onClick={() => handleThrow(resourceId, quantity)}
                            style={{
                              padding: '6px',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              backgroundColor: '#550000',
                              color: '#ff4444',
                              border: '1px solid #ff4444',
                              cursor: 'pointer',
                              borderRadius: '3px'
                            }}
                          >
                            THROW ALL
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'resources' && (
          <div>
            <h2 style={{ color: '#00ff88', marginTop: 0 }}>RESOURCE DATABASE</h2>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
              Browse all available resources. Buy resources to add them to your cargo hold. Grayed out items are not in your inventory.
            </div>
            {['common', 'uncommon', 'rare'].map(rarity => {
              const resources = resourceData.getResourcesByRarity(rarity);
              const rarityColor = {
                'common': '#888888',
                'uncommon': '#4488ff',
                'rare': '#ff00ff'
              }[rarity];

              return (
                <div key={rarity} style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: rarityColor, borderBottom: `2px solid ${rarityColor}`, paddingBottom: '5px' }}>
                    {rarity.toUpperCase()} RESOURCES
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginTop: '15px' }}>
                    {resources.map(resource => {
                      const owned = resource.quantity > 0;
                      const buyPrice = Math.floor(resource.baseValue * TRADE_MARKUP);

                      return (
                        <div key={resource.id} style={{
                          border: `2px solid ${rarityColor}`,
                          padding: '12px',
                          backgroundColor: owned ? '#1a1a1a' : '#0a0a0a',
                          opacity: owned ? 1 : 0.7,
                          borderRadius: '4px',
                          transition: 'opacity 0.2s'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '24px', marginRight: '10px' }}>{resource.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                {resource.name}
                              </div>
                              {owned && (
                                <div style={{ color: '#00ff88', fontSize: '14px', fontWeight: 'bold' }}>
                                  Owned: {resource.quantity}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontStyle: 'italic' }}>
                            {resource.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#ffaa00', marginBottom: '10px' }}>
                            Base Value: {resource.baseValue} CR | Buy: {buyPrice} CR
                          </div>

                          {/* Buy Button */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                            <button
                              onClick={() => handleBuy(resource.id, 1)}
                              style={{
                                padding: '8px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                backgroundColor: '#00aa00',
                                color: '#fff',
                                border: '2px solid #00ff88',
                                cursor: 'pointer',
                                borderRadius: '3px'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#00ff88'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#00aa00'}
                            >
                              BUY 1
                            </button>
                            <button
                              onClick={() => handleBuy(resource.id, 10)}
                              style={{
                                padding: '8px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                backgroundColor: '#005500',
                                color: '#00ff88',
                                border: '1px solid #00ff88',
                                cursor: 'pointer',
                                borderRadius: '3px'
                              }}
                            >
                              BUY 10
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedTab === 'stats' && (
          <div>
            <h2 style={{ color: '#00ff88', marginTop: 0 }}>STATISTICS</h2>
            <div style={{ fontSize: '18px', lineHeight: '2' }}>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>Total Cargo Value:</strong> <span style={{ color: '#ffaa00', float: 'right' }}>{totalValue.toLocaleString()} CR</span>
              </div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>Cargo Capacity:</strong> <span style={{ color: '#00ff88', float: 'right' }}>{cargoData.maxCapacity} units</span>
              </div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>Space Used:</strong> <span style={{ color: '#4488ff', float: 'right' }}>{cargoData.currentCapacity} units ({capacityPercent.toFixed(1)}%)</span>
              </div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>Space Available:</strong> <span style={{ color: '#00ff88', float: 'right' }}>{cargoData.getAvailableSpace()} units</span>
              </div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>Unique Resources:</strong> <span style={{ color: '#ff00ff', float: 'right' }}>{ownedResources.length}</span>
              </div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <strong>Credits Balance:</strong> <span style={{ color: '#ffaa00', float: 'right' }}>{cargoData.credits.toLocaleString()} CR</span>
              </div>
            </div>

            <div style={{ marginTop: '30px', padding: '15px', border: '2px solid #ffaa00', backgroundColor: '#1a1a0a' }}>
              <h3 style={{ color: '#ffaa00', marginTop: 0 }}>⚙ CARGO UPGRADE</h3>
              <div style={{ marginBottom: '10px' }}>
                Upgrade cargo capacity by {CARGO_UPGRADE_AMOUNT} units for {CARGO_UPGRADE_COST} CR
              </div>
              <button
                onClick={() => {
                  const result = cargoData.upgradeCapacity(CARGO_UPGRADE_AMOUNT, CARGO_UPGRADE_COST);
                  if (result.success) {
                    alert(`Cargo capacity upgraded to ${result.newCapacity} units!`);
                    // Force re-render
                    setCargoData({ ...cargoData });
                  } else {
                    alert('Insufficient credits for upgrade!');
                  }
                }}
                style={{
                  background: '#ffaa00',
                  border: '2px solid #fff',
                  color: '#000',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
                disabled={cargoData.credits < CARGO_UPGRADE_COST}
              >
                {cargoData.credits >= CARGO_UPGRADE_COST ? 'UPGRADE CARGO' : 'INSUFFICIENT CREDITS'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        marginTop: '15px',
        padding: '15px',
        border: '2px solid #4488ff',
        backgroundColor: '#0a0a1a',
        fontSize: '14px',
        color: '#4488ff'
      }}>
        💡 TIP: Mine asteroids to collect resources. Sell resources at space stations for credits.
        Use credits to upgrade your cargo capacity and ship systems.
      </div>
    </div>
  );
};

export default InventoryScreen;
