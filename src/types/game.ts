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

export interface GameActivity {
  id: string;
  name: string;
  description: string;
  
  // Costs (what player pays to do activity)
  fuelCost?: number;
  snackCost?: number;
  moneyCost?: number;
  timeCost?: number; // advances daysTraveled
  vibeCost?: number; // some activities might be tiring
  
  // Rewards/Effects (what player gains from activity)
  vibeChange?: number;
  fuelChange?: number;
  snackChange?: number;
  moneyChange?: number;
  carHealthChange?: number;
  
  // Meta properties
  eventChance?: number; // chance to trigger random event after activity
  requiredResources?: {
    fuel?: number;
    snacks?: number;
    money?: number;
    vibes?: number;
    carHealth?: number;
  };
  
  // Gameplay modifiers
  oneTimeOnly?: boolean; // can only be done once per location visit
  repeatable?: boolean; // can be done multiple times (default true)
  cooldown?: number; // days before can repeat
}

// Activity result for feedback to player
export interface ActivityResult {
  success: boolean;
  message: string;
  effects: {
    vibeChange?: number;
    fuelChange?: number;
    snackChange?: number;
    moneyChange?: number;
    carHealthChange?: number;
    timeAdvanced?: boolean;
  };
  triggeredEvent?: boolean;
}

export interface GameLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  connections: Record<string, number>; // destination ID -> fuel cost
  
  // Activity system (new approach)
  activities?: GameActivity[];
  
  // Backward compatibility (deprecated)
  activityNames?: string[];
  
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

// Helper function types for activity system
export type ActivityValidator = (activity: GameActivity, playerStats: PlayerStats) => {
  canPerform: boolean;
  reasons: string[];
};

export type ActivityEffectApplier = (activity: GameActivity, playerStats: PlayerStats) => {
  newStats: PlayerStats;
  result: ActivityResult;
};

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
