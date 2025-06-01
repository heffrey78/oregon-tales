# Task 009: Unify Admin Panel Styles

**User Story**: As a user of the admin panel, I want a consistent look and feel across all management sections (locations, events, activities), so that the admin experience is more intuitive and easier to use.

## Status: ✅ COMPLETED

## Parent Task: 002
## Sub Tasks: None
## Dependencies: 006 (Update Admin Interface)

## Description
Currently, the admin panel has slightly different styles and implementations for managing locations, events, and activities. This task aims to unify the admin interface by extracting reusable components, standardizing the UI patterns, and improving the overall consistency of the admin experience.

## Implementation Details

### Current State Analysis

#### Common Patterns Found
- Entity list displays (locations, events, activities)
- Add/Edit/Delete operations for each entity type
- Modal forms with text inputs, number inputs, and other form controls
- Form validation and submission handling
- Entity card displays with similar information layouts

#### Inconsistencies to Address
- Different styling between location, event, and activity cards
- Inconsistent form layouts and sectioning
- Duplicated code for form submission and validation logic
- Different modal sizes and structures
- Varying button styles and positions

### Proposed Reusable Components

#### 1. EntityCard Component
Create a reusable card component for displaying entities in lists:

```tsx
// src/components/admin/EntityCard.tsx
import { FC, ReactNode } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

interface EntityCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  metadata?: { label: string; value: string }[];
  onEdit: () => void;
  onDelete: () => void;
  isUserAuthenticated: boolean;
  additionalContent?: ReactNode;
}

export const EntityCard: FC<EntityCardProps> = ({
  title,
  subtitle,
  icon,
  metadata = [],
  onEdit,
  onDelete,
  isUserAuthenticated,
  additionalContent
}) => (
  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
    <div className="flex items-center space-x-3">
      {icon && <span className="text-2xl">{icon}</span>}
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        {metadata.length > 0 && (
          <div className="text-xs text-gray-400">
            {metadata.map((item, index) => (
              <span key={index} className="capitalize">
                {item.label}: {item.value}
                {index < metadata.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        )}
        {additionalContent}
      </div>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={onEdit}
        disabled={!isUserAuthenticated}
        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center"
      >
        <Edit3 size={14} className="mr-1" /> Edit
      </button>
      <button
        onClick={onDelete}
        disabled={!isUserAuthenticated}
        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center"
      >
        <Trash2 size={14} className="mr-1" /> Delete
      </button>
    </div>
  </div>
);
```

#### 2. FormField Component
Create a reusable form field component:

```tsx
// src/components/admin/FormField.tsx
import { FC, ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
  helpText?: string;
}

export const FormField: FC<FormFieldProps> = ({
  label,
  htmlFor,
  className = '',
  children,
  helpText
}) => {
  const labelClass = "block text-sm font-medium text-gray-700";
  
  return (
    <div className={`${className}`}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
```

#### 3. FormSection Component
Create a component to group related form fields:

```tsx
// src/components/admin/FormSection.tsx
import { FC, ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection: FC<FormSectionProps> = ({ title, children }) => (
  <div className="border-t pt-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {children}
    </div>
  </div>
);
```

#### 4. AdminActionButton Component
Create a unified button component for admin actions:

```tsx
// src/components/admin/AdminActionButton.tsx
import { FC, ReactNode } from 'react';

interface AdminActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AdminActionButton: FC<AdminActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseClass = "flex items-center rounded font-semibold disabled:bg-gray-400";
  
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2",
    lg: "px-4 py-2 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

#### 5. EntityManager Component
Create a higher-level component to manage entity lists:

```tsx
// src/components/admin/EntityManager.tsx
import { FC, ReactNode } from 'react';
import { PlusSquare } from 'lucide-react';
import { AdminActionButton } from './AdminActionButton';

interface EntityManagerProps {
  title: string;
  icon?: ReactNode;
  onAddNew: () => void;
  isUserAuthenticated: boolean;
  children: ReactNode;
}

export const EntityManager: FC<EntityManagerProps> = ({
  title,
  icon,
  onAddNew,
  isUserAuthenticated,
  children
}) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h3>
    <AdminActionButton
      onClick={onAddNew}
      disabled={!isUserAuthenticated}
      icon={<PlusSquare size={18} />}
      variant="primary"
      className="mb-2"
    >
      Add New {title.replace(/Manage\s/, '')}
    </AdminActionButton>
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {children}
    </div>
  </div>
);
```

### Component Organization

Create a proper structure for admin components:

```
src/
  components/
    admin/
      EntityCard.tsx
      FormField.tsx
      FormSection.tsx
      AdminActionButton.tsx
      EntityManager.tsx
      forms/
        LocationForm.tsx
        EventForm.tsx
        ActivityForm.tsx
```

### Implementation Plan

#### Phase 1: Extract Common Components
1. Create base components described above
2. Update imports in AdminPanel.tsx

#### Phase 2: Refactor Entity Management
1. Replace location management with EntityManager + EntityCard
2. Replace event management with EntityManager + EntityCard
3. Update activity cards with the new EntityCard

#### Phase 3: Refactor Form Management
1. Create LocationForm, EventForm, and ActivityForm components
2. Use FormField and FormSection to structure these forms
3. Standardize form layout and section grouping

#### Phase 4: Standardize Validation and API Logic
1. Create consistent validation patterns across entities
2. Standardize error handling and feedback mechanisms
3. Extract common CRUD operation patterns

### Code Changes

#### AdminPanel.tsx (After Refactoring)

```tsx
// src/components/AdminPanel.tsx
import { FC, useState, Dispatch, SetStateAction } from 'react';
import { PlusSquare, Edit3, Trash2, UploadCloud, Activity, MapPin, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { db } from '../services/storage';
import { DEFAULT_LOCATIONS_DATA, DEFAULT_GAME_EVENTS_DATA } from '../utils/constants';
import type { GameLocation, GameEvent, GameActivity } from '../types/game';

// Import new admin components
import { EntityCard } from './admin/EntityCard';
import { EntityManager } from './admin/EntityManager';
import { AdminActionButton } from './admin/AdminActionButton';
import { LocationForm } from './admin/forms/LocationForm';
import { EventForm } from './admin/forms/EventForm';
import { ActivityForm } from './admin/forms/ActivityForm';

// Interface definitions remain the same
// ...

export const AdminPanel: FC<AdminPanelProps> = ({
  // props remain the same
}) => {
  // State management remains largely the same
  // ...

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
      <AdminActionButton
        onClick={seedInitialData}
        disabled={!isUserAuthenticated}
        icon={<UploadCloud size={18} />}
        variant="success"
        size="lg"
        className="mb-4"
      >
        Seed Initial Locations & Events (if empty)
      </AdminActionButton>

      {/* Locations Management */}
      <EntityManager
        title="Manage Locations"
        icon={<MapPin />}
        onAddNew={() => {
          setEditingLocation({
            id: '',
            name: '',
            description: '',
            icon: '📍',
            connectionsStr: '{}',
            activityNamesStr: '',
            eventChance: 0.15
          });
          setShowLocationForm(true);
        }}
        isUserAuthenticated={isUserAuthenticated}
      >
        {(Object.values(gameLocations) as GameLocation[]).map(location => (
          <EntityCard
            key={location.id}
            title={location.name}
            subtitle={location.description}
            icon={location.icon}
            metadata={[{ label: 'connections', value: String(Object.keys(location.connections || {}).length) }]}
            onEdit={() => handleEditLocation(location)}
            onDelete={() => deleteLocation(location.id)}
            isUserAuthenticated={isUserAuthenticated}
          />
        ))}
      </EntityManager>

      {/* Events Management */}
      <EntityManager
        title="Manage Events"
        icon={<AlertTriangle />}
        onAddNew={() => {
          setEditingEvent({
            id: '',
            type: 'neutral',
            message: '',
            vibeChange: 0,
            fuelChange: 0,
            snackChange: 0,
            moneyChange: 0,
            carHealthChange: 0
          });
          setShowEventForm(true);
        }}
        isUserAuthenticated={isUserAuthenticated}
      >
        {(gameEvents as GameEvent[]).map((event: GameEvent) => (
          <EntityCard
            key={event.id}
            title={event.id}
            subtitle={event.message}
            metadata={[{ label: 'type', value: event.type }]}
            onEdit={() => handleEditEvent(event)}
            onDelete={() => deleteEvent(event.id)}
            isUserAuthenticated={isUserAuthenticated}
          />
        ))}
      </EntityManager>

      {/* Activity Management */}
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
            <Activity size={24} className="mr-2" /> Activity Management
          </h2>
          
          {/* Location selector remains the same */}
          {/* ... */}
          
          {selectedLocationForActivity && (
            <>
              <AdminActionButton
                onClick={() => {
                  setEditingActivity({
                    id: '',
                    name: '',
                    description: '',
                    vibeChange: 0,
                    fuelCost: 0,
                    moneyCost: 0,
                    snackCost: 0,
                    timeCost: 0,
                    eventChance: 0
                  });
                  setShowActivityForm(true);
                }}
                disabled={!isUserAuthenticated}
                icon={<PlusSquare size={18} />}
                variant="primary"
                className="mb-2"
              >
                Add Activity
              </AdminActionButton>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getActivitiesForLocation(selectedLocationForActivity).map(activity => (
                  <EntityCard 
                    key={activity.id}
                    title={activity.name}
                    subtitle={activity.description}
                    onEdit={() => handleEditActivity(activity)}
                    onDelete={() => handleDeleteActivity(activity.id)}
                    isUserAuthenticated={isUserAuthenticated}
                    additionalContent={
                      <>
                        {/* Costs display */}
                        <div className="mt-2 text-xs text-gray-500">
                          {[
                            activity.fuelCost && `${activity.fuelCost} fuel`,
                            activity.moneyCost && `$${activity.moneyCost}`,
                            activity.snackCost && `${activity.snackCost} snacks`,
                            activity.timeCost && `${activity.timeCost} day${activity.timeCost > 1 ? 's' : ''}`,
                            activity.vibeCost && `${activity.vibeCost} vibes`
                          ].filter(Boolean).join(' • ') || 'No costs'}
                        </div>
                        
                        {/* Effects display */}
                        <div className="mt-1 text-xs text-green-600">
                          {[
                            activity.vibeChange && `${activity.vibeChange > 0 ? '+' : ''}${activity.vibeChange} vibes`,
                            activity.fuelChange && `${activity.fuelChange > 0 ? '+' : ''}${activity.fuelChange} fuel`,
                            activity.snackChange && `${activity.snackChange > 0 ? '+' : ''}${activity.snackChange} snacks`,
                            activity.moneyChange && `${activity.moneyChange > 0 ? '+$' : '-$'}${Math.abs(activity.moneyChange)}`,
                            activity.carHealthChange && `${activity.carHealthChange > 0 ? '+' : ''}${activity.carHealthChange} car health`
                          ].filter(Boolean).join(' • ') || 'No effects'}
                        </div>
                        
                        {/* Event chance */}
                        {activity.eventChance && activity.eventChance > 0 && (
                          <div className="mt-1 text-xs text-purple-600">
                            {Math.round(activity.eventChance * 100)}% event chance
                          </div>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Location Form Modal */}
      <Modal 
        isOpen={showLocationForm} 
        onClose={() => setShowLocationForm(false)} 
        title={editingLocation?.id ? "Edit Location" : "Add New Location"} 
        size="lg"
      >
        <LocationForm
          location={editingLocation}
          onSave={saveLocation}
          onChange={setEditingLocation}
          isUserAuthenticated={isUserAuthenticated}
          activities={editingLocation ? getActivitiesForLocation(editingLocation.id) : []}
        />
      </Modal>

      {/* Event Form Modal */}
      <Modal 
        isOpen={showEventForm} 
        onClose={() => setShowEventForm(false)} 
        title={editingEvent?.id ? "Edit Event" : "Add New Event"} 
        size="lg"
      >
        <EventForm
          event={editingEvent}
          onSave={saveEvent}
          onChange={setEditingEvent}
          isUserAuthenticated={isUserAuthenticated}
        />
      </Modal>

      {/* Activity Form Modal */}
      <Modal 
        isOpen={showActivityForm} 
        onClose={() => setShowActivityForm(false)} 
        title={editingActivity?.id ? "Edit Activity" : "Add New Activity"} 
        size="xl"
      >
        <ActivityForm
          activity={editingActivity}
          onSave={saveActivity}
          onChange={setEditingActivity}
          isUserAuthenticated={isUserAuthenticated}
        />
      </Modal>
    </div>
  );
};
```

### Testing Plan

1. Visual regression testing to ensure UI looks consistent
2. Functional testing to verify all admin operations still work
3. Accessibility testing to ensure the refactored components maintain accessibility

### Success Criteria

- Consistent styling across all entity management sections
- Reduced code duplication through component extraction
- Improved maintainability through clear component hierarchy
- All existing functionality preserved after refactoring
- Intuitive and consistent user interactions

## Implementation Steps

1. ✅ Create reusable admin component files
2. ✅ Create form component files
3. ✅ Refactor AdminPanel.tsx to use the new components
4. ✅ Test all functionality to ensure it works properly
5. ✅ Verify visual consistency across all sections

## Estimated Effort: 12-18 hours
## Actual Effort: Completed on June 1, 2025
