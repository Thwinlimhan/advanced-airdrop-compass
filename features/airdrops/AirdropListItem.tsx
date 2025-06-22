import React from 'react';
import { Link } from 'react-router-dom';
import { Airdrop, AirdropStatus, AirdropPriority, AirdropTask } from '../../types';
import { Button } from '../../design-system/components/Button';
import { Edit3, Trash2, Archive, ArchiveRestore, Zap, Droplets } from 'lucide-react';

interface AirdropListItemProps {
  airdrop: Airdrop;
  onEdit: (airdrop: Airdrop) => void;
  onDelete: (airdropId: string) => void;
  onToggleArchive: (airdropId: string) => void;
}

const getStatusColorClass = (status: AirdropStatus) => {
  switch (status) {
    case AirdropStatus.LIVE:
    case AirdropStatus.CONFIRMED:
      return 'text-green-400';
    case AirdropStatus.RUMORED:
      return 'text-yellow-400';
    case AirdropStatus.IN_PROGRESS:
      return 'text-blue-400';
    case AirdropStatus.COMPLETED:
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
};

const getPriorityColorClass = (priority?: AirdropPriority) => {
  switch (priority) {
    case AirdropPriority.HIGH: return 'text-red-400';
    case AirdropPriority.MEDIUM: return 'text-yellow-400';
    case AirdropPriority.LOW: return 'text-blue-400';
    default: return 'text-gray-400';
  }
};

export const AirdropListItem: React.FC<AirdropListItemProps> = ({ airdrop, onEdit, onDelete, onToggleArchive }) => {
  const countTasksRecursive = (tasks: AirdropTask[]): { completed: number, total: number } => {
    let completed = 0;
    let total = 0;
    tasks.forEach(task => {
      total++;
      if (task.completed) completed++;
      if (task.subTasks && task.subTasks.length > 0) {
        const subCounts = countTasksRecursive(task.subTasks);
        completed += subCounts.completed;
        total += subCounts.total;
      }
    });
    return { completed, total };
  };

  const { completed: completedTasks, total: totalTasks } = countTasksRecursive(airdrop.tasks);
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <tr className="hover:bg-card-dark/60">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {airdrop.logoBase64 ? (
              <img className="h-10 w-10 rounded-lg object-cover" src={`data:image/jpeg;base64,${airdrop.logoBase64}`} alt={`${airdrop.projectName} logo`} />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-background-dark/80 flex items-center justify-center text-muted-dark"><Droplets size={20}/></div>
            )}
          </div>
          <div className="ml-4">
            <Link to={`/airdrops/${airdrop.id}`} className="text-sm font-medium text-primary hover:underline">
              {airdrop.projectName}
            </Link>
            <div className="text-xs text-muted-dark">{airdrop.blockchain}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-dark">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(airdrop.myStatus)} bg-opacity-20 bg-current`}>
          {airdrop.myStatus}
        </span>
      </td>
       <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-dark">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(airdrop.status)} bg-opacity-20 bg-current`}>
          {airdrop.status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-dark">
        <span className={`flex items-center font-semibold ${getPriorityColorClass(airdrop.priority)}`}>
           {airdrop.priority && <Zap size={12} className="mr-1"/>}
           {airdrop.priority || 'N/A'}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="w-full bg-progress_track-dark rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="text-xs text-muted-dark mt-1 text-right">{completedTasks}/{totalTasks}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
         <div className="flex items-center justify-end space-x-1">
          {!airdrop.isArchived && <Button variant="ghost" size="sm" onClick={() => onEdit(airdrop)} title="Edit Airdrop" className="p-1"><Edit3 size={16}/></Button>}
          <Button variant="ghost" size="sm" onClick={() => onToggleArchive(airdrop.id)} title={airdrop.isArchived ? "Restore" : "Archive"} className="p-1">{airdrop.isArchived ? <ArchiveRestore size={16}/> : <Archive size={16}/>}</Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(airdrop.id)} title="Delete Airdrop" className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16}/></Button>
        </div>
      </td>
    </tr>
  );
}; 