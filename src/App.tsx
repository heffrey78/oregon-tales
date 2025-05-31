import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Fuel,
  Apple,
  DollarSign,
  Smile,
  Tent,
  Car,
  ArrowRight,
  Save,
  HelpCircle,
  Sun,
  Moon,
  Settings,
  EyeOff
} from 'lucide-react';

import { Modal } from './components/Modal';
import { StatIcon, PixelCar } from './components/GameComponents';
import { AdminPanel } from './components/AdminPanel';
import type { PlayerStats, GameLocation, GameEvent, GameActivity, GameOverReason } from './types/game';
import { 
  INITIAL_PLAYER_STATS, 
  DEFAULT_LOCATIONS_DATA, 
  DEFAULT_GAME_EVENTS_DATA,
  canPlayerPerformActivity,
  convertStringActivityToGameActivity 
} from './utils/constants';
import { 
  auth, 
  db, 
  locationsCollectionRef, 
  eventsCollectionRef,
  getUserGameDocPath 
} from './services/storage';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [gameLog, setGameLog] = useState<string[]>(["Welcome to Oregon Tales! Your journey begins..."]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [currentEventModal, setCurrentEventModal] = useState<GameEvent | null>(null);
  const [gameOver, setGameOver] = useState<GameOverReason>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Game Configuration Data
  const [gameLocations, setGameLocations] = useState<Record<string, GameLocation>>({});
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);

  // Load game configuration from localStorage
  const loadGameConfig = useCallback(async () => {
    console.log("loadGameConfig: Attempting to load game configuration...");
    setIsConfigLoading(true);
    try {
      const locsData = await db.getLocations();
      const eventsData = await db.getEvents();

      // Convert locations array to object format expected by the game
      const locationsObject: Record<string, GameLocation> = {};
      locsData.forEach(location => {
        locationsObject[location.id] = location;
      });

      if (locsData.length > 0) {
        setGameLocations(locationsObject);
        console.log("loadGameConfig: Locations loaded:", locsData.length);
      } else {
        setGameLocations(DEFAULT_LOCATIONS_DATA);
        console.log("loadGameConfig: No locations found, using defaults");
      }

      if (eventsData.length > 0) {
        setGameEvents(eventsData);
        console.log("loadGameConfig: Events loaded:", eventsData.length);
      } else {
        setGameEvents(DEFAULT_GAME_EVENTS_DATA);
        console.log("loadGameConfig: No events found, using defaults");
      }

      if (locsData.length === 0 && eventsData.length === 0) {
        setGameLog(prev => [...prev, "Game config not found in storage. Consider seeding."]);
      } else {
        setGameLog(prev => [...prev, "Game configuration loaded."]);
      }

    } catch (error) {
      console.error("loadGameConfig: Error loading game configuration:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGameLog(prev => [...prev, `Error loading game config: ${errorMessage}. Using defaults.`]);
      setGameLocations(DEFAULT_LOCATIONS_DATA);
      setGameEvents(DEFAULT_GAME_EVENTS_DATA);
    } finally {
      setIsConfigLoading(false);
      console.log("loadGameConfig: Finished loading game configuration.");
    }
  }, []);

  // Seed initial game data to localStorage
  const seedInitialData = async () => {
    setGameLog(prev => [...prev, "Attempting to seed initial game data..."]);
    if (!auth.isAuthenticated()) {
      setGameLog(prev => [...prev, "Admin Error: Not authenticated. Cannot seed data."]);
      console.error("Admin Error: Not authenticated for seeding.");
      return;
    }
    console.log("User authenticated for seeding");
    try {
      const existingLocations = await db.getLocations();
      const existingEvents = await db.getEvents();

      let seeded = false;

      if (existingLocations.length === 0) {
        console.log("Seeding locations to localStorage...");
        await db.saveLocations(DEFAULT_LOCATIONS_DATA);
        seeded = true;
      } else {
        console.log("Locations already exist, skipping seed.");
      }

      if (existingEvents.length === 0) {
        console.log("Seeding events to localStorage...");
        await db.saveEvents(DEFAULT_GAME_EVENTS_DATA);
        seeded = true;
      } else {
        console.log("Events already exist, skipping seed.");
      }

      if (seeded) {
        setGameLog(prev => [...prev, "Initial game data seeded successfully! Reloading config..."]);
        console.log("Seeding successful.");
        await loadGameConfig();
      } else {
        setGameLog(prev => [...prev, "No new data seeded."]);
      }

    } catch (error) {
      console.error("Error seeding initial data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGameLog(prev => [...prev, `Error seeding data: ${errorMessage}`]);
    }
  };

  // Local Auth Setup
  useEffect(() => {
    console.log("Auth: Setting up local authentication.");
    const isAuthenticated = auth.isAuthenticated();
    
    if (!isAuthenticated) {
      // Auto sign-in for local storage
      auth.signIn().then(() => {
        console.log("Auth: Auto signed in locally.");
        setUserId('local_user');
        setIsAuthReady(true);
      });
    } else {
      console.log("Auth: Already authenticated locally.");
      setUserId('local_user');
      setIsAuthReady(true);
    }
  }, []);

  // Effect to load game configuration
  useEffect(() => {
    if (isAuthReady && userId) {
      console.log("ConfigLoad: Auth ready and userId present. Calling loadGameConfig.");
      loadGameConfig();
    } else if (isAuthReady && !userId) {
      console.warn("ConfigLoad: Auth ready but no userId. Game config will not load. Possible sign-in failure.");
      setIsConfigLoading(false);
      setGameLog(prev => [...prev, "Authentication failed. Cannot load game configuration."]);
    } else {
      console.log("ConfigLoad: Auth not ready or no userId yet. Waiting to load game config.");
    }
  }, [isAuthReady, userId, loadGameConfig]);

  // Load player game or initialize new game
  useEffect(() => {
    if (!isAuthReady || !userId || isConfigLoading) {
      console.log(`PlayerGameLoad: Conditions not met - isAuthReady=${isAuthReady}, userId=${userId}, isConfigLoading=${isConfigLoading}.`);
      if (isAuthReady && !userId && !isConfigLoading) {
        setIsLoading(false);
        console.log("PlayerGameLoad: Auth ready, no user, config not loading. Stopping player data load.");
      }
      return;
    }
    console.log("PlayerGameLoad: Conditions met. UserId:", userId);

    const startingLocation = gameLocations['Portland'] ? 'Portland' : Object.keys(gameLocations)[0] || 'UnknownLocation';
    const dynamicInitialPlayerStats = { ...INITIAL_PLAYER_STATS, currentLocation: startingLocation };
    console.log("PlayerGameLoad: Default starting location:", startingLocation);

    const loadPlayerGame = async () => {
      console.log("PlayerGameLoad: Attempting to load player game from localStorage for user:", userId);
      setIsLoading(true);
      try {
        const savedState = await db.getGameState();
        if (savedState) {
          const data = savedState;
          const loadedLocation = data.currentLocation && gameLocations[data.currentLocation] ? data.currentLocation : startingLocation;
          setPlayerStats({ ...dynamicInitialPlayerStats, ...data, currentLocation: loadedLocation });
          setGameLog(prev => [...prev, "Player game loaded successfully."]);
          console.log("PlayerGameLoad: Player game loaded:", data);
        } else {
          setPlayerStats(dynamicInitialPlayerStats);
          await db.saveGameState(dynamicInitialPlayerStats);
          setGameLog(prev => [...prev, "No player save data found. Starting a new Oregon Tale!"]);
          console.log("PlayerGameLoad: New player game initialized for user:", userId);
        }
      } catch (error) {
        console.error("PlayerGameLoad: Error loading player game:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setGameLog(prev => [...prev, `Error loading player game: ${errorMessage}. Starting fresh.`]);
        setPlayerStats(dynamicInitialPlayerStats);
        try {
          await db.saveGameState(dynamicInitialPlayerStats);
        } catch (saveError) {
          console.error("PlayerGameLoad: Error saving initial game state:", saveError);
        }
      } finally {
        setIsLoading(false);
        console.log("PlayerGameLoad: Finished loading player game for user:", userId);
      }
    };

    if (Object.keys(gameLocations).length > 0) {
      console.log("PlayerGameLoad: Game locations are loaded, proceeding to load player game.");
      loadPlayerGame();
    } else if (!isConfigLoading) {
      console.warn("PlayerGameLoad: Game locations are empty even after config load attempt. Player game load might use default/unknown location.");
      loadPlayerGame();
    } else {
      console.log("PlayerGameLoad: Game locations not yet loaded (or config still loading), player game load deferred.");
    }

  }, [isAuthReady, userId, isConfigLoading, gameLocations]);

  // Save player game state
  const saveGame = useCallback(async () => {
    if (!userId || !isAuthReady) {
      setGameLog(prev => [...prev, "Cannot save: User not authenticated."]);
      return;
    }
    try {
      await db.saveGameState(playerStats);
      setGameLog(prev => [...prev, "Game progress saved!"]);
    } catch (error) {
      console.error("Error saving game:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGameLog(prev => [...prev, `Error saving game: ${errorMessage}`]);
    }
  }, [userId, playerStats, isAuthReady]);

  // Check for game over conditions
  useEffect(() => {
    if (playerStats.vibes <= 0) {
      setGameOver('lost_vibes');
    } else if (playerStats.fuel <= 0 && playerStats.money < 10) {
      setGameOver('lost_fuel_money');
    } else if (playerStats.carHealth <= 0) {
      setGameOver('lost_car');
    }
  }, [playerStats.vibes, playerStats.fuel, playerStats.money, playerStats.carHealth]);

  const handleTravel = (destinationId: string, fuelCost: number) => {
    if (gameOver || !gameLocations[destinationId]) return;
    if (playerStats.fuel < fuelCost) {
      triggerRandomEventById('LOW_FUEL_WARNING_CUSTOM', { 
        destinationName: gameLocations[destinationId].name, 
        fuelNeeded: fuelCost 
      });
      return;
    }

    setPlayerStats(prev => ({
      ...prev,
      fuel: prev.fuel - fuelCost,
      currentLocation: destinationId,
      daysTraveled: prev.daysTraveled + 1,
      timeOfDay: 'Day',
    }));
    setGameLog(prev => [...prev, `Traveled to ${gameLocations[destinationId].name}. Cost: ${fuelCost} fuel. Day ${playerStats.daysTraveled + 1}.`]);

    if (Math.random() < (gameLocations[destinationId].eventChance || 0.15) && gameEvents.length > 0) {
      triggerRandomEventById();
    }
    saveGame();
  };

  const triggerRandomEventById = (eventId?: string, customParams: any = {}) => {
    if (gameOver || gameEvents.length === 0) return;

    let eventToTrigger: GameEvent | undefined;
    if (eventId) {
      eventToTrigger = gameEvents.find(e => e.id === eventId);
      if (eventId === 'LOW_FUEL_WARNING_CUSTOM') {
        eventToTrigger = {
          id: 'LOW_FUEL_WARNING_CUSTOM',
          type: 'urgent',
          message: `Not enough fuel (${playerStats.fuel}) for ${customParams.destinationName} (${customParams.fuelNeeded} needed). Find fuel!`,
          vibeChange: -10
        };
      }
    } else {
      eventToTrigger = gameEvents[Math.floor(Math.random() * gameEvents.length)];
    }

    if (!eventToTrigger) {
      console.warn(`Event with ID ${eventId || 'random'} not found or no events available.`);
      setGameLog(prev => [...prev, `DEBUG: Event ${eventId || 'random'} not found.`]);
      return;
    }

    setCurrentEventModal(eventToTrigger);
    setGameLog(prev => [...prev, `EVENT: ${eventToTrigger.message}`]);

    setPlayerStats(prev => ({
      ...prev,
      vibes: Math.min(100, Math.max(0, prev.vibes + (eventToTrigger.vibeChange || 0))),
      fuel: Math.max(0, prev.fuel + (eventToTrigger.fuelChange || 0)),
      snacks: Math.max(0, prev.snacks + (eventToTrigger.snackChange || 0)),
      money: Math.max(0, prev.money + (eventToTrigger.moneyChange || 0)),
      carHealth: Math.min(100, Math.max(0, prev.carHealth + (eventToTrigger.carHealthChange || 0)))
    }));
  };

  const handleRest = () => {
    if (gameOver) return;
    if (playerStats.snacks <= 0) {
      setGameLog(prev => [...prev, "No snacks for a proper rest! Vibes dip."]);
      setPlayerStats(prev => ({ 
        ...prev, 
        vibes: Math.max(0, prev.vibes - 5), 
        daysTraveled: prev.daysTraveled + 1, 
        timeOfDay: 'Day' 
      }));
      return;
    }
    const vibeGain = playerStats.timeOfDay === 'Night' ? 25 : 15;
    setPlayerStats(prev => ({
      ...prev,
      vibes: Math.min(100, prev.vibes + vibeGain),
      snacks: prev.snacks - 1,
      daysTraveled: prev.daysTraveled + 1,
      timeOfDay: 'Day',
    }));
    setGameLog(prev => [...prev, `Rested. Vibes +${vibeGain}. Snack consumed. It's now Day ${playerStats.daysTraveled + 1}.`]);
    saveGame();
  };

  // Activity effect application function
  const applyActivityEffects = (activity: GameActivity, currentStats: PlayerStats): {
    newStats: PlayerStats;
    message: string;
  } => {
    const costs: string[] = [];
    const gains: string[] = [];
    
    let newStats = { ...currentStats };
    
    // Apply costs
    if (activity.fuelCost) {
      newStats.fuel = Math.max(0, newStats.fuel - activity.fuelCost);
      costs.push(`${activity.fuelCost} fuel`);
    }
    if (activity.moneyCost) {
      newStats.money = Math.max(0, newStats.money - activity.moneyCost);
      costs.push(`$${activity.moneyCost}`);
    }
    if (activity.snackCost) {
      newStats.snacks = Math.max(0, newStats.snacks - activity.snackCost);
      costs.push(`${activity.snackCost} snacks`);
    }
    if (activity.vibeCost) {
      newStats.vibes = Math.max(0, newStats.vibes - activity.vibeCost);
      costs.push(`${activity.vibeCost} vibes`);
    }
    if (activity.timeCost && activity.timeCost > 0) {
      newStats.daysTraveled += activity.timeCost;
      newStats.timeOfDay = 'Day'; // Reset to day after activity
      costs.push(`${activity.timeCost} day${activity.timeCost > 1 ? 's' : ''}`);
    }
    
    // Apply effects/gains
    if (activity.vibeChange) {
      newStats.vibes = Math.min(100, Math.max(0, newStats.vibes + activity.vibeChange));
      if (activity.vibeChange > 0) gains.push(`${activity.vibeChange} vibes`);
    }
    if (activity.fuelChange) {
      newStats.fuel = Math.min(100, Math.max(0, newStats.fuel + activity.fuelChange));
      if (activity.fuelChange > 0) gains.push(`${activity.fuelChange} fuel`);
    }
    if (activity.snackChange) {
      newStats.snacks = Math.min(20, Math.max(0, newStats.snacks + activity.snackChange));
      if (activity.snackChange > 0) gains.push(`${activity.snackChange} snacks`);
    }
    if (activity.moneyChange) {
      newStats.money = Math.max(0, newStats.money + activity.moneyChange);
      if (activity.moneyChange > 0) gains.push(`$${activity.moneyChange}`);
    }
    if (activity.carHealthChange) {
      newStats.carHealth = Math.min(100, Math.max(0, newStats.carHealth + activity.carHealthChange));
      if (activity.carHealthChange > 0) gains.push(`${activity.carHealthChange} car health`);
    }
    
    // Build message
    let message = `Completed: ${activity.name}.`;
    if (costs.length > 0) {
      message += ` Cost: ${costs.join(', ')}.`;
    }
    if (gains.length > 0) {
      message += ` Gained: ${gains.join(', ')}.`;
    }
    
    return { newStats, message };
  };

  // Get activities for current location with backward compatibility
  const getActivitiesForCurrentLocation = (): GameActivity[] => {
    const currentLocationData = gameLocations[playerStats.currentLocation];
    if (!currentLocationData) return [];
    
    // Handle new format
    if (currentLocationData.activities) {
      return currentLocationData.activities;
    }
    
    // Handle legacy format - convert on the fly
    if (currentLocationData.activityNames) {
      return currentLocationData.activityNames.map(name => 
        convertStringActivityToGameActivity(name, currentLocationData.id)
      );
    }
    
    return [];
  };

  // New activity handler using GameActivity objects
  const handleActivity = (activity: GameActivity) => {
    if (gameOver) return;
    
    // 1. Validate player can perform activity
    const validation = canPlayerPerformActivity(activity, playerStats);
    if (!validation.canPerform) {
      setGameLog(prev => [...prev, 
        `Cannot perform ${activity.name}: ${validation.reasons.join(', ')}`
      ]);
      return;
    }
    
    // 2. Apply costs and effects
    const result = applyActivityEffects(activity, playerStats);
    setPlayerStats(result.newStats);
    
    // 3. Log the action and results
    setGameLog(prev => [...prev, result.message]);
    
    // 4. Maybe trigger random event
    const eventChance = activity.eventChance || 0;
    if (eventChance > 0 && Math.random() < eventChance && gameEvents.length > 0) {
      triggerRandomEventById();
    }
    
    // 5. Save game state
    saveGame();
  };

  // Backward compatibility wrapper for legacy string activities
  const handleLegacyActivity = (activityName: string) => {
    const activity: GameActivity = {
      id: `legacy_${activityName.toLowerCase().replace(/\s+/g, '_')}`,
      name: activityName,
      description: `Enjoy ${activityName.toLowerCase()}`,
      vibeChange: 3,
      eventChance: 0.3
    };
    
    handleActivity(activity);
  };

  const restartGame = async () => {
    const startingLocation = gameLocations['Portland'] ? 'Portland' : Object.keys(gameLocations)[0] || 'UnknownLocation';
    const dynamicInitialPlayerStats = { ...INITIAL_PLAYER_STATS, currentLocation: startingLocation };
    setPlayerStats(dynamicInitialPlayerStats);
    setGameLog(["Welcome to Oregon Tales! Your journey begins anew..."]);
    setGameOver(null);
    setCurrentEventModal(null);
    setIsLoading(true);
    if (userId) {
      try {
        await db.saveGameState(dynamicInitialPlayerStats);
      } catch (error) {
        console.error("Error resetting game data:", error);
      }
    }
    setIsLoading(false);
  };

  // Loading screens
  if (!isAuthReady || isConfigLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col justify-center items-center text-white p-4">
        <h1 className="text-4xl font-bold mb-4">Oregon Tales</h1>
        <p className="text-xl">{!isAuthReady ? "Authenticating your travel papers..." : "Loading the Oregon map..."}</p>
        <div className="mt-4 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoading && isAuthReady && userId && !isConfigLoading && Object.keys(gameLocations).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col justify-center items-center text-white p-4">
        <h1 className="text-4xl font-bold mb-4">Oregon Tales</h1>
        <p className="text-xl">Loading your saved adventure...</p>
        <div className="mt-4 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentLocationData = gameLocations[playerStats.currentLocation];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-300 to-blue-400 p-2 sm:p-4 font-sans">
      <header className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-green-700 tracking-tight">Oregon Tales</h1>
            <p className="text-sm text-gray-600">Discover the Beaver State.</p>
            {userId && <p className="text-xs text-gray-500 mt-1">Traveler ID: {userId.substring(0, 12)}...</p>}
          </div>
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            title="Admin Panel"
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow transition-colors"
          >
            {showAdminPanel ? <EyeOff size={24} className="text-gray-700" /> : <Settings size={24} className="text-gray-700" />}
          </button>
        </div>
      </header>

      {showAdminPanel && (
        <AdminPanel
          gameLocations={gameLocations}
          gameEvents={gameEvents}
          loadGameConfig={loadGameConfig}
          seedInitialData={seedInitialData}
          setGameLog={setGameLog}
          isUserAuthenticated={!!userId}
        />
      )}

      {gameOver && (
        <Modal isOpen={!!gameOver} onClose={() => {}} title="Journey's End">
          <div className="text-center">
            <p className="text-xl mb-4">
              {gameOver === 'lost_vibes' ? "Your spirit for adventure has waned." :
                gameOver === 'lost_fuel_money' ? "Stranded and broke, the road ends here." :
                  gameOver === 'lost_car' ? "Your trusty vehicle has given up the ghost." :
                    "The journey has ended."}
            </p>
            <p className="mb-2">You traveled for {playerStats.daysTraveled} days.</p>
            <p className="mb-6">Final location: {currentLocationData?.name || playerStats.currentLocation}</p>
            <button
              onClick={restartGame}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow w-full transition-colors"
            >
              Start a New Journey
            </button>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={!!currentEventModal}
        onClose={() => setCurrentEventModal(null)}
        title={
          currentEventModal?.type === 'positive' ? "Good News!" :
            currentEventModal?.type === 'negative' ? "Uh Oh..." :
              currentEventModal?.type === 'urgent' ? "Heads Up!" :
                "Something Happened!"
        }
      >
        <p className="text-gray-700 mb-2">{currentEventModal?.message}</p>
        {Object.entries(currentEventModal || {}).map(([key, value]) => {
          if (key.endsWith('Change') && value !== 0 && typeof value === 'number') {
            const label = key.replace('Change', '').replace(/([A-Z])/g, ' $1').trim();
            return (
              <p key={key} className="text-sm capitalize">
                {label}: <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
                  {value > 0 ? '+' : ''}{value}
                </span>
              </p>
            );
          }
          return null;
        })}
        <button
          onClick={() => setCurrentEventModal(null)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow w-full transition-colors"
        >
          Okay
        </button>
      </Modal>

      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="How to Play Oregon Tales">
        <div className="space-y-3 text-sm text-gray-700">
          <p>Welcome, traveler! Your goal is to explore Oregon, manage your resources, and keep your vibes high.</p>
          <p><Fuel className="inline h-4 w-4 mr-1 text-orange-500" /><strong>Fuel:</strong> Needed to travel. Runs out, and you might get stuck!</p>
          <p><Apple className="inline h-4 w-4 mr-1 text-red-500" /><strong>Snacks:</strong> Consumed when resting. Keep your energy up.</p>
          <p><DollarSign className="inline h-4 w-4 mr-1 text-green-600" /><strong>Money:</strong> Used for fuel, snacks, repairs, and other opportunities.</p>
          <p><Smile className="inline h-4 w-4 mr-1 text-yellow-500" /><strong>Vibes:</strong> Your morale. If it drops to zero, the journey is over!</p>
          <p><Car className="inline h-4 w-4 mr-1 text-gray-600" /><strong>Car Health:</strong> Keep your ride in good shape. Breakdowns are no fun.</p>
          <p><strong>Actions:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li><strong>Travel:</strong> Choose a destination to move. Consumes fuel and time.</li>
            <li><strong>Rest:</strong> Improves vibes, consumes a snack, advances time.</li>
            <li><strong>Activities:</strong> Explore what your current location has to offer!</li>
          </ul>
          <p>Random events can occur during travel or at locations. Good luck!</p>
          <button
            onClick={() => setShowHelp(false)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow w-full transition-colors"
          >
            Got it!
          </button>
        </div>
      </Modal>

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Player Stats & Controls Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/70 backdrop-blur-md shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Traveler's Logbook</h2>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatIcon icon={<Fuel size={20} className="text-orange-500" />} label="Fuel" value={playerStats.fuel} unit="/100" />
              <StatIcon icon={<Apple size={20} className="text-red-500" />} label="Snacks" value={playerStats.snacks} unit="/20" />
              <StatIcon icon={<DollarSign size={20} className="text-green-600" />} label="Money" value={`$${playerStats.money}`} />
              <StatIcon icon={<Smile size={20} className="text-yellow-500" />} label="Vibes" value={playerStats.vibes} unit="/100" />
              <StatIcon icon={<Car size={20} className="text-gray-600" />} label="Car" value={playerStats.carHealth} unit="/100" />
              <StatIcon 
                icon={playerStats.timeOfDay === 'Day' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-400" />} 
                label="Day" 
                value={`${playerStats.daysTraveled} (${playerStats.timeOfDay})`} 
              />
            </div>
            <PixelCar color="bg-sky-600" />
            <div className="mt-3 space-y-2">
              <button
                onClick={saveGame}
                disabled={isLoading || !isAuthReady || !userId}
                className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
              >
                <Save size={18} className="mr-2" /> Save Progress
              </button>
              <button
                onClick={handleRest}
                disabled={!!gameOver || playerStats.snacks <= 0}
                className="w-full flex items-center justify-center bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
              >
                <Tent size={18} className="mr-2" /> Rest (1 Snack)
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
              >
                <HelpCircle size={18} className="mr-2" /> How to Play
              </button>
            </div>
          </div>
          {/* Narrative Log */}
          <div className="bg-white/70 backdrop-blur-md shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 border-b pb-2">Journey Log</h2>
            <div className="h-48 overflow-y-auto text-sm space-y-1 pr-1">
              {gameLog.slice().reverse().map((entry, index) => (
                <p key={index} className={`p-1.5 rounded ${index === 0 ? 'bg-sky-100/80' : 'bg-gray-50/70'}`}>
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Actions Column */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md shadow-md rounded-xl p-4">
          {currentLocationData ? (
            <>
              <div className="text-center mb-4">
                <span className="text-5xl">{currentLocationData.icon}</span>
                <h2 className="text-2xl font-bold text-indigo-700 mt-1">{currentLocationData.name}</h2>
                <p className="text-md text-gray-600 italic mt-1">{currentLocationData.description}</p>
                <p className="text-sm text-gray-500 mt-1">Day {playerStats.daysTraveled}, {playerStats.timeOfDay}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Local Activities:</h3>
                {(() => {
                  const activities = getActivitiesForCurrentLocation();
                  return activities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activities.map(activity => {
                        const validation = canPlayerPerformActivity(activity, playerStats);
                        const isDisabled = !!gameOver || !validation.canPerform;
                        
                        return (
                          <div key={activity.id} className="relative">
                            <button
                              onClick={() => handleActivity(activity)}
                              disabled={isDisabled}
                              className={`w-full p-3 rounded-lg shadow text-left transition-colors ${
                                isDisabled 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                              }`}
                            >
                              <div className="font-medium">{activity.name}</div>
                              <div className="text-xs mt-1 opacity-75">{activity.description}</div>
                              
                              {/* Cost indicators */}
                              {(activity.fuelCost || activity.moneyCost || activity.snackCost || activity.timeCost) && (
                                <div className="text-xs mt-2 opacity-60">
                                  Costs: {[
                                    activity.fuelCost && `${activity.fuelCost} fuel`,
                                    activity.moneyCost && `$${activity.moneyCost}`,
                                    activity.snackCost && `${activity.snackCost} snacks`,
                                    activity.timeCost && `${activity.timeCost} day${activity.timeCost > 1 ? 's' : ''}`
                                  ].filter(Boolean).join(', ')}
                                </div>
                              )}
                              
                              {/* Effect indicators */}
                              {(activity.vibeChange || activity.fuelChange || activity.snackChange || activity.moneyChange) && (
                                <div className="text-xs mt-1 opacity-60">
                                  Effects: {[
                                    activity.vibeChange && `${activity.vibeChange > 0 ? '+' : ''}${activity.vibeChange} vibes`,
                                    activity.fuelChange && `${activity.fuelChange > 0 ? '+' : ''}${activity.fuelChange} fuel`,
                                    activity.snackChange && `${activity.snackChange > 0 ? '+' : ''}${activity.snackChange} snacks`,
                                    activity.moneyChange && `${activity.moneyChange > 0 ? '+$' : '-$'}${Math.abs(activity.moneyChange)}`
                                  ].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </button>
                            
                            {/* Tooltip for disabled activities */}
                            {isDisabled && !gameOver && (
                              <div className="absolute bottom-full left-0 mb-2 p-2 bg-red-600 text-white text-xs rounded shadow-lg z-10 max-w-48 opacity-0 group-hover:opacity-100 transition-opacity">
                                {validation.reasons.join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No activities available here.</p>
                  );
                })()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Travel Options:</h3>
                {currentLocationData.connections && Object.keys(currentLocationData.connections).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(currentLocationData.connections).map(([destId, cost]) => {
                      const destData = gameLocations[destId];
                      if (!destData) return (
                        <li key={destId} className="text-red-500 text-sm">
                          Error: Destination '{destId}' not found in game data. Admin may need to check connections.
                        </li>
                      );
                      return (
                        <li key={destId}>
                          <button
                            onClick={() => handleTravel(destId, cost)}
                            disabled={!!gameOver || playerStats.fuel < cost}
                            className="w-full flex justify-between items-center bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
                          >
                            <span>To {destData.name}</span>
                            <span className="flex items-center text-sm">
                              <Fuel size={16} className="mr-1 opacity-80" /> {cost} <ArrowRight size={18} className="ml-2" />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="text-sm text-gray-500">No travel options from here. Perhaps it's a scenic dead-end?</p>}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <h2 className="text-xl text-gray-700">Current location data not available.</h2>
              {(isAuthReady && !userId && !isConfigLoading) ? 
                <p className="text-sm text-red-500">Authentication may have failed. Please try refreshing.</p> :
                <p className="text-sm text-gray-500">This might happen if the location ID in your save is no longer in the game's data, or if game data is still loading.</p>
              }
              <p className="text-sm text-gray-500 mt-2">Try restarting the game or checking the Admin Panel to seed data if this is the first run.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
