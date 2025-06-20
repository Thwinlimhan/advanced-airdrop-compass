import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Settings, Zap, DollarSign, ShieldCheck, ListChecks, ArrowLeft, Cog, Repeat, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Select } from '../../design-system/components/Select';

export const AutomationSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [globalAutomationEnabled, setGlobalAutomationEnabled] = useState(false);
  const [ethMaxGwei, setEthMaxGwei] = useState('20');
  const [solMaxLamports, setSolMaxLamports] = useState('10000');
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [dailyBudget, setDailyBudget] = useState('50');
  const [whitelistedContracts, setWhitelistedContracts] = useState('0xUniswapRouter, 0xStargatePool');
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [minTxValue, setMinTxValue] = useState('5');
  const [maxTxValue, setMaxTxValue] = useState('100');

  const automationStrategies = [
    { value: 'conservative', label: 'Conservative (Low Risk, Established Protocols)' },
    { value: 'balanced', label: 'Balanced (Mix of Old & New, Moderate Risk)' },
    { value: 'aggressive', label: 'Aggressive (High Risk, New/Untested Protocols)' },
    { value: 'custom', label: 'Custom (User Defined - Not Implemented)' },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <Link to="/settings" className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <Cog size={28} className="mr-2 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {t('settings_automation_title')}
        </h2>
      </div>

      <AlertMessage
        type="warning"
        title="Conceptual Feature - Not Functional"
        message={t('settings_automation_desc')}
        className="mb-6"
      />

      <Card>
        <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-1">
          Global Automation Control
        </h3>
        <ToggleSwitch
          id="globalAutomationToggle"
          label="Enable Automated Interactions"
          checked={globalAutomationEnabled}
          onChange={setGlobalAutomationEnabled}
        />
        <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
          {globalAutomationEnabled 
            ? "Conceptual automation is 'enabled'. No actions will be performed."
            : "Conceptual automation is 'disabled'."}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-1">
            Interaction Strategy
          </h3>
          <Select
            id="automationStrategy"
            label="Automation Strategy Profile"
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            options={automationStrategies}
            disabled={!globalAutomationEnabled}
          />
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
            Select a pre-defined strategy or define custom rules (conceptual).
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-1">
            Budget & Safety
          </h3>
          <div className="space-y-4">
            <Input
              id="dailyBudget"
              label="Max Daily Automation Spend (USD - Conceptual)"
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              disabled={!globalAutomationEnabled}
              placeholder="e.g., 50"
              leftIcon={<DollarSign size={16} className="text-gray-400"/>}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                id="minTxValue"
                label="Min Transaction Value (USD)"
                type="number"
                value={minTxValue}
                onChange={(e) => setMinTxValue(e.target.value)}
                disabled={!globalAutomationEnabled}
                placeholder="e.g., 5"
                />
                <Input
                id="maxTxValue"
                label="Max Transaction Value (USD)"
                type="number"
                value={maxTxValue}
                onChange={(e) => setMaxTxValue(e.target.value)}
                disabled={!globalAutomationEnabled}
                placeholder="e.g., 100"
                />
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-1">
            Gas & Slippage Settings
          </h3>
          <div className="space-y-4">
            <Input
              id="ethMaxGwei"
              label="Ethereum Max Gwei"
              type="number"
              value={ethMaxGwei}
              onChange={(e) => setEthMaxGwei(e.target.value)}
              disabled={!globalAutomationEnabled}
              placeholder="e.g., 25"
            />
            <Input
              id="solMaxLamports"
              label="Solana Max Lamports (Compute Units)"
              type="number"
              value={solMaxLamports}
              onChange={(e) => setSolMaxLamports(e.target.value)}
              disabled={!globalAutomationEnabled}
              placeholder="e.g., 200000"
            />
            <Input
              id="slippageTolerance"
              label="Default Slippage Tolerance (%)"
              type="number"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(e.target.value)}
              min="0.1"
              max="5"
              step="0.1"
              disabled={!globalAutomationEnabled}
              placeholder="e.g., 0.5"
            />
          </div>
        </Card>

         <Card>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-1">
              Contract Interaction Control
            </h3>
            <div>
              <label htmlFor="whitelistedContracts" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Whitelisted Contract Addresses (Comma-separated)
              </label>
              <textarea
                id="whitelistedContracts"
                rows={3}
                value={whitelistedContracts}
                onChange={(e) => setWhitelistedContracts(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm bg-white dark:bg-gray-700 text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                placeholder="e.g., 0xUniswapRouter, 0xStargatePool..."
                disabled={!globalAutomationEnabled}
              />
              <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Only interact with these contracts when automated.</p>
            </div>
            <div className="mt-3">
              <ToggleSwitch
                  id="interactUnknownContracts"
                  label="Allow interaction with new/unknown contracts (High Risk)"
                  checked={false} // Default to false for safety
                  onChange={() => {}} // Conceptual
                  disabled={!globalAutomationEnabled}
              />
            </div>
        </Card>
      </div>

      <Card title="Task Automation Preferences (Conceptual)" className="mt-6">
        <p className="text-sm text-muted-light dark:text-muted-dark mb-3">
          Define which types of tasks or strategies the automation engine might attempt.
        </p>
        <div className="space-y-3">
            <ToggleSwitch id="autoSwap" label="Attempt Automated Swaps (e.g., for volume)" checked={false} onChange={() => {}} disabled={!globalAutomationEnabled}/>
            <ToggleSwitch id="autoBridge" label="Attempt Automated Bridging Tasks" checked={false} onChange={() => {}} disabled={!globalAutomationEnabled}/>
            <ToggleSwitch id="autoStake" label="Attempt Automated Staking/Restaking" checked={false} onChange={() => {}} disabled={!globalAutomationEnabled}/>
            <ToggleSwitch id="autoGovernance" label="Attempt Automated Governance Voting (if possible)" checked={false} onChange={() => {}} disabled={!globalAutomationEnabled}/>
            <ToggleSwitch id="autoNftMint" label="Attempt Automated NFT Mints (based on criteria)" checked={false} onChange={() => {}} disabled={!globalAutomationEnabled}/>
        </div>
      </Card>
      
      <div className="mt-8 flex justify-end">
         <Button variant="primary" disabled={!globalAutomationEnabled} onClick={() => alert("Conceptual settings saved (no actual changes).")}>
            Save Automation Settings (Conceptual)
          </Button>
      </div>
    </PageWrapper>
  );
};
