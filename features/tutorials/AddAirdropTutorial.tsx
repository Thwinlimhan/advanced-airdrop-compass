import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useSettingsStore } from '../../stores/settingsStore';
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  X,
  Target,
  Plus,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface AddAirdropTutorialProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const AddAirdropTutorial: React.FC<AddAirdropTutorialProps> = ({
  onComplete,
  onSkip
}) => {
  const { markTutorialAsCompleted } = useSettingsStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = [
    {
      title: 'Welcome to Airdrop Management',
      description: 'Learn how to effectively track and manage your airdrop opportunities.',
      icon: Target,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This tutorial will guide you through the key features of airdrop management:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <Plus size={16} className="text-green-500" />
              Adding new airdrops with detailed information
            </li>
            <li className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Setting deadlines and tracking progress
            </li>
            <li className="flex items-center gap-2">
              <DollarSign size={16} className="text-yellow-500" />
              Monitoring costs and potential returns
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-purple-500" />
              Managing tasks and time allocation
            </li>
          </ul>
        </div>
      )
    },
    {
      title: 'Adding Your First Airdrop',
      description: 'Learn how to add a new airdrop with all the essential details.',
      icon: Plus,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Quick Start Guide
            </h4>
            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>1. Click the "Add Airdrop" button in the top right</li>
              <li>2. Fill in the project name and basic details</li>
              <li>3. Select the target blockchain</li>
              <li>4. Set your priority level</li>
              <li>5. Add any relevant notes or links</li>
            </ol>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            You can always edit these details later or add more information as you learn more about the project.
          </p>
        </div>
      )
    },
    {
      title: 'Managing Tasks',
      description: 'Create and track tasks to stay organized and efficient.',
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Task Management Tips
            </h4>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>• Break down complex airdrops into smaller tasks</li>
              <li>• Set realistic deadlines for each task</li>
              <li>• Track time spent and costs incurred</li>
              <li>• Link tasks to specific wallets when relevant</li>
              <li>• Use notes to document important details</li>
            </ul>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tasks help you stay organized and ensure you don't miss any important steps in the airdrop process.
          </p>
        </div>
      )
    },
    {
      title: 'Tracking Progress',
      description: 'Monitor your airdrop status and track your success rate.',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Status Tracking
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Airdrop Status:</h5>
                <p className="text-purple-700 dark:text-purple-300">Track the overall project status</p>
              </div>
              <div>
                <h5 className="font-medium text-purple-800 dark:text-purple-200">My Status:</h5>
                <p className="text-purple-700 dark:text-purple-300">Track your personal progress</p>
              </div>
              <div>
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Task Completion:</h5>
                <p className="text-purple-700 dark:text-purple-300">Monitor individual task progress</p>
              </div>
              <div>
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Cost Tracking:</h5>
                <p className="text-purple-700 dark:text-purple-300">Track expenses and potential returns</p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Regular status updates help you make informed decisions about which airdrops to prioritize.
          </p>
        </div>
      )
    },
    {
      title: 'You\'re All Set!',
      description: 'You now have the basics to start managing your airdrops effectively.',
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Next Steps
            </h4>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <li>• Add your first airdrop</li>
              <li>• Explore the dashboard for insights</li>
              <li>• Check out the AI features for strategy advice</li>
              <li>• Set up your wallet connections</li>
              <li>• Configure your notification preferences</li>
            </ul>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Remember, you can always access help and tutorials from the settings menu. Good luck with your airdrop hunting!
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await markTutorialAsCompleted('addAirdrop');
      addToast('Tutorial completed! You can now start managing your airdrops.', 'success');
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to mark tutorial as completed:', error);
      addToast('Failed to complete tutorial. Please try again.', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Card variant="elevated" padding="lg" className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <IconComponent size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            leftIcon={<X size={16} />}
          >
            Skip
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[200px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  leftIcon={isCompleting ? undefined : <CheckCircle size={16} />}
                >
                  {isCompleting ? 'Completing...' : 'Complete Tutorial'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  leftIcon={<ArrowRight size={16} />}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
