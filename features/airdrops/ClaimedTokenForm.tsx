import React, { useState, useEffect } from 'react';
import { ClaimedTokenLog } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Button } from '../../design-system/components/Button';

interface ClaimedTokenFormProps {
  isOpen: boolean;
  onSubmit: (log: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'> | ClaimedTokenLog) => void;
  initialData?: ClaimedTokenLog;
  onClose: () => void;
}

export const ClaimedTokenForm: React.FC<ClaimedTokenFormProps> = ({ isOpen, onSubmit, initialData, onClose }) => {
  const [formData, setFormData] = useState<Partial<ClaimedTokenLog>>({
    symbol: '',
    quantity: 0,
    acquisitionCostPerToken: undefined,
    salePricePerToken: undefined,
    saleDate: undefined,
    notes: '',
    currentMarketPricePerToken: undefined,
    acquisitionLotId: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) { // Only reset/initialize when modal is actually open and data changes
      if (initialData) {
        setFormData({
          ...initialData,
          quantity: Number(initialData.quantity) || 0,
          acquisitionCostPerToken: initialData.acquisitionCostPerToken !== undefined ? Number(initialData.acquisitionCostPerToken) : undefined,
          salePricePerToken: initialData.salePricePerToken !== undefined ? Number(initialData.salePricePerToken) : undefined,
          currentMarketPricePerToken: initialData.currentMarketPricePerToken !== undefined ? Number(initialData.currentMarketPricePerToken) : undefined,
          saleDate: initialData.saleDate ? new Date(initialData.saleDate).toISOString().split('T')[0] : undefined,
          acquisitionLotId: initialData.acquisitionLotId || undefined,
        });
      } else {
        setFormData({
          symbol: '',
          quantity: 0,
          acquisitionCostPerToken: undefined,
          salePricePerToken: undefined,
          saleDate: undefined,
          notes: '',
          currentMarketPricePerToken: undefined,
          acquisitionLotId: undefined,
        });
      }
      setErrors({}); // Clear errors when modal opens or data changes
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? undefined : parseFloat(value),
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.symbol?.trim()) newErrors.symbol = 'Token symbol is required.';
    if (formData.quantity === undefined || formData.quantity <= 0) newErrors.quantity = 'Quantity must be a positive number.';
    if (formData.acquisitionCostPerToken !== undefined && formData.acquisitionCostPerToken < 0) newErrors.acquisitionCostPerToken = 'Acquisition cost cannot be negative.';
    if (formData.salePricePerToken !== undefined && formData.salePricePerToken < 0) newErrors.salePricePerToken = 'Sale price cannot be negative.';
    if (formData.currentMarketPricePerToken !== undefined && formData.currentMarketPricePerToken < 0) newErrors.currentMarketPricePerToken = 'Market price cannot be negative.';
    if (formData.saleDate && isNaN(new Date(formData.saleDate).getTime())) newErrors.saleDate = 'Invalid sale date.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        symbol: formData.symbol?.trim() || '',
        quantity: Number(formData.quantity) || 0,
        acquisitionCostPerToken: formData.acquisitionCostPerToken !== undefined ? Number(formData.acquisitionCostPerToken) : undefined,
        salePricePerToken: formData.salePricePerToken !== undefined ? Number(formData.salePricePerToken) : undefined,
        currentMarketPricePerToken: formData.currentMarketPricePerToken !== undefined ? Number(formData.currentMarketPricePerToken) : undefined,
        saleDate: formData.saleDate ? new Date(formData.saleDate).toISOString() : undefined,
        notes: formData.notes?.trim() || '',
        acquisitionLotId: formData.acquisitionLotId?.trim() || undefined,
      };

      if (initialData?.id) {
        onSubmit({ ...initialData, ...submissionData } as ClaimedTokenLog);
      } else {
        // For new logs, currentMarketPricePerToken is likely user-provided, not API fetched yet.
        onSubmit(submissionData as Omit<ClaimedTokenLog, 'id'>);
      }
      // onClose is handled by AirdropDetailPage after context update
    }
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        id="symbol"
        name="symbol"
        label="Token Symbol"
        value={formData.symbol || ''}
        onChange={handleChange}
        error={!!errors.symbol}
        helperText={errors.symbol}
        placeholder="e.g., ETH, ARB"
        required
      />
      <Input
        id="quantity"
        name="quantity"
        label="Quantity Received"
        type="number"
        value={formData.quantity === undefined ? '' : formData.quantity.toString()}
        onChange={handleChange}
        error={!!errors.quantity}
        helperText={errors.quantity}
        min="0"
        step="any"
        required
      />
      <Input
        id="acquisitionCostPerToken"
        name="acquisitionCostPerToken"
        label="Acquisition Cost per Token (Optional)"
        type="number"
        value={formData.acquisitionCostPerToken === undefined ? '' : formData.acquisitionCostPerToken.toString()}
        onChange={handleChange}
        error={!!errors.acquisitionCostPerToken}
        helperText={errors.acquisitionCostPerToken}
        min="0"
        step="any"
        placeholder="e.g., 0.5 (in USD or quote currency)"
      />
       <Input
        id="currentMarketPricePerToken"
        name="currentMarketPricePerToken"
        label="Current Market Price / Token (Manual - for Unsold Tokens)"
        type="number"
        value={formData.currentMarketPricePerToken === undefined ? '' : formData.currentMarketPricePerToken.toString()}
        onChange={handleChange}
        error={!!errors.currentMarketPricePerToken}
        helperText={errors.currentMarketPricePerToken}
        min="0"
        step="any"
        placeholder="e.g., 1.80"
      />
      <Input
        id="salePricePerToken"
        name="salePricePerToken"
        label="Sale Price per Token (Optional - if sold)"
        type="number"
        value={formData.salePricePerToken === undefined ? '' : formData.salePricePerToken.toString()}
        onChange={handleChange}
        error={!!errors.salePricePerToken}
        helperText={errors.salePricePerToken}
        min="0"
        step="any"
        placeholder="e.g., 2.5 (if sold)"
      />
      <Input
        id="saleDate"
        name="saleDate"
        label="Sale Date (Optional - if sold)"
        type="date"
        value={formData.saleDate || ''}
        onChange={handleChange}
        error={!!errors.saleDate}
        helperText={errors.saleDate}
      />
      <Input
        id="acquisitionLotId"
        name="acquisitionLotId"
        label="Acquisition Lot ID (Optional for Cost Basis)"
        value={formData.acquisitionLotId || ''}
        onChange={handleChange}
        placeholder="e.g., OriginalClaimID, PurchaseTxHash"
      />
      <Textarea
        id="notes"
        name="notes"
        label="Notes (Optional)"
        value={formData.notes || ''}
        onChange={handleChange}
        rows={3}
        placeholder="e.g., Sold half on KuCoin, staked the rest."
      />
      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-surface py-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Add Log'}</Button>
      </div>
    </form>
  );
};
