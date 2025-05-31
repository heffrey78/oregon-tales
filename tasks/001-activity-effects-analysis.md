# Task 001: Activity Effects System Analysis

**User Story**: As a developer, I want to analyze the current event and activity systems so that I can plan the implementation of activity effects.

## Status: ✅ COMPLETE

## Parent Task: None
## Sub Tasks: 002, 003, 004, 005, 006, 007, 008

## Description
Analyze the existing codebase to understand how events work with their effects system and how activities are currently implemented as simple strings.

## Current State Analysis

### Events System (Current Implementation)
- **Interface**: `GameEvent` with properties:
  - `id`, `type`, `message` (core properties)
  - `vibeChange?`, `fuelChange?`, `snackChange?`, `moneyChange?`, `carHealthChange?` (effect properties)
- **Trigger System**: Events can be triggered randomly or by specific IDs
- **Effect Application**: Applied immediately to player stats with bounds checking
- **Admin Interface**: Full CRUD operations in AdminPanel.tsx
- **Storage**: Persisted in localStorage via `storage.ts`

### Activities System (Current Implementation)
- **Interface**: Simple `string[]` in `GameLocation.activityNames`
- **Effects**: Hardcoded +3 vibes, 30% chance to trigger random event
- **Admin Interface**: Edited as comma-separated string in location form
- **No Independent Effects**: Cannot have costs, resource changes, or unique behaviors

### Key Files Involved
- `src/types/game.ts` - Type definitions
- `src/App.tsx` - Main game logic and `handleActivity` function
- `src/components/AdminPanel.tsx` - Admin interface
- `src/services/storage.ts` - Data persistence
- `src/utils/constants.ts` - Default game data

## Requirements for Activity Effects

### Functional Requirements
1. Activities should have independent effects like events (fuel cost, money cost, resource rewards)
2. Activities should maintain their connection to locations
3. Admin panel should allow creating/editing activity effects
4. Activities can still trigger events (optional secondary effect)
5. Backward compatibility with existing string-based activities

### Technical Requirements
1. New `GameActivity` interface similar to `GameEvent`
2. Replace `activityNames: string[]` with `activities: GameActivity[]` in locations
3. Update storage layer to handle activity data
4. Migrate existing string activities to new format
5. Update admin interface for activity management
6. Update game logic to apply activity effects

## Success Criteria
- [x] Current system analyzed and documented
- [ ] Implementation plan created (Task 002)
- [ ] Type definitions updated (Task 003)
- [ ] Data structures updated (Task 004)
- [ ] Game logic updated (Task 005)
- [ ] Admin interface updated (Task 006)
- [ ] Migration system implemented (Task 007)
- [ ] Testing and validation completed (Task 008)
