import React from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { formatCurrency } from '../../utils/formatting';
import { ListChecks, Zap, Activity, DollarSign } from 'lucide-react';

interface DetailedLogItem {
  id: string;
  date: string;
  description: string;
  cost: number;
  type: string; // 'Gas Log', 'Interaction', 'Airdrop Tx', 'Task Cost'
  relatedItem?: string; // e.g., Wallet Name, Airdrop Name
}

interface CostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: DetailedLogItem[];
  itemTypeForNoItems: 'category' | 'network' | 'wallet';
}

const LogTypeIcon: React.FC<{type: string}> = ({type}) => {
    switch(type) {
        case 'Gas Log': return <Zap size={16} className="text-orange-500 mr-2 flex-shrink-0"/>;
        case 'Interaction Log': return <Activity size={16} className="text-blue-500 mr-2 flex-shrink-0"/>;
        case 'Airdrop Tx': return <DollarSign size={16} className="text-green-500 mr-2 flex-shrink-0"/>;
        case 'Task Cost': return <ListChecks size={16} className="text-purple-500 mr-2 flex-shrink-0"/>;
        default: return <DollarSign size={16} className="text-gray-500 mr-2 flex-shrink-0"/>;
    }
}

export const CostDetailModal: React.FC<CostDetailModalProps> = ({ isOpen, onClose, title, items, itemTypeForNoItems }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {items.length === 0 ? (
          <p className="text-muted-light dark:text-muted-dark text-center py-4">
            No detailed transactions found for this {itemTypeForNoItems}.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-750">
                <div className="flex justify-between items-start">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center mb-0.5">
                        <LogTypeIcon type={item.type} />
                        <span className="text-sm font-medium text-text-light dark:text-text-dark truncate" title={item.description}>
                            {item.description}
                        </span>
                    </div>
                    <p className="text-xs text-muted-light dark:text-muted-dark">
                      Date: {new Date(item.date).toLocaleDateString()}
                      {item.relatedItem && ` | From: ${item.relatedItem}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 dark:text-red-400 whitespace-nowrap ml-2">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};