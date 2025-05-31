export interface PlayerStats {
  fuel: number;
  snacks: number;
  money: number;
  vibes: number;
  carHealth: number;
  daysTraveled: number;
  timeOfDay: 'Day' | 'Night';
  currentLocation: string;
}

export interface GameLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  connections: Record<string, number>; // destination ID -> fuel cost
  activityNames: string[];
  eventChance: number;
}

export interface GameEvent {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'urgent';
  message: string;
  vibeChange?: number;
  fuelChange?: number;
  snackChange?: number;
  moneyChange?: number;
  carHealthChange?: number;
}

export type GameOverReason = 'lost_vibes' | 'lost_fuel_money' | 'lost_car' | null;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Global type declarations for Vite environment variables
declare global {
  const __firebase_config: string;
  const __app_id: string;
  const __initial_auth_token: string;
}
