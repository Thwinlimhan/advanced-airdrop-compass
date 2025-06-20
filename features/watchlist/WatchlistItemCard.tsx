import React, { useRef, useEffect } from 'react';
import { WatchlistItem, ConfidenceLevel } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Edit3, Trash2, ArrowUpCircle, ExternalLink, Twitter, CalendarClock, Share2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  onEdit: (item: WatchlistItem) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onPromote: (itemId: string, itemName: string) => void;
  isHighlighted?: boolean;
}

const getConfidenceColor = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case ConfidenceLevel.HIGH: return 'bg-green-100 text-green-800';
    case ConfidenceLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
    case ConfidenceLevel.LOW: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const WatchlistItemCardComponent: React.FC<WatchlistItemCardProps> = ({ item, onEdit, onDelete, onPromote, isHighlighted }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardRef.current.classList.add('ring-2', 'ring-primary-light', 'transition-all', 'duration-300');
        const timer = setTimeout(() => {
            cardRef.current?.classList.remove('ring-2', 'ring-primary-light');
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  const handleShare = () => {
    addToast("Sharing features are conceptual and will be implemented in a future update.", "info");
  };


  return (
    <div ref={cardRef}>
        <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-primary-light">{item.projectName}</h3>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getConfidenceColor(item.confidence)}`}>
                {item.confidence}
            </span>
            </div>
            <p className="text-xs text-muted-light mb-1">
              Added: {new Date(item.addedDate).toLocaleDateString()}
            </p>
            {item.reminderDate && (
                <p className="text-xs text-orange-500 mb-3 flex items-center">
                    <CalendarClock size={12} className="mr-1"/> Reminder: {new Date(item.reminderDate).toLocaleDateString()}
                </p>
            )}

            {(item.websiteLink || item.twitterLink) && (
            <div className="mb-3 flex flex-wrap gap-2">
                {item.websiteLink && (
                <a href={item.websiteLink} target="_blank" rel="noopener noreferrer" aria-label={t('watchlist_website_aria', {itemName: item.projectName })}>
                    <Button variant="ghost" size="sm" leftIcon={<ExternalLink size={14} />}>Website</Button>
                </a>
                )}
                {item.twitterLink && (
                <a href={item.twitterLink} target="_blank" rel="noopener noreferrer" aria-label={t('watchlist_twitter_aria', {itemName: item.projectName })}>
                    <Button variant="ghost" size="sm" leftIcon={<Twitter size={14} />}>Twitter</Button>
                </a>
                )}
            </div>
            )}

            {item.notes && (
            <div className="mb-4 p-2 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{item.notes}</p>
            </div>
            )}
        </div>

        <div className="mt-auto pt-3 flex flex-wrap gap-2 justify-end border-t border-gray-200">
            <Button variant="ghost" size="sm" onClick={handleShare} title={t('watchlist_share_item_aria', { itemName: item.projectName })} aria-label={t('watchlist_share_item_aria', { itemName: item.projectName })}>
                <Share2 size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPromote(item.id, item.projectName)} leftIcon={<ArrowUpCircle size={16}/>} aria-label={t('watchlist_promote_item_aria', { itemName: item.projectName })}>
            Promote to Airdrop
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)} title={t('watchlist_edit_item_aria', { itemName: item.projectName })} aria-label={t('watchlist_edit_item_aria', { itemName: item.projectName })}>
            <Edit3 size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item.id, item.projectName)} className="text-red-500 hover:text-red-700" title={t('watchlist_delete_item_aria', { itemName: item.projectName })} aria-label={t('watchlist_delete_item_aria', { itemName: item.projectName })}>
            <Trash2 size={16} />
            </Button>
        </div>
        </Card>
    </div>
  );
};

export const WatchlistItemCard = React.memo(WatchlistItemCardComponent);
