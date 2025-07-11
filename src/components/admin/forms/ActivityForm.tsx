import React, { FC } from 'react';
import { FormField } from '../FormField';
import { FormSection } from '../FormSection';
import { AdminActionButton } from '../AdminActionButton';
import { EmojiPicker } from '../EmojiPicker';
import type { GameActivity, GameEvent } from '../../../types/game';

interface ActivityFormProps {
  activity: GameActivity | null;
  onSave: (e: React.FormEvent) => void;
  onChange: React.Dispatch<React.SetStateAction<GameActivity | null>>;
  isUserAuthenticated: boolean;
  gameEvents: GameEvent[];
}

export const ActivityForm: FC<ActivityFormProps> = ({
  activity,
  onSave,
  onChange,
  isUserAuthenticated,
  gameEvents
}) => {
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  
  if (!activity) return null;

  const handleChange = (key: keyof GameActivity, value: string | number) => {
    onChange(prev => prev ? {...prev, [key]: value} : null);
  };

  const handleRequiredResourceChange = (resourceKey: 'fuel' | 'snacks' | 'money' | 'vibes' | 'carHealth', value: number | undefined) => {
    onChange(prev => {
      if (!prev) return null;
      
      const requiredResources = {...(prev.requiredResources || {})};
      if (value !== undefined && value > 0) {
        requiredResources[resourceKey] = value;
      } else {
        delete requiredResources[resourceKey];
      }
      
      return {
        ...prev,
        requiredResources: Object.keys(requiredResources).length > 0 ? requiredResources : undefined
      };
    });
  };

  const handleAssignedEventChange = (eventId: string, isAssigned: boolean) => {
    onChange(prev => {
      if (!prev) return null;
      
      const assignedEventIds = [...(prev.assignedEventIds || [])];
      if (isAssigned && !assignedEventIds.includes(eventId)) {
        assignedEventIds.push(eventId);
      } else if (!isAssigned) {
        const index = assignedEventIds.indexOf(eventId);
        if (index > -1) assignedEventIds.splice(index, 1);
      }
      
      return {
        ...prev,
        assignedEventIds: assignedEventIds.length > 0 ? assignedEventIds : undefined
      };
    });
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      {/* Basic Information */}
      <FormSection title="Basic Information">
        <FormField label="Activity ID" className="col-span-2">
          <input 
            type="text" 
            value={activity.id || ''} 
            onChange={e => handleChange('id', e.target.value)} 
            className={inputClass} 
            required 
            placeholder="unique_activity_id"
          />
        </FormField>
        
        <FormField label="Activity Name" className="col-span-3">
          <input 
            type="text" 
            value={activity.name || ''} 
            onChange={e => handleChange('name', e.target.value)} 
            className={inputClass} 
            required 
            placeholder="Visit Local Museum"
          />
        </FormField>

        <FormField label="Icon (emoji)" className="col-span-2">
          <EmojiPicker 
            value={activity.icon || ''}
            onChange={(emoji) => handleChange('icon', emoji)}
          />
        </FormField>
      </FormSection>
      
      <FormField label="Description">
        <textarea 
          value={activity.description || ''} 
          onChange={e => handleChange('description', e.target.value)} 
          className={inputClass} 
          rows={3}
          required
          placeholder="Learn about local history and culture"
        />
      </FormField>
      
      {/* Costs Section */}
      <FormSection title="Costs (What player pays)">
        <FormField label="Fuel Cost" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.fuelCost || 0} 
            onChange={e => handleChange('fuelCost', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Money Cost ($)" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.moneyCost || 0} 
            onChange={e => handleChange('moneyCost', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Snack Cost" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.snackCost || 0} 
            onChange={e => handleChange('snackCost', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Vibe Cost" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.vibeCost || 0} 
            onChange={e => handleChange('vibeCost', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Time Cost (days)" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.timeCost || 0} 
            onChange={e => handleChange('timeCost', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
      </FormSection>
      
      {/* Effects Section */}
      <FormSection title="Effects (What player gains/loses)">
        <FormField label="Vibe Change" className="col-span-1">
          <input 
            type="number" 
            value={activity.vibeChange || 0} 
            onChange={e => handleChange('vibeChange', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Fuel Change" className="col-span-1">
          <input 
            type="number" 
            value={activity.fuelChange || 0} 
            onChange={e => handleChange('fuelChange', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Snack Change" className="col-span-1">
          <input 
            type="number" 
            value={activity.snackChange || 0} 
            onChange={e => handleChange('snackChange', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Money Change" className="col-span-1">
          <input 
            type="number" 
            value={activity.moneyChange || 0} 
            onChange={e => handleChange('moneyChange', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Car Health Change" className="col-span-1">
          <input 
            type="number" 
            value={activity.carHealthChange || 0} 
            onChange={e => handleChange('carHealthChange', parseInt(e.target.value) || 0)} 
            className={inputClass} 
          />
        </FormField>
      </FormSection>
      
      {/* Advanced Options */}
      <FormSection title="Advanced Options">
        <FormField label="Event Chance (0-100%)" className="col-span-2">
          <input 
            type="number" 
            step="0.01"
            min="0"
            max="1"
            value={activity.eventChance || 0} 
            onChange={e => handleChange('eventChance', parseFloat(e.target.value) || 0)} 
            className={inputClass} 
          />
          <p className="text-xs text-gray-500 mt-1">Fallback chance for random events when no assigned events trigger</p>
        </FormField>
      </FormSection>

      {/* Assigned Events Section */}
      <FormSection title="Assigned Events">
        <div className="col-span-full">
          <p className="text-sm text-gray-600 mb-3">
            Select events that can be triggered by this activity. Assigned events have higher probability than random events.
          </p>
          {gameEvents.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {gameEvents.map(event => (
                <label key={event.id} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activity.assignedEventIds?.includes(event.id) || false}
                    onChange={e => handleAssignedEventChange(event.id, e.target.checked)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{event.icon || '💬'}</span>
                      <span className="font-medium text-sm">{event.id}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{event.type}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{event.message}</p>
                    {(event.baseChance || event.activityMultiplier) && (
                      <p className="text-xs text-purple-600 mt-1">
                        Base: {Math.round((event.baseChance || 0.15) * 100)}% 
                        {event.activityMultiplier && ` × ${event.activityMultiplier} = ${Math.round((event.baseChance || 0.15) * (event.activityMultiplier || 1) * 100)}%`}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No events available. Create some events first.</p>
          )}
          {activity.assignedEventIds && activity.assignedEventIds.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Selected: {activity.assignedEventIds.length} event{activity.assignedEventIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </FormSection>
      
      {/* Requirements Section */}
      <FormSection title="Minimum Requirements">
        <FormField label="Required Fuel" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.requiredResources?.fuel || 0} 
            onChange={e => handleRequiredResourceChange('fuel', parseInt(e.target.value) || undefined)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Required Money ($)" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.requiredResources?.money || 0} 
            onChange={e => handleRequiredResourceChange('money', parseInt(e.target.value) || undefined)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Required Vibes" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.requiredResources?.vibes || 0} 
            onChange={e => handleRequiredResourceChange('vibes', parseInt(e.target.value) || undefined)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Required Car Health" className="col-span-1">
          <input 
            type="number" 
            min="0"
            value={activity.requiredResources?.carHealth || 0} 
            onChange={e => handleRequiredResourceChange('carHealth', parseInt(e.target.value) || undefined)} 
            className={inputClass} 
          />
        </FormField>
      </FormSection>
      
      <div className="pt-4 sticky bottom-0 bg-white pb-4">
        <AdminActionButton
          type="submit"
          disabled={!isUserAuthenticated}
          variant="success"
          className="w-full"
        >
          Save Activity
        </AdminActionButton>
      </div>
    </form>
  );
};
