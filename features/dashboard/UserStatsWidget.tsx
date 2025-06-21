import React from 'react';
import { Card, CardHeader } from '../../design-system/components/Card';
import { Award, Star, Sparkles, Droplets, ListChecks, WalletCards, NotebookPen, CalendarCheck } from 'lucide-react'; // Added CalendarCheck
import { useAppContext } from '../../contexts/AppContext';
import { UserBadge } from '../../types';
import { EnhancedLineChart as LineChart } from '../../components/charts/LineChart';
import { ChartData } from 'chart.js';

interface UserStatsWidgetProps {
  points: number;
}

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

const iconComponents: { [key: string]: React.ElementType } = {
  Sparkles, Droplets, ListChecks, WalletCards, NotebookPen, Star, Award, CalendarCheck,
};

// Updated to reflect the new theme for charts
const generatePointsHistoryData = (currentPoints: number, accentColor: string): ChartData<'line'> => {
  const labels: string[] = [];
  const data: number[] = [];
  const daysToTrack = 7; 
  
  let fluctuatingPoints = currentPoints;
  for (let i = 0; i < daysToTrack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysToTrack - 1 - i));
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    if (i < daysToTrack -1) { 
        fluctuatingPoints = Math.max(0, fluctuatingPoints - Math.floor(Math.random() * (currentPoints / (daysToTrack*2) + 5))); 
    }
    data.push(i === daysToTrack - 1 ? currentPoints : Math.max(0, fluctuatingPoints)); 
  }
  
  if(currentPoints > 0) {
      let basePoints = Math.max(0, currentPoints - (50 * daysToTrack)); 
      for(let i=0; i<daysToTrack-1; i++){
          data[i] = Math.max(0, basePoints + Math.floor(Math.random() * 50 * (i+1) * 0.5));
      }
      data[daysToTrack-1] = currentPoints; 
      
      for (let i = 0; i < data.length - 1; i++) {
            if (data[i] > data[i+1] && data[i+1] !== currentPoints ) data[i+1] = Math.min(currentPoints, data[i] + Math.floor(Math.random() * 20));
            if (data[i] > currentPoints) data[i] = Math.floor(currentPoints * (0.8 + Math.random() * 0.1));
        }
        data[data.length - 1] = currentPoints; 
  }

  return {
    labels,
    datasets: [
      {
        label: 'Points Over Time (Simulated)',
        data,
        fill: true, // Enabled for gradient fill
        tension: 0.2,
        borderColor: accentColor, // Use accentColor for line
        backgroundColor: (context) => { // Gradient fill
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
            gradient.addColorStop(0, `${accentColor}66`); // Semi-transparent purple at top
            gradient.addColorStop(1, `${accentColor}00`); // Fully transparent at bottom
            return gradient;
        },
        pointBackgroundColor: accentColor,
        pointBorderColor: accentColor,
      },
    ],
  };
};


export const UserStatsWidget: React.FC<UserStatsWidgetProps> = ({ points }) => {
  const { appData } = useAppContext();
  const { level, progress, nextLevelPoints } = calculateLevel(points);
  const achievedBadges = (appData.userBadges || []).filter(badge => badge.achieved);
  // Pass accent color from settings to chart data generation
  const pointsHistoryChartData = generatePointsHistoryData(points, appData.settings.accentColor || '#885AF8');
  const currentStreak = appData.settings.currentStreak || 0;

  const achievementsContent = achievedBadges.length === 0 ? (
    <p className="text-sm text-muted-dark">No badges unlocked yet. Keep farming!</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
      {achievedBadges.map(badge => {
        const IconComponent = iconComponents[badge.iconName] || Star; 
        return (
          <div key={badge.id} title={`${badge.name}: ${badge.description} (Achieved: ${new Date(badge.achievedDate!).toLocaleDateString()})`} className="flex flex-col items-center p-2 bg-background-dark/50 dark:bg-card-dark/70 rounded-lg text-center hover:shadow-md transition-shadow">
            <IconComponent size={28} className="mb-1 text-accent_yellow" />
            <p className="text-xs font-medium text-white truncate w-full">{badge.name}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader title="Your Stats & Achievements" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Points and Level */}
        <div className="md:col-span-1 flex flex-col items-center justify-around gap-4 p-4 rounded-lg">
          <div className="text-center">
            <Star size={32} className="mx-auto mb-1 text-accent_yellow" />
            <p className="text-4xl font-extrabold text-white">{points.toLocaleString()}</p>
            <p className="text-sm text-muted-dark">Total Points Earned</p>
          </div>
          <div className="text-center w-full">
            <Award size={32} className="mx-auto mb-1 text-accent_yellow" />
            <p className="text-4xl font-extrabold text-white">Level {level}</p>
            <div className="w-full bg-progress_track-dark rounded-full h-2.5 mt-1.5">
              <div 
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
                title={`${points.toLocaleString()}/${nextLevelPoints.toLocaleString()} points to Level ${level+1}`}
              ></div>
            </div>
            <p className="text-xs text-muted-dark mt-1">{points.toLocaleString()} / {nextLevelPoints.toLocaleString()} to Level {level+1}</p>
          </div>
          {currentStreak > 0 && (
            <div className="text-center mt-2">
              <CalendarCheck size={28} className="mx-auto mb-1 text-accent_yellow" />
              <p className="text-xl font-semibold text-white">🔥 {currentStreak} Day Streak!</p>
            </div>
          )}
        </div>

        {/* Middle Column: Achievements */}
        <div className="md:col-span-1 space-y-3">
          <h4 className="text-md font-semibold text-white">Achievements Unlocked:</h4>
          {achievementsContent}
        </div>
        
        {/* Right Column: Points History Chart */}
        <div className="md:col-span-1 space-y-3">
             <h4 className="text-md font-semibold text-white">Points History (Last 7 Days):</h4>
             <div className="h-48"> 
                <LineChart 
                  data={pointsHistoryChartData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { color: 'rgba(167, 167, 167, 0.1)'}, ticks: { color: '#A7A7A7' } },
                      y: { grid: { color: 'rgba(167, 167, 167, 0.1)'}, ticks: { color: '#A7A7A7' } }
                    }
                  }} 
                />
             </div>
        </div>
      </div>
      
      <p className="text-xs text-center mt-4 text-muted-dark">
        Keep completing tasks to earn more points, level up, and unlock achievements!
      </p>
    </Card>
  );
};