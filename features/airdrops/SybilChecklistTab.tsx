import React, { useState, useEffect } from 'react';
import { Airdrop, SybilChecklistItem } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { CheckSquare, Square, Edit2, Save, X, Brain, Loader2, Info } from 'lucide-react'; 
import { Textarea } from '../../design-system/components/Textarea';
import { Modal } from '../../design-system/components/Modal';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { useAppContext } from '../../contexts/AppContext';
import { AlertMessage } from '../../components/ui/AlertMessage';


interface SybilChecklistTabProps {
  airdrop: Airdrop;
  onUpdateItem: (airdropId: string, item: SybilChecklistItem) => void;
}

type MergeChoice = 'append' | 'prepend' | 'replace';

export const SybilChecklistTab: React.FC<SybilChecklistTabProps> = ({ airdrop, onUpdateItem }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [aiLoadingItemId, setAiLoadingItemId] = useState<string | null>(null);
  const { addToast } = useToast();
  const { updateAirdropSybilItem } = useAppContext(); 
  
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [itemForMerge, setItemForMerge] = useState<SybilChecklistItem | null>(null);
  const [aiSuggestionForMerge, setAiSuggestionForMerge] = useState('');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }
  }, []);

  const handleToggleComplete = (item: SybilChecklistItem) => {
    if (airdrop.isArchived) return;
    onUpdateItem(airdrop.id, { ...item, completed: !item.completed });
  };

  const handleStartEditNotes = (item: SybilChecklistItem) => {
    if (airdrop.isArchived) return;
    setEditingItemId(item.id);
    setEditingNotes(item.notes || '');
  };

  const handleSaveNotes = () => {
    if (airdrop.isArchived) return;
    if (editingItemId) {
      const itemToUpdate = airdrop.sybilChecklist.find(i => i.id === editingItemId);
      if (itemToUpdate) {
        onUpdateItem(airdrop.id, { ...itemToUpdate, notes: editingNotes.trim() });
      }
      setEditingItemId(null);
      setEditingNotes('');
    }
  };

  const handleCancelEditNotes = () => {
    setEditingItemId(null);
    setEditingNotes('');
  };

  const handleAiAssist = async (item: SybilChecklistItem) => {
    if (airdrop.isArchived || aiLoadingItemId === item.id) return;

    if (isApiKeyMissing) {
      addToast("AI Assist unavailable: API Key not configured.", "warning");
      return;
    }

    setAiLoadingItemId(item.id);
    addToast('AI is thinking about Sybil resistance for this item...', 'info');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const systemInstruction = `You are an expert in cryptocurrency airdrop Sybil prevention. For the following Sybil checklist item, provide a concise, actionable explanation or suggestion (2-3 sentences max) for how a user might address or think about this item to improve their Sybil resistance. If relevant, consider the project name: '${airdrop.projectName}'. Keep the note suitable for a user's personal checklist. Output should be plain text. Be practical and focused on helping the user build good habits.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: `Sybil Checklist Item: "${item.text}" for project "${airdrop.projectName}"`,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      let aiSuggestedNotes = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = aiSuggestedNotes.match(fenceRegex);
      if (match && match[2]) {
        aiSuggestedNotes = match[2].trim();
      }

      if (item.notes && item.notes.trim()) {
        setItemForMerge(item);
        setAiSuggestionForMerge(aiSuggestedNotes);
        setShowMergeModal(true);
      } else {
        if (editingItemId === item.id) {
          setEditingNotes(aiSuggestedNotes);
        } else {
          onUpdateItem(airdrop.id, { ...item, notes: aiSuggestedNotes });
        }
        addToast('AI suggestions added to notes.', 'success');
      }

    } catch (err) {
      console.error("Error calling Gemini API for Sybil assist:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      addToast(`AI Assist Error: ${errorMessage}`, 'error');
    } finally {
      setAiLoadingItemId(null);
    }
  };

  const handleMergeChoice = (choice: MergeChoice) => {
    if (!itemForMerge || !aiSuggestionForMerge) return;

    let newNotes = '';
    const existingNotes = editingItemId === itemForMerge.id ? editingNotes : itemForMerge.notes || '';

    switch (choice) {
      case 'append':
        newNotes = `${existingNotes}\n\n--- AI Suggestion ---\n${aiSuggestionForMerge}`;
        break;
      case 'prepend':
        newNotes = `--- AI Suggestion ---\n${aiSuggestionForMerge}\n\n${existingNotes}`;
        break;
      case 'replace':
        newNotes = aiSuggestionForMerge;
        break;
    }

    if (editingItemId === itemForMerge.id) {
        setEditingNotes(newNotes.trim());
    } else {
        onUpdateItem(airdrop.id, { ...itemForMerge, notes: newNotes.trim() });
    }
    addToast('AI suggestions merged into notes.', 'success');
    setShowMergeModal(false);
    setItemForMerge(null);
    setAiSuggestionForMerge('');
  };


  const completedCount = airdrop.sybilChecklist.filter(item => item.completed).length;
  const totalCount = airdrop.sybilChecklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  let scoreColor = 'text-red-500 dark:text-red-400';
  let scoreText = 'High Risk';
  if (progressPercentage >= 75) {
    scoreColor = 'text-green-500 dark:text-green-400';
    scoreText = 'Low Risk';
  } else if (progressPercentage >= 40) {
    scoreColor = 'text-yellow-500 dark:text-yellow-400';
    scoreText = 'Medium Risk';
  }

  return (
    <>
    <Card>
      <h4 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1">Sybil Resistance Checklist</h4>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
        Track your actions to minimize Sybil risk for this airdrop. This is for personal assessment only.
      </p>

      {isApiKeyMissing && (
        <AlertMessage type="warning" title="AI Assist Disabled" message="The AI Assist feature for notes requires an API_KEY to be configured. This feature is currently unavailable." className="mb-4" />
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-medium text-text-light dark:text-text-dark">Overall Progress</span>
          <span className={`font-semibold ${scoreColor}`}>{scoreText} ({completedCount}/{totalCount})</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                progressPercentage >= 75 ? 'bg-green-500' : progressPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Sybil checklist progress"
          ></div>
        </div>
      </div>

      {airdrop.sybilChecklist.length === 0 ? (
        <p className="text-muted-light dark:text-muted-dark">No checklist items defined. This might be an error or an old airdrop entry.</p>
      ) : (
        <ul className="space-y-3">
          {airdrop.sybilChecklist.map((item) => (
            <li key={item.id} className={`p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 hover:shadow-sm transition-shadow ${airdrop.isArchived ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-grow min-w-0">
                  <button onClick={() => handleToggleComplete(item)} className="mt-1 flex-shrink-0" disabled={airdrop.isArchived} aria-label={`Mark item ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}>
                    {item.completed ? <CheckSquare size={20} className="text-green-500" /> : <Square size={20} className="text-gray-400" />}
                  </button>
                  <span className={`text-text-light dark:text-text-dark ${item.completed ? 'line-through text-muted-light dark:text-muted-dark' : ''} break-words`}>
                    {item.text}
                  </span>
                </div>
                <div className="flex space-x-0.5 sm:space-x-1 flex-shrink-0 ml-1">
                    <Button variant="ghost" size="sm" onClick={() => handleAiAssist(item)} title="AI Assist with Notes" disabled={aiLoadingItemId === item.id || airdrop.isArchived || isApiKeyMissing}>
                        {aiLoadingItemId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editingItemId === item.id ? handleCancelEditNotes() : handleStartEditNotes(item)} title={editingItemId === item.id ? "Cancel Edit Notes" : "Edit Notes"} disabled={airdrop.isArchived}>
                        {editingItemId === item.id ? <X size={16} /> : <Edit2 size={16} />}
                    </Button>
                </div>
              </div>
              {editingItemId === item.id ? (
                <div className="mt-2 ml-9 space-y-2">
                  <Textarea
                    id={`sybil-notes-${item.id}`}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add notes for this item..."
                    rows={3}
                  />
                  <div className="flex space-x-2 justify-end">
                    <Button onClick={handleSaveNotes} size="sm" leftIcon={<Save size={"16"} />}>Save</Button>
                    <Button onClick={handleCancelEditNotes} size="sm" variant="outline" leftIcon={<X size={16} />}>Cancel</Button>
                  </div>
                </div>
              ) : (
                item.notes && (
                  <div className="mt-2 ml-9 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    <strong className="text-xs text-muted-light dark:text-muted-dark block mb-0.5">Notes:</strong>
                    {item.notes}
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
    {showMergeModal && itemForMerge && (
        <Modal 
            isOpen={showMergeModal} 
            onClose={() => setShowMergeModal(false)} 
            title="AI Suggestion - Merge Notes"
            size="md"
        >
            <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    AI has suggested notes for "{itemForMerge.text}". How would you like to merge them with your existing notes?
                </p>
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Your Current Notes:</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 whitespace-pre-wrap">{editingItemId === itemForMerge.id ? editingNotes : itemForMerge.notes}</p>
                </div>
                 <div className="p-2 border rounded bg-indigo-50 dark:bg-indigo-900/50">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">AI Suggested Notes:</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-200 whitespace-pre-wrap">{aiSuggestionForMerge}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                    <Button onClick={() => handleMergeChoice('append')} variant="outline" size="sm">Append AI Suggestion</Button>
                    <Button onClick={() => handleMergeChoice('prepend')} variant="outline" size="sm">Prepend AI Suggestion</Button>
                    <Button onClick={() => handleMergeChoice('replace')} variant="primary" size="sm">Replace with AI Suggestion</Button>
                </div>
            </div>
        </Modal>
    )}
    </>
  );
};
