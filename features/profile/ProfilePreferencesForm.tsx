import React, { useState, useEffect } from 'react';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { TagInput } from '../../components/ui/TagInput';
import { UserFarmingPreferences } from '../../types';
import { Save } from 'lucide-react';
import { BLOCKCHAIN_OPTIONS, DEFAULT_USER_FARMING_PREFERENCES } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { Droplets, ListChecks, WalletCards, NotebookPen } from 'lucide-react';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

interface ProfilePreferencesFormProps {
  initialPreferences: UserFarmingPreferences;
  onSave: (preferences: UserFarmingPreferences) => Promise<void>;
}

export const ProfilePreferencesForm: React.FC<ProfilePreferencesFormProps> = ({ initialPreferences, onSave }) => {
    const [preferences, setPreferences] = useState<UserFarmingPreferences>(initialPreferences || DEFAULT_USER_FARMING_PREFERENCES);
    const [isDirty, setIsDirty] = useState(false);
    const { t } = useTranslation();
    
    useEffect(() => {
        setPreferences(initialPreferences || DEFAULT_USER_FARMING_PREFERENCES);
    }, [initialPreferences]);

    const handleChange = (field: keyof UserFarmingPreferences, value: any) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(preferences);
        setIsDirty(false);
    };

    const handleAutomationChange = (field: keyof UserFarmingPreferences['automations'], value: boolean) => {
        handleChange('automations', { ...preferences.automations, [field]: value });
    };

    const handleStrategyToggle = (strategy: string) => {
        const currentStrategies = preferences.preferredStrategies || [];
        if (currentStrategies.includes(strategy)) {
            handleChange('preferredStrategies', currentStrategies.filter((s) => s !== strategy));
        } else {
            handleChange('preferredStrategies', [...currentStrategies, strategy]);
        }
    };

    const availableStrategies = ['Aave', 'Compound', 'Uniswap', 'LayerZero', 'DeFi Lending', 'NFTs'];


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            <div>
                <label className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center">
                    <Droplets size={20} className="mr-2 text-[var(--color-accent)]"/>
                    {t('profile_risk_level_label', {defaultValue: 'Risk Level'})}
                </label>
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t('profile_risk_level_desc', {defaultValue: 'Choose your preferred risk level for airdrop farming.'})}
                </p>
                <Select
                    id="riskTolerance"
                    value={preferences.riskTolerance}
                    onChange={(e) => handleChange('riskTolerance', e.target.value)}
                    options={[
                        { value: 'Low', label: t('risk_low', {defaultValue: 'Low Risk'}) },
                        { value: 'Medium', label: t('risk_medium', {defaultValue: 'Medium Risk'}) },
                        { value: 'High', label: t('risk_high', {defaultValue: 'High Risk'}) },
                    ]}
                />
            </div>
             <div>
                <label className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center">
                    <ListChecks size={20} className="mr-2 text-[var(--color-accent)]"/>
                    {t('profile_interaction_freq_label', {defaultValue: 'Interaction Frequency'})}
                </label>
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t('profile_interaction_freq_desc', {defaultValue: 'How often you plan to interact with protocols.'})}
                </p>
                <Select
                    id="timeCommitment"
                    value={preferences.timeCommitment}
                    onChange={(e) => handleChange('timeCommitment', e.target.value)}
                    options={[
                         { value: '<5 hrs/wk', label: t('time_commitment_low', {defaultValue: '< 5 hours/week'}) },
                         { value: '5-10 hrs/wk', label: t('time_commitment_medium', {defaultValue: '5-10 hours/week'}) },
                         { value: '>10 hrs/wk', label: t('time_commitment_high', {defaultValue: '> 10 hours/week'}) },
                    ]}
                />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center">
                  <WalletCards size={20} className="mr-2 text-[var(--color-accent)]"/>
                  {t('profile_automations_title', {defaultValue: 'Farming Automations'})}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {t('profile_automations_desc', {defaultValue: 'Enable automations to streamline your workflow (conceptual).'})}
                </p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface-secondary)]">
                        <label htmlFor="autoClaim" className="text-sm font-medium text-[var(--color-text-secondary)]">{t('profile_auto_claim_label', {defaultValue: 'Auto-claim Rewards'})}</label>
                        <ToggleSwitch id="autoClaim" checked={preferences.automations?.autoClaim || false} onChange={(checked) => handleAutomationChange('autoClaim', checked)} />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface-secondary)]">
                        <label htmlFor="autoCompound" className="text-sm font-medium text-[var(--color-text-secondary)]">{t('profile_auto_compound_label', {defaultValue: 'Auto-compound Yield'})}</label>
                        <ToggleSwitch id="autoCompound" checked={preferences.automations?.autoCompound || false} onChange={(checked) => handleAutomationChange('autoCompound', checked)} />
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center">
                  <NotebookPen size={20} className="mr-2 text-[var(--color-accent)]"/>
                  {t('profile_strategy_prefs_title', {defaultValue: 'Strategy Preferences'})}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {t('profile_strategy_prefs_desc', {defaultValue: 'Select your preferred strategies for discovering airdrops.'})}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableStrategies.map(strategy => (
                        <button
                            type="button"
                            key={strategy}
                            onClick={() => handleStrategyToggle(strategy)}
                            className={`p-2 rounded-lg text-sm transition-all text-center ${
                                (preferences.preferredStrategies || []).includes(strategy)
                                    ? 'bg-[var(--color-accent)] text-white font-semibold shadow'
                                    : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                            }`}
                        >
                            {t(`strategies_${strategy.toLowerCase().replace(' ', '_')}`, {defaultValue: strategy})}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
            <Button type="submit" disabled={!isDirty} leftIcon={<Save size={16}/>}>
                {t('common_save_changes', {defaultValue: 'Save Changes'})}
            </Button>
        </div>
    </form>
  );
};
