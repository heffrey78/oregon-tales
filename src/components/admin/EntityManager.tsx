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
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <AdminActionButton
        onClick={onAddNew}
        disabled={!isUserAuthenticated}
        icon={<PlusSquare size={18} />}
        variant="primary"
        className="mb-4"
      >
        Add New {title.replace(/Manage\s/, '')}
      </AdminActionButton>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);
