# Task 003: Update Type Definitions for Activity Effects

**User Story**: As a developer, I want updated TypeScript interfaces so that activities can have effects like events.

## Status: 🔄 IN PROGRESS

## Parent Task: 002
## Sub Tasks: None

## Description
Update the TypeScript type definitions in `src/types/game.ts` to support activity effects while maintaining backward compatibility.

## Implementation Details

### New Types to Add

```typescript
export interface GameActivity {
  id: string;
  name: string;
  description: string;
  
  // Costs (what player pays to do activity)
  fuelCost?: number;
  snackCost?: number;
  moneyCost?: number;
  timeCost?: number; // advances daysTraveled
  vibeCost?: number; // some activities might be tiring
  
  // Rewards/Effects (what player gains from activity)
  vibeChange?: number;
  fuelChange?: number;
  snackChange?: number;
  moneyChange?: number;
  carHealthChange?: number;
  
  // Meta properties
  eventChance?: number; // chance to trigger random event after activity
  requiredResources?: {
    fuel?: number;
    snacks?: number;
    money?: number;
    vibes?: number;
    carHealth?: number;
  };
  
  // Gameplay modifiers
  oneTimeOnly?: boolean; // can only be done once per location visit
  repeatable?: boolean; // can be done multiple times (default true)
  cooldown?: number; // days before can repeat
}

// Helper type for activity requirements checking
export interface ActivityRequirement {
  fuel?: number;
  snacks?: number;
  money?: number;
  vibes?: number;
  carHealth?: number;
}

// Activity result for feedback to player
export interface ActivityResult {
  success: boolean;
  message: string;
  effects: {
    vibeChange?: number;
    fuelChange?: number;
    snackChange?: number;
    moneyChange?: number;
    carHealthChange?: number;
    timeAdvanced?: boolean;
  };
  triggeredEvent?: boolean;
}
```

### Updated GameLocation Interface

```typescript
export interface GameLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  connections: Record<string, number>; // destination ID -> fuel cost
  
  // Activity system (new approach)
  activities?: GameActivity[];
  
  // Backward compatibility (deprecated)
  activityNames?: string[];
  
  eventChance: number;
}
```

### Helper Functions Types

```typescript
// Function signatures for activity system
export type ActivityValidator = (activity: GameActivity, playerStats: PlayerStats) => {
  canPerform: boolean;
  reasons: string[];
};

export type ActivityEffectApplier = (activity: GameActivity, playerStats: PlayerStats) => {
  newStats: PlayerStats;
  result: ActivityResult;
};
```

## Files to Update

### Primary File
- `src/types/game.ts` - Add new interfaces and update existing ones

### Related Files (for reference in later tasks)
- `src/App.tsx` - Will need to use new types
- `src/components/AdminPanel.tsx` - Will need to handle new types
- `src/utils/constants.ts` - Will need to provide default activities
- `src/services/storage.ts` - Will need to handle new data structures

## Backward Compatibility Considerations

1. **Dual Property Support**: Support both `activities` and `activityNames` in `GameLocation`
2. **Optional Properties**: All new properties should be optional to not break existing data
3. **Type Guards**: Create utility functions to check which format is being used
4. **Migration Helpers**: Types to support data migration

```typescript
// Utility types for migration
export type LegacyGameLocation = Omit<GameLocation, 'activities'> & {
  activityNames: string[];
};

export type ModernGameLocation = Omit<GameLocation, 'activityNames'> & {
  activities: GameActivity[];
};

// Type guards
export const isLegacyLocation = (location: GameLocation): location is LegacyGameLocation => {
  return Array.isArray(location.activityNames) && !location.activities;
};

export const isModernLocation = (location: GameLocation): location is ModernGameLocation => {
  return Array.isArray(location.activities) && !location.activityNames;
};
```

## Implementation Steps

1. ✅ Design new type interfaces
2. ⏳ Add new interfaces to `src/types/game.ts`
3. ⏳ Update existing interfaces for backward compatibility
4. ⏳ Add utility types and type guards
5. ⏳ Validate TypeScript compilation
6. ⏳ Update imports in related files

## Testing Checklist

- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing interfaces
- [ ] New interfaces properly exported
- [ ] Type guards work correctly
- [ ] All optional properties marked correctly

## Success Criteria

- [ ] `GameActivity` interface added with all required properties
- [ ] `GameLocation` interface updated with backward compatibility
- [ ] Utility types added for migration support
- [ ] Type guards implemented
- [ ] All TypeScript compilation errors resolved
- [ ] No breaking changes to existing code
