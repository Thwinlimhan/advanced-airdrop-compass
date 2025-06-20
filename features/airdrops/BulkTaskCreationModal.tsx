import React, { useState } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { COMMON_TASK_TEMPLATES } from '../../constants';
import { ListPlus } from 'lucide-react';

interface BulkTaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: { description: string }[]) => void;
}

export const BulkTaskCreationModal: React.FC<BulkTaskCreationModalProps> = ({ isOpen, onClose, onAddTasks }) => {
  const [tasksText, setTasksText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleAddPastedTasks = () => {
    const descriptions = tasksText.split('\n').map(line => line.trim()).filter(line => line);
    if (descriptions.length > 0) {
      onAddTasks(descriptions.map(desc => ({ description: desc })));
    }
    setTasksText('');
    onClose();
  };

  const handleAddFromTemplate = () => {
    if (selectedTemplate) {
      const template = COMMON_TASK_TEMPLATES.find(t => t.name === selectedTemplate);
      if (template) {
        onAddTasks(template.tasks);
      }
    }
    setSelectedTemplate('');
    onClose();
  };

  const templateOptions = [
    { value: '', label: 'Select a template...' },
    ...COMMON_TASK_TEMPLATES.map(t => ({ value: t.name, label: t.name }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center mb-4"><ListPlus size={20} className="mr-2 text-success"/>Bulk Add Tasks</div>
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-semibold mb-1 text-primary">Option 1: Paste Tasks</h4>
          <p className="text-xs text-text-secondary mb-1.5">Enter one task description per line.</p>
          <Textarea
            id="bulk-tasks-text"
            value={tasksText}
            onChange={(e) => setTasksText(e.target.value)}
            placeholder="Follow on Twitter\nJoin Discord server\nMake a swap on the DEX"
            rows={5}
          />
          <Button onClick={handleAddPastedTasks} disabled={!tasksText.trim()} className="mt-2">
            Add Pasted Tasks
          </Button>
        </div>

        <hr className="border border-border"/>

        <div>
          <h4 className="text-md font-semibold mb-1 text-primary">Option 2: Use a Template</h4>
          <Select
            id="task-template-select"
            label="Choose a Task Template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            options={templateOptions}
          />
          <Button onClick={handleAddFromTemplate} disabled={!selectedTemplate} className="mt-2">
            Add Tasks from Template
          </Button>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
