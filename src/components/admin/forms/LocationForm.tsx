import React, { FC } from 'react';
import { FormField } from '../FormField';
import { FormSection } from '../FormSection';
import { AdminActionButton } from '../AdminActionButton';
import { EmojiPicker } from '../EmojiPicker';
import type { GameActivity, GameLocation } from '../../../types/game';

interface EditingLocation extends Omit<GameLocation, 'connections' | 'activityNames'> {
  connectionsStr: string;
  activityNamesStr: string;
}

interface LocationFormProps {
  location: EditingLocation | null;
  onSave: (e: React.FormEvent) => void;
  onChange: React.Dispatch<React.SetStateAction<EditingLocation | null>>;
  isUserAuthenticated: boolean;
  activities: GameActivity[];
}

export const LocationForm: FC<LocationFormProps> = ({
  location,
  onSave,
  onChange,
  isUserAuthenticated,
  activities
}) => {
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  
  if (!location) return null;

  const handleChange = (key: keyof EditingLocation, value: string | number) => {
    onChange(prev => prev ? {...prev, [key]: value} : null);
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <FormSection title="Basic Information">
        <FormField label="Location ID" className="col-span-2">
          <input 
            type="text" 
            value={location.id || ''} 
            onChange={e => handleChange('id', e.target.value)} 
            className={inputClass} 
            required 
          />
        </FormField>
        
        <FormField label="Name" className="col-span-3">
          <input 
            type="text" 
            value={location.name || ''} 
            onChange={e => handleChange('name', e.target.value)} 
            className={inputClass} 
            required 
          />
        </FormField>
      </FormSection>
      
      <FormField label="Description">
        <textarea 
          value={location.description || ''} 
          onChange={e => handleChange('description', e.target.value)} 
          className={inputClass} 
          rows={2} 
          required 
        />
      </FormField>
      
      <FormSection title="Appearance">
        <FormField label="Icon (emoji)" className="col-span-2">
          <EmojiPicker 
            value={location.icon || ''} 
            onChange={(emoji) => handleChange('icon', emoji)}
          />
        </FormField>
      </FormSection>
      
      <FormSection title="Gameplay Settings">
        <FormField 
          label="Connections" 
          helpText="JSON format: {'destination': fuelCost}" 
          className="col-span-3"
        >
          <input 
            type="text" 
            value={location.connectionsStr || '{}'} 
            onChange={e => handleChange('connectionsStr', e.target.value)} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Event Chance" className="col-span-2">
          <input 
            type="number" 
            step="0.01" 
            min="0"
            max="1"
            value={location.eventChance || 0.15} 
            onChange={e => handleChange('eventChance', parseFloat(e.target.value))} 
            className={inputClass} 
          />
        </FormField>
      </FormSection>
      
      <FormField label="Activities">
        <div className="text-sm text-gray-600 mb-2">
          Use the Activity Management section to add/edit activities for this location.
        </div>
        <div className="bg-gray-100 p-3 rounded text-sm">
          {activities.length} activities configured
        </div>
      </FormField>
      
      <div className="pt-4 sticky bottom-0 bg-white pb-4">
        <AdminActionButton
          type="submit"
          disabled={!isUserAuthenticated}
          variant="success"
          className="w-full"
        >
          Save Location
        </AdminActionButton>
      </div>
    </form>
  );
};
