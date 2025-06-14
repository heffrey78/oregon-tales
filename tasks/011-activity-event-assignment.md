# Task 011: Activity-Event Assignment System

**User Story**: As a game designer, I want to assign specific events to activities so that participating in an activity can increase the likelihood of that event happening, creating more strategic and thematic gameplay.

## Status: ✅ COMPLETE

## Parent Task: None
## Sub Tasks: None

## Description

Currently, activities have a generic `eventChance` property that triggers random events from the global event pool. This task implements the ability to assign specific events to activities, so that:

1. Activities can have associated events that are more likely to trigger
2. The probability of activity-specific events increases when the activity is performed
3. The system maintains backward compatibility with the existing generic event system
4. Game designers can create thematic connections between activities and events

For example:
- "Go Fishing" activity could have a higher chance of triggering "Caught a Big Fish!" event
- "Explore Cave" activity could increase likelihood of "Found Hidden Treasure" or "Cave-in!" events
- "Visit Tavern" activity could trigger social events like "Met a Helpful Stranger"

## Implementation Requirements

### Type Definition Updates
- Add `assignedEventIds?: string[]` to `GameActivity` interface
- Add `baseChance: number` and `activityMultiplier?: number` to `GameEvent` interface
- Update activity result system to track which events were triggered

### Core Logic Changes
- Modify event triggering logic to check for activity-assigned events first
- Implement probability system that increases assigned event chances
- Maintain fallback to random events when no assigned events trigger
- Add validation to ensure assigned event IDs exist

### Admin Interface Updates
- Add event assignment controls to ActivityForm
- Display assigned events in activity cards
- Add event probability configuration in EventForm
- Show activity-event relationships in admin panel

### Data Migration
- Update existing data to include new optional properties
- Ensure backward compatibility with activities that don't have assigned events
- Migrate any existing thematic activity-event relationships

## Success Criteria
- [x] `GameActivity` interface includes `assignedEventIds` array
- [x] `GameEvent` interface includes `baseChance` and `activityMultiplier` properties
- [x] Activity execution checks assigned events before random events
- [x] Assigned events have higher probability than base chance when triggered by their activities
- [x] ActivityForm allows selecting and managing assigned events
- [x] EventForm allows configuring base chance and activity multipliers
- [x] Admin panel displays activity-event relationships clearly
- [x] System gracefully handles missing or invalid event IDs
- [x] Backward compatibility maintained for existing saves and activities
- [x] Game logic validates event assignments during activity execution

## Technical Notes

### Probability Calculation
```typescript
// Proposed algorithm
const assignedEventChance = event.baseChance * (event.activityMultiplier || 1.0);
const shouldTrigger = Math.random() < assignedEventChance;
```

### Event Selection Priority
1. Roll for each assigned event using increased probability
2. If no assigned events trigger, fall back to generic event system
3. Respect existing `eventChance` property for backward compatibility