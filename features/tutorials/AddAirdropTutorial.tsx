import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { useAppContext } from '../../contexts/AppContext';
import { CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  targetId?: string; // Element ID to highlight (not fully implemented in this simplified version)
}

const ADD_AIRDROP_TUTORIAL_KEY = 'addAirdropTutorialCompleted';

const steps: TutorialStep[] = [
  {
    title: "Welcome to Airdrop Tracking!",
    content: "Let's learn how to add a new airdrop to your tracker. This will help you organize your farming efforts.",
  },
  {
    title: "Click 'Add New Airdrop'",
    content: "First, find and click the 'Add New Airdrop' button on the Airdrop Tracker page. This will open a form.",
    targetId: "addNewAirdropButton", // Assuming the button on AirdropListPage has this ID or similar
  },
  {
    title: "Fill in Project Details",
    content: "In the form, enter the project name, blockchain, and its current status (e.g., Rumored, Confirmed).",
  },
  {
    title: "Set Your Status & Priority",
    content: "Indicate your participation status (e.g., Not Started) and how important this airdrop is to you (Priority).",
  },
  {
    title: "Add Links & Notes",
    content: "Include official links (website, Twitter) and any personal notes or eligibility criteria you've found.",
  },
  {
    title: "Save Your Airdrop",
    content: "Once you're done, click 'Add Airdrop'. It will then appear on your list!",
  },
  {
    title: "Tutorial Complete!",
    content: "You've learned the basics of adding an airdrop. You can always refer back to this or explore other features.",
  }
];

interface AddAirdropTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAirdropTutorial: React.FC<AddAirdropTutorialProps> = ({ isOpen, onClose }) => {
  const { appData, markTutorialAsCompleted } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);

  const isCompleted = appData.settings.tutorialsCompleted?.[ADD_AIRDROP_TUTORIAL_KEY];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0); // Reset to first step when opened
    }
  }, [isOpen]);

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
    markTutorialAsCompleted(ADD_AIRDROP_TUTORIAL_KEY);
    onClose();
  };
  
  // If tutorial is completed and modal is forced open, perhaps show a summary or allow reset.
  // For now, if completed, it just allows stepping through again if opened.

  if (!isOpen) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step.title} size="md">
      <div className="my-4 text-sm text-text-light dark:text-text-dark">
        {step.content}
      </div>
      
      {currentStep === steps.length - 1 && !isCompleted && (
         <div className="p-3 bg-green-50 dark:bg-green-800 rounded-md text-green-700 dark:text-green-200 mb-4">
            <CheckCircle size={18} className="inline mr-2" />
            You've reached the end! Click "Finish Tutorial" to mark it as completed.
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrev}>
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
                Finish Tutorial
            </Button>
            )}
        </div>
      </div>
    </Modal>
  );
};
