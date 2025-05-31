// Local storage service to replace Firebase
import type { GameLocation, GameEvent, GameActivity } from '../types/game';

const STORAGE_KEYS = {
  locations: 'oregon_tales_locations',
  events: 'oregon_tales_events',
  gameState: 'oregon_tales_game_state',
  isAuthenticated: 'oregon_tales_auth'
};

// Simple local authentication
export const localAuth = {
  isAuthenticated: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.isAuthenticated) === 'true';
  },
  
  signIn: (): Promise<boolean> => {
    localStorage.setItem(STORAGE_KEYS.isAuthenticated, 'true');
    return Promise.resolve(true);
  },
  
  signOut: (): void => {
    localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
  },

  onAuthStateChanged: (callback: (isAuth: boolean) => void) => {
    // Simulate Firebase auth state change
    callback(localAuth.isAuthenticated());
    return () => {}; // Return unsubscribe function
  }
};

// Local storage database operations
export const localDB = {
  // Location operations
  saveLocation: async (location: GameLocation): Promise<void> => {
    const locations = localDB.getLocations();
    locations[location.id] = location;
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locations));
  },
  
  getLocations: (): Record<string, GameLocation> => {
    const stored = localStorage.getItem(STORAGE_KEYS.locations);
    return stored ? JSON.parse(stored) : {};
  },
  
  deleteLocation: async (locationId: string): Promise<void> => {
    const locations = localDB.getLocations();
    delete locations[locationId];
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locations));
  },
  
  // Event operations
  saveEvent: async (event: GameEvent): Promise<void> => {
    const events = localDB.getEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  },
  
  getEvents: (): GameEvent[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.events);
    return stored ? JSON.parse(stored) : [];
  },
  
  deleteEvent: async (eventId: string): Promise<void> => {
    const events = localDB.getEvents();
    const filtered = events.filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(filtered));
  },
  
  // Bulk operations
  saveLocations: async (locations: Record<string, GameLocation>): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locations));
  },
  
  saveEvents: async (events: GameEvent[]): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  },
  
  // Game state operations
  saveGameState: async (gameState: any): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.gameState, JSON.stringify(gameState));
  },
  
  getGameState: (): any => {
    const stored = localStorage.getItem(STORAGE_KEYS.gameState);
    return stored ? JSON.parse(stored) : null;
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

// Export for backwards compatibility - these are now just references to localDB
export const db = localDB;
export const auth = localAuth;
export const locationsCollectionRef = 'locations';
export const eventsCollectionRef = 'events';
export const getUserGameDocPath = (userId: string) => `user_${userId}_gameData`;
