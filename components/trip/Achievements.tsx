import React from 'react';
import { AchievementCard } from './AchievementCard';
import type { Trip } from '@/lib/stores/trip-store';

interface Achievement {
  id: string;
  label: string;
  value: string;
  icon: string;
}

interface AchievementsProps {
  trip: Trip;
}

export const Achievements: React.FC<AchievementsProps> = ({ trip }) => {
  const { attributes, sections } = trip;

  const totalSegeln = sections.reduce(
    (sum, sec) => sum + (sec.sailSeaKm || 0) + (sec.sailInlandKm || 0),
    0,
  );
  const totalSchleusen = sections.reduce((sum, sec) => sum + (sec.schleusen || 0), 0);
  const totalMotor = sections.reduce((sum, sec) => sum + (sec.motorKm || 0), 0);

  const achievements: Achievement[] = [
    {
      id: 'sail',
      label: 'Segelstrecke',
      value: `${totalSegeln.toFixed(1)} km`,
      icon: 'pi pi-send',
    },
    {
      id: 'lock',
      label: 'Schleusen',
      value: `${totalSchleusen} passiert`,
      icon: 'pi pi-stop-circle',
    },
    {
      id: 'group',
      label: 'Gemeinschaft',
      value: 'Bonus aktiv',
      icon: 'pi pi-users',
    },
    {
      id: 'motor',
      label: 'Motorfahrt',
      value: `${totalMotor.toFixed(1)} km`,
      icon: 'pi pi-cog',
    },
  ].filter((a) => {
    if (a.id === 'sail') return totalSegeln > 0;
    if (a.id === 'lock') return totalSchleusen > 0;
    if (a.id === 'group') return attributes?.isGroup;
    if (a.id === 'motor') return totalMotor > 0;
    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {achievements.map((item) => (
        <div key={item.id} className="relative">
          <AchievementCard achievement={item} />
          <i className="pi pi-check-circle text-xl text-green-500 absolute top-4 right-4" />
        </div>
      ))}
    </div>
  );
};
