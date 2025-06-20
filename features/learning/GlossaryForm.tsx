import React, { useState, useEffect } from 'react';
import { LearningResource } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Button } from '../../design-system/components/Button';
import { useToast } from '../../hooks/useToast'; // Added
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface GlossaryFormProps {
  onSubmit: (term: Omit<LearningResource, 'id' | 'category'> | LearningResource) => void;
  initialData?: LearningResource;
  onClose: () => void;
}

export const GlossaryForm: React.FC<GlossaryFormProps> = ({ onSubmit, initialData, onClose }) => {
  const { addToast } = useToast(); // Added
  const { t } = useTranslation(); // Added
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Content here is the definition
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) newErrors.title = 'Term is required.';
    if (!content.trim()) newErrors.content = 'Definition is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
        const termData = { 
            title: title.trim(), 
            content: content.trim(), 
            type: 'glossary' as 'glossary'
        };
        if (initialData?.id) {
            await onSubmit({ ...termData, id: initialData.id, category: initialData.category }); 
        } else {
            await onSubmit(termData);
        }
        // onClose(); // Toast handled by AppContext or calling component
    } catch (error) {
        addToast(`Error submitting glossary term: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="glossaryTitle"
        label="Term"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="e.g., Airdrop, Gas Fees"
        required
        disabled={isSubmitting}
      />
      <Textarea
        id="glossaryContent"
        label="Definition"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        placeholder="Enter the definition of the term."
        rows={5}
        required
        disabled={isSubmitting}
      />
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t('common_cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{initialData ? t('common_save_changes_button', {defaultValue:'Save Changes'}) : t('common_add_term_button', {defaultValue:'Add Term'})}</Button>
      </div>
    </form>
  );
};
