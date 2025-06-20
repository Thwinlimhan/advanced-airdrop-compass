import React, { useState } from 'react';
import { LearningResource } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Button } from '../../design-system/components/Button';
import { Send } from 'lucide-react';
import { useToast } from '../../hooks/useToast'; // Added
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface GuideSubmissionFormProps {
  onSubmit: (guideData: Omit<LearningResource, 'id' | 'type' | 'author' | 'submissionDate'>) => void;
  onClose: () => void;
}

export const GuideSubmissionForm: React.FC<GuideSubmissionFormProps> = ({ onSubmit, onClose }) => {
  const { addToast } = useToast(); // Added
  const { t } = useTranslation(); // Added
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

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
        await onSubmit({ 
            title: title.trim(), 
            category: category.trim() || undefined, 
            content: content.trim(),
        });
        // onClose(); // Toast handled by AppContext or calling component
    } catch (error) {
        addToast(`Error submitting guide: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <p className="text-sm text-muted-light dark:text-muted-dark">
        Share your knowledge! Submit your own crypto guide. It will be added to the Learning Hub.
      </p>
      <Input
        id="userGuideTitle"
        label="Guide Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="e.g., My Awesome Airdrop Hunting Tips"
        required
        disabled={isSubmitting}
      />
      <Input
        id="userGuideCategory"
        label="Category (Optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="e.g., Strategy, Wallets, Security"
        disabled={isSubmitting}
      />
      <Textarea
        id="userGuideContent"
        label="Guide Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        placeholder="Write your guide content here. Use line breaks for paragraphs."
        rows={10}
        required
        disabled={isSubmitting}
      />
      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-card-light dark:bg-card-dark py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t('common_cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} leftIcon={isSubmitting ? undefined : <Send size={16}/>}>{t('common_submit_guide_button', {defaultValue: 'Submit Guide'})}</Button>
      </div>
    </form>
  );
};
