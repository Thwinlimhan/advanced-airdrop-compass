import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { useAuthStore } from '../../stores/authStore';
import { DEFAULT_USER_BADGES } from '../../constants';
import { Award, Star, Sparkles, Droplets, ListChecks, WalletCards, NotebookPen, Lock, CalendarCheck, CheckCircle, HelpCircle } from 'lucide-react'; // Added HelpCircle
import { useTranslation } from '../../hooks/useTranslation';
import { UserBadge } from '../../types';
import { Button } from '../../design-system/components/Button';
import { useToast } from '../../hooks/useToast'; // Added import

const iconComponents: { [key: string]: React.ElementType } = {
  Sparkles, Droplets, ListChecks, WalletCards, NotebookPen, Star, Award, Lock, CalendarCheck, CheckCircle, HelpCircle, // Added HelpCircle for safety
};

const MockStreakBadges: Partial<UserBadge>[] = [ // Using Partial as achievedDate might not be there if not achieved
    { id: 'streak_7_day_mock', name: '7-Day Task Streak', description: 'Completed tasks for 7 consecutive days.', iconName: 'CalendarCheck', achieved: false },
    { id: 'streak_30_day_mock', name: '30-Day Task Master', description: 'Completed tasks for 30 consecutive days!', iconName: 'Award', achieved: false },
    { id: 'streak_90_day_mock', name: '90-Day Farming Legend', description: 'Completed tasks for 90 consecutive days!! Wow!', iconName: 'Star', achieved: false },
];


export const AchievementsPage: React.FC = () => {
  const { userBadges, checkAndAwardBadges: triggerBadgeCheck } = useAuthStore();
  const { t } = useTranslation();
  const { addToast } = useToast(); // Initialized useToast

  const allPossibleBadges = DEFAULT_USER_BADGES;
  const userBadgesList = userBadges || [];

  // Merge default badges with user's achieved status
  const badgesToDisplay: UserBadge[] = allPossibleBadges.map(defaultBadge => {
    const userVersion = userBadgesList.find((ub: UserBadge) => ub.id === defaultBadge.id);
    return userVersion || { ...defaultBadge, achieved: false, achievedDate: undefined };
  });
  
  // Separate achieved and locked based on the merged list
  const achievedBadges = badgesToDisplay.filter(badge => badge.achieved);
  const lockedBadges = badgesToDisplay.filter(badge => !badge.achieved);
  
  // Add mock streak badges to locked if not already defined and achieved. This is conceptual.
  const displayedLockedBadges = [...lockedBadges];
  MockStreakBadges.forEach(mockBadge => {
      if(!badgesToDisplay.find(b => b.id === mockBadge.id)) { // Only add if not part of userBadges/defaultBadges
          displayedLockedBadges.push(mockBadge as UserBadge); // Cast as UserBadge, assuming achieved is false
      }
  });


  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <Award size={32} className="mr-3 text-yellow-500" />
        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">
          {t('nav_achievements', { defaultValue: 'Achievements & Milestones' })}
        </h2>
      </div>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
        Track your progress and celebrate your airdrop farming milestones! New achievements may be added over time.
      </p>
      <Button onClick={() => { triggerBadgeCheck(); addToast('Badge check triggered!', 'info');}} className="mb-6">Re-check Achievements</Button>


      {achievedBadges.length > 0 && (
        <Card className="mb-8">
          <h3 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center">
            <CheckCircle size={24} className="mr-2" /> Unlocked Achievements ({achievedBadges.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {achievedBadges.map(badge => {
              const IconComponent = iconComponents[badge.iconName] || Award;
              return (
                <div key={badge.id} className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <IconComponent size={28} className="mr-3 text-green-500" />
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">{badge.name}</h4>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">{badge.description}</p>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Achieved: {new Date(badge.achievedDate!).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {displayedLockedBadges.length > 0 && (
        <Card>
          <h3 className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center">
            <Lock size={24} className="mr-2" /> Locked Achievements ({displayedLockedBadges.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedLockedBadges.map(badge => {
              const IconComponent = iconComponents[badge.iconName] || HelpCircle;
              return (
                <div key={badge.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg opacity-70">
                  <div className="flex items-center mb-2">
                    <IconComponent size={28} className="mr-3 text-yellow-500" />
                    <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">{badge.name}</h4>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      
      {achievedBadges.length === 0 && displayedLockedBadges.length === 0 && (
          <Card>
            <p className="text-center text-muted-light dark:text-muted-dark py-8">
                No achievements defined yet. Stay tuned for future updates or check your badge logic!
            </p>
          </Card>
      )}

    </PageWrapper>
  );
};