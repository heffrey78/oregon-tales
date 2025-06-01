# Task 010: Emoji Icons for Game Entities

**User Story**: As a game developer, I want to enhance locations, activities, and events with emoji-based icons, so that these entities have visual identifiers that improve user experience and game aesthetics.

## Status: ✅ COMPLETE

## Parent Task: None
## Sub Tasks: None

## Description
Currently, locations already support an icon property (emoji), but there's no convenient picker available in the admin interface. Additionally, activities and events don't have icon properties at all. This task aims to add emoji icon support to all three entity types in a consistent way and provide an emoji picker in the admin interface for easier selection.

## Implementation Details

### Type Definitions Updates
- Update `GameActivity` interface in `game.ts` to add an `icon` string property
- Update `GameEvent` interface in `game.ts` to add an `icon` string property

### UI Components Development
- Create a reusable `EmojiPicker` component with the following features:
  - Modal display of categorized emoji options
  - Search functionality for finding specific emojis
  - Recently used/favorites section
  - Preview functionality to see selected emoji
- Integrate emoji picker in all entity forms (Location, Activity, Event)

### Storage Updates
- Update storage service to handle the new properties
- Ensure backward compatibility for existing data without icons
- Add migration function to set default icons for existing entities if needed

### Form Updates
- Modify `LocationForm.tsx` to replace the current text input with the new emoji picker
- Update `ActivityForm.tsx` to add emoji icon selection
- Update `EventForm.tsx` to add emoji icon selection

### UI Display Updates
- Update entity cards to prominently display the associated emoji icons
- Ensure consistent styling of emoji icons across the application
- Add fallback icons for entities without an assigned emoji

## Success Criteria
- [x] Type definitions updated to include icon property for all entity types
- [x] Reusable EmojiPicker component created
- [x] EmojiPicker integrated in all entity forms
- [x] Storage functionality updated to handle the new properties
- [x] Entity cards and list views updated to display emoji icons
- [x] Admin users can successfully add and edit emoji icons for all entity types
- [x] Game interface displays the appropriate emoji icons for entities
- [x] Backward compatibility maintained for existing data

## Technical Considerations
- The emoji picker should work well on both desktop and mobile devices
- Consider using an existing emoji picker library to avoid reinventing the wheel
- Ensure the selected emojis render properly across different platforms/browsers
- Consider adding validation to ensure only single emojis are used, not emoji sequences
- Provide a set of default/suggested emojis appropriate for each entity type
