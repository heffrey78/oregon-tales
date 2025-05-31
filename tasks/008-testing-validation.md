# Task 008: Testing and Validation

**User Story**: As a developer, I want comprehensive testing of the activity effects system so that I can ensure it works correctly and doesn't break existing functionality.

## Status: ⏳ PENDING

## Parent Task: 002
## Sub Tasks: None
## Dependencies: All previous tasks (003-007)

## Description
Implement comprehensive testing for the new activity effects system, including unit tests, integration tests, user experience validation, and performance testing.

## Implementation Details

### Unit Testing

#### Activity Logic Tests
```typescript
// src/tests/activity.test.ts
import { 
  validateActivity, 
  canPlayerPerformActivity, 
  applyActivityEffects 
} from '../utils/activityLogic';
import { GameActivity, PlayerStats } from '../types/game';

describe('Activity Validation', () => {
  const validActivity: GameActivity = {
    id: 'test_activity',
    name: 'Test Activity',
    description: 'A test activity',
    moneyCost: 10,
    vibeChange: 5
  };

  test('validates correct activity', () => {
    const result = validateActivity(validActivity);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects activity without ID', () => {
    const invalidActivity = { ...validActivity, id: '' };
    const result = validateActivity(invalidActivity);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Activity must have an ID');
  });

  test('rejects activity with negative costs', () => {
    const invalidActivity = { ...validActivity, moneyCost: -5 };
    const result = validateActivity(invalidActivity);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Money cost cannot be negative');
  });

  test('validates event chance range', () => {
    const invalidActivity = { ...validActivity, eventChance: 1.5 };
    const result = validateActivity(invalidActivity);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Event chance must be between 0 and 1');
  });
});

describe('Player Activity Capability', () => {
  const playerStats: PlayerStats = {
    fuel: 50,
    snacks: 5,
    money: 100,
    vibes: 75,
    carHealth: 80,
    daysTraveled: 3,
    timeOfDay: 'Day',
    currentLocation: 'Portland'
  };

  test('allows activity when player has sufficient resources', () => {
    const activity: GameActivity = {
      id: 'affordable_activity',
      name: 'Affordable Activity',
      description: 'Can afford this',
      moneyCost: 50,
      fuelCost: 25
    };

    const result = canPlayerPerformActivity(activity, playerStats);
    expect(result.canPerform).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  test('blocks activity when player lacks resources', () => {
    const activity: GameActivity = {
      id: 'expensive_activity',
      name: 'Expensive Activity',
      description: 'Cannot afford this',
      moneyCost: 150,
      fuelCost: 75
    };

    const result = canPlayerPerformActivity(activity, playerStats);
    expect(result.canPerform).toBe(false);
    expect(result.reasons).toContain('Need $150 (have $100)');
    expect(result.reasons).toContain('Need 75 fuel (have 50)');
  });

  test('checks minimum requirements', () => {
    const activity: GameActivity = {
      id: 'requirement_activity',
      name: 'Requirements Activity',
      description: 'Has minimum requirements',
      requiredResources: {
        vibes: 80,
        carHealth: 90
      }
    };

    const result = canPlayerPerformActivity(activity, playerStats);
    expect(result.canPerform).toBe(false);
    expect(result.reasons).toContain('Need at least 80 vibes');
    expect(result.reasons).toContain('Car needs at least 90 health');
  });
});

describe('Activity Effect Application', () => {
  const initialStats: PlayerStats = {
    fuel: 50,
    snacks: 5,
    money: 100,
    vibes: 75,
    carHealth: 80,
    daysTraveled: 3,
    timeOfDay: 'Day',
    currentLocation: 'Portland'
  };

  test('applies costs correctly', () => {
    const activity: GameActivity = {
      id: 'cost_activity',
      name: 'Cost Activity',
      description: 'Has various costs',
      fuelCost: 10,
      moneyCost: 20,
      snackCost: 1,
      timeCost: 1
    };

    const result = applyActivityEffects(activity, initialStats);
    
    expect(result.newStats.fuel).toBe(40);
    expect(result.newStats.money).toBe(80);
    expect(result.newStats.snacks).toBe(4);
    expect(result.newStats.daysTraveled).toBe(4);
    expect(result.message).toContain('Cost: 10 fuel, $20, 1 snacks, 1 day');
  });

  test('applies effects correctly', () => {
    const activity: GameActivity = {
      id: 'effect_activity',
      name: 'Effect Activity',
      description: 'Has various effects',
      vibeChange: 10,
      fuelChange: 5,
      moneyChange: -15,
      carHealthChange: -5
    };

    const result = applyActivityEffects(activity, initialStats);
    
    expect(result.newStats.vibes).toBe(85);
    expect(result.newStats.fuel).toBe(55);
    expect(result.newStats.money).toBe(85);
    expect(result.newStats.carHealth).toBe(75);
    expect(result.message).toContain('Gained: +10 vibes, +5 fuel, -$15, -5 car health');
  });

  test('respects bounds (no negative resources)', () => {
    const activity: GameActivity = {
      id: 'bounds_test',
      name: 'Bounds Test',
      description: 'Tests bounds',
      fuelCost: 100, // More than player has
      vibeChange: 50 // Would exceed 100
    };

    const result = applyActivityEffects(activity, initialStats);
    
    expect(result.newStats.fuel).toBe(0); // Not negative
    expect(result.newStats.vibes).toBe(100); // Capped at 100
  });
});
```

#### Migration Tests
```typescript
// src/tests/migration.test.ts
import { 
  migrateLocationData, 
  needsMigration, 
  createMigratedActivity 
} from '../utils/migration';
import { GameLocation } from '../types/game';

describe('Data Migration', () => {
  const legacyLocation: GameLocation = {
    id: 'test_location',
    name: 'Test Location',
    description: 'A test location',
    icon: '🏢',
    connections: {},
    activityNames: ['Visit Museum', 'Go Hiking'],
    eventChance: 0.15
  };

  test('detects legacy locations needing migration', () => {
    expect(needsMigration(legacyLocation)).toBe(true);
  });

  test('does not migrate modern locations', () => {
    const modernLocation = {
      ...legacyLocation,
      activityNames: undefined,
      activities: [{
        id: 'modern_activity',
        name: 'Modern Activity',
        description: 'Already migrated'
      }]
    };
    
    expect(needsMigration(modernLocation)).toBe(false);
  });

  test('migrates legacy activities correctly', () => {
    const migrated = migrateLocationData(legacyLocation);
    
    expect(migrated.activities).toHaveLength(2);
    expect(migrated.activities![0].name).toBe('Visit Museum');
    expect(migrated.activities![1].name).toBe('Go Hiking');
    expect(migrated.activityNames).toBeUndefined();
  });

  test('creates migrated activity with template matching', () => {
    const activity = createMigratedActivity('Visit Museum', 'test_location', 0);
    
    expect(activity.id).toBe('test_location_visit_museum');
    expect(activity.name).toBe('Visit Museum');
    expect(activity.moneyCost).toBe(12); // Museum template
    expect(activity.vibeChange).toBe(8);
    expect(activity.timeCost).toBe(1);
  });
});
```

### Integration Testing

#### Game Flow Tests
```typescript
// src/tests/gameFlow.test.ts
describe('Activity Integration Tests', () => {
  let gameState: any;
  
  beforeEach(() => {
    // Setup mock game state
    gameState = setupMockGameState();
  });

  test('complete activity flow works end-to-end', async () => {
    // 1. Player starts with initial resources
    expect(gameState.playerStats.money).toBe(200);
    expect(gameState.playerStats.vibes).toBe(75);

    // 2. Player performs an activity
    const activity = gameState.location.activities[0];
    await gameState.handleActivity(activity);

    // 3. Resources are updated correctly
    expect(gameState.playerStats.money).toBe(200 - activity.moneyCost);
    expect(gameState.playerStats.vibes).toBe(75 + activity.vibeChange);

    // 4. Game log is updated
    expect(gameState.gameLog).toContain('Completed:');
  });

  test('activity validation prevents invalid actions', async () => {
    // Drain player's money
    gameState.playerStats.money = 5;

    const expensiveActivity = {
      id: 'expensive',
      name: 'Expensive Activity',
      description: 'Costs too much',
      moneyCost: 50
    };

    const result = await gameState.handleActivity(expensiveActivity);
    
    // Activity should not execute
    expect(gameState.playerStats.money).toBe(5); // Unchanged
    expect(gameState.gameLog).toContain('Cannot perform');
  });

  test('event triggering works with activities', async () => {
    const eventTriggerActivity = {
      id: 'event_trigger',
      name: 'Event Trigger',
      description: 'Always triggers event',
      eventChance: 1.0
    };

    const initialLogLength = gameState.gameLog.length;
    await gameState.handleActivity(eventTriggerActivity);

    // Should have activity log + event log
    expect(gameState.gameLog.length).toBeGreaterThan(initialLogLength + 1);
    expect(gameState.gameLog.some(log => log.includes('EVENT:'))).toBe(true);
  });
});
```

#### Admin Panel Tests
```typescript
// src/tests/adminPanel.test.ts
describe('Admin Panel Activity Management', () => {
  test('creates new activity correctly', async () => {
    const newActivity = {
      id: 'new_activity',
      name: 'New Activity',
      description: 'A newly created activity',
      moneyCost: 25,
      vibeChange: 8
    };

    await adminPanel.saveActivity('Portland', newActivity);
    
    const location = await storage.getLocation('Portland');
    expect(location.activities).toContainEqual(newActivity);
  });

  test('validates activity data before saving', async () => {
    const invalidActivity = {
      id: '', // Invalid - no ID
      name: 'Invalid Activity',
      description: 'This should not save'
    };

    const result = await adminPanel.saveActivity('Portland', invalidActivity);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Activity must have an ID');
  });

  test('updates existing activity', async () => {
    const originalActivity = {
      id: 'update_test',
      name: 'Original Name',
      description: 'Original description'
    };

    await adminPanel.saveActivity('Portland', originalActivity);

    const updatedActivity = {
      ...originalActivity,
      name: 'Updated Name',
      vibeChange: 10
    };

    await adminPanel.saveActivity('Portland', updatedActivity);
    
    const location = await storage.getLocation('Portland');
    const saved = location.activities.find(a => a.id === 'update_test');
    expect(saved.name).toBe('Updated Name');
    expect(saved.vibeChange).toBe(10);
  });
});
```

### User Experience Testing

#### UI/UX Test Scenarios
```typescript
// Manual testing checklist for UI/UX
const uxTestScenarios = [
  {
    name: 'Activity Display Clarity',
    steps: [
      'Navigate to a location with activities',
      'Verify activity names are clear and descriptive',
      'Check that costs are clearly visible',
      'Confirm disabled activities show reasons'
    ],
    expected: 'User can easily understand what each activity does and costs'
  },
  {
    name: 'Resource Management Feedback',
    steps: [
      'Perform activity that costs resources',
      'Check immediate feedback in UI',
      'Verify resource bars update correctly',
      'Confirm game log shows clear transaction details'
    ],
    expected: 'Player gets clear feedback about resource changes'
  },
  {
    name: 'Activity Availability',
    steps: [
      'Try activity with insufficient resources',
      'Check tooltip/error message',
      'Verify button is properly disabled',
      'Test with barely sufficient resources'
    ],
    expected: 'Clear indication of what player can and cannot do'
  },
  {
    name: 'Strategic Decision Making',
    steps: [
      'Present player with multiple activity choices',
      'Verify different cost/benefit trade-offs are clear',
      'Test risk/reward scenarios (event chances)',
      'Check time advancement implications'
    ],
    expected: 'Player can make informed strategic choices'
  }
];
```

#### Accessibility Testing
```typescript
const accessibilityChecks = [
  'Keyboard navigation works for all activity buttons',
  'Screen reader can announce activity costs and effects',
  'Color contrast meets WCAG guidelines',
  'Text scaling works properly',
  'Focus indicators are visible',
  'Error messages are announced to screen readers'
];
```

### Performance Testing

#### Performance Benchmarks
```typescript
// src/tests/performance.test.ts
describe('Performance Tests', () => {
  test('activity processing performance', () => {
    const startTime = performance.now();
    
    // Process 1000 activities
    for (let i = 0; i < 1000; i++) {
      applyActivityEffects(testActivity, testPlayerStats);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should process 1000 activities in under 100ms
    expect(duration).toBeLessThan(100);
  });

  test('migration performance with large dataset', async () => {
    // Create 100 legacy locations
    const legacyLocations = createMockLegacyLocations(100);
    
    const startTime = performance.now();
    await migrateLegacyData(legacyLocations);
    const endTime = performance.now();
    
    // Migration should complete in reasonable time
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
  });

  test('admin panel rendering performance', () => {
    const startTime = performance.now();
    
    // Render admin panel with 50 locations, each with 10 activities
    renderAdminPanel(createMockDataset(50, 10));
    
    const endTime = performance.now();
    
    // Should render quickly
    expect(endTime - startTime).toBeLessThan(1000); // 1 second
  });
});
```

### Error Handling Tests

#### Edge Cases and Error Scenarios
```typescript
describe('Error Handling', () => {
  test('handles corrupted activity data gracefully', () => {
    const corruptedActivity = {
      id: 'corrupted',
      name: null, // Invalid
      description: undefined, // Invalid
      moneyCost: 'not a number' // Invalid type
    };

    expect(() => validateActivity(corruptedActivity)).not.toThrow();
    
    const result = validateActivity(corruptedActivity);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('handles storage failures during migration', async () => {
    // Mock storage failure
    jest.spyOn(storage, 'saveLocation').mockRejectedValue(new Error('Storage failed'));

    const result = await migrateGameData();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Storage failed');
  });

  test('handles missing location data', () => {
    const result = getActivitiesForLocation('nonexistent_location');
    expect(result).toEqual([]);
  });

  test('handles numeric overflow in resource calculations', () => {
    const playerStats = {
      ...mockPlayerStats,
      money: Number.MAX_SAFE_INTEGER - 10
    };

    const activity = {
      id: 'overflow_test',
      name: 'Overflow Test',
      description: 'Tests numeric overflow',
      moneyChange: 100
    };

    const result = applyActivityEffects(activity, playerStats);
    
    // Should not overflow
    expect(result.newStats.money).toBeLessThan(Number.MAX_SAFE_INTEGER);
  });
});
```

### Regression Testing

#### Backward Compatibility Verification
```typescript
describe('Regression Tests', () => {
  test('existing save games continue to work', async () => {
    // Load a real save game from before the update
    const legacySaveGame = loadLegacySaveGame();
    
    // Initialize game with legacy data
    const gameState = await initializeGameWithData(legacySaveGame);
    
    // Verify game functions normally
    expect(gameState.playerStats).toBeDefined();
    expect(gameState.gameLocations).toBeDefined();
    expect(gameState.currentLocation).toBeDefined();
    
    // Verify activities work (even if migrated)
    const activities = getActivitiesForCurrentLocation(gameState);
    expect(activities.length).toBeGreaterThan(0);
  });

  test('existing events system unaffected', () => {
    // Events should work exactly as before
    const event = createTestEvent();
    const initialStats = createTestPlayerStats();
    
    const result = applyEventEffects(event, initialStats);
    
    // Same behavior as original system
    expect(result.newStats.vibes).toBe(initialStats.vibes + event.vibeChange);
  });

  test('travel system integration maintained', () => {
    // Travel between locations should work normally
    const travelResult = handleTravel('Portland', 'Salem', 5);
    
    expect(travelResult.success).toBe(true);
    expect(travelResult.fuelConsumed).toBe(5);
  });
});
```

## Testing Infrastructure

### Test Setup and Utilities
```typescript
// src/tests/testUtils.ts
export const createMockPlayerStats = (overrides = {}): PlayerStats => ({
  fuel: 50,
  snacks: 5,
  money: 100,
  vibes: 75,
  carHealth: 80,
  daysTraveled: 3,
  timeOfDay: 'Day',
  currentLocation: 'Portland',
  ...overrides
});

export const createMockActivity = (overrides = {}): GameActivity => ({
  id: 'test_activity',
  name: 'Test Activity',
  description: 'A test activity',
  vibeChange: 5,
  ...overrides
});

export const createMockGameState = () => ({
  playerStats: createMockPlayerStats(),
  gameLocations: createMockLocations(),
  gameEvents: createMockEvents(),
  gameLog: [],
  handleActivity: jest.fn(),
  // ... other mock methods
});
```

### Continuous Integration

#### Test Automation
```yaml
# .github/workflows/test.yml
name: Activity System Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:migration
      - run: npm run lint
      - run: npm run build
      
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

## Implementation Steps

1. ⏳ Set up testing infrastructure and utilities
2. ⏳ Write unit tests for activity logic
3. ⏳ Write integration tests for game flow
4. ⏳ Create migration and backward compatibility tests
5. ⏳ Implement performance benchmarks
6. ⏳ Design UX testing scenarios
7. ⏳ Set up automated test pipeline
8. ⏳ Run comprehensive test suite

## Testing Checklist

### Functional Testing
- [ ] Activity validation works correctly
- [ ] Activity effects apply properly
- [ ] Resource bounds are respected
- [ ] Event triggering works as expected
- [ ] Admin CRUD operations function
- [ ] Migration preserves data integrity
- [ ] Backward compatibility maintained

### Performance Testing
- [ ] Activity processing is fast enough
- [ ] Migration completes in reasonable time
- [ ] UI remains responsive with large datasets
- [ ] Memory usage is acceptable
- [ ] No performance regressions

### User Experience Testing
- [ ] Activity costs and effects are clear
- [ ] Error messages are helpful
- [ ] UI is intuitive and accessible
- [ ] Strategic choices are meaningful
- [ ] Feedback is immediate and clear

### Regression Testing
- [ ] Existing save games work
- [ ] Original event system unchanged
- [ ] Travel mechanics unaffected
- [ ] All previous features functional

## Success Criteria

- [ ] All unit tests pass with >95% coverage
- [ ] Integration tests verify end-to-end functionality
- [ ] Performance benchmarks meet requirements
- [ ] Manual UX testing shows positive results
- [ ] Migration tests verify data integrity
- [ ] Regression tests confirm no breaking changes
- [ ] Automated CI/CD pipeline passes all checks
- [ ] Documentation includes testing procedures
