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
