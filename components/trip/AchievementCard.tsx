import React from 'react';

export interface Achievement {
  id: string;
  label: string;
  value: string;
  icon: string;
}

interface AchievementProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementProps> = ({ achievement }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
        <i className={`${achievement.icon} text-xl`} />
      </div>
      <div>
        <div className="font-bold text-gray-800">{achievement.label}</div>
        <div className="text-sm text-gray-500">{achievement.value}</div>
      </div>
    </div>
  </div>
);
