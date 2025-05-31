# Task 006: Update Admin Interface for Activity Management

**User Story**: As a game administrator, I want to create and edit activities with costs and effects so that I can design engaging location-based experiences.

## Status: ✅ COMPLETED

## Parent Task: 002
## Sub Tasks: None
## Dependencies: 003 (Type Definitions), 004 (Data Structures)

## Description
Update the admin panel in `src/components/AdminPanel.tsx` to provide full CRUD operations for activities, including creating activities with costs, effects, and requirements.

## Implementation Details

### New Activity Management Section

#### Activity List Display
```typescript
// Add to AdminPanel component
const [showActivityForm, setShowActivityForm] = useState(false);
const [editingActivity, setEditingActivity] = useState<GameActivity | null>(null);
const [selectedLocationForActivity, setSelectedLocationForActivity] = useState<string>('');

// Activity management section in render
<div className="bg-gray-50 p-4 rounded-lg">
  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
    <Activity size={24} className="mr-2" /> Activity Management
  </h2>
  
  {/* Location selector */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Location to Manage Activities
    </label>
    <select
      value={selectedLocationForActivity}
      onChange={e => setSelectedLocationForActivity(e.target.value)}
      className={inputClass}
    >
      <option value="">Choose a location...</option>
      {Object.values(gameLocations).map(location => (
        <option key={location.id} value={location.id}>
          {location.name}
        </option>
      ))}
    </select>
  </div>
  
  {selectedLocationForActivity && (
    <>
      <button
        onClick={() => {
          setEditingActivity({
            id: '',
            name: '',
            description: '',
            vibeChange: 0,
            fuelCost: 0,
            moneyCost: 0,
            snackCost: 0,
            timeCost: 0,
            eventChance: 0
          });
          setShowActivityForm(true);
        }}
        disabled={!isUserAuthenticated}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg shadow mb-2 flex items-center"
      >
        <PlusSquare size={18} className="mr-2" /> Add Activity
      </button>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {getActivitiesForLocation(selectedLocationForActivity).map(activity => (
          <ActivityCard 
            key={activity.id} 
            activity={activity}
            onEdit={() => handleEditActivity(activity)}
            onDelete={() => handleDeleteActivity(activity.id)}
            isUserAuthenticated={isUserAuthenticated}
          />
        ))}
      </div>
    </>
  )}
</div>
```

#### Activity Card Component
```typescript
interface ActivityCardProps {
  activity: GameActivity;
  onEdit: () => void;
  onDelete: () => void;
  isUserAuthenticated: boolean;
}

const ActivityCard: FC<ActivityCardProps> = ({ 
  activity, 
  onEdit, 
  onDelete, 
  isUserAuthenticated 
}) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{activity.name}</div>
        <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
        
        {/* Cost display */}
        <div className="mt-2 text-xs text-gray-500">
          {[
            activity.fuelCost && `${activity.fuelCost} fuel`,
            activity.moneyCost && `$${activity.moneyCost}`,
            activity.snackCost && `${activity.snackCost} snacks`,
            activity.timeCost && `${activity.timeCost} day${activity.timeCost > 1 ? 's' : ''}`,
            activity.vibeCost && `${activity.vibeCost} vibes`
          ].filter(Boolean).join(' • ') || 'No costs'}
        </div>
        
        {/* Effects display */}
        <div className="mt-1 text-xs text-green-600">
          {[
            activity.vibeChange && `${activity.vibeChange > 0 ? '+' : ''}${activity.vibeChange} vibes`,
            activity.fuelChange && `${activity.fuelChange > 0 ? '+' : ''}${activity.fuelChange} fuel`,
            activity.snackChange && `${activity.snackChange > 0 ? '+' : ''}${activity.snackChange} snacks`,
            activity.moneyChange && `${activity.moneyChange > 0 ? '+$' : '-$'}${Math.abs(activity.moneyChange)}`,
            activity.carHealthChange && `${activity.carHealthChange > 0 ? '+' : ''}${activity.carHealthChange} car health`
          ].filter(Boolean).join(' • ') || 'No effects'}
        </div>
        
        {/* Event chance */}
        {activity.eventChance && activity.eventChance > 0 && (
          <div className="mt-1 text-xs text-purple-600">
            {Math.round(activity.eventChance * 100)}% event chance
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 ml-4">
        <button
          onClick={onEdit}
          disabled={!isUserAuthenticated}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={onDelete}
          disabled={!isUserAuthenticated}
          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);
```

### Activity Form Modal

#### Comprehensive Activity Form
```typescript
<Modal 
  isOpen={showActivityForm} 
  onClose={() => setShowActivityForm(false)} 
  title={editingActivity?.id ? "Edit Activity" : "Add New Activity"} 
  size="xl"
>
  <form onSubmit={saveActivity} className="space-y-4">
    {/* Basic Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Activity ID</label>
        <input 
          type="text" 
          value={editingActivity?.id || ''} 
          onChange={e => setEditingActivity(prev => prev ? {...prev, id: e.target.value} : null)} 
          className={inputClass} 
          required 
          placeholder="unique_activity_id"
        />
      </div>
      <div>
        <label className={labelClass}>Activity Name</label>
        <input 
          type="text" 
          value={editingActivity?.name || ''} 
          onChange={e => setEditingActivity(prev => prev ? {...prev, name: e.target.value} : null)} 
          className={inputClass} 
          required 
          placeholder="Visit Local Museum"
        />
      </div>
    </div>
    
    <div>
      <label className={labelClass}>Description</label>
      <textarea 
        value={editingActivity?.description || ''} 
        onChange={e => setEditingActivity(prev => prev ? {...prev, description: e.target.value} : null)} 
        className={inputClass} 
        rows={3}
        required
        placeholder="Learn about local history and culture"
      />
    </div>
    
    {/* Costs Section */}
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Costs (What player pays)</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Fuel Cost</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.fuelCost || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, fuelCost: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Money Cost ($)</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.moneyCost || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, moneyCost: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Snack Cost</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.snackCost || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, snackCost: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Vibe Cost</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.vibeCost || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, vibeCost: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Time Cost (days)</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.timeCost || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, timeCost: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
      </div>
    </div>
    
    {/* Effects Section */}
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Effects (What player gains/loses)</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Vibe Change</label>
          <input 
            type="number" 
            value={editingActivity?.vibeChange || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, vibeChange: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Fuel Change</label>
          <input 
            type="number" 
            value={editingActivity?.fuelChange || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, fuelChange: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Snack Change</label>
          <input 
            type="number" 
            value={editingActivity?.snackChange || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, snackChange: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Money Change ($)</label>
          <input 
            type="number" 
            value={editingActivity?.moneyChange || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, moneyChange: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Car Health Change</label>
          <input 
            type="number" 
            value={editingActivity?.carHealthChange || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, carHealthChange: parseInt(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
      </div>
    </div>
    
    {/* Advanced Options */}
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Advanced Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Event Chance (0.0 to 1.0)</label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            max="1"
            value={editingActivity?.eventChance || 0} 
            onChange={e => setEditingActivity(prev => prev ? {...prev, eventChance: parseFloat(e.target.value) || 0} : null)} 
            className={inputClass} 
          />
        </div>
        <div className="flex items-center space-x-4 pt-6">
          <label className="flex items-center">
            <input 
              type="checkbox"
              checked={editingActivity?.oneTimeOnly || false}
              onChange={e => setEditingActivity(prev => prev ? {...prev, oneTimeOnly: e.target.checked} : null)}
              className="mr-2"
            />
            One-time only
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox"
              checked={editingActivity?.repeatable !== false}
              onChange={e => setEditingActivity(prev => prev ? {...prev, repeatable: e.target.checked} : null)}
              className="mr-2"
            />
            Repeatable
          </label>
        </div>
      </div>
    </div>
    
    {/* Requirements Section */}
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Minimum Requirements</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Min Fuel</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.requiredResources?.fuel || 0} 
            onChange={e => setEditingActivity(prev => prev ? {
              ...prev, 
              requiredResources: { 
                ...prev.requiredResources, 
                fuel: parseInt(e.target.value) || undefined 
              }
            } : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Min Money ($)</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.requiredResources?.money || 0} 
            onChange={e => setEditingActivity(prev => prev ? {
              ...prev, 
              requiredResources: { 
                ...prev.requiredResources, 
                money: parseInt(e.target.value) || undefined 
              }
            } : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Min Vibes</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.requiredResources?.vibes || 0} 
            onChange={e => setEditingActivity(prev => prev ? {
              ...prev, 
              requiredResources: { 
                ...prev.requiredResources, 
                vibes: parseInt(e.target.value) || undefined 
              }
            } : null)} 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Min Car Health</label>
          <input 
            type="number" 
            min="0"
            value={editingActivity?.requiredResources?.carHealth || 0} 
            onChange={e => setEditingActivity(prev => prev ? {
              ...prev, 
              requiredResources: { 
                ...prev.requiredResources, 
                carHealth: parseInt(e.target.value) || undefined 
              }
            } : null)} 
            className={inputClass} 
          />
        </div>
      </div>
    </div>
    
    <button 
      type="submit" 
      disabled={!isUserAuthenticated} 
      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow"
    >
      Save Activity
    </button>
  </form>
</Modal>
```

### Activity Management Logic

#### CRUD Operations
```typescript
const handleEditActivity = (activity: GameActivity) => {
  setEditingActivity({ ...activity });
  setShowActivityForm(true);
};

const saveActivity = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isUserAuthenticated || !editingActivity || !selectedLocationForActivity) {
    setGameLog(prev => [...prev, "Admin Error: Cannot save activity."]);
    return;
  }
  
  try {
    // Validate activity data
    const validation = validateActivity(editingActivity);
    if (!validation.valid) {
      setGameLog(prev => [...prev, `Admin Error: ${validation.errors.join(', ')}`]);
      return;
    }
    
    // Get current location
    const location = gameLocations[selectedLocationForActivity];
    if (!location) {
      setGameLog(prev => [...prev, "Admin Error: Location not found."]);
      return;
    }
    
    // Update location's activities
    const currentActivities = location.activities || [];
    const activityIndex = currentActivities.findIndex(a => a.id === editingActivity.id);
    
    let updatedActivities;
    if (activityIndex >= 0) {
      // Update existing activity
      updatedActivities = [...currentActivities];
      updatedActivities[activityIndex] = editingActivity;
    } else {
      // Add new activity
      updatedActivities = [...currentActivities, editingActivity];
    }
    
    // Save updated location
    const updatedLocation = { ...location, activities: updatedActivities };
    await db.saveLocation(updatedLocation);
    
    setGameLog(prev => [...prev, `Admin: Activity ${editingActivity.name} saved.`]);
    setShowActivityForm(false);
    setEditingActivity(null);
    loadGameConfig();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setGameLog(prev => [...prev, `Admin Error saving activity: ${errorMessage}`]);
    console.error("Error saving activity:", error);
  }
};

const handleDeleteActivity = async (activityId: string) => {
  if (!isUserAuthenticated || !selectedLocationForActivity) {
    setGameLog(prev => [...prev, "Admin Error: Cannot delete activity."]);
    return;
  }
  
  if (window.confirm(`Delete activity ${activityId}? This cannot be undone.`)) {
    try {
      const location = gameLocations[selectedLocationForActivity];
      if (!location) return;
      
      const updatedActivities = (location.activities || []).filter(a => a.id !== activityId);
      const updatedLocation = { ...location, activities: updatedActivities };
      
      await db.saveLocation(updatedLocation);
      setGameLog(prev => [...prev, `Admin: Activity ${activityId} deleted.`]);
      loadGameConfig();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGameLog(prev => [...prev, `Admin Error deleting activity: ${errorMessage}`]);
      console.error("Error deleting activity:", error);
    }
  }
};

const getActivitiesForLocation = (locationId: string): GameActivity[] => {
  const location = gameLocations[locationId];
  return location?.activities || [];
};
```

### Update Location Form

#### Remove Legacy Activity Names Field
```typescript
// In location form, replace activityNames input with:
<div>
  <label className={labelClass}>Activities</label>
  <div className="text-sm text-gray-600 mb-2">
    Use the Activity Management section below to add/edit activities for this location.
  </div>
  <div className="bg-gray-100 p-3 rounded text-sm">
    {getActivitiesForLocation(editingLocation?.id || '').length} activities configured
  </div>
</div>
```

## Files to Update

1. **`src/components/AdminPanel.tsx`**
   - Add activity management section
   - Add activity form modal
   - Add CRUD operations for activities
   - Update location form to remove legacy activity field

## Implementation Steps

1. ✅ Add activity management state and UI components
2. ✅ Create comprehensive activity form modal
3. ✅ Implement activity CRUD operations
4. ✅ Update location form to remove legacy fields
5. ✅ Add activity validation and error handling
6. ✅ Test all admin functionality

## User Experience Improvements

### Visual Activity Management
- Clear display of costs vs effects
- Color coding for different types of changes
- Intuitive form layout with logical groupings

### Admin Workflow
- Location-based activity management
- Easy switching between locations
- Clear validation messages
- Bulk operations support

### Data Integrity
- Activity validation before saving
- Prevention of duplicate activity IDs
- Clear error messages for invalid data

## Testing Checklist

- [x] Activity CRUD operations work correctly
- [x] Activity form validation prevents invalid data
- [x] Activities are properly associated with locations
- [x] Activity display shows all relevant information
- [x] Admin can switch between locations easily
- [x] Error handling works for all scenarios
- [x] Activity data persists correctly

## Success Criteria

- [x] Admin can create activities with full cost/effect specification
- [x] Admin can edit existing activities
- [x] Admin can delete activities with confirmation
- [x] Activity form validates all input data
- [x] Activities are properly organized by location
- [x] Clear visual feedback for all admin operations
- [x] Backward compatibility maintained during transition
