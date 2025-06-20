import React, { useState, useMemo } from 'react';
import { LearningResource } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Edit3, Trash2, Brain } from 'lucide-react'; // Added Brain for AI Explain
import { GlossaryTermExplanationModal } from './GlossaryTermExplanationModal'; // Added
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface GlossaryListProps {
  terms: LearningResource[]; 
  onEdit: (term: LearningResource) => void;
  onDelete: (termId: string, termTitle: string) => void;
}

export const GlossaryList: React.FC<GlossaryListProps> = ({ terms, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [explainingTerm, setExplainingTerm] = useState<LearningResource | null>(null);
  const { t } = useTranslation(); // Added

  const filteredTerms = useMemo(() => {
    return terms.filter(term => 
      term.type === 'glossary' &&
      (term.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       term.content.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => a.title.localeCompare(b.title));
  }, [terms, searchTerm]);

  return (
    <div className="space-y-6">
      <Input
        id="glossarySearch"
        placeholder={t('glossary_search_placeholder', {defaultValue: "Search glossary (e.g., Sybil, Gas Fees)"})}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredTerms.length === 0 ? (
        <p className="text-center text-muted-light dark:text-muted-dark py-6">No glossary terms match your search. Try adding some!</p>
      ) : (
        <div className="space-y-4">
          {filteredTerms.map(term => (
            <Card key={term.id}>
              <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-xl font-semibold text-primary-light dark:text-primary-dark mb-1">{term.title}</h4>
                    <p className="text-text-light dark:text-text-dark">{term.content}</p>
                </div>
                <div className="flex space-x-1 flex-shrink-0 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => setExplainingTerm(term)} title="AI Explain Term"><Brain size={16}/></Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(term)} title="Edit Term"><Edit3 size={16}/></Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(term.id, term.title)} className="text-red-500 hover:text-red-700" title="Delete Term"><Trash2 size={16}/></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {explainingTerm && (
        <GlossaryTermExplanationModal
          isOpen={!!explainingTerm}
          onClose={() => setExplainingTerm(null)}
          term={explainingTerm}
        />
      )}
    </div>
  );
};
