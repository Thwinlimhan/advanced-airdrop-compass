import React, { useState } from 'react';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { CheckSquare, Plus, X, Edit2, Save, Trash2 } from 'lucide-react';

interface Subtask {
  id: string;
  description: string;
  completed: boolean;
}

interface SubtaskChecklistProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  placeholder?: string;
  allowInlineEdit?: boolean;
  showAddButton?: boolean;
}

export const SubtaskChecklist: React.FC<SubtaskChecklistProps> = ({
  subtasks,
  onChange,
  placeholder = "Add a subtask...",
  allowInlineEdit = true,
  showAddButton = true
}) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newTask: Subtask = {
        id: Date.now().toString(),
        description: newSubtask.trim(),
        completed: false
      };
      onChange([...subtasks, newTask]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter(st => st.id !== id));
  };

  const toggleSubtask = (id: string) => {
    onChange(subtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const startEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditValue(subtask.description);
  };

  const saveEdit = () => {
    if (editValue.trim() && editingId) {
      onChange(subtasks.map(st =>
        st.id === editingId ? { ...st, description: editValue.trim() } : st
      ));
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addSubtask();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Add new subtask */}
      {showAddButton && (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSubtask}
            disabled={!newSubtask.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Subtasks list */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <button
                type="button"
                onClick={() => toggleSubtask(subtask.id)}
                className={`flex-shrink-0 w-4 h-4 rounded border-2 ${
                  subtask.completed
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {subtask.completed && (
                  <CheckSquare className="w-3 h-3 text-white" />
                )}
              </button>

              {editingId === subtask.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={handleEditKeyPress}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={saveEdit}
                    disabled={!editValue.trim()}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {subtask.description}
                  </span>
                  <div className="flex gap-1">
                    {allowInlineEdit && (
                      <button
                        type="button"
                        onClick={() => startEdit(subtask)}
                        className="text-gray-400 hover:text-blue-500"
                        title="Edit subtask"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Remove subtask"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {subtasks.length === 0 && showAddButton && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No subtasks added yet. Click the + button to add one.
        </div>
      )}
    </div>
  );
}; 