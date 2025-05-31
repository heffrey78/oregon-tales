import type { PlayerStats, GameLocation, GameEvent } from '../types/game';

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
