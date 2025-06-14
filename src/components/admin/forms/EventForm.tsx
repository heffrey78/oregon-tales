import React, { FC } from 'react';
import { FormField } from '../FormField';
import { FormSection } from '../FormSection';
import { AdminActionButton } from '../AdminActionButton';
import { EmojiPicker } from '../EmojiPicker';
import type { GameEvent } from '../../../types/game';

interface EventFormProps {
  event: GameEvent | null;
  onSave: (e: React.FormEvent) => void;
  onChange: React.Dispatch<React.SetStateAction<GameEvent | null>>;
  isUserAuthenticated: boolean;
}

export const EventForm: FC<EventFormProps> = ({
  event,
  onSave,
  onChange,
  isUserAuthenticated
}) => {
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  
  if (!event) return null;

  const handleChange = (key: keyof GameEvent, value: string | number) => {
    onChange(prev => prev ? {...prev, [key]: value} : null);
  };

  return (
    <form onSubmit={onSave} className="space-y-4">
      <FormSection title="Basic Information">
        <FormField label="Event ID" className="col-span-2">
          <input 
            type="text" 
            value={event.id || ''} 
            onChange={e => handleChange('id', e.target.value)} 
            className={inputClass} 
            required 
          />
        </FormField>
        
        <FormField label="Type" className="col-span-3">
          <select 
            value={event.type || 'neutral'} 
            onChange={e => handleChange('type', e.target.value)} 
            className={inputClass}
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="urgent">Urgent</option>
          </select>
        </FormField>

        <FormField label="Icon (emoji)" className="col-span-2">
          <EmojiPicker 
            value={event.icon || ''}
            onChange={(emoji) => handleChange('icon', emoji)}
          />
        </FormField>
      </FormSection>
      
      <FormField label="Message">
        <textarea 
          value={event.message || ''} 
          onChange={e => handleChange('message', e.target.value)} 
          className={inputClass} 
          rows={2} 
          required
        />
      </FormField>
      
      <FormSection title="Game Effects">
        <FormField label="Vibe Change" className="col-span-1">
          <input 
            type="number" 
            value={event.vibeChange || 0} 
            onChange={e => handleChange('vibeChange', parseInt(e.target.value))} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Fuel Change" className="col-span-1">
          <input 
            type="number" 
            value={event.fuelChange || 0} 
            onChange={e => handleChange('fuelChange', parseInt(e.target.value))} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Snack Change" className="col-span-1">
          <input 
            type="number" 
            value={event.snackChange || 0} 
            onChange={e => handleChange('snackChange', parseInt(e.target.value))} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Money Change" className="col-span-1">
          <input 
            type="number" 
            value={event.moneyChange || 0} 
            onChange={e => handleChange('moneyChange', parseInt(e.target.value))} 
            className={inputClass} 
          />
        </FormField>
        
        <FormField label="Car Health Change" className="col-span-1">
          <input 
            type="number" 
            value={event.carHealthChange || 0} 
            onChange={e => handleChange('carHealthChange', parseInt(e.target.value))} 
            className={inputClass} 
          />
        </FormField>
      </FormSection>

      <FormSection title="Event Probability">
        <FormField label="Base Chance (0-100%)" className="col-span-1">
          <input 
            type="number" 
            step="0.01"
            min="0"
            max="1"
            value={event.baseChance || 0.15} 
            onChange={e => handleChange('baseChance', parseFloat(e.target.value) || 0.15)} 
            className={inputClass} 
          />
          <p className="text-xs text-gray-500 mt-1">Default probability when triggered randomly</p>
        </FormField>
        
        <FormField label="Activity Multiplier" className="col-span-1">
          <input 
            type="number" 
            step="0.1"
            min="0.1"
            max="10"
            value={event.activityMultiplier || 2.0} 
            onChange={e => handleChange('activityMultiplier', parseFloat(e.target.value) || 2.0)} 
            className={inputClass} 
          />
          <p className="text-xs text-gray-500 mt-1">Multiplier applied when triggered by assigned activities</p>
        </FormField>

        <div className="col-span-full">
          <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
            <strong>Enhanced Probability:</strong> {Math.round((event.baseChance || 0.15) * (event.activityMultiplier || 2.0) * 100)}%
            {(event.baseChance || 0.15) * (event.activityMultiplier || 2.0) > 1.0 && (
              <span className="text-orange-600"> (capped at 100%)</span>
            )}
          </div>
        </div>
      </FormSection>
      
      <div className="pt-4 sticky bottom-0 bg-white pb-4">
        <AdminActionButton
          type="submit"
          disabled={!isUserAuthenticated}
          variant="success"
          className="w-full"
        >
          Save Event
        </AdminActionButton>
      </div>
    </form>
  );
};
