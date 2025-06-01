import { GameActivity, GameEvent, GameLocation } from '../types/game';

// Default emoji categories for activities based on keywords in name/description
const ACTIVITY_ICON_MAP: Record<string, string[]> = {
  '🌲': ['hike', 'nature', 'walk', 'trail', 'forest', 'mountain', 'outdoor'],
  '🍽️': ['eat', 'food', 'restaurant', 'dining', 'meal', 'breakfast', 'lunch', 'dinner'],
  '🎭': ['theater', 'show', 'performance', 'play', 'festival', 'concert', 'music'],
  '🏛️': ['museum', 'history', 'culture', 'gallery', 'exhibit', 'tour'],
  '🏖️': ['beach', 'ocean', 'coast', 'sand', 'tide', 'shore'],
  '🛒': ['shop', 'shopping', 'store', 'market', 'buy'],
  '🚶': ['visit', 'explore', 'wander', 'stroll'],
  '🚗': ['drive', 'road', 'trip', 'car', 'route'],
  '🏕️': ['camp', 'camping', 'tent', 'night', 'fire'],
  '📸': ['photo', 'picture', 'camera', 'view', 'viewpoint', 'lookout'],
  '🏃': ['run', 'jog', 'exercise', 'sport'],
  '🛌': ['rest', 'sleep', 'motel', 'hotel', 'stay', 'lodge'],
  '🎣': ['fish', 'fishing', 'catch', 'river', 'lake'],
  '🥾': ['hike', 'trek', 'trail'],
  '☕': ['coffee', 'tea', 'cafe', 'brew'],
  '🍺': ['beer', 'brewery', 'drink', 'pub', 'bar'],
  '🍦': ['ice cream', 'dessert', 'sweet', 'treat']
};

// Default event icons based on type
export const EVENT_ICON_MAP: Record<string, string> = {
  'positive': '✨',
  'negative': '⚠️',
  'neutral': '💬',
  'urgent': '🚨'
};

/**
 * Generate a suitable emoji icon for an activity based on its name and description
 */
export const generateActivityIcon = (activity: GameActivity): string => {
  const textToMatch = `${activity.name.toLowerCase()} ${activity.description.toLowerCase()}`;
  
  for (const [emoji, keywords] of Object.entries(ACTIVITY_ICON_MAP)) {
    for (const keyword of keywords) {
      if (textToMatch.includes(keyword)) {
        return emoji;
      }
    }
  }
  
  // Default fallback icon if no match found
  return '🔍';
};

/**
 * Add missing icons to activities in a location
 */
export const addIconsToLocationActivities = (location: GameLocation): GameLocation => {
  if (!location.activities || location.activities.length === 0) {
    return location;
  }
  
  const updatedActivities = location.activities.map(activity => {
    if (!activity.icon) {
      return {
        ...activity,
        icon: generateActivityIcon(activity)
      };
    }
    return activity;
  });
  
  return {
    ...location,
    activities: updatedActivities
  };
};

/**
 * Add missing icons to events
 */
export const addIconsToEvent = (event: GameEvent): GameEvent => {
  if (!event.icon) {
    return {
      ...event,
      icon: EVENT_ICON_MAP[event.type] || '💬'
    };
  }
  return event;
};
