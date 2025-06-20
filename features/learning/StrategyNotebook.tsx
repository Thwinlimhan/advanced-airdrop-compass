import React, { useState, useEffect } from 'react';
import { StrategyNote, Airdrop } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Textarea } from '../../design-system/components/Textarea';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select'; // Added for linking
import { PlusCircle, Edit3, Trash2, Save, XCircle, Link2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface StrategyNotebookProps {
  initialSelectedNoteId?: string;
}

export const StrategyNotebook: React.FC<StrategyNotebookProps> = ({ initialSelectedNoteId }) => {
  const { appData, addStrategyNote, updateStrategyNote, deleteStrategyNote } = useAppContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialSelectedNoteId || null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentLinkedAirdropIds, setCurrentLinkedAirdropIds] = useState<string[]>([]); // Added
  const [isEditing, setIsEditing] = useState(false); 

  const notes = appData.strategyNotes;
  const airdrops = appData.airdrops; // For linking options

  useEffect(() => {
    if (initialSelectedNoteId && notes.find(n => n.id === initialSelectedNoteId)) {
      setSelectedNoteId(initialSelectedNoteId);
    }
  }, [initialSelectedNoteId, notes]);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        setCurrentTitle(note.title);
        setCurrentContent(note.content);
        setCurrentLinkedAirdropIds(note.linkedAirdropIds || []); // Load linked IDs
        setIsEditing(false); 
      } else {
        setSelectedNoteId(null);
        setCurrentTitle('');
        setCurrentContent('');
        setCurrentLinkedAirdropIds([]);
        setIsEditing(false);
      }
    } else {
      setCurrentTitle('');
      setCurrentContent('');
      setCurrentLinkedAirdropIds([]);
      setIsEditing(false);
    }
  }, [selectedNoteId, notes]);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleNewNote = () => {
    setSelectedNoteId(null); 
    setCurrentTitle('');
    setCurrentContent('');
    setCurrentLinkedAirdropIds([]);
    setIsEditing(true); 
  };
  
  const handleEdit = () => {
      setIsEditing(true);
  }

  const handleSaveNote = async () => {
    if (!currentTitle.trim()) {
      alert("Title cannot be empty."); 
      return;
    }
    
    const noteDataToSave = { 
        title: currentTitle, 
        content: currentContent, 
        linkedAirdropIds: currentLinkedAirdropIds 
    };

    if (selectedNoteId) { 
      await updateStrategyNote({ ...noteDataToSave, id: selectedNoteId, lastModified: new Date().toISOString() });
    } else { 
      await addStrategyNote(noteDataToSave);
      // After adding a new note, select it (optional: find the newly added note if IDs change server-side)
      // For now, we'll clear and let the user select from the list if they want to see it immediately.
      // If addStrategyNote returned the new note, we could auto-select it.
    }
    setIsEditing(false); 
    if(!selectedNoteId) { 
        setCurrentTitle('');
        setCurrentContent('');
        setCurrentLinkedAirdropIds([]);
    }
  };
  
  const handleDeleteNote = async () => {
      if (selectedNoteId && window.confirm(`Are you sure you want to delete the note "${currentTitle}"?`)) {
          await deleteStrategyNote(selectedNoteId);
          setSelectedNoteId(null); 
          setCurrentTitle('');
          setCurrentContent('');
          setCurrentLinkedAirdropIds([]);
          setIsEditing(false);
      }
  };

  const handleCancelEdit = () => {
    if (selectedNoteId) { 
        const note = notes.find(n => n.id === selectedNoteId);
        if (note) {
            setCurrentTitle(note.title);
            setCurrentContent(note.content);
            setCurrentLinkedAirdropIds(note.linkedAirdropIds || []);
        }
    } else { 
        setCurrentTitle('');
        setCurrentContent('');
        setCurrentLinkedAirdropIds([]);
    }
    setIsEditing(false);
  };

  const airdropOptions = airdrops.map(a => ({ value: a.id, label: a.projectName }));

  const handleLinkedAirdropsChange = (selectedOptions: HTMLSelectElement['selectedOptions']) => {
    const values = Array.from(selectedOptions).map(option => option.value);
    setCurrentLinkedAirdropIds(values);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]"> 
      <Card className="md:col-span-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">My Notes</h4>
          <Button size="sm" onClick={handleNewNote} leftIcon={<PlusCircle size={16}/>}>New Note</Button>
        </div>
        {notes.length === 0 ? (
          <p className="text-muted-light dark:text-muted-dark">No strategy notes yet. Create one!</p>
        ) : (
          <ul className="space-y-2">
            {notes.slice().sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).map(note => (
              <li key={note.id}>
                <button
                  onClick={() => handleSelectNote(note.id)}
                  className={`w-full text-left p-2 rounded-md ${selectedNoteId === note.id ? 'bg-primary-light/20 dark:bg-primary-dark/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <h5 className="font-medium text-text-light dark:text-text-dark truncate">{note.title}</h5>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Last modified: {new Date(note.lastModified).toLocaleDateString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="md:col-span-2 flex flex-col">
        {(!selectedNoteId && !isEditing) ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <Edit3 size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                <h4 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">Select a note to view or edit</h4>
                <p className="text-muted-light dark:text-muted-dark">Or create a new note to start documenting your strategies.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
                {isEditing ? (
                     <Input 
                        id="noteTitle"
                        value={currentTitle} 
                        onChange={(e) => setCurrentTitle(e.target.value)} 
                        placeholder="Note Title"
                        className="text-2xl font-semibold !py-1 !px-2 flex-grow mr-2"
                    />
                ) : (
                    <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark truncate">{currentTitle}</h3>
                )}
               
              <div className="flex space-x-2">
                {isEditing ? (
                    <>
                        <Button onClick={handleSaveNote} size="sm" variant="primary" leftIcon={<Save size={16}/>}>Save</Button>
                        <Button onClick={handleCancelEdit} size="sm" variant="outline" leftIcon={<XCircle size={16}/>}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={handleEdit} size="sm" variant="outline" leftIcon={<Edit3 size={16}/>}>Edit</Button>
                        {selectedNoteId && <Button onClick={handleDeleteNote} size="sm" variant="danger" leftIcon={<Trash2 size={16}/>}>Delete</Button>}
                    </>
                )}
              </div>
            </div>
            {isEditing && (
                <div className="mb-3">
                    <label htmlFor="linkedAirdrops" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Link to Airdrops (Optional)
                    </label>
                    <select
                        id="linkedAirdrops"
                        multiple
                        value={currentLinkedAirdropIds}
                        onChange={(e) => handleLinkedAirdropsChange(e.target.selectedOptions)}
                        className="block w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
                    >
                        {airdropOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            )}
            {isEditing ? (
                 <Textarea
                    id="noteContent"
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    placeholder="Start typing your strategy here..."
                    className="flex-grow resize-none text-base h-full min-h-[250px]" 
                />
            ) : (
                <>
                    {currentLinkedAirdropIds.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-muted-light dark:text-muted-dark flex items-center">
                                <Link2 size={12} className="mr-1"/> Linked to:
                                {currentLinkedAirdropIds.map(id => {
                                    const ad = airdrops.find(a => a.id === id);
                                    return ad ? <span key={id} className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">{ad.projectName}</span> : null;
                                })}
                            </p>
                        </div>
                    )}
                    <div className="prose dark:prose-invert max-w-none flex-grow overflow-y-auto text-text-light dark:text-text-dark">
                        {currentContent.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                        {currentContent.trim() === '' && <p className="italic text-muted-light dark:text-muted-dark">This note is empty. Click 'Edit' to add content.</p>}
                    </div>
                </>
            )}
            
          </>
        )}
      </Card>
    </div>
  );
};
