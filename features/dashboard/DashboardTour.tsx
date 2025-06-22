import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { useSettingsStore } from '../../stores/settingsStore';
import { CheckCircle, ArrowRight, ArrowLeft, Lightbulb, LayoutDashboard, Zap, ListChecks, MessageCircle, UserCircle } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  icon?: React.ElementType;
}

const DASHBOARD_TOUR_COMPLETED_KEY = 'dashboardTourCompleted';

const steps: TutorialStep[] = [
  {
    title: "Welcome to Your Dashboard!",
    content: "This quick tour will guide you through the main sections of your dashboard. Let's get started!",
    icon: Lightbulb,
  },
  {
    title: "Summary Stats",
    content: "At the top, you'll find key metrics like active airdrops, tasks completed, upcoming tasks, and estimated potential value of your tracked airdrops.",
    icon: LayoutDashboard,
  },
  {
    title: "User Stats",
    content: "Track your progress! Earn points by completing tasks and see your current level here.",
    icon: UserCircle,
  },
  {
    title: "Priority Tasks",
    content: "This widget shows your most urgent tasks, including overdue items and upcoming deadlines for both airdrops and recurring tasks.",
    icon: ListChecks,
  },
  {
    title: "Multi-Chain Gas Fees",
    content: "Keep an eye on current gas prices for your selected networks. You can customize these networks in Settings.",
    icon: Zap,
  },
  {
    title: "Airdrop Alerts & News",
    content: "Log important news, reminders, or custom alerts related to your airdrop activities here.",
    icon: MessageCircle,
  },
  {
    title: "You're All Set!",
    content: "That's a brief overview of your dashboard. You can reorder these widgets by dragging them, and customize their visibility in Settings. Happy farming!",
    icon: CheckCircle,
  }
];

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardTour: React.FC<DashboardTourProps> = ({ isOpen, onClose }) => {
  const { settings, markTutorialAsCompleted } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);

  // This effect is important if isOpen can change AFTER the component mounts
  // e.g. if it's controlled by a parent state that might change not just on mount.
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0); 
    }
  }, [isOpen]);

  const isCompleted = settings.tutorialsCompleted?.[DASHBOARD_TOUR_COMPLETED_KEY];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    markTutorialAsCompleted(DASHBOARD_TOUR_COMPLETED_KEY);
    onClose();
  };
  
  if (!isOpen) {
    return null;
  }

  const step = steps[currentStep];
  const StepIcon = step.icon || Lightbulb;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
        <div className="flex items-center">
            <StepIcon size={20} className="mr-2 text-yellow-400"/> {step.title} (Step {currentStep + 1}/{steps.length})
        </div>
    } size="md">
      <div className="my-4 text-sm text-text-light dark:text-text-dark">
        {step.content}
      </div>
      
      {currentStep === steps.length - 1 && !isCompleted && (
         <div className="p-3 bg-green-50 dark:bg-green-800 rounded-md text-green-700 dark:text-green-200 mb-4 text-sm">
            <CheckCircle size={18} className="inline mr-2" />
            You've reached the end! Click "Finish Tour" to mark it as completed.
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrev} leftIcon={<ArrowLeft size={16}/>}>
              Previous
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-light dark:text-muted-dark">{currentStep + 1} / {steps.length}</span>
            {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} rightIcon={<ArrowRight size={16}/>}>
                Next
            </Button>
            ) : (
            <Button onClick={handleComplete} variant="secondary" leftIcon={<CheckCircle size={16}/>}>
                {isCompleted ? "Close Tour" : "Finish Tour"}
            </Button>
            )}
        </div>
      </div>
    </Modal>
  );
};
