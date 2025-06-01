# Task 002: Activity Effects Implementation Plan

**User Story**: As a developer, I want a detailed implementation plan for activity effects so that I can implement the feature systematically.

## Status: ✅ COMPLETE

## Parent Task: 001
## Sub Tasks: 003, 004, 005, 006, 007, 008

## Description
Create a detailed step-by-step implementation plan for adding activity effects to the Oregon Tales game.

## Implementation Strategy

### Phase 1: Type System Updates (Task 003)
1. Create `GameActivity` interface
2. Update `GameLocation` interface 
3. Add backward compatibility types
4. Update related interfaces

### Phase 2: Data Structure Updates (Task 004)
1. Update default game data with activities
2. Create migration utilities
3. Update storage layer
4. Add validation functions

### Phase 3: Core Game Logic Updates (Task 005)
1. Update `handleActivity` function
2. Add activity effect application logic
3. Update activity selection UI
4. Add activity validation

### Phase 4: Admin Interface Updates (Task 006)
1. Add activity management to admin panel
2. Create activity form components
3. Add CRUD operations for activities
4. Update location form to handle activities

### Phase 5: Migration and Compatibility (Task 007)
1. Create migration script for existing data
2. Add backward compatibility layer
3. Update default data
4. Test migration process

### Phase 6: Testing and Validation (Task 008)
1. Unit tests for new functionality
2. Integration testing
3. User experience testing
4. Performance validation

## Technical Considerations

### Data Structure Design
```typescript
interface GameActivity {
  id: string;
  name: string;
  description: string;
  // Costs (negative effects)
  fuelCost?: number;
  snackCost?: number; 
  moneyCost?: number;
  timeCost?: number; // advances time/day
  // Rewards (positive effects)
  vibeChange?: number;
  fuelChange?: number;
  snackChange?: number;
  moneyChange?: number;
  carHealthChange?: number;
  // Meta properties
  eventChance?: number; // chance to trigger random event
  requiredResources?: Partial<PlayerStats>; // minimum resources needed
  oneTimeOnly?: boolean; // can only be done once per location
}
```

### Backward Compatibility Strategy
1. Support both `activityNames: string[]` and `activities: GameActivity[]`
2. Auto-convert string activities to basic `GameActivity` objects
3. Maintain existing save game compatibility
4. Graceful degradation for old data

### Database Schema Changes
```typescript
// Before
interface GameLocation {
  activityNames: string[];
}

// After (with backward compatibility)
interface GameLocation {
  activityNames?: string[]; // deprecated but supported
  activities?: GameActivity[]; // new preferred format
}
```

## Implementation Order

1. **Task 003**: Update type definitions
2. **Task 004**: Update data structures and storage
3. **Task 005**: Update core game logic
4. **Task 006**: Update admin interface  
5. **Task 007**: Implement migration system
6. **Task 008**: Testing and validation

## Risk Mitigation

### Breaking Changes
- Maintain backward compatibility during transition
- Provide migration tools
- Test with existing save games

### Performance Impact
- Activity processing should be lightweight
- Cache computed activity lists
- Optimize admin interface rendering

### User Experience
- Preserve existing gameplay feel
- Improve activity feedback
- Clear cost/benefit information

## Success Criteria
- [x] Implementation plan documented
- [x] Technical approach defined
- [x] Risk mitigation strategies identified
- [x] All sub-tasks defined and ready for implementation
