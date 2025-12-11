import React from 'react';
import { Card, CardContent } from '../ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, iconBgColor, iconColor }) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-montserrat">{title}</p>
          <p className="text-2xl font-bold text-gray-900 font-montserrat">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
