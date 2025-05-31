import { FC, useState, Dispatch, SetStateAction } from 'react';
import { PlusSquare, Edit3, Trash2, UploadCloud } from 'lucide-react';
import { Modal } from './Modal';
import { db } from '../services/storage';
import { DEFAULT_LOCATIONS_DATA, DEFAULT_GAME_EVENTS_DATA } from '../utils/constants';
import type { GameLocation, GameEvent } from '../types/game';

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

  const handleEditLocation = (loc: GameLocation) => {
    setEditingLocation({
      ...loc,
      connectionsStr: JSON.stringify(loc.connections || {}),
      activityNamesStr: (loc.activityNames || []).join(', ')
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
        activityNames: editingLocation.activityNamesStr.split(',').map(s => s.trim()).filter(s => s),
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
              activityNamesStr: '',
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
            <label className={labelClass}>Activity Names (comma-separated)</label>
            <input 
              type="text" 
              value={editingLocation?.activityNamesStr || ''} 
              onChange={e => setEditingLocation(prev => prev ? {...prev, activityNamesStr: e.target.value} : null)} 
              className={inputClass} 
            />
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
    </div>
  );
};
