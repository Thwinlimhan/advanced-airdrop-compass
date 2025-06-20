import React, { useState, useEffect } from 'react';
import { RoadmapEvent } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { ROADMAP_EVENT_STATUSES } from '../../constants';

interface RoadmapEventFormProps {
  isOpen: boolean;
  onSubmit: (event: Omit<RoadmapEvent, 'id'> | RoadmapEvent) => void;
  initialData?: RoadmapEvent;
  onClose: () => void;
}

export const RoadmapEventForm: React.FC<RoadmapEventFormProps> = ({ isOpen, onSubmit, initialData, onClose }) => {
  const [formData, setFormData] = useState<Partial<RoadmapEvent>>({
    description: '',
    dateEstimate: '',
    status: 'Rumored',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset form state when modal opens or initialData changes
    if (isOpen) {
        if (initialData) {
        setFormData(initialData);
        } else {
        setFormData({
            description: '',
            dateEstimate: '',
            status: 'Rumored',
            notes: '',
        });
        }
        setErrors({}); // Clear previous errors
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.description?.trim()) newErrors.description = 'Event description is required.';
    if (!formData.dateEstimate?.trim()) newErrors.dateEstimate = 'Date estimate is required.';
    if (!formData.status) newErrors.status = 'Status is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const eventData = {
        description: formData.description!.trim(),
        dateEstimate: formData.dateEstimate!.trim(),
        status: formData.status!,
        notes: formData.notes?.trim() || undefined, // Ensure notes is undefined if empty string
      };
      if (initialData?.id) {
        onSubmit({ ...initialData, ...eventData });
      } else {
        onSubmit(eventData as Omit<RoadmapEvent, 'id'>);
      }
      // onClose(); // Parent component will handle closing
    }
  };

  const statusOptions = ROADMAP_EVENT_STATUSES.map(s => ({ value: s, label: s }));

  if (!isOpen) return null; // Don't render if not open

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        id="roadmapDescription"
        name="description"
        label="Event Description"
        value={formData.description || ''}
        onChange={handleChange}
        error={errors.description}
        placeholder="e.g., Token Generation Event (TGE), Mainnet Launch"
        required
      />
      <Input
        id="roadmapDateEstimate"
        name="dateEstimate"
        label="Date Estimate"
        value={formData.dateEstimate || ''}
        onChange={handleChange}
        error={errors.dateEstimate}
        placeholder="e.g., Q3 2024, Mid-November, Approx. 2024-12-01"
        required
      />
      <Select
        id="roadmapStatus"
        name="status"
        label="Status"
        value={formData.status || 'Rumored'}
        onChange={handleChange}
        options={statusOptions}
        error={errors.status}
        required
      />
      <Textarea
        id="roadmapNotes"
        name="notes"
        label="Notes (Optional)"
        value={formData.notes || ''}
        onChange={handleChange}
        rows={3}
        placeholder="Any additional details or source links."
      />
      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-card-light dark:bg-card-dark py-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Add Event'}</Button>
      </div>
    </form>
  );
};
