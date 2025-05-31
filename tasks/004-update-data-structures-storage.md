# Task 004: Update Data Structures and Storage

**User Story**: As a developer, I want updated data structures and storage methods so that activity data can be persisted and managed.

## Status: ⏳ PENDING

## Parent Task: 002
## Sub Tasks: None
## Dependencies: 003 (Update Type Definitions)

## Description
Update the data storage layer, default game data, and related utilities to support the new activity system while maintaining backward compatibility.

## Implementation Details

### Storage Layer Updates (`src/services/storage.ts`)

#### New Storage Methods
```typescript
// Activity-specific storage methods
export const saveActivities = async (locationId: string, activities: GameActivity[]) => {
  // Implementation will update location's activities array
};

export const getActivitiesForLocation = async (locationId: string): Promise<GameActivity[]> => {
  // Implementation will retrieve activities for a location
};

export const migrateLocationActivities = async (locationId: string) => {
  // Convert string-based activityNames to GameActivity objects
};
```

#### Updated Location Storage
```typescript
// Update existing saveLocation method to handle both formats
export const saveLocation = async (location: GameLocation) => {
  // Handle both legacy activityNames and new activities formats
  // Ensure data consistency
};
```

### Default Data Updates (`src/utils/constants.ts`)

#### Convert String Activities to GameActivity Objects
Current format:
```typescript
'Portland': {
  // ...
  activityNames: ['Visit Powell\'s Books', 'Grab Voodoo Doughnuts'],
  // ...
}
```

New format:
```typescript
'Portland': {
  // ...
  activities: [
    {
      id: 'visit_powells',
      name: 'Visit Powell\'s Books',
      description: 'Browse the world-famous independent bookstore',
      moneyCost: 15,
      vibeChange: 10,
      timeCost: 1,
      eventChance: 0.1
    },
    {
      id: 'voodoo_donuts',
      name: 'Grab Voodoo Doughnuts',
      description: 'Indulge in Portland\'s most famous donuts',
      moneyCost: 8,
      vibeChange: 5,
      snackChange: 1,
      eventChance: 0.05
    }
  ],
  // Keep activityNames for backward compatibility (auto-generated)
  activityNames: ['Visit Powell\'s Books', 'Grab Voodoo Doughnuts'],
  // ...
}
```

#### Activity Templates by Location Type
```typescript
export const DEFAULT_ACTIVITY_TEMPLATES: Record<string, Partial<GameActivity>[]> = {
  city: [
    {
      name: 'Explore Downtown',
      description: 'Walk around the city center',
      moneyCost: 0,
      vibeChange: 5,
      timeCost: 1
    },
    {
      name: 'Visit Local Museum',
      description: 'Learn about local history and culture',
      moneyCost: 12,
      vibeChange: 8,
      timeCost: 1
    }
  ],
  nature: [
    {
      name: 'Scenic Hike',
      description: 'Take a refreshing nature walk',
      moneyCost: 0,
      vibeChange: 12,
      timeCost: 1,
      carHealthChange: -2 // dirt roads wear on car
    }
  ],
  beach: [
    {
      name: 'Beach Walk',
      description: 'Stroll along the shoreline',
      moneyCost: 0,
      vibeChange: 8,
      timeCost: 1
    },
    {
      name: 'Tide Pool Exploration',
      description: 'Discover marine life in tide pools',
      moneyCost: 0,
      vibeChange: 10,
      timeCost: 1,
      eventChance: 0.15
    }
  ]
};
```

### Validation and Utility Functions

#### Activity Validation
```typescript
export const validateActivity = (activity: GameActivity): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!activity.id) errors.push('Activity must have an ID');
  if (!activity.name) errors.push('Activity must have a name');
  if (!activity.description) errors.push('Activity must have a description');
  
  // Validate costs are not negative
  if (activity.fuelCost && activity.fuelCost < 0) errors.push('Fuel cost cannot be negative');
  if (activity.moneyCost && activity.moneyCost < 0) errors.push('Money cost cannot be negative');
  if (activity.snackCost && activity.snackCost < 0) errors.push('Snack cost cannot be negative');
  
  // Validate event chance is between 0 and 1
  if (activity.eventChance && (activity.eventChance < 0 || activity.eventChance > 1)) {
    errors.push('Event chance must be between 0 and 1');
  }
  
  return { valid: errors.length === 0, errors };
};

export const canPlayerPerformActivity = (activity: GameActivity, playerStats: PlayerStats): { 
  canPerform: boolean; 
  reasons: string[] 
} => {
  const reasons: string[] = [];
  
  // Check costs
  if (activity.fuelCost && playerStats.fuel < activity.fuelCost) {
    reasons.push(`Need ${activity.fuelCost} fuel (have ${playerStats.fuel})`);
  }
  if (activity.moneyCost && playerStats.money < activity.moneyCost) {
    reasons.push(`Need $${activity.moneyCost} (have $${playerStats.money})`);
  }
  if (activity.snackCost && playerStats.snacks < activity.snackCost) {
    reasons.push(`Need ${activity.snackCost} snacks (have ${playerStats.snacks})`);
  }
  
  // Check requirements
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

#### Migration Utilities
```typescript
export const convertStringActivityToGameActivity = (
  activityName: string, 
  locationId: string
): GameActivity => {
  // Convert legacy string activities to basic GameActivity objects
  return {
    id: `${locationId}_${activityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: activityName,
    description: `Enjoy ${activityName.toLowerCase()} at this location`,
    vibeChange: 3, // Default from current implementation
    eventChance: 0.3, // Default from current implementation
    timeCost: 0 // Don't advance time for migrated activities
  };
};

export const migrateLocationData = (location: GameLocation): GameLocation => {
  // Convert legacy format to new format
  if (location.activityNames && !location.activities) {
    return {
      ...location,
      activities: location.activityNames.map(name => 
        convertStringActivityToGameActivity(name, location.id)
      )
    };
  }
  return location;
};
```

## Files to Update

1. **`src/services/storage.ts`**
   - Add activity-specific storage methods
   - Update location storage to handle both formats
   - Add migration methods

2. **`src/utils/constants.ts`**
   - Convert all `activityNames` to rich `GameActivity` objects
   - Add activity templates for different location types
   - Add validation and utility functions

3. **`src/services/firebase.ts`** (if used)
   - Mirror changes from storage.ts for Firebase backend

## Implementation Steps

1. ⏳ Update storage methods in `storage.ts`
2. ⏳ Create activity validation utilities
3. ⏳ Update default location data with activities
4. ⏳ Add migration utilities
5. ⏳ Test storage and retrieval methods
6. ⏳ Validate data consistency

## Data Migration Strategy

### Automatic Migration
- Detect legacy format (`activityNames` present, `activities` missing)
- Convert strings to basic `GameActivity` objects
- Preserve backward compatibility

### Manual Enhancement
- Admin can later enhance auto-migrated activities
- Add costs, better descriptions, special effects
- Migration preserves user customizations

## Testing Checklist

- [ ] Storage methods work with new data format
- [ ] Backward compatibility maintained
- [ ] Migration utilities work correctly
- [ ] Validation functions catch errors
- [ ] Default data is valid and complete
- [ ] No data loss during migration

## Success Criteria

- [ ] Storage layer supports `GameActivity` objects
- [ ] All default locations have rich activity data
- [ ] Backward compatibility with legacy data maintained
- [ ] Migration utilities properly convert old data
- [ ] Validation functions prevent invalid data
- [ ] Data consistency maintained across operations
