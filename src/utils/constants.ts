import type { PlayerStats, GameLocation, GameEvent, GameActivity } from '../types/game';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  fuel: 100,
  snacks: 10,
  money: 200,
  vibes: 75,
  carHealth: 100,
  daysTraveled: 0,
  timeOfDay: 'Day',
  currentLocation: 'Portland',
};

export const DEFAULT_LOCATIONS_DATA: Record<string, GameLocation> = {
  'Portland': {
    id: 'Portland',
    name: 'Portland, Rose City',
    description: 'A vibrant city known for its food trucks, coffee culture, and quirky "Keep Portland Weird" spirit.',
    icon: '🏙️',
    connections: { 'Salem': 5, 'Cannon Beach': 4, 'Mount Hood': 3, 'The Dalles': 5 },
    activityNames: ['Visit Powell\'s Books', 'Grab Voodoo Doughnuts'],
    eventChance: 0.2
  },
  'Salem': {
    id: 'Salem',
    name: 'Salem, The Capital',
    description: 'Oregon\'s state capital, home to government buildings and historic sites.',
    icon: '🏛️',
    connections: { 'Portland': 5, 'Eugene': 6 },
    activityNames: ['Tour the State Capitol'],
    eventChance: 0.15
  },
  'Eugene': {
    id: 'Eugene',
    name: 'Eugene, Track Town USA',
    description: 'Home to the University of Oregon and legendary track and field programs.',
    icon: '🌲',
    connections: { 'Salem': 6, 'Ashland': 10, 'Bend': 8 },
    activityNames: ['Run Pre\'s Trail'],
    eventChance: 0.2
  },
  'Ashland': {
    id: 'Ashland',
    name: 'Ashland, Shakespeare\'s Town',
    description: 'Famous for the Oregon Shakespeare Festival and artistic community.',
    icon: '🎭',
    connections: { 'Eugene': 10, 'Crater Lake': 7 },
    activityNames: ['Catch a play'],
    eventChance: 0.1
  },
  'Bend': {
    id: 'Bend',
    name: 'Bend, Outdoor Paradise',
    description: 'A haven for outdoor enthusiasts with skiing, hiking, and craft beer.',
    icon: '🏞️',
    connections: { 'Eugene': 8, 'Crater Lake': 6, 'John Day Fossil Beds': 9 },
    activityNames: ['Hike Pilot Butte'],
    eventChance: 0.25
  },
  'Crater Lake': {
    id: 'Crater Lake',
    name: 'Crater Lake National Park',
    description: 'Breathtakingly deep blue lake formed in a volcanic caldera.',
    icon: '🌋',
    connections: { 'Ashland': 7, 'Bend': 6 },
    activityNames: ['Drive the Rim Village'],
    eventChance: 0.3
  },
  'Cannon Beach': {
    id: 'Cannon Beach',
    name: 'Cannon Beach, Coastal Gem',
    description: 'Iconic Haystack Rock and pristine Pacific coastline.',
    icon: '🏖️',
    connections: { 'Portland': 4 },
    activityNames: ['Explore tide pools'],
    eventChance: 0.2
  },
  'Mount Hood': {
    id: 'Mount Hood',
    name: 'Mount Hood, Majestic Peak',
    description: 'Oregon\'s highest peak, perfect for skiing and mountaineering.',
    icon: '🏔️',
    connections: { 'Portland': 3, 'The Dalles': 4 },
    activityNames: ['Visit Timberline Lodge'],
    eventChance: 0.25
  },
  'The Dalles': {
    id: 'The Dalles',
    name: 'The Dalles, Historic Rivertown',
    description: 'Historic town on the Columbia River with rich pioneer history.',
    icon: '🛶',
    connections: { 'Portland': 5, 'Mount Hood': 4 },
    activityNames: ['Visit Columbia Gorge Discovery Center'],
    eventChance: 0.15
  },
  'John Day Fossil Beds': {
    id: 'John Day Fossil Beds',
    name: 'John Day Fossil Beds',
    description: 'Journey back in time through colorful painted hills and ancient fossils.',
    icon: '🦴',
    connections: { 'Bend': 9 },
    activityNames: ['Hike the Painted Hills'],
    eventChance: 0.3
  }
};

export const DEFAULT_GAME_EVENTS_DATA: GameEvent[] = [
  {
    id: 'GOOD_WEATHER',
    type: 'positive',
    message: "Beautiful sunny skies! Everyone's feeling great.",
    vibeChange: 10,
    fuelChange: 0,
    moneyChange: 0,
    snackChange: 0,
    carHealthChange: 0
  },
  {
    id: 'FOUND_SNACKS',
    type: 'positive',
    message: "You found a forgotten bag of trail mix!",
    vibeChange: 5,
    snackChange: 2
  },
  {
    id: 'LOCAL_TIP',
    type: 'neutral',
    message: "A friendly local gave you a tip about a hidden gem.",
    vibeChange: 5
  },
  {
    id: 'RAINY_DAY',
    type: 'negative',
    message: "It's pouring rain. Dampens the mood.",
    vibeChange: -5
  },
  {
    id: 'POTHOLE',
    type: 'negative',
    message: "Ouch! Hit a nasty pothole.",
    vibeChange: -5,
    carHealthChange: -5
  },
  {
    id: 'FRIENDLY_STRANGER',
    type: 'positive',
    message: "A kind stranger offers you some homemade cookies!",
    vibeChange: 8,
    snackChange: 1
  },
  {
    id: 'CAR_TROUBLE',
    type: 'negative',
    message: "Your car makes a concerning noise. Time for some maintenance.",
    carHealthChange: -10,
    vibeChange: -3
  },
  {
    id: 'SCENIC_VIEW',
    type: 'positive',
    message: "You stop at a breathtaking viewpoint. Oregon's beauty lifts your spirits!",
    vibeChange: 12
  },
  {
    id: 'TRAFFIC_JAM',
    type: 'negative',
    message: "Stuck in unexpected traffic. This is frustrating!",
    vibeChange: -8,
    fuelChange: -2
  },
  {
    id: 'ROADSIDE_ASSISTANCE',
    type: 'positive',
    message: "AAA shows up just when you need them most!",
    carHealthChange: 15,
    vibeChange: 5
  }
];

// Activity templates for converting legacy string activities
export const DEFAULT_ACTIVITY_TEMPLATES: Record<string, Partial<GameActivity>[]> = {
  city: [
    {
      name: 'Explore Downtown',
      description: 'Walk around the city center',
      moneyCost: 0,
      vibeChange: 5,
      timeCost: 1
    },
    {
      name: 'Visit Local Museum',
      description: 'Learn about local history and culture',
      moneyCost: 12,
      vibeChange: 8,
      timeCost: 1
    }
  ],
  nature: [
    {
      name: 'Scenic Hike',
      description: 'Take a refreshing nature walk',
      moneyCost: 0,
      vibeChange: 12,
      timeCost: 1,
      carHealthChange: -2 // dirt roads wear on car
    }
  ],
  beach: [
    {
      name: 'Beach Walk',
      description: 'Stroll along the shoreline',
      moneyCost: 0,
      vibeChange: 8,
      timeCost: 1
    },
    {
      name: 'Tide Pool Exploration',
      description: 'Discover marine life in tide pools',
      moneyCost: 0,
      vibeChange: 10,
      timeCost: 1,
      eventChance: 0.15
    }
  ]
};

// Validation and utility functions
export const validateActivity = (activity: GameActivity): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!activity.id) errors.push('Activity must have an ID');
  if (!activity.name) errors.push('Activity must have a name');
  if (!activity.description) errors.push('Activity must have a description');
  
  // Validate costs are not negative
  if (activity.fuelCost && activity.fuelCost < 0) errors.push('Fuel cost cannot be negative');
  if (activity.moneyCost && activity.moneyCost < 0) errors.push('Money cost cannot be negative');
  if (activity.snackCost && activity.snackCost < 0) errors.push('Snack cost cannot be negative');
  
  // Validate event chance is between 0 and 1
  if (activity.eventChance && (activity.eventChance < 0 || activity.eventChance > 1)) {
    errors.push('Event chance must be between 0 and 1');
  }
  
  return { valid: errors.length === 0, errors };
};

export const canPlayerPerformActivity = (activity: GameActivity, playerStats: PlayerStats): { 
  canPerform: boolean; 
  reasons: string[] 
} => {
  const reasons: string[] = [];
  
  // Check costs
  if (activity.fuelCost && playerStats.fuel < activity.fuelCost) {
    reasons.push(`Need ${activity.fuelCost} fuel (have ${playerStats.fuel})`);
  }
  if (activity.moneyCost && playerStats.money < activity.moneyCost) {
    reasons.push(`Need $${activity.moneyCost} (have $${playerStats.money})`);
  }
  if (activity.snackCost && playerStats.snacks < activity.snackCost) {
    reasons.push(`Need ${activity.snackCost} snacks (have ${playerStats.snacks})`);
  }
  
  // Check requirements
  if (activity.requiredResources) {
    const req = activity.requiredResources;
    if (req.fuel && playerStats.fuel < req.fuel) {
      reasons.push(`Need at least ${req.fuel} fuel`);
    }
    if (req.money && playerStats.money < req.money) {
      reasons.push(`Need at least $${req.money}`);
    }
    if (req.vibes && playerStats.vibes < req.vibes) {
      reasons.push(`Need at least ${req.vibes} vibes`);
    }
    if (req.carHealth && playerStats.carHealth < req.carHealth) {
      reasons.push(`Car needs at least ${req.carHealth} health`);
    }
  }
  
  return { canPerform: reasons.length === 0, reasons };
};

// Migration utilities
export const convertStringActivityToGameActivity = (
  activityName: string, 
  locationId: string
): GameActivity => {
  // Convert legacy string activities to basic GameActivity objects
  return {
    id: `${locationId}_${activityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: activityName,
    description: `Enjoy ${activityName.toLowerCase()} at this location`,
    vibeChange: 3, // Default from current implementation
    eventChance: 0.3, // Default from current implementation
    timeCost: 0 // Don't advance time for migrated activities
  };
};

export const migrateLocationData = (location: GameLocation): GameLocation => {
  // Convert legacy format to new format
  if (location.activityNames && !location.activities) {
    return {
      ...location,
      activities: location.activityNames.map(name => 
        convertStringActivityToGameActivity(name, location.id)
      ),
      // Keep activityNames for backward compatibility
      activityNames: location.activityNames
    };
  }
  return location;
};
