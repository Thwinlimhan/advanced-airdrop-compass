import React, { useState, useEffect } from 'react';
import { Airdrop, AirdropStatus, AirdropPriority, AirdropTemplate, AirdropTask, AirdropCustomField, AirdropNotificationSettings, AirdropProjectCategory } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { TagInput } from '../../components/ui/TagInput';
import { CreatableSelect } from '../../components/ui/CreatableSelect';
import { BLOCKCHAIN_OPTIONS, AIRDROP_STATUS_OPTIONS, MY_AIRDROP_STATUS_OPTIONS, AIRDROP_PRIORITY_OPTIONS, AIRDROP_PROJECT_CATEGORIES, AIRDROP_POTENTIAL_OPTIONS } from '../../constants';
import { useAirdropStore } from '../../stores/airdropStore';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageUp, Loader2, Brain, PlusCircle, Trash2, Bell, Info, Target, Globe, Link, Twitter, MessageCircle, Tag, FileText, Settings, ChevronDown, ChevronRight, AlertCircle, Plus, X, Calendar, DollarSign, Clock, CheckSquare, ExternalLink } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../../design-system/components/Modal';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { useWalletStore } from '../../stores/walletStore';
import { SubtaskChecklist } from '../tasks/SubtaskChecklist';

interface AirdropFormData {
  projectName: string;
  blockchain: string;
  myStatus: string;
  potential: string;
  description: string;
  website: string;
  twitter: string;
  discord: string;
  telegram: string;
  tags: string[];
  notes: string;
  eligibility: string;
  dependencies: string[];
  initialTasks: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
}

interface AirdropFormErrors {
  projectName?: string;
  blockchain?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
}

interface AirdropFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (airdrop: AirdropFormData) => void;
  initialAirdrop?: Partial<AirdropFormData>;
  mode?: 'create' | 'edit';
}

export const AirdropFormModal: React.FC<AirdropFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialAirdrop = {},
  mode = 'create'
}) => {
  const { wallets } = useWalletStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<AirdropFormData>({
    projectName: '',
    blockchain: '',
    myStatus: 'Not Started',
    potential: 'Unknown',
    description: '',
    website: '',
    twitter: '',
    discord: '',
    telegram: '',
    tags: [],
    notes: '',
    eligibility: '',
    dependencies: [],
    initialTasks: [],
    ...initialAirdrop
  });

  const [errors, setErrors] = useState<AirdropFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newDependency, setNewDependency] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectName: '',
        blockchain: '',
        myStatus: 'Not Started',
        potential: 'Unknown',
        description: '',
        website: '',
        twitter: '',
        discord: '',
        telegram: '',
        tags: [],
        notes: '',
        eligibility: '',
        dependencies: [],
        initialTasks: [],
        ...initialAirdrop
      });
      setErrors({});
      setShowAdvanced(false);
      setNewTag('');
      setNewDependency('');
    }
  }, [isOpen, initialAirdrop]);

  // Inline validation
  const validateField = (field: keyof AirdropFormData, value: string) => {
    switch (field) {
      case 'projectName':
        if (!value.trim()) return 'Project name is required';
        if (value.trim().length < 2) return 'Project name must be at least 2 characters';
        break;
      case 'blockchain':
        if (!value.trim()) return 'Blockchain is required';
        break;
      case 'website':
        if (value && !isValidUrl(value)) {
          return 'Please enter a valid URL';
        }
        break;
      case 'twitter':
        if (value && !value.startsWith('@') && !value.startsWith('http')) {
          return 'Please enter a valid Twitter handle (@username) or URL';
        }
        break;
      case 'discord':
        if (value && !value.startsWith('http')) {
          return 'Please enter a valid Discord invite URL';
        }
        break;
      case 'telegram':
        if (value && !value.startsWith('@') && !value.startsWith('http')) {
          return 'Please enter a valid Telegram handle (@username) or URL';
        }
        break;
    }
    return '';
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFieldChange = (field: keyof AirdropFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof AirdropFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Validate field
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addDependency = () => {
    if (newDependency.trim() && !formData.dependencies.includes(newDependency.trim())) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, newDependency.trim()]
      }));
      setNewDependency('');
    }
  };

  const removeDependency = (dependency: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d !== dependency)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: AirdropFormErrors = {};
    
    // Validate required fields
    const projectNameError = validateField('projectName', formData.projectName);
    if (projectNameError) newErrors.projectName = projectNameError;
    
    const blockchainError = validateField('blockchain', formData.blockchain);
    if (blockchainError) newErrors.blockchain = blockchainError;
    
    // Validate optional fields if they have values
    if (formData.website) {
      const websiteError = validateField('website', formData.website);
      if (websiteError) newErrors.website = websiteError;
    }
    
    if (formData.twitter) {
      const twitterError = validateField('twitter', formData.twitter);
      if (twitterError) newErrors.twitter = twitterError;
    }
    
    if (formData.discord) {
      const discordError = validateField('discord', formData.discord);
      if (discordError) newErrors.discord = discordError;
    }
    
    if (formData.telegram) {
      const telegramError = validateField('telegram', formData.telegram);
      if (telegramError) newErrors.telegram = telegramError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      addToast(`Airdrop ${mode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
      onClose();
    } catch (error) {
      addToast(`Failed to ${mode === 'create' ? 'create' : 'update'} airdrop`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  const blockchains = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base', 'BSC', 'Solana', 'Avalanche', 'Other'];
  const statuses = ['Not Started', 'In Progress', 'Completed', 'Failed', 'On Hold'];
  const potentials = ['Unknown', 'Low', 'Medium', 'High', 'Very High'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'create' ? 'Create' : 'Edit'} Airdrop`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name *
                </label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => handleFieldChange('projectName', e.target.value)}
                  placeholder="Enter project name..."
                  className={errors.projectName ? 'border-red-500' : ''}
                />
                {errors.projectName && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.projectName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Blockchain *
                </label>
                <Select
                  value={formData.blockchain}
                  onValueChange={(value) => handleFieldChange('blockchain', value)}
                  options={[
                    { value: '', label: 'Select blockchain' },
                    ...blockchains.map(bc => ({ value: bc, label: bc }))
                  ]}
                />
                {errors.blockchain && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.blockchain}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <Select
                  value={formData.myStatus}
                  onValueChange={(value) => handleFieldChange('myStatus', value)}
                  options={statuses.map(status => ({ value: status, label: status }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Potential Value
                </label>
                <Select
                  value={formData.potential}
                  onValueChange={(value) => handleFieldChange('potential', value)}
                  options={potentials.map(potential => ({ value: potential, label: potential }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe the airdrop project..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Official Links Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Official Links
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="https://project.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  Official project website
                </div>
                {errors.website && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.website}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Twitter
                </label>
                <div className="relative">
                  <Input
                    value={formData.twitter}
                    onChange={(e) => handleFieldChange('twitter', e.target.value)}
                    placeholder="@username or URL"
                    className={errors.twitter ? 'border-red-500' : ''}
                  />
                  <Twitter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  Twitter handle or profile URL
                </div>
                {errors.twitter && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.twitter}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discord
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    value={formData.discord}
                    onChange={(e) => handleFieldChange('discord', e.target.value)}
                    placeholder="https://discord.gg/invite"
                    className={errors.discord ? 'border-red-500' : ''}
                  />
                  <MessageCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  Discord server invite URL
                </div>
                {errors.discord && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.discord}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telegram
                </label>
                <div className="relative">
                  <Input
                    value={formData.telegram}
                    onChange={(e) => handleFieldChange('telegram', e.target.value)}
                    placeholder="@username or URL"
                    className={errors.telegram ? 'border-red-500' : ''}
                  />
                  <MessageCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  Telegram handle or channel URL
                </div>
                {errors.telegram && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.telegram}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Advanced Settings
              </h3>
              {showAdvanced ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Eligibility Requirements
                </label>
                <Textarea
                  value={formData.eligibility}
                  onChange={(e) => handleFieldChange('eligibility', e.target.value)}
                  placeholder="Describe eligibility requirements..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addTag)}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dependencies
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newDependency}
                    onChange={(e) => setNewDependency(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addDependency)}
                    placeholder="Add a dependency..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDependency}
                    disabled={!newDependency.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.dependencies.length > 0 && (
                  <div className="space-y-2">
                    {formData.dependencies.map((dependency) => (
                      <div
                        key={dependency}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="flex-1 text-sm">{dependency}</span>
                        <button
                          type="button"
                          onClick={() => removeDependency(dependency)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Additional notes or context..."
                  rows={3}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Initial Tasks Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-600" />
              Initial Tasks (Optional)
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubtaskChecklist
              subtasks={formData.initialTasks}
              onChange={(initialTasks) => setFormData(prev => ({ ...prev, initialTasks }))}
              placeholder="Add an initial task..."
            />

            {formData.initialTasks.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No initial tasks added. You can add tasks later or create them now.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !formData.projectName.trim() || !formData.blockchain}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              `${mode === 'create' ? 'Create' : 'Update'} Airdrop`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
