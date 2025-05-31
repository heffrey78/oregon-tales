# Oregon Tales

An interactive adventure game where you explore the beautiful state of Oregon. Manage your resources, discover amazing locations, and experience random events as you journey through the Pacific Northwest.

## Features

- 🗺️ **Explore Oregon**: Visit 10 unique locations from Portland to Crater Lake
- ⛽ **Resource Management**: Monitor fuel, snacks, money, vibes, and car health
- 🎲 **Random Events**: Encounter unexpected situations that affect your journey
- 💾 **Save Progress**: Your adventure is automatically saved to local storage
- 🛠️ **Admin Panel**: Manage game content with built-in admin tools
- 📱 **Responsive Design**: Play on desktop, tablet, or mobile
- 🔒 **No Backend Required**: All data stored locally in your browser

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd oregon-tales
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001` to start playing!

## How It Works

The game uses **localStorage** to persist all data locally in your browser:
- **Game State**: Your current progress, stats, and location
- **Locations**: All game locations and their properties
- **Events**: Random events that can occur during gameplay
- **User Session**: Simple local authentication for data organization

No external backend or account creation required!

## Gameplay

### Objective
Explore Oregon while managing your resources and keeping your vibes high. The game ends if:
- Your vibes drop to 0
- You run out of fuel AND money
- Your car health reaches 0

### Resources
- **Fuel**: Required for travel between locations
- **Snacks**: Consumed when resting to restore vibes
- **Money**: Used for purchases and emergencies
- **Vibes**: Your morale and enthusiasm
- **Car Health**: Vehicle condition affects your journey

### Actions
- **Travel**: Move between connected locations (costs fuel)
- **Rest**: Consume a snack to restore vibes and advance time
- **Activities**: Participate in location-specific activities

## Game Administration

The built-in admin panel allows you to:
- Add/edit/delete locations
- Add/edit/delete random events
- Seed initial game data
- Manage game configuration

Access the admin panel by clicking the settings icon in the top-right corner.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Deployment

This game can be deployed to any static hosting service since it requires no backend:

- **Netlify**: Simple drag-and-drop deployment
- **Vercel**: Git-based deployment with automatic builds  
- **GitHub Pages**: Free hosting for open source projects
- **Surge.sh**: Quick command-line deployment
- **Any web server**: Just serve the built files

### Simple Deployment Example

```bash
# Build the project
npm run build

# Deploy to Netlify (install netlify-cli first)
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Or deploy to Vercel (install vercel-cli first)  
npm install -g vercel
vercel --prod
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Storage**: Browser LocalStorage
- **Icons**: Lucide React
- **No Backend Required**: Pure client-side application

## Project Structure

```
src/
├── components/          # React components
│   ├── AdminPanel.tsx   # Game administration interface
│   ├── GameComponents.tsx # Reusable game UI components
│   └── Modal.tsx        # Modal dialog component
├── services/            # Data storage services
│   └── storage.ts       # LocalStorage management and game data persistence
├── types/               # TypeScript type definitions
│   └── game.ts          # Game-related interfaces
├── utils/               # Utility functions and constants
│   └── constants.ts     # Game constants and default data
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## Development

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

### Development Workflow

1. **Make Changes**: Edit source files in the `src/` directory
2. **Test Locally**: Use `npm run dev` to test your changes
3. **Build**: Run `npm run build` to ensure production build works
4. **Commit**: Follow conventional commit format (e.g., `feat:`, `fix:`, `docs:`)

### Key Files

- `src/App.tsx` - Main game logic and state management
- `src/services/storage.ts` - LocalStorage data persistence
- `src/utils/constants.ts` - Game data and configuration
- `src/components/AdminPanel.tsx` - Content management interface
- `src/types/game.ts` - TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by classic adventure games like Oregon Trail
- Oregon location data and descriptions
- Icons provided by Lucide React
- Built with modern web technologies
