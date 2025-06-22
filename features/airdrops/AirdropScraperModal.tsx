import React, { useState } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Brain, Loader2, Link as LinkIcon, DownloadCloud } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface AirdropScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrape: (url: string) => Promise<void>;
}

export const AirdropScraperModal: React.FC<AirdropScraperModalProps> = ({ isOpen, onClose, onScrape }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleScrapeClick = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }
    if (!/^(https?):\/\/[^\s$.?#].[^\s]*$/.test(url)) {
        setError('Please enter a valid URL starting with http:// or https://.');
        return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await onScrape(url);
      addToast('Data scraped and pre-filled successfully!', 'success');
      onClose(); // Parent will handle opening the next modal
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to process URL: ${errorMessage}`);
      addToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Airdrop via URL (AI)"
      size="md"
    >
      <div className="flex items-center mb-4">
        <Brain size={20} className="mr-2 text-primary" />
        <span className="text-lg font-semibold">AI-Powered Import</span>
      </div>
      <AlertMessage
        type="info"
        title="Conceptual Feature"
        message="This is a demonstration. Instead of actually scraping the web (which browsers block), the AI will generate plausible data based on the URL's domain (e.g., cryptorank.io, airdrops.io) and project name."
        className="mb-4"
      />
      <div className="space-y-4">
        <Input
          id="airdrop-url"
          label="Airdrop URL (from CryptoRank, airdrops.io, etc.)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://cryptorank.io/airdrop/some-project"
          error={!!error}
          errorText={error || undefined}
          leftIcon={<LinkIcon size={16} />}
          disabled={isLoading}
        />
        <Button onClick={handleScrapeClick} disabled={isLoading || !url.trim()} leftIcon={isLoading ? <Loader2 className="animate-spin" /> : <DownloadCloud />}>
          {isLoading ? 'Analyzing...' : 'Scrape & Pre-fill Form'}
        </Button>
      </div>
    </Modal>
  );
}; 