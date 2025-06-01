# Task 005: Update Core Game Logic

**User Story**: As a player, I want activities to have meaningful costs and effects so that my choices have strategic impact on my journey.

## Status: ✅ COMPLETE

## Parent Task: 002
## Sub Tasks: None
## Dependencies: 003 (Type Definitions), 004 (Data Structures)

## Description
Update the core game logic in `src/App.tsx` to handle activity effects, costs, and validation using the new `GameActivity` system.

## Implementation Details

### Update `handleActivity` Function

#### Current Implementation
```typescript
const handleActivity = (activityName: string) => {
  if (gameOver) return;
  setGameLog(prev => [...prev, `You chose to: ${activityName}. (Detailed effects TBD).`]);
  setPlayerStats(prev => ({ ...prev, vibes: Math.min(100, prev.vibes + 3) }));
  if (Math.random() < 0.3 && gameEvents.length > 0) {
    triggerRandomEventById();
  }
  saveGame();
};
```

#### New Implementation
```typescript
const handleActivity = (activity: GameActivity) => {
  if (gameOver) return;
  
  // 1. Validate player can perform activity
  const validation = canPlayerPerformActivity(activity, playerStats);
  if (!validation.canPerform) {
    setGameLog(prev => [...prev, 
      `Cannot perform ${activity.name}: ${validation.reasons.join(', ')}`
    ]);
    return;
  }
  
  // 2. Apply costs and effects
  const result = applyActivityEffects(activity, playerStats);
  setPlayerStats(result.newStats);
  
  // 3. Log the action and results
  setGameLog(prev => [...prev, result.message]);
  
  // 4. Maybe trigger random event
  const eventChance = activity.eventChance || 0;
  if (eventChance > 0 && Math.random() < eventChance && gameEvents.length > 0) {
    triggerRandomEventById();
  }
  
  saveGame();
};
```

### New Activity System Functions

#### Activity Effect Application
```typescript
const applyActivityEffects = (activity: GameActivity, currentStats: PlayerStats): {
  newStats: PlayerStats;
  message: string;
} => {
  const costs: string[] = [];
  const gains: string[] = [];
  
  let newStats = { ...currentStats };
  
  // Apply costs
  if (activity.fuelCost) {
    newStats.fuel = Math.max(0, newStats.fuel - activity.fuelCost);
    costs.push(`${activity.fuelCost} fuel`);
  }
  if (activity.moneyCost) {
    newStats.money = Math.max(0, newStats.money - activity.moneyCost);
    costs.push(`$${activity.moneyCost}`);
  }
  if (activity.snackCost) {
    newStats.snacks = Math.max(0, newStats.snacks - activity.snackCost);
    costs.push(`${activity.snackCost} snacks`);
  }
  if (activity.vibeCost) {
    newStats.vibes = Math.max(0, newStats.vibes - activity.vibeCost);
    costs.push(`${activity.vibeCost} vibes`);
  }
  
  // Apply rewards/effects
  if (activity.vibeChange) {
    const change = activity.vibeChange;
    newStats.vibes = Math.min(100, Math.max(0, newStats.vibes + change));
    if (change > 0) gains.push(`+${change} vibes`);
    else gains.push(`${change} vibes`);
  }
  if (activity.fuelChange) {
    const change = activity.fuelChange;
    newStats.fuel = Math.max(0, newStats.fuel + change);
    if (change > 0) gains.push(`+${change} fuel`);
    else gains.push(`${change} fuel`);
  }
  if (activity.snackChange) {
    const change = activity.snackChange;
    newStats.snacks = Math.max(0, newStats.snacks + change);
    if (change > 0) gains.push(`+${change} snacks`);
    else gains.push(`${change} snacks`);
  }
  if (activity.moneyChange) {
    const change = activity.moneyChange;
    newStats.money = Math.max(0, newStats.money + change);
    if (change > 0) gains.push(`+$${change}`);
    else gains.push(`-$${Math.abs(change)}`);
  }
  if (activity.carHealthChange) {
    const change = activity.carHealthChange;
    newStats.carHealth = Math.min(100, Math.max(0, newStats.carHealth + change));
    if (change > 0) gains.push(`+${change} car health`);
    else gains.push(`${change} car health`);
  }
  
  // Advance time if needed
  if (activity.timeCost && activity.timeCost > 0) {
    newStats.daysTraveled += activity.timeCost;
    newStats.timeOfDay = 'Day'; // Reset to day after activity
    costs.push(`${activity.timeCost} day${activity.timeCost > 1 ? 's' : ''}`);
  }
  
  // Build message
  let message = `Completed: ${activity.name}.`;
  if (costs.length > 0) {
    message += ` Cost: ${costs.join(', ')}.`;
  }
  if (gains.length > 0) {
    message += ` Gained: ${gains.join(', ')}.`;
  }
  
  return { newStats, message };
};

const canPlayerPerformActivity = (activity: GameActivity, playerStats: PlayerStats): {
  canPerform: boolean;
  reasons: string[];
} => {
  const reasons: string[] = [];
  
  // Check immediate costs
  if (activity.fuelCost && playerStats.fuel < activity.fuelCost) {
    reasons.push(`Need ${activity.fuelCost} fuel (have ${playerStats.fuel})`);
  }
  if (activity.moneyCost && playerStats.money < activity.moneyCost) {
    reasons.push(`Need $${activity.moneyCost} (have $${playerStats.money})`);
  }
  if (activity.snackCost && playerStats.snacks < activity.snackCost) {
    reasons.push(`Need ${activity.snackCost} snacks (have ${playerStats.snacks})`);
  }
  if (activity.vibeCost && playerStats.vibes < activity.vibeCost) {
    reasons.push(`Need ${activity.vibeCost} vibes (have ${playerStats.vibes})`);
  }
  
  // Check minimum requirements
  if (activity.requiredResources) {
    const req = activity.requiredResources;
    if (req.fuel && playerStats.fuel < req.fuel) {
      reasons.push(`Need at least ${req.fuel} fuel`);
    }
    if (req.money && playerStats.money < req.money) {
      reasons.push(`Need at least $${req.money}`);
    }
    if (req.vibes && playerStats.vibes < req.vibes) {
      reasons.push(`Need at least ${req.vibes} vibes`);
    }
    if (req.carHealth && playerStats.carHealth < req.carHealth) {
      reasons.push(`Car needs at least ${req.carHealth} health`);
    }
  }
  
  return { canPerform: reasons.length === 0, reasons };
};
```

#### Activity Data Access
```typescript
const getActivitiesForCurrentLocation = (): GameActivity[] => {
  const currentLocationData = gameLocations[playerStats.currentLocation];
  if (!currentLocationData) return [];
  
  // Handle new format
  if (currentLocationData.activities) {
    return currentLocationData.activities;
  }
  
  // Handle legacy format - convert on the fly
  if (currentLocationData.activityNames) {
    return currentLocationData.activityNames.map(name => 
      convertStringActivityToGameActivity(name, currentLocationData.id)
    );
  }
  
  return [];
};
```

### UI Updates for Activity Display

#### Enhanced Activity Buttons
```typescript
// In the main game UI where activities are rendered
const activities = getActivitiesForCurrentLocation();

// Replace current activity rendering with:
{activities.length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {activities.map(activity => {
      const validation = canPlayerPerformActivity(activity, playerStats);
      const isDisabled = !!gameOver || !validation.canPerform;
      
      return (
        <div key={activity.id} className="relative">
          <button
            onClick={() => handleActivity(activity)}
            disabled={isDisabled}
            className={`w-full p-3 rounded-lg shadow text-left transition-colors ${
              isDisabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
            }`}
          >
            <div className="font-medium">{activity.name}</div>
            <div className="text-xs mt-1 opacity-75">{activity.description}</div>
            
            {/* Cost indicators */}
            {(activity.fuelCost || activity.moneyCost || activity.snackCost || activity.timeCost) && (
              <div className="text-xs mt-2 opacity-60">
                Costs: {[
                  activity.fuelCost && `${activity.fuelCost} fuel`,
                  activity.moneyCost && `$${activity.moneyCost}`,
                  activity.snackCost && `${activity.snackCost} snacks`,
                  activity.timeCost && `${activity.timeCost} day${activity.timeCost > 1 ? 's' : ''}`
                ].filter(Boolean).join(', ')}
              </div>
            )}
          </button>
          
          {/* Tooltip for disabled activities */}
          {isDisabled && !gameOver && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-red-600 text-white text-xs rounded shadow-lg z-10 max-w-48">
              {validation.reasons.join(', ')}
            </div>
          )}
        </div>
      );
    })}
  </div>
) : (
  <p className="text-sm text-gray-500">No activities available here.</p>
)}
```

### Backward Compatibility Layer

#### Legacy Activity Handler
```typescript
const handleLegacyActivity = (activityName: string) => {
  // Convert to basic GameActivity and use new system
  const activity: GameActivity = {
    id: `legacy_${activityName.toLowerCase().replace(/\s+/g, '_')}`,
    name: activityName,
    description: `Enjoy ${activityName.toLowerCase()}`,
    vibeChange: 3,
    eventChance: 0.3
  };
  
  handleActivity(activity);
};
```

## Files to Update

1. **`src/App.tsx`**
   - Replace `handleActivity` function
   - Add activity effect application logic
   - Add activity validation functions
   - Update activity UI rendering
   - Add backward compatibility

## Implementation Steps

1. ✅ Add new activity utility functions
2. ✅ Replace `handleActivity` implementation
3. ✅ Update activity UI rendering
4. ✅ Add activity validation display
5. ✅ Add backward compatibility layer
6. ✅ Test with different activity types

## User Experience Improvements

### Clear Cost Display
- Show costs before player commits to activity
- Visual indicators for affordable/unaffordable activities
- Tooltip explanations for disabled activities

### Rich Feedback
- Detailed messages about costs paid and benefits gained
- Visual effects for resource changes
- Clear indication of time advancement

### Strategic Choices
- Activities with trade-offs (pay money to gain vibes)
- Risk/reward activities (chance for events)
- Resource management considerations

## Testing Checklist

- [x] Activity costs properly deducted from player stats
- [x] Activity effects properly applied to player stats
- [x] Activity validation prevents invalid actions
- [x] UI clearly shows activity costs and availability
- [x] Backward compatibility with legacy activities
- [x] Resource bounds checking (no negative values)
- [x] Time advancement works correctly
- [x] Event triggering works as expected

## Success Criteria

- [x] Activities have meaningful costs and effects
- [x] Player can see costs before committing to activities
- [x] Activities are validated before execution
- [x] Rich feedback provided for activity results
- [x] Backward compatibility maintained
- [x] UI clearly communicates activity information
- [x] Strategic depth added to gameplay
