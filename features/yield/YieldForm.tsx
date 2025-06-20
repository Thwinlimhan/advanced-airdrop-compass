import React, { useState, useEffect } from 'react';
import { YieldPosition, Wallet } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { useToast } from '../../hooks/useToast'; // Added
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface YieldFormProps {
  onSubmit: (position: Omit<YieldPosition, 'id'> | YieldPosition) => void;
  initialData?: YieldPosition;
  onClose: () => void;
  wallets: Wallet[];
}

export const YieldForm: React.FC<YieldFormProps> = ({ onSubmit, initialData, onClose, wallets }) => {
  const { addToast } = useToast(); // Added
  const { t } = useTranslation(); // Added
  const [formData, setFormData] = useState<Partial<Omit<YieldPosition, 'id'>>>({
    platformName: '',
    assetSymbol: '',
    amountStaked: 0,
    walletId: wallets.length > 0 ? wallets[0].id : '',
    entryDate: new Date().toISOString().split('T')[0],
    currentApy: undefined,
    notes: '',
    poolUrl: '',
    currentValue: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  useEffect(() => {
    if (initialData) {
      const { id, ...editableData } = initialData;
      setFormData({
        ...editableData,
        amountStaked: Number(editableData.amountStaked) || 0,
        currentApy: editableData.currentApy !== undefined ? Number(editableData.currentApy) : undefined,
        currentValue: editableData.currentValue !== undefined ? Number(editableData.currentValue) : undefined,
        entryDate: editableData.entryDate ? new Date(editableData.entryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        platformName: '', assetSymbol: '', amountStaked: 0,
        walletId: wallets.length > 0 ? wallets[0].id : '',
        entryDate: new Date().toISOString().split('T')[0],
        currentApy: undefined, notes: '', poolUrl: '', currentValue: undefined,
      });
    }
  }, [initialData, wallets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number' && name !== 'currentApy' && name !== 'currentValue') { 
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
    } else if (name === 'currentApy' || name === 'currentValue') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.platformName?.trim()) newErrors.platformName = 'Platform name is required.';
    if (!formData.assetSymbol?.trim()) newErrors.assetSymbol = 'Asset symbol is required.';
    if (formData.amountStaked === undefined || formData.amountStaked <= 0) newErrors.amountStaked = 'Amount staked must be a positive number.';
    if (!formData.walletId) newErrors.walletId = 'Associated wallet is required.';
    if (!formData.entryDate) newErrors.entryDate = 'Entry date is required.';
    if (formData.currentApy !== undefined && formData.currentApy < 0) newErrors.currentApy = 'APY cannot be negative.';
    if (formData.currentValue !== undefined && formData.currentValue < 0) newErrors.currentValue = 'Current value cannot be negative.';
    if (formData.poolUrl && !formData.poolUrl.startsWith('http')) newErrors.poolUrl = 'Please enter a valid URL for the pool.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
        const submissionData = {
            platformName: formData.platformName!.trim(),
            assetSymbol: formData.assetSymbol!.trim(),
            amountStaked: Number(formData.amountStaked) || 0,
            walletId: formData.walletId!,
            entryDate: new Date(formData.entryDate!).toISOString(),
            currentApy: formData.currentApy !== undefined ? Number(formData.currentApy) : undefined,
            notes: formData.notes?.trim() || undefined,
            poolUrl: formData.poolUrl?.trim() || undefined,
            currentValue: formData.currentValue !== undefined ? Number(formData.currentValue) : undefined,
        };

        if (initialData?.id) {
            await onSubmit({ ...initialData, ...submissionData });
        } else {
            await onSubmit(submissionData as Omit<YieldPosition, 'id'>);
        }
        // onClose(); // Toast handled by AppContext
    } catch (error) {
        addToast(`Error submitting yield position: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const walletOptions = wallets.map(w => ({ value: w.id, label: `${w.name} (${w.blockchain})` }));
  if(walletOptions.length === 0) walletOptions.unshift({ value: '', label: 'No wallets available - Add one first!' });


  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input id="platformName" name="platformName" label="Platform Name" value={formData.platformName || ''} onChange={handleChange} error={!!errors.platformName} placeholder="e.g., Uniswap V3, Aave, Lido" required disabled={isSubmitting}/>
      <Input id="assetSymbol" name="assetSymbol" label="Asset / Pool Symbol" value={formData.assetSymbol || ''} onChange={handleChange} error={!!errors.assetSymbol} placeholder="e.g., ETH-USDC LP, stETH, SOL" required disabled={isSubmitting}/>
      <Input id="amountStaked" name="amountStaked" label="Amount Staked/Deposited" type="number" value={formData.amountStaked?.toString() || '0'} onChange={handleChange} error={!!errors.amountStaked} min="0" step="any" required disabled={isSubmitting}/>
      <Select id="walletId" name="walletId" label="Associated Wallet" value={formData.walletId || ''} onChange={handleChange} options={walletOptions} error={!!errors.walletId} required disabled={walletOptions.length === 0 || (walletOptions.length ===1 && walletOptions[0].value === '') || isSubmitting} />
      <Input id="entryDate" name="entryDate" label="Entry Date" type="date" value={formData.entryDate || ''} onChange={handleChange} error={!!errors.entryDate} required disabled={isSubmitting}/>
      <Input id="currentApy" name="currentApy" label="Current APY (%) (Manual)" type="number" value={formData.currentApy?.toString() || ''} onChange={handleChange} error={!!errors.currentApy} min="0" step="any" placeholder="e.g., 5.75" disabled={isSubmitting}/>
      <Input id="currentValue" name="currentValue" label="Current Value of Position (USD, Optional)" type="number" value={formData.currentValue?.toString() || ''} onChange={handleChange} error={!!errors.currentValue} min="0" step="any" placeholder="e.g., 1250.75" disabled={isSubmitting}/>
      <Input id="poolUrl" name="poolUrl" label="Link to Pool/Farm (Optional)" type="url" value={formData.poolUrl || ''} onChange={handleChange} error={!!errors.poolUrl} placeholder="https://app.uniswap.org/..." disabled={isSubmitting}/>
      <Textarea id="notes" name="notes" label="Notes (Optional)" value={formData.notes || ''} onChange={handleChange} rows={3} placeholder="e.g., Impermanent loss strategy, lock-up period." disabled={isSubmitting}/>
      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-card-light py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common_cancel')}</Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || walletOptions.length === 0 || (walletOptions.length ===1 && walletOptions[0].value === '')}>{initialData ? t('common_save_changes_button', {defaultValue:'Save Changes'}) : t('common_add_position_button', {defaultValue: 'Add Position'})}</Button>
      </div>
    </form>
  );
};
