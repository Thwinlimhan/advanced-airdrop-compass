import React, { useMemo } from 'react';
import { Airdrop, ClaimedTokenLog } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { PlusCircle, Edit3, Trash2, TrendingUp, TrendingDown, DollarSign, HelpCircle, Eye } from 'lucide-react';
import { parseMonetaryValue, formatCurrency } from '../../utils/formatting'; // Ensure formatCurrency is imported

interface ProfitLossTabProps {
  airdrop: Airdrop;
  onOpenClaimLogModal: (log?: ClaimedTokenLog) => void;
  onDeleteClaimLog: (airdropId: string, logId: string) => void;
  isArchived: boolean;
}

export const ProfitLossTab: React.FC<ProfitLossTabProps> = ({ airdrop, onOpenClaimLogModal, onDeleteClaimLog, isArchived }) => {

  const financials = useMemo(() => {
    let totalTransactionCosts = 0;
    airdrop.transactions.forEach(tx => {
      totalTransactionCosts += parseMonetaryValue(tx.cost);
    });

    let totalAcquisitionValue = 0;
    let totalSaleValue = 0;
    let totalUnrealizedValue = 0;

    airdrop.claimedTokens.forEach(log => {
      const acquisitionCost = (parseMonetaryValue(log.acquisitionCostPerToken) || 0) * log.quantity;
      totalAcquisitionValue += acquisitionCost;

      if (log.salePricePerToken !== undefined && log.salePricePerToken !== null && log.quantity) {
        totalSaleValue += parseMonetaryValue(log.salePricePerToken) * log.quantity;
      } else if (log.currentMarketPricePerToken !== undefined && log.currentMarketPricePerToken !== null && log.quantity) {
        totalUnrealizedValue += parseMonetaryValue(log.currentMarketPricePerToken) * log.quantity;
      }
    });
    
    const netProfitLossRealized = totalSaleValue - totalAcquisitionValue - totalTransactionCosts;

    return {
      totalTransactionCosts,
      totalAcquisitionValue,
      totalSaleValue,
      totalUnrealizedValue,
      netProfitLossRealized,
    };
  }, [airdrop.transactions, airdrop.claimedTokens]);

  const handleDelete = (logId: string, tokenSymbol: string) => {
      if (isArchived) return;
      if (window.confirm(`Are you sure you want to delete the claim log for ${tokenSymbol}?`)) {
          onDeleteClaimLog(airdrop.id, logId);
      }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-text-light dark:text-text-dark">Profit/Loss &amp; Claimed Tokens</h4>
        {!isArchived && (
            <Button size="sm" onClick={() => onOpenClaimLogModal()} leftIcon={<PlusCircle size={16}/>} disabled={isArchived}> Log Claimed Tokens </Button>
        )}
      </div>

      <Card className="mb-6 bg-gray-50 dark:bg-gray-800">
        <h5 className="text-lg font-medium text-text-light dark:text-text-dark mb-3 flex items-center"> <DollarSign size={20} className="mr-2 text-green-500" /> Financial Summary (Airdrop Specific) </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
          <div> <p className="text-muted-light dark:text-muted-dark">Total Transaction Costs (Gas, etc.):</p> <p className="font-semibold text-red-500 dark:text-red-400">{formatCurrency(financials.totalTransactionCosts)}</p> </div>
          <div> <p className="text-muted-light dark:text-muted-dark">Total Token Acquisition Costs:</p> <p className="font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(financials.totalAcquisitionValue)}</p> </div>
          <div> <p className="text-muted-light dark:text-muted-dark">Total Realized Sales Value:</p> <p className="font-semibold text-green-500 dark:text-green-400">{formatCurrency(financials.totalSaleValue)}</p> </div>
          <div> <p className="text-muted-light dark:text-muted-dark">Current Unrealized Value (Unsold):</p> <p className="font-semibold text-blue-500 dark:text-blue-400">{formatCurrency(financials.totalUnrealizedValue)}</p> </div>
          <div className="md:col-span-2 lg:col-span-2 mt-2"> <p className="text-muted-light dark:text-muted-dark">Overall Net Profit / Loss (Realized):</p> <p className={`text-2xl font-bold ${financials.netProfitLossRealized >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}> {financials.netProfitLossRealized >= 0 ? <TrendingUp className="inline mr-1" size={24}/> : <TrendingDown className="inline mr-1" size={24}/>} {formatCurrency(financials.netProfitLossRealized)} </p> </div>
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark mt-3"> Note: Calculations are based on logged data. Unrealized value uses manually updated or simulated current market prices. </p>
      </Card>
      
      <h5 className="text-lg font-medium text-text-light dark:text-text-dark mb-3">Claimed Token Logs</h5>
      {airdrop.claimedTokens.length === 0 ? ( <p className="text-muted-light dark:text-muted-dark">No token claims logged yet.</p> ) : (
        <div className="space-y-3">
          {airdrop.claimedTokens.slice().sort((a,b) => (a.symbol > b.symbol) ? 1 : -1).map(log => {
            const isSold = log.salePricePerToken !== undefined && log.salePricePerToken !== null;
            let unrealizedPL = 0;
            if (!isSold && log.currentMarketPricePerToken !== undefined && log.currentMarketPricePerToken !== null) {
                unrealizedPL = (parseMonetaryValue(log.currentMarketPricePerToken) - (parseMonetaryValue(log.acquisitionCostPerToken) || 0)) * log.quantity;
            }
            return (
                <div key={log.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700">
                <div className="flex justify-between items-start mb-1"> <h6 className="font-semibold text-md text-primary-light dark:text-primary-dark"> {log.quantity} {log.symbol} </h6> {!isArchived && ( <div className="flex space-x-1"> <Button variant="ghost" size="sm" onClick={() => onOpenClaimLogModal(log)} title="Edit Log" disabled={isArchived}><Edit3 size={16}/></Button> <Button variant="ghost" size="sm" onClick={() => handleDelete(log.id, log.symbol)} className="text-red-500 hover:text-red-700" title="Delete Log" disabled={isArchived}><Trash2 size={16}/></Button> </div> )} </div>
                <div className="text-xs space-y-0.5 text-muted-light dark:text-muted-dark">
                    {log.acquisitionCostPerToken !== undefined && <p>Acq. Cost/Token: {formatCurrency(parseMonetaryValue(log.acquisitionCostPerToken))} (Total Acq. Value: {formatCurrency(parseMonetaryValue(log.acquisitionCostPerToken) * log.quantity)})</p>}
                    {isSold ? ( <> <p>Sale Price/Token: {formatCurrency(parseMonetaryValue(log.salePricePerToken))} (Total Sale Value: {formatCurrency(parseMonetaryValue(log.salePricePerToken) * log.quantity)})</p> {log.saleDate && <p>Sale Date: {new Date(log.saleDate).toLocaleDateString()}</p>} </>
                    ) : ( log.currentMarketPricePerToken !== undefined && ( <> <p>Current Market Price/Token: {formatCurrency(parseMonetaryValue(log.currentMarketPricePerToken))}</p> <p className={`font-semibold ${unrealizedPL >= 0 ? 'text-green-500' : 'text-red-500'}`}> Unrealized P/L for this lot: {formatCurrency(unrealizedPL)} </p> </> )
                    )}
                    {log.acquisitionLotId && <p className="text-xs italic">Lot ID: {log.acquisitionLotId}</p>}
                </div>
                {log.notes && log.notes.trim() && <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 italic whitespace-pre-wrap">{log.notes}</p>}
                </div>
            );
            })}
        </div>
      )}
    </Card>
  );
};
