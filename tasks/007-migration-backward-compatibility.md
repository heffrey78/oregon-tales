# Task 007: Migration and Backward Compatibility

**User Story**: As a player with existing save data, I want my game to continue working when the activity system is updated so that I don't lose my progress.

## Status: ⏳ WON'T DO

## Parent Task: 002
## Sub Tasks: None
## Dependencies: 003 (Type Definitions), 004 (Data Structures), 005 (Core Logic)

## Description
Implement migration utilities and backward compatibility layers to ensure existing save games and location data work seamlessly with the new activity system.

## Implementation Details

### Migration Strategy

#### Automatic Data Migration
```typescript
// In src/utils/migration.ts
export const migrateGameData = async (): Promise<void> => {
  console.log('Starting game data migration...');
  
  // 1. Migrate location data
  const locations = await db.getLocations();
  let migrationNeeded = false;
  
  for (const location of locations) {
    if (needsMigration(location)) {
      const migratedLocation = migrateLocationData(location);
      await db.saveLocation(migratedLocation);
      migrationNeeded = true;
      console.log(`Migrated location: ${location.id}`);
    }
  }
  
  if (migrationNeeded) {
    console.log('Game data migration completed successfully');
    // Mark migration as completed
    localStorage.setItem('oregon_tales_migration_v2', 'completed');
  } else {
    console.log('No migration needed - data already up to date');
  }
};

const needsMigration = (location: GameLocation): boolean => {
  // Check if location has legacy activityNames but no activities
  return Array.isArray(location.activityNames) && 
         location.activityNames.length > 0 && 
         (!location.activities || location.activities.length === 0);
};

const migrateLocationData = (location: GameLocation): GameLocation => {
  if (!needsMigration(location)) {
    return location;
  }
  
  // Convert activityNames to GameActivity objects
  const activities: GameActivity[] = location.activityNames!.map((name, index) => 
    createMigratedActivity(name, location.id, index)
  );
  
  return {
    ...location,
    activities,
    // Keep activityNames for backward compatibility, but mark as migrated
    activityNames: undefined // Remove legacy field after migration
  };
};

const createMigratedActivity = (
  activityName: string, 
  locationId: string, 
  index: number
): GameActivity => {
  // Generate stable ID based on location and activity name
  const id = `${locationId}_${activityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  
  // Apply activity templates based on activity name patterns
  const template = getActivityTemplate(activityName, locationId);
  
  return {
    id,
    name: activityName,
    description: generateActivityDescription(activityName, locationId),
    vibeChange: template.vibeChange || 3, // Original hardcoded value
    eventChance: template.eventChance || 0.3, // Original hardcoded value
    timeCost: template.timeCost || 0,
    ...template // Apply any other template properties
  };
};

const getActivityTemplate = (activityName: string, locationId: string): Partial<GameActivity> => {
  const name = activityName.toLowerCase();
  
  // Pattern-based activity templates
  if (name.includes('museum') || name.includes('gallery')) {
    return {
      moneyCost: 12,
      vibeChange: 8,
      timeCost: 1,
      eventChance: 0.1
    };
  }
  
  if (name.includes('hike') || name.includes('trail')) {
    return {
      vibeChange: 12,
      timeCost: 1,
      carHealthChange: -2, // Dirt roads
      eventChance: 0.2
    };
  }
  
  if (name.includes('book') || name.includes('library')) {
    return {
      moneyCost: 5,
      vibeChange: 6,
      timeCost: 1,
      eventChance: 0.05
    };
  }
  
  if (name.includes('food') || name.includes('restaurant') || name.includes('donut')) {
    return {
      moneyCost: 8,
      vibeChange: 5,
      snackChange: 1,
      eventChance: 0.05
    };
  }
  
  if (name.includes('beach') || name.includes('tide pool')) {
    return {
      vibeChange: 8,
      timeCost: 1,
      eventChance: 0.15
    };
  }
  
  if (name.includes('drive') || name.includes('scenic')) {
    return {
      fuelCost: 2,
      vibeChange: 10,
      timeCost: 1,
      eventChance: 0.25
    };
  }
  
  // Default template for unknown activities
  return {
    vibeChange: 3,
    eventChance: 0.3,
    timeCost: 0
  };
};

const generateActivityDescription = (activityName: string, locationId: string): string => {
  const location = DEFAULT_LOCATIONS_DATA[locationId];
  const locationName = location?.name || locationId;
  
  // Generate contextual descriptions
  const name = activityName.toLowerCase();
  
  if (name.includes('museum')) {
    return `Explore the local museum and learn about ${locationName}'s history and culture.`;
  }
  if (name.includes('hike') || name.includes('trail')) {
    return `Take a scenic hike and enjoy the natural beauty around ${locationName}.`;
  }
  if (name.includes('book')) {
    return `Browse books and soak in the literary atmosphere at this ${locationName} landmark.`;
  }
  if (name.includes('food') || name.includes('restaurant')) {
    return `Enjoy local cuisine and experience ${locationName}'s food culture.`;
  }
  if (name.includes('beach')) {
    return `Relax on the beach and take in the coastal views near ${locationName}.`;
  }
  if (name.includes('drive') || name.includes('scenic')) {
    return `Take a scenic drive and enjoy the beautiful landscapes around ${locationName}.`;
  }
  
  // Generic description
  return `Enjoy ${activityName.toLowerCase()} and experience what ${locationName} has to offer.`;
};
```

### Backward Compatibility Layer

#### Runtime Activity Resolution
```typescript
// In src/utils/activityCompat.ts
export const getActivitiesForLocation = (location: GameLocation): GameActivity[] => {
  // Prefer new activities format
  if (location.activities && location.activities.length > 0) {
    return location.activities;
  }
  
  // Fall back to legacy activityNames with on-the-fly conversion
  if (location.activityNames && location.activityNames.length > 0) {
    return location.activityNames.map((name, index) => 
      createMigratedActivity(name, location.id, index)
    );
  }
  
  return [];
};

export const isLegacyLocation = (location: GameLocation): boolean => {
  return Boolean(
    location.activityNames && 
    location.activityNames.length > 0 && 
    (!location.activities || location.activities.length === 0)
  );
};

export const hasModernActivities = (location: GameLocation): boolean => {
  return Boolean(location.activities && location.activities.length > 0);
};

// Wrapper for handling both formats in app logic
export const handleActivityClick = (
  activityOrName: GameActivity | string,
  locationId: string,
  handleFunction: (activity: GameActivity) => void
) => {
  if (typeof activityOrName === 'string') {
    // Legacy string activity - convert on the fly
    const activity = createMigratedActivity(activityOrName, locationId, 0);
    handleFunction(activity);
  } else {
    // Modern GameActivity object
    handleFunction(activityOrName);
  }
};
```

### Migration Trigger Points

#### App Initialization Migration Check
```typescript
// In src/App.tsx - update useEffect
useEffect(() => {
  if (isAuthReady && userId) {
    console.log("ConfigLoad: Auth ready and userId present. Calling loadGameConfig.");
    loadGameConfig().then(async () => {
      // Check if migration is needed
      const migrationCompleted = localStorage.getItem('oregon_tales_migration_v2');
      if (!migrationCompleted) {
        console.log('Running automatic data migration...');
        try {
          await migrateGameData();
          setGameLog(prev => [...prev, "Game data updated to new format."]);
        } catch (error) {
          console.error('Migration failed:', error);
          setGameLog(prev => [...prev, "Migration warning: Some data may need manual update."]);
        }
      }
    });
  } else if (isAuthReady && !userId) {
    console.warn("ConfigLoad: Auth ready but no userId. Game config will not load. Possible sign-in failure.");
    setIsConfigLoading(false);
    setGameLog(prev => [...prev, "Authentication failed. Cannot load game configuration."]);
  } else {
    console.log("ConfigLoad: Auth not ready or no userId yet. Waiting to load game config.");
  }
}, [isAuthReady, userId, loadGameConfig]);
```

#### Admin Panel Migration Tools
```typescript
// Add to AdminPanel.tsx
const runManualMigration = async () => {
  if (!isUserAuthenticated) {
    setGameLog(prev => [...prev, "Admin Error: Not authenticated for migration."]);
    return;
  }
  
  setGameLog(prev => [...prev, "Admin: Starting manual data migration..."]);
  
  try {
    await migrateGameData();
    await loadGameConfig(); // Reload to show migrated data
    setGameLog(prev => [...prev, "Admin: Migration completed successfully."]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setGameLog(prev => [...prev, `Admin Error during migration: ${errorMessage}`]);
    console.error("Migration error:", error);
  }
};

// Add migration button to admin panel
<button
  onClick={runManualMigration}
  disabled={!isUserAuthenticated}
  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg shadow mb-2 flex items-center"
>
  <UploadCloud size={18} className="mr-2" /> Migrate Legacy Data
</button>
```

### Data Validation and Repair

#### Migration Validation
```typescript
export const validateMigration = async (): Promise<{
  success: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    const locations = await db.getLocations();
    
    for (const location of locations) {
      // Check for locations with both old and new formats
      if (location.activityNames && location.activities) {
        issues.push(`${location.id} has both legacy and modern activity formats`);
        recommendations.push(`Clean up ${location.id} to use only modern format`);
      }
      
      // Check for locations with no activities at all
      if (!location.activityNames && !location.activities) {
        issues.push(`${location.id} has no activities defined`);
        recommendations.push(`Add activities to ${location.id} for better gameplay`);
      }
      
      // Validate activity data if present
      if (location.activities) {
        for (const activity of location.activities) {
          const validation = validateActivity(activity);
          if (!validation.valid) {
            issues.push(`${location.id}.${activity.id}: ${validation.errors.join(', ')}`);
            recommendations.push(`Fix activity ${activity.id} validation errors`);
          }
        }
      }
    }
    
    return {
      success: issues.length === 0,
      issues,
      recommendations
    };
  } catch (error) {
    return {
      success: false,
      issues: [`Migration validation failed: ${error}`],
      recommendations: ['Check database connectivity and try again']
    };
  }
};

// Add validation to admin panel
const runMigrationValidation = async () => {
  const validation = await validateMigration();
  
  if (validation.success) {
    setGameLog(prev => [...prev, "Admin: Migration validation passed - no issues found."]);
  } else {
    setGameLog(prev => [...prev, "Admin: Migration validation found issues:"]);
    validation.issues.forEach(issue => {
      setGameLog(prev => [...prev, `  • ${issue}`]);
    });
    setGameLog(prev => [...prev, "Recommendations:"]);
    validation.recommendations.forEach(rec => {
      setGameLog(prev => [...prev, `  • ${rec}`]);
    });
  }
};
```

### Rollback Capability

#### Backup and Restore
```typescript
export const createMigrationBackup = async (): Promise<string> => {
  const timestamp = new Date().toISOString();
  const backupKey = `oregon_tales_backup_${timestamp}`;
  
  const locations = await db.getLocations();
  const events = await db.getEvents();
  
  const backup = {
    timestamp,
    locations,
    events,
    version: '1.0'
  };
  
  localStorage.setItem(backupKey, JSON.stringify(backup));
  return backupKey;
};

export const restoreFromBackup = async (backupKey: string): Promise<void> => {
  const backupData = localStorage.getItem(backupKey);
  if (!backupData) {
    throw new Error('Backup not found');
  }
  
  const backup = JSON.parse(backupData);
  
  // Restore locations
  for (const location of backup.locations) {
    await db.saveLocation(location);
  }
  
  // Restore events
  for (const event of backup.events) {
    await db.saveEvent(event);
  }
  
  // Clear migration flag to allow re-migration if needed
  localStorage.removeItem('oregon_tales_migration_v2');
};
```

## Files to Create/Update

1. **`src/utils/migration.ts`** (NEW)
   - Migration logic and utilities
   - Activity template system
   - Validation functions

2. **`src/utils/activityCompat.ts`** (NEW)
   - Backward compatibility helpers
   - Runtime activity resolution
   - Legacy format handling

3. **`src/App.tsx`**
   - Add migration check on startup
   - Import migration utilities

4. **`src/components/AdminPanel.tsx`**
   - Add migration tools
   - Add validation tools
   - Add backup/restore options

## Implementation Steps

1. ⏳ Create migration utility functions
2. ⏳ Create backward compatibility layer
3. ⏳ Add migration check to app initialization
4. ⏳ Add migration tools to admin panel
5. ⏳ Create backup and restore functionality
6. ⏳ Test migration with various data scenarios

## Migration Testing Scenarios

### Test Cases
1. **Fresh Install**: No existing data - should work normally
2. **Legacy Data Only**: Only activityNames - should auto-migrate
3. **Mixed Data**: Some locations with new format, some legacy - should handle both
4. **Already Migrated**: Modern format - should not re-migrate
5. **Corrupted Data**: Invalid data - should handle gracefully

### Validation Scenarios
1. Successful migration with valid results
2. Migration with data issues requiring manual intervention
3. Partial migration failure with rollback capability
4. Performance impact of migration on large datasets

## Risk Mitigation

### Data Safety
- Always create backup before migration
- Validate migrated data before saving
- Provide rollback capability
- Never delete original data until migration confirmed

### Performance
- Run migration asynchronously
- Show progress for large datasets
- Allow incremental migration
- Cache migrated results

### User Experience
- Clear migration status messages
- Non-blocking migration process
- Graceful fallback for migration failures
- Admin tools for manual intervention

## Success Criteria

- [ ] Existing save games work without modification
- [ ] Legacy location data automatically migrates to new format
- [ ] No data loss during migration process
- [ ] Backward compatibility maintained during transition
- [ ] Admin tools available for manual migration management
- [ ] Migration validation ensures data integrity
- [ ] Rollback capability for failed migrations
- [ ] Performance impact is minimal for end users
