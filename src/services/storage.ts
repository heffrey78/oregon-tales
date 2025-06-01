import { PlayerStats, GameLocation, GameEvent, GameActivity } from '../types/game';
import { addIconsToLocationActivities, addIconsToEvent } from '../utils/iconHelpers';

// LocalStorage keys
const STORAGE_KEYS = {
  GAME_STATE: 'oregon_tales_game_state',
  LOCATIONS: 'oregon_tales_locations',
  EVENTS: 'oregon_tales_events',
  USER: 'oregon_tales_user',
} as const;

// Game-specific localStorage functions
export const saveGameState = async (gameState: PlayerStats) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const userGameStates = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_STATE) || '{}');
  userGameStates[auth.currentUser.uid] = gameState;
  localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(userGameStates));
};

export const loadGameState = async (): Promise<PlayerStats | null> => {
  if (!auth.currentUser) return null;
  
  const userGameStates = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_STATE) || '{}');
  return userGameStates[auth.currentUser.uid] || null;
};

export const saveLocation = async (location: GameLocation) => {
  const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) || '[]');
  
  // Process the location to ensure activities have icons
  const processedLocation = addIconsToLocationActivities(location);
  
  if (processedLocation.id) {
    // Update existing location
    const index = locations.findIndex((loc: GameLocation) => loc.id === processedLocation.id);
    if (index >= 0) {
      locations[index] = processedLocation;
    } else {
      locations.push(processedLocation);
    }
  } else {
    // Add new location with generated ID
    const newLocation = {
      ...processedLocation,
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    locations.push(newLocation);
  }
  
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
};

export const getLocations = async (): Promise<GameLocation[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
  const locations = data ? JSON.parse(data) : [];
  
  // Make sure activities in all locations have icons
  return locations.map(addIconsToLocationActivities);
};

export const deleteLocation = async (locationId: string) => {
  const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) || '[]');
  const filteredLocations = locations.filter((loc: GameLocation) => loc.id !== locationId);
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(filteredLocations));
};

export const saveEvent = async (event: GameEvent) => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
  
  // Process the event to ensure it has an icon
  const processedEvent = addIconsToEvent(event);
  
  if (processedEvent.id) {
    // Update existing event
    const index = events.findIndex((evt: GameEvent) => evt.id === processedEvent.id);
    if (index >= 0) {
      events[index] = processedEvent;
    } else {
      events.push(processedEvent);
    }
  } else {
    // Add new event with generated ID
    const newEvent = {
      ...processedEvent,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    events.push(newEvent);
  }
  
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const getEvents = async (): Promise<GameEvent[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  const events = data ? JSON.parse(data) : [];
  
  // Make sure all events have icons
  return events.map(addIconsToEvent);
};

export const deleteEvent = async (eventId: string) => {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
  const filteredEvents = events.filter((evt: GameEvent) => evt.id !== eventId);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filteredEvents));
};

// Simple user authentication using localStorage
export const auth = {
  currentUser: null as { uid: string; email: string } | null,
  
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // Simple mock authentication - in production you'd validate against a real backend
    if (email && password) {
      const user = { uid: `user_${Date.now()}`, email };
      auth.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user };
    }
    throw new Error('Invalid credentials');
  },
  
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Simple mock user creation
    if (email && password) {
      const user = { uid: `user_${Date.now()}`, email };
      auth.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user };
    }
    throw new Error('Invalid registration data');
  },
  
  signOut: async () => {
    auth.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Check for existing user on initialization
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      auth.currentUser = JSON.parse(savedUser);
      callback(auth.currentUser);
    } else {
      callback(null);
    }
    
    // Return unsubscribe function
    return () => {};
  },
  
  // Helper functions expected by App.tsx
  isAuthenticated: () => auth.currentUser !== null,
  
  signIn: async () => {
    // Auto sign-in for demo purposes
    const user = { uid: `demo_user_${Date.now()}`, email: 'demo@example.com' };
    auth.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }
};

// Database operations using localStorage
export const db = {
  collection: (collectionName: string) => ({
    doc: (docId?: string) => ({
      set: async (data: any) => {
        const key = `${STORAGE_KEYS[collectionName.toUpperCase() as keyof typeof STORAGE_KEYS]}`;
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (docId) {
          // Update existing document
          const index = existingData.findIndex((item: any) => item.id === docId);
          if (index >= 0) {
            existingData[index] = { ...data, id: docId };
          } else {
            existingData.push({ ...data, id: docId });
          }
        } else {
          // Add new document with generated ID
          const id = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          existingData.push({ ...data, id });
        }
        
        localStorage.setItem(key, JSON.stringify(existingData));
        return { id: docId || `${collectionName}_${Date.now()}` };
      },
      
      get: async () => {
        const key = `${STORAGE_KEYS[collectionName.toUpperCase() as keyof typeof STORAGE_KEYS]}`;
        const data = localStorage.getItem(key);
        if (data && docId) {
          const items = JSON.parse(data);
          const item = items.find((item: any) => item.id === docId);
          return {
            exists: !!item,
            data: () => item,
            id: docId
          };
        }
        return { exists: false, data: () => null };
      },
      
      delete: async () => {
        if (docId) {
          const key = `${STORAGE_KEYS[collectionName.toUpperCase() as keyof typeof STORAGE_KEYS]}`;
          const existingData = JSON.parse(localStorage.getItem(key) || '[]');
          const filteredData = existingData.filter((item: any) => item.id !== docId);
          localStorage.setItem(key, JSON.stringify(filteredData));
        }
      }
    }),
    
    get: async () => {
      const key = `${STORAGE_KEYS[collectionName.toUpperCase() as keyof typeof STORAGE_KEYS]}`;
      const data = localStorage.getItem(key);
      const items = data ? JSON.parse(data) : [];
      
      return {
        docs: items.map((item: any) => ({
          id: item.id,
          data: () => item
        }))
      };
    },
    
    add: async (data: any) => {
      const key = `${STORAGE_KEYS[collectionName.toUpperCase() as keyof typeof STORAGE_KEYS]}`;
      const existingData = JSON.parse(localStorage.getItem(key) || '[]');
      const id = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem = { ...data, id };
      existingData.push(newItem);
      localStorage.setItem(key, JSON.stringify(existingData));
      return { id };
    }
  }),
  
  // Helper functions expected by App.tsx
  getLocations: getLocations,
  getEvents: getEvents,
  saveGameState: saveGameState,
  getGameState: loadGameState,
  saveLocation: saveLocation,
  saveEvent: saveEvent,
  deleteLocation: deleteLocation,
  deleteEvent: deleteEvent,
  
  // Additional helper functions for backward compatibility
  saveLocations: async (locations: Record<string, GameLocation>) => {
    for (const location of Object.values(locations)) {
      await saveLocation(location);
    }
  },
  
  saveEvents: async (events: GameEvent[]) => {
    for (const event of events) {
      await saveEvent(event);
    }
  }
};

// Initialize default data if none exists
export const initializeDefaultData = async () => {
  const existingLocations = await getLocations();
  const existingEvents = await getEvents();
  
  if (existingLocations.length === 0) {
    // Add default locations from constants if none exist
    const { DEFAULT_LOCATIONS_DATA } = await import('../utils/constants');
    for (const location of Object.values(DEFAULT_LOCATIONS_DATA)) {
      await saveLocation(location);
    }
  }
  
  if (existingEvents.length === 0) {
    // Add default events from constants if none exist
    const { DEFAULT_GAME_EVENTS_DATA } = await import('../utils/constants');
    for (const event of DEFAULT_GAME_EVENTS_DATA) {
      await saveEvent(event);
    }
  }
};

// Legacy Firebase-style collection references for backward compatibility
export const locationsCollectionRef = 'locations';
export const eventsCollectionRef = 'events';

// Legacy Firebase-style helper function
export const getUserGameDocPath = (userId: string) => `users/${userId}/game`;

// Initialize authentication state
const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
if (savedUser) {
  auth.currentUser = JSON.parse(savedUser);
}