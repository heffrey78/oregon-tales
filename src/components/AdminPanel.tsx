import { FC, useState, Dispatch, SetStateAction } from 'react';
import { PlusSquare, Edit3, Trash2, UploadCloud, Activity } from 'lucide-react';
import { Modal } from './Modal';
import { db } from '../services/storage';
import { DEFAULT_LOCATIONS_DATA, DEFAULT_GAME_EVENTS_DATA } from '../utils/constants';
import type { GameLocation, GameEvent, GameActivity } from '../types/game';

interface AdminPanelProps {
  gameLocations: Record<string, GameLocation>;
  gameEvents: GameEvent[];
  loadGameConfig: () => Promise<void>;
  seedInitialData: () => Promise<void>;
  setGameLog: Dispatch<SetStateAction<string[]>>;
  isUserAuthenticated: boolean;
}

interface EditingLocation extends Omit<GameLocation, 'connections' | 'activityNames'> {
  connectionsStr: string;
  activityNamesStr: string;
}

export const AdminPanel: FC<AdminPanelProps> = ({
  gameLocations,
  gameEvents,
  loadGameConfig,
  seedInitialData,
  setGameLog,
  isUserAuthenticated
}) => {
  const [editingLocation, setEditingLocation] = useState<EditingLocation | null>(null);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<GameActivity | null>(null);
  const [selectedLocationForActivity, setSelectedLocationForActivity] = useState<string>('');

  // Activity management helper functions
  const getActivitiesForLocation = (locationId: string): GameActivity[] => {
    const location = gameLocations[locationId];
    return location?.activities || [];
  };

  const validateActivity = (activity: GameActivity): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!activity.id?.trim()) errors.push("Activity ID is required");
    if (!activity.name?.trim()) errors.push("Activity name is required");
    if (!activity.description?.trim()) errors.push("Activity description is required");
    
    // Check for negative values where they don't make sense
    if (activity.fuelCost && activity.fuelCost < 0) errors.push("Fuel cost cannot be negative");
    if (activity.moneyCost && activity.moneyCost < 0) errors.push("Money cost cannot be negative");
    if (activity.snackCost && activity.snackCost < 0) errors.push("Snack cost cannot be negative");
    if (activity.timeCost && activity.timeCost < 0) errors.push("Time cost cannot be negative");
    if (activity.vibeCost && activity.vibeCost < 0) errors.push("Vibe cost cannot be negative");
    
    if (activity.eventChance && (activity.eventChance < 0 || activity.eventChance > 1)) {
      errors.push("Event chance must be between 0 and 1");
    }
    
    return { valid: errors.length === 0, errors };
  };

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

  const handleEditLocation = (loc: GameLocation) => {
    setEditingLocation({
      ...loc,
      connectionsStr: JSON.stringify(loc.connections || {}),
      activityNamesStr: '' // Keeping for interface compatibility but not used
    });
    setShowLocationForm(true);
  };

  const handleEditEvent = (ev: GameEvent) => {
    setEditingEvent({ ...ev });
    setShowEventForm(true);
  };

  const saveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserAuthenticated) {
      setGameLog(prev => [...prev, "Admin Error: Not authenticated. Cannot save location."]);
      console.error("Admin Error: Not authenticated for saving location.");
      return;
    }
    if (!editingLocation || !editingLocation.id) {
      setGameLog(prev => [...prev, "Admin Error: Location ID is required."]);
      return;
    }

    try {
      const locationData: GameLocation = {
        ...editingLocation,
        connections: JSON.parse(editingLocation.connectionsStr || '{}'),
        eventChance: parseFloat(editingLocation.eventChance.toString()) || 0.15
      };

      await db.saveLocation(locationData);
      setGameLog(prev => [...prev, `Admin: Location ${editingLocation.id} saved.`]);
      setShowLocationForm(false);
      setEditingLocation(null);
      loadGameConfig();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGameLog(prev => [...prev, `Admin Error saving location: ${errorMessage}`]);
      console.error("Error saving location:", error);
    }
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserAuthenticated) {
      setGameLog(prev => [...prev, "Admin Error: Not authenticated. Cannot save event."]);
      console.error("Admin Error: Not authenticated for saving event.");
      return;
    }
    if (!editingEvent || !editingEvent.id) {
      setGameLog(prev => [...prev, "Admin Error: Event ID is required."]);
      return;
    }

    try {
      const eventData: GameEvent = {
        ...editingEvent,
        vibeChange: parseInt(editingEvent.vibeChange?.toString() || '0') || 0,
        fuelChange: parseInt(editingEvent.fuelChange?.toString() || '0') || 0,
        snackChange: parseInt(editingEvent.snackChange?.toString() || '0') || 0,
        moneyChange: parseInt(editingEvent.moneyChange?.toString() || '0') || 0,
        carHealthChange: parseInt(editingEvent.carHealthChange?.toString() || '0') || 0,
      };

      await db.saveEvent(eventData);
      setGameLog(prev => [...prev, `Admin: Event ${editingEvent.id} saved.`]);
      setShowEventForm(false);
      setEditingEvent(null);
      loadGameConfig();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGameLog(prev => [...prev, `Admin Error saving event: ${errorMessage}`]);
      console.error("Error saving event:", error);
    }
  };

  const deleteLocation = async (locationId: string) => {
    if (!isUserAuthenticated) {
      setGameLog(prev => [...prev, "Admin Error: Not authenticated. Cannot delete location."]);
      console.error("Admin Error: Not authenticated for deleting location.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete location ${locationId}? This cannot be undone.`)) {
      try {
        await db.deleteLocation(locationId);
        setGameLog(prev => [...prev, `Admin: Location ${locationId} deleted.`]);
        loadGameConfig();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setGameLog(prev => [...prev, `Admin Error deleting location: ${errorMessage}`]);
        console.error("Error deleting location:", error);
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!isUserAuthenticated) {
      setGameLog(prev => [...prev, "Admin Error: Not authenticated. Cannot delete event."]);
      console.error("Admin Error: Not authenticated for deleting event.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete event ${eventId}? This cannot be undone.`)) {
      try {
        await db.deleteEvent(eventId);
        setGameLog(prev => [...prev, `Admin: Event ${eventId} deleted.`]);
        loadGameConfig();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setGameLog(prev => [...prev, `Admin Error deleting event: ${errorMessage}`]);
        console.error("Error deleting event:", error);
      }
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";

  // ActivityCard component
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

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
      <button
        onClick={seedInitialData}
        disabled={!isUserAuthenticated}
        className="mb-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center"
      >
        <UploadCloud size={18} className="mr-2" /> Seed Initial Locations & Events (if empty)
      </button>

      {/* Locations Management */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Manage Locations</h3>
        <button 
          onClick={() => {
            setEditingLocation({
              id: '',
              name: '',
              description: '',
              icon: '📍',
              connectionsStr: '{}',
              activityNamesStr: '', // Keeping for interface compatibility but not used
              eventChance: 0.15
            });
            setShowLocationForm(true);
          }}
          disabled={!isUserAuthenticated}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg shadow mb-2 flex items-center">
          <PlusSquare size={18} className="mr-2" /> Add New Location
        </button>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(Object.values(gameLocations) as GameLocation[]).map(location => (
            <div key={location.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{location.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500">Connections: {Object.keys(location.connections || {}).length}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditLocation(location)}
                  disabled={!isUserAuthenticated}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                  <Edit3 size={14} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => deleteLocation(location.id)}
                  disabled={!isUserAuthenticated}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Management */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Manage Events</h3>
        <button 
          onClick={() => {
            setEditingEvent({
              id: '',
              type: 'neutral',
              message: '',
              vibeChange: 0,
              fuelChange: 0,
              snackChange: 0,
              moneyChange: 0,
              carHealthChange: 0
            });
            setShowEventForm(true);
          }}
          disabled={!isUserAuthenticated}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded-lg shadow mb-2 flex items-center">
          <PlusSquare size={18} className="mr-2" /> Add New Event
        </button>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(gameEvents as GameEvent[]).map((event: GameEvent) => (
            <div key={event.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <div className="font-medium text-gray-900">{event.id}</div>
                <div className="text-sm text-gray-500">{event.message}</div>
                <div className="text-xs text-gray-400 capitalize">Type: {event.type}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  disabled={!isUserAuthenticated}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                  <Edit3 size={14} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  disabled={!isUserAuthenticated}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Management */}
      <div className="mb-6">
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
      </div>

      {/* Location Form Modal */}
      <Modal isOpen={showLocationForm} onClose={() => setShowLocationForm(false)} title={editingLocation?.id ? "Edit Location" : "Add New Location"} size="lg">
        <form onSubmit={saveLocation} className="space-y-3">
          <div>
            <label className={labelClass}>Location ID</label>
            <input 
              type="text" 
              value={editingLocation?.id || ''} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, id: e.target.value} : null)} 
              className={inputClass} 
              required 
            />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input 
              type="text" 
              value={editingLocation?.name || ''} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, name: e.target.value} : null)} 
              className={inputClass} 
              required 
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea 
              value={editingLocation?.description || ''} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, description: e.target.value} : null)} 
              className={inputClass} 
              rows={2} 
              required 
            />
          </div>
          <div>
            <label className={labelClass}>Icon (emoji)</label>
            <input 
              type="text" 
              value={editingLocation?.icon || ''} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, icon: e.target.value} : null)} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>Connections (JSON format: {`{"destination": fuelCost}`})</label>
            <input 
              type="text" 
              value={editingLocation?.connectionsStr || '{}'} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, connectionsStr: e.target.value} : null)} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>Activities</label>
            <div className="text-sm text-gray-600 mb-2">
              Use the Activity Management section below to add/edit activities for this location.
            </div>
            <div className="bg-gray-100 p-3 rounded text-sm">
              {getActivitiesForLocation(editingLocation?.id || '').length} activities configured
            </div>
          </div>
          <div>
            <label className={labelClass}>Event Chance (0.0 to 1.0)</label>
            <input 
              type="number" 
              step="0.01" 
              value={editingLocation?.eventChance || 0.15} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, eventChance: parseFloat(e.target.value)} : null)} 
              className={inputClass} 
            />
          </div>
          <button 
            type="submit" 
            disabled={!isUserAuthenticated} 
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            Save Location
          </button>
        </form>
      </Modal>

      {/* Event Form Modal */}
      <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title={editingEvent?.id ? "Edit Event" : "Add New Event"} size="lg">
        <form onSubmit={saveEvent} className="space-y-3">
          <div>
            <label className={labelClass}>Event ID</label>
            <input 
              type="text" 
              value={editingEvent?.id || ''} 
              onChange={e => setEditingEvent(prev => prev ? {...prev, id: e.target.value} : null)} 
              className={inputClass} 
              required 
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select 
              value={editingEvent?.type || 'neutral'} 
              onChange={e => setEditingEvent(prev => prev ? {...prev, type: e.target.value as any} : null)} 
              className={inputClass}
            >
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Message</label>
            <textarea 
              value={editingEvent?.message || ''} 
              onChange={e => setEditingEvent(prev => prev ? {...prev, message: e.target.value} : null)} 
              className={inputClass} 
              rows={2} 
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vibe Change</label>
              <input 
                type="number" 
                value={editingEvent?.vibeChange || 0} 
                onChange={e => setEditingEvent(prev => prev ? {...prev, vibeChange: parseInt(e.target.value)} : null)} 
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Fuel Change</label>
              <input 
                type="number" 
                value={editingEvent?.fuelChange || 0} 
                onChange={e => setEditingEvent(prev => prev ? {...prev, fuelChange: parseInt(e.target.value)} : null)} 
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Snack Change</label>
              <input 
                type="number" 
                value={editingEvent?.snackChange || 0} 
                onChange={e => setEditingEvent(prev => prev ? {...prev, snackChange: parseInt(e.target.value)} : null)} 
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Money Change</label>
              <input 
                type="number" 
                value={editingEvent?.moneyChange || 0} 
                onChange={e => setEditingEvent(prev => prev ? {...prev, moneyChange: parseInt(e.target.value)} : null)} 
                className={inputClass} 
              />
            </div>
            <div>
              <label className={labelClass}>Car Health Change</label>
              <input 
                type="number" 
                value={editingEvent?.carHealthChange || 0} 
                onChange={e => setEditingEvent(prev => prev ? {...prev, carHealthChange: parseInt(e.target.value)} : null)} 
                className={inputClass} 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!isUserAuthenticated} 
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            Save Event
          </button>
        </form>
      </Modal>

      {/* Activity Form Modal */}
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
    </div>
  );
};
