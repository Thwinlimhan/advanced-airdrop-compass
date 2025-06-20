import React from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
// Button is not explicitly used in the provided minimal structure, but good to have if extended
// import { Button } from './Button'; 
import { Command } from '../../types'; // Path assumes types.ts is at the root
import { Search } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, commands }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { t } = useTranslation(); // Added

  const filteredCommands = React.useMemo(() => {
    if (!searchTerm.trim()) {
      // Group by category if no search term
      const grouped: { [key: string]: Command[] } = {};
      commands.forEach(cmd => {
        const category = cmd.category || 'General';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(cmd);
      });
      return grouped;
    }
    // Flat list if searching
    return commands.filter(cmd =>
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [commands, searchTerm]);


  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('command_palette_title', { defaultValue: 'Command Palette' })} size="md">
      <div className="p-1">
        <Input
          type="text"
          placeholder={t('command_palette_search_placeholder', { defaultValue: 'Type a command or search...' })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3 text-sm"
          autoFocus
        />
        <div className="max-h-[60vh] overflow-y-auto pr-1 text-sm">
          {Array.isArray(filteredCommands) ? ( // Flat list when searching
            <>
              {filteredCommands.length === 0 && <p className="text-muted-light dark:text-muted-dark text-center py-4">No commands match "{searchTerm}".</p>}
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => { command.action(); onClose(); setSearchTerm(''); }}
                  className="w-full text-left p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors flex items-center"
                  title={command.name}
                >
                  {command.icon && <command.icon size={16} className="mr-2.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{command.name}</p>
                    {command.category && <p className="text-xs text-muted-light dark:text-muted-dark truncate">{command.category}</p>}
                  </div>
                </button>
              ))}
            </>
          ) : ( // Grouped object when not searching
            <>
            {Object.keys(filteredCommands).length === 0 && commands.length > 0 && <p className="text-muted-light dark:text-muted-dark text-center py-4">No commands available.</p>}
            {Object.entries(filteredCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2 last:mb-0">
                <h3 className="text-xs font-semibold uppercase text-muted-light dark:text-muted-dark px-2.5 py-1.5">
                  {category}
                </h3>
                {cmds.map(command => (
                  <button
                    key={command.id}
                    onClick={() => { command.action(); onClose(); setSearchTerm(''); }}
                    className="w-full text-left p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors flex items-center"
                    title={command.name}
                  >
                    {command.icon && <command.icon size={16} className="mr-2.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{command.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
