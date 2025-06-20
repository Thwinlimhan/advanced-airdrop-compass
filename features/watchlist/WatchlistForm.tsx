import React, { useState, useEffect } from 'react';
import { WatchlistItem, ConfidenceLevel } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { CONFIDENCE_LEVELS } from '../../constants';

interface WatchlistFormProps {
  onSubmit: (item: Omit<WatchlistItem, 'id' | 'addedDate'> | WatchlistItem) => Promise<void>; // Updated to Promise<void>
  initialData?: WatchlistItem;
  onClose: () => void;
}

export const WatchlistForm: React.FC<WatchlistFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [formData, setFormData] = useState<Partial<Omit<WatchlistItem, 'id' | 'addedDate'>>>({
    projectName: '',
    twitterLink: '',
    websiteLink: '',
    confidence: ConfidenceLevel.LOW,
    notes: '',
    reminderDate: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const { id, addedDate, ...editableData } = initialData;
      setFormData({
        ...editableData,
        reminderDate: editableData.reminderDate ? new Date(editableData.reminderDate).toISOString().split('T')[0] : undefined,
      });
    } else {
      setFormData({
        projectName: '',
        twitterLink: '',
        websiteLink: '',
        confidence: ConfidenceLevel.LOW,
        notes: '',
        reminderDate: undefined,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.projectName?.trim()) newErrors.projectName = 'Project name is required.';
    if (!formData.confidence) newErrors.confidence = 'Confidence level is required.';
    
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (formData.websiteLink && !urlRegex.test(formData.websiteLink)) newErrors.websiteLink = 'Invalid website URL.';
    if (formData.twitterLink && !urlRegex.test(formData.twitterLink)) newErrors.twitterLink = 'Invalid Twitter URL.';
    if (formData.reminderDate && isNaN(new Date(formData.reminderDate).getTime())) newErrors.reminderDate = 'Invalid reminder date.';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        projectName: formData.projectName!.trim(),
        twitterLink: formData.twitterLink?.trim() || undefined,
        websiteLink: formData.websiteLink?.trim() || undefined,
        confidence: formData.confidence!,
        notes: formData.notes?.trim() || undefined,
        reminderDate: formData.reminderDate || undefined,
      };

      if (initialData?.id) {
        await onSubmit({ ...initialData, ...submissionData });
      } else {
        await onSubmit(submissionData as Omit<WatchlistItem, 'id' | 'addedDate'>);
      }
      onClose();
    }
  };

  const confidenceOptions = CONFIDENCE_LEVELS.map(c => ({ value: c, label: c }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        id="watchProjectName"
        name="projectName"
        label="Project Name"
        value={formData.projectName || ''}
        onChange={handleChange}
        error={!!errors.projectName}
        placeholder="e.g., Potential Gem Protocol"
        required
      />
      <Select
        id="watchConfidence"
        name="confidence"
        label="Confidence Level"
        value={formData.confidence || ConfidenceLevel.LOW}
        onChange={handleChange}
        options={confidenceOptions}
        error={!!errors.confidence}
        required
      />
      <Input
        id="watchWebsiteLink"
        name="websiteLink"
        label="Website Link (Optional)"
        type="url"
        value={formData.websiteLink || ''}
        onChange={handleChange}
        error={!!errors.websiteLink}
        placeholder="https://..."
      />
      <Input
        id="watchTwitterLink"
        name="twitterLink"
        label="Twitter Link (Optional)"
        type="url"
        value={formData.twitterLink || ''}
        onChange={handleChange}
        error={!!errors.twitterLink}
        placeholder="https://twitter.com/..."
      />
       <Input
        id="watchReminderDate"
        name="reminderDate"
        label="Reminder Date (Optional)"
        type="date"
        value={formData.reminderDate || ''}
        onChange={handleChange}
        error={!!errors.reminderDate}
      />
      <Textarea
        id="watchNotes"
        name="notes"
        label="Notes (Optional)"
        value={formData.notes || ''}
        onChange={handleChange}
        rows={4}
        placeholder="Why this project is on your radar, rumors, key people, etc."
      />
      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-card-light py-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Add to Watchlist'}</Button>
      </div>
    </form>
  );
};