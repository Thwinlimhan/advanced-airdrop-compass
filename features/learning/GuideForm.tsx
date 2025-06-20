import React, { useState, useEffect } from 'react';
import { LearningResource } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Button } from '../../design-system/components/Button';
import { useToast } from '../../hooks/useToast'; // Added
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface GuideFormProps {
  onSubmit: (guide: Omit<LearningResource, 'id'> | LearningResource) => void;
  initialData?: LearningResource;
  onClose: () => void;
}

export const GuideForm: React.FC<GuideFormProps> = ({ onSubmit, initialData, onClose }) => {
  const { addToast } = useToast(); // Added
  const { t } = useTranslation(); // Added
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category || '');
      setContent(initialData.content);
    } else {
      setTitle('');
      setCategory('');
      setContent('');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) newErrors.title = 'Guide title is required.';
    if (!content.trim()) newErrors.content = 'Guide content is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
        const guideData = { 
            title: title.trim(), 
            category: category.trim() || undefined, // Ensure category is undefined if empty
            content: content.trim(), 
            type: 'guide' as 'guide' 
        };
        if (initialData?.id) {
            await onSubmit({ ...guideData, id: initialData.id });
        } else {
            await onSubmit(guideData);
        }
        // onClose(); // Toast handled by AppContext or calling component
    } catch (error) {
        addToast(`Error submitting guide: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        id="guideTitle"
        label="Guide Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="e.g., Understanding Layer 2 Scaling"
        required
        disabled={isSubmitting}
      />
      <Input
        id="guideCategory"
        label="Category (Optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="e.g., Security, DeFi, NFTs"
        disabled={isSubmitting}
      />
      <Textarea
        id="guideContent"
        label="Guide Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        placeholder="Write your guide content here. You can use line breaks for paragraphs."
        rows={10}
        required
        disabled={isSubmitting}
      />
      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-card-light dark:bg-card-dark py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t('common_cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{initialData ? t('common_save_changes_button', {defaultValue:'Save Changes'}) : t('common_add_guide_button', {defaultValue:'Add Guide'})}</Button>
      </div>
    </form>
  );
};
