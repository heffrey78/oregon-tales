# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Oregon Tales is a React/TypeScript adventure game inspired by Oregon Trail. It's a single-page application with no backend dependencies - all data is stored in browser localStorage.

## Development Commands

```bash
npm run dev      # Start development server on port 3000
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Architecture

### Key Design Patterns
- **State Management**: Game state is managed in App.tsx using React hooks and passed down to components
- **Data Persistence**: All data operations go through the service layer (src/services/storage.ts) which abstracts localStorage
- **Type Safety**: All game entities (locations, events, activities) have strict TypeScript interfaces in src/types/game.ts
- **Resource Effects**: Activities and events modify player resources through effect objects that specify resource changes

### Component Organization
- **GameComponents.tsx**: Main game UI components (ResourceBar, LocationView, TravelView, etc.)
- **AdminPanel.tsx**: Admin interface for managing game content
- **admin/forms/**: Form components for creating/editing locations, events, and activities

### Data Flow
1. Game state is initialized from localStorage or default data
2. User actions trigger state updates in App.tsx
3. State changes are automatically persisted to localStorage
4. Components re-render based on new state

## Working with Game Content

### Adding New Features
When adding new game mechanics:
1. Update type definitions in src/types/game.ts
2. Update default data in src/utils/constants.ts
3. Implement data migration in src/services/storage.ts if changing data structures
4. Update relevant components and admin forms

### Resource System
Resources are: fuel, snacks, money, vibes, carHealth
- Effects are specified as objects: `{ fuel: -10, money: -5 }`
- All resource changes go through the game state update logic in App.tsx

### Location System
- Locations have connections to other locations (travel routes)
- Each location has specific activities available
- Travel costs are calculated based on distance and applied as resource effects

## Task Organization

This project uses a structured task management system documented in `tasks/README.md`. When working on the project:

### Required Workflow
1. **Review existing tasks** in the `tasks/` directory before starting work
2. **Create new task files** using the format: `{task-id}-{task-name}.md`
3. **Update task status** as you progress using emojis:
   - ✅ COMPLETE - Task completed and validated
   - 🔄 IN PROGRESS - Currently being worked on
   - ⏱️ PENDING - Queued but not started
   - ⚠️ BLOCKED - Cannot proceed due to dependencies
   - 🔍 REVIEW - Completed but pending review

### Task Structure Requirements
- Three-digit sequential task IDs (001, 002, 003...)
- User story format: "As a {role}, I want {goal} so that {benefit}"
- Clear parent/sub-task relationships for complex work
- Measurable success criteria with checkboxes
- Create retrospective files after completion: `{task-id}-{task-name}-retrospective.md`

### Key Guidelines
- Always check for parent tasks to understand context
- Break complex tasks into sub-tasks
- Update status as work progresses, not just at completion
- Maintain numeric sequence when adding new tasks

## Testing

No testing framework is currently configured. When implementing tests, consider:
- Component testing for UI elements
- Unit tests for game logic calculations
- Integration tests for save/load functionality