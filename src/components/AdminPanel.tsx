// filepath: /media/jeffwikstrom/Secondary/Projects/oregon-tales/src/components/AdminPanel.tsx
import { FC, useState, Dispatch, SetStateAction } from 'react';
import { PlusSquare, Edit3, Trash2, UploadCloud, Activity, MapPin, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { db } from '../services/storage';
import { DEFAULT_LOCATIONS_DATA, DEFAULT_GAME_EVENTS_DATA } from '../utils/constants';
import type { GameLocation, GameEvent, GameActivity } from '../types/game';

// Import new admin components
import { EntityCard } from './admin/EntityCard';
import { EntityManager } from './admin/EntityManager';
import { AdminActionButton } from './admin/AdminActionButton';
import { LocationForm } from './admin/forms/LocationForm';
import { EventForm } from './admin/forms/EventForm';
import { ActivityForm } from './admin/forms/ActivityForm';
import { EmojiDisplay } from './admin/EmojiPicker';

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

  // Helper function to get default event icon based on event type
  const getDefaultEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'positive':
        return '✨';
      case 'negative':
        return '⚠️';
      case 'urgent':
        return '🚨';
      case 'neutral':
      default:
        return '💬';
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
      <AdminActionButton
        onClick={seedInitialData}
        disabled={!isUserAuthenticated}
        icon={<UploadCloud size={18} />}
        variant="success"
        size="lg"
        className="mb-4"
      >
        Seed Initial Locations & Events (if empty)
      </AdminActionButton>

      {/* Locations Management */}
      <EntityManager
        title="Manage Locations"
        icon={<MapPin />}
        onAddNew={() => {
          setEditingLocation({
            id: '',
            name: '',
            description: '',
            icon: '📍',
            connectionsStr: '{}',
            activityNamesStr: '',
            eventChance: 0.15
          });
          setShowLocationForm(true);
        }}
        isUserAuthenticated={isUserAuthenticated}
      >
        {(Object.values(gameLocations) as GameLocation[]).map(location => (
          <EntityCard
            key={location.id}
            title={location.name}
            subtitle={location.description}
            icon={location.icon}
            metadata={[{ label: 'connections', value: String(Object.keys(location.connections || {}).length) }]}
            onEdit={() => handleEditLocation(location)}
            onDelete={() => deleteLocation(location.id)}
            isUserAuthenticated={isUserAuthenticated}
          />
        ))}
      </EntityManager>

            {/* Activity Management */}
      <div className="mb-6">
        {/* Location selector */}
        <div className="mb-4 px-4">
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
          <EntityManager
            title="Activity Management"
            icon={<Activity />}
            onAddNew={() => {
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
            isUserAuthenticated={isUserAuthenticated}
          >
            {getActivitiesForLocation(selectedLocationForActivity).map(activity => (
              <EntityCard 
                key={activity.id}
                title={activity.name}
                subtitle={activity.description}
                icon={activity.icon || '🔍'}
                onEdit={() => handleEditActivity(activity)}
                onDelete={() => handleDeleteActivity(activity.id)}
                isUserAuthenticated={isUserAuthenticated}
                additionalContent={
                  <>
                    {/* Costs display */}
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
                  </>
                }
              />
            ))}
          </EntityManager>
        )}
      </div>

      {/* Events Management */}
      <EntityManager
        title="Manage Events"
        icon={<AlertTriangle />}
        onAddNew={() => {
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
        isUserAuthenticated={isUserAuthenticated}
      >
        {(gameEvents as GameEvent[]).map((event: GameEvent) => (
          <EntityCard
            key={event.id}
            title={event.id}
            subtitle={event.message}
            icon={event.icon || getDefaultEventIcon(event.type)}
            metadata={[{ label: 'type', value: event.type }]}
            onEdit={() => handleEditEvent(event)}
            onDelete={() => deleteEvent(event.id)}
            isUserAuthenticated={isUserAuthenticated}
          />
        ))}
      </EntityManager>

      {/* Location Form Modal */}
      <Modal 
        isOpen={showLocationForm} 
        onClose={() => setShowLocationForm(false)} 
        title={editingLocation?.id ? "Edit Location" : "Add New Location"} 
        size="lg"
      >
        <LocationForm
          location={editingLocation}
          onSave={saveLocation}
          onChange={setEditingLocation}
          isUserAuthenticated={isUserAuthenticated}
          activities={editingLocation ? getActivitiesForLocation(editingLocation.id) : []}
        />
      </Modal>

      {/* Activity Form Modal */}
      <Modal 
        isOpen={showActivityForm} 
        onClose={() => setShowActivityForm(false)} 
        title={editingActivity?.id ? "Edit Activity" : "Add New Activity"} 
        size="xl"
      >
        <ActivityForm
          activity={editingActivity}
          onSave={saveActivity}
          onChange={setEditingActivity}
          isUserAuthenticated={isUserAuthenticated}
        />
      </Modal>

      {/* Event Form Modal */}
      <Modal 
        isOpen={showEventForm} 
        onClose={() => setShowEventForm(false)} 
        title={editingEvent?.id ? "Edit Event" : "Add New Event"} 
        size="lg"
      >
        <EventForm
          event={editingEvent}
          onSave={saveEvent}
          onChange={setEditingEvent}
          isUserAuthenticated={isUserAuthenticated}
        />
      </Modal>
    </div>
  );
};
