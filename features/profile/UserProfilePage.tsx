import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { UserFarmingPreferences, UserBadge as UserBadgeType, AppSettings } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { UserCircle, Edit3, Save, XCircle, Award, BarChart3, Star, Sparkles, Droplets, ListChecks, WalletCards, NotebookPen, CalendarCheck, ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';
import { ProfilePreferencesForm } from './ProfilePreferencesForm';
import { DEFAULT_USER_FARMING_PREFERENCES } from '../../constants'; // Import default preferences

const iconComponents: { [key: string]: React.ElementType } = {
  Sparkles, Droplets, ListChecks, WalletCards, NotebookPen, Star, Award, CalendarCheck, ShieldCheck, TrendingUp, UserCircle, HelpCircle,
};

const calculateLevel = (points: number): { level: number; progress: number; nextLevelPoints: number } => {
  let level = 1;
  let pointsForNextLevel = 100;
  let accumulatedPointsForLevel = 0;
  while (points >= accumulatedPointsForLevel + pointsForNextLevel) {
    accumulatedPointsForLevel += pointsForNextLevel;
    level++;
    pointsForNextLevel = Math.floor(pointsForNextLevel * 1.5);
  }
  const pointsIntoCurrentLevel = points - accumulatedPointsForLevel;
  const progress = (pointsIntoCurrentLevel / pointsForNextLevel) * 100;
  return { level, progress: Math.min(progress, 100), nextLevelPoints: accumulatedPointsForLevel + pointsForNextLevel };
};


export const UserProfilePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { settings, updateSettings } = useSettingsStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editableUsername, setEditableUsername] = useState(currentUser?.username || '');
  const [editableEmail, setEditableEmail] = useState(currentUser?.email || '');

  const [preferences, setPreferences] = useState<UserFarmingPreferences>(
    settings.userPreferences || DEFAULT_USER_FARMING_PREFERENCES
  );
  
  useEffect(() => {
    const newPrefs = settings.userPreferences || DEFAULT_USER_FARMING_PREFERENCES;
    if (JSON.stringify(preferences) !== JSON.stringify(newPrefs)) {
      setPreferences(newPrefs);
    }
  }, [settings.userPreferences]);


  const handleDetailsSave = async () => {
    // Conceptual: In a real app, this would call a backend API to update user details.
    // For now, it's just a UI simulation.
    if (currentUser) {
      // Simulating an update. Real update would go through context -> API -> context update.
      // For now, we can't directly change currentUser in AppContext from here without API.
      addToast(t('profile_details_updated_conceptual', {defaultValue: 'Profile details update simulated.'}), 'info');
    }
    setIsEditingDetails(false);
  };

  const handlePreferencesSave = async (newPreferences: UserFarmingPreferences) => {
    const updatedSettings: Partial<AppSettings> = { userPreferences: newPreferences };
    await updateSettings(updatedSettings);
    addToast(t('profile_preferences_saved', {defaultValue: 'Farming preferences saved!'}), 'success');
  };
  
  const userPoints = settings.userPoints || 0;
  const { level, progress, nextLevelPoints } = calculateLevel(userPoints);
  const currentStreak = settings.currentStreak || 0;
  const userBadges: UserBadgeType[] = settings.userBadges || [];

  if (!currentUser) {
    return <PageWrapper><p>{t('common_loading', {defaultValue: 'Loading user profile...'})}</p></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <UserCircle size={32} className="mr-3 text-[var(--color-text-primary)]" />
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
          {t('profile_page_title', {defaultValue: 'My Profile'})}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Details Card */}
        <Card>
          <CardHeader><h3 className="text-lg font-semibold">{t('profile_user_details_title', {defaultValue: 'User Details'})}</h3></CardHeader>
          <CardContent>
          {isEditingDetails ? (
            <div className="space-y-4">
              <Input
                id="profileUsername"
                label={t('profile_username_label', {defaultValue: 'Username'})}
                value={editableUsername}
                onChange={(e) => setEditableUsername(e.target.value)}
              />
              <Input
                id="profileEmail"
                type="email"
                label={t('profile_email_label', {defaultValue: 'Email'})}
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
              />
              <div className="flex space-x-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditingDetails(false)} leftIcon={<XCircle size={16}/>}>{t('common_cancel')}</Button>
                <Button onClick={handleDetailsSave} leftIcon={<Save size={16}/>}>{t('common_save')}</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong className="text-[var(--color-text-secondary)]">{t('profile_username_label', {defaultValue: 'Username'})}:</strong> {currentUser.username}</p>
              <p><strong className="text-[var(--color-text-secondary)]">{t('profile_email_label', {defaultValue: 'Email'})}:</strong> {currentUser.email}</p>
              <Button variant="outline" size="sm" onClick={() => setIsEditingDetails(true)} leftIcon={<Edit3 size={14}/>} className="mt-3">
                {t('profile_edit_details_button', {defaultValue: 'Edit Details (Conceptual)'})}
              </Button>
            </div>
          )}
          </CardContent>
        </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader><h3 className="text-lg font-semibold">{t('profile_stats_title', {defaultValue: 'Your Stats'})}</h3></CardHeader>
            <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                      <Star size={28} className="mx-auto mb-1 text-yellow-400"/>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{userPoints.toLocaleString()}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{t('profile_total_points_label', {defaultValue: 'Total Points'})}</p>
                  </div>
                  <div>
                      <Award size={28} className="mx-auto mb-1 text-teal-400"/>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{t('profile_level_label', {defaultValue: 'Level'})} {level}</p>
                      <div className="w-full bg-[var(--color-surface-secondary)] rounded-full h-1.5 mt-1 mx-auto max-w-[100px]">
                          <div className="bg-[var(--color-accent)] h-1.5 rounded-full" style={{ width: `${progress}%`}}></div>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">{progress.toFixed(0)}% to Level {level+1}</p>
                  </div>
                  <div>
                      <CalendarCheck size={28} className="mx-auto mb-1 text-pink-400"/>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{currentStreak} {t('profile_days_label', {defaultValue: 'Days'})}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{t('profile_task_streak_label', {defaultValue: 'Task Streak'})}</p>
                  </div>
             </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="md:col-span-3">
            <CardHeader><h3 className="text-lg font-semibold">{t('profile_farming_preferences_title', {defaultValue: 'Airdrop Farming Preferences'})}</h3></CardHeader>
            <CardContent>
            <ProfilePreferencesForm
              initialPreferences={preferences}
              onSave={handlePreferencesSave}
            />
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="md:col-span-3">
            <CardHeader><h3 className="text-lg font-semibold">{t('profile_achievements_title', {defaultValue: 'Achievements & Badges'})}</h3></CardHeader>
            <CardContent>
            {userBadges.filter(b => b.achieved).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userBadges.filter(b => b.achieved).map(badge => {
                  const Icon = iconComponents[badge.iconName] || Award;
                  return (
                    <div key={badge.id} className="flex flex-col items-center p-3 bg-[var(--color-surface-secondary)] rounded-lg text-center shadow-sm" title={`${badge.description} - Achieved: ${new Date(badge.achievedDate!).toLocaleDateString()}`}>
                      <Icon size={32} className="mb-1.5 text-yellow-400" />
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate w-full">{badge.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Achieved: {new Date(badge.achievedDate!).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[var(--color-text-secondary)] text-center py-4">{t('profile_no_badges_message', {defaultValue: 'No badges unlocked yet. Keep farming!'})}</p>
            )}
            </CardContent>
          </Card>
      </div>
    </PageWrapper>
  );
};