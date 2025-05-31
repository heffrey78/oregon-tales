import { FC } from 'react';

interface StatIconProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

export const StatIcon: FC<StatIconProps> = ({ icon, label, value, unit = '' }) => (
  <div className="flex items-center space-x-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow hover:shadow-md transition-shadow">
    {icon}
    <span className="font-semibold">:</span>
    <span className="font-mono">{value}{unit}</span>
  </div>
);

interface PixelCarProps {
  color?: string;
}

export const PixelCar: FC<PixelCarProps> = ({ color = 'bg-blue-500' }) => (
  <div className="flex flex-col items-center my-2">
    <div className="text-xs text-gray-600">Your Trusty Ride</div>
    <div className={`w-16 h-8 ${color} rounded-t-md relative shadow-lg`}>
      <div className="absolute -bottom-1 right-2 w-4 h-4 bg-gray-700 rounded-full"></div>
      <div className="absolute -bottom-1 left-2 w-4 h-4 bg-gray-700 rounded-full"></div>
      <div className="absolute top-1 left-3 w-6 h-3 bg-blue-300 rounded-sm opacity-75"></div>
    </div>
  </div>
);
