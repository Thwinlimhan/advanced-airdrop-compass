import React, { useRef } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useAppContext } from '../../contexts/AppContext';
import { AppData, RecurringTask, Wallet, Airdrop, ClaimedTokenLog, StrategyNote, AirdropTask } from '../../types'; 
import { Download, Upload, AlertTriangle, WalletCards, Droplets, ListChecks, FileSpreadsheet, NotebookText } from 'lucide-react'; 
import { useToast } from '../../hooks/useToast';

export const DataManagement: React.FC = () => {
  const { appData, setAppData, exportAirdropsToCSV, exportWalletsToCSV, exportRecurringTasksToCSV, exportSoldTokenLogsToCSV } = useAppContext(); // Added CSV export functions
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const walletsFileInputRef = useRef<HTMLInputElement>(null); 
  const airdropsFileInputRef = useRef<HTMLInputElement>(null); 
  const recurringTasksFileInputRef = useRef<HTMLInputElement>(null); 
  const strategyNotesFileInputRef = useRef<HTMLInputElement>(null);


  const handleExportJsonData = (dataType: 'all' | 'wallets' | 'airdrops' | 'recurringTasks' | 'strategyNotes' = 'all') => {
    try {
      let dataToExport: any;
      let fileName = `airdrop_compass_backup_all_${new Date().toISOString().split('T')[0]}.json`;
      
      if (dataType === 'wallets') {
        dataToExport = { wallets: appData.wallets };
        fileName = `airdrop_compass_wallets_${new Date().toISOString().split('T')[0]}.json`;
      } else if (dataType === 'airdrops') {
        dataToExport = { airdrops: appData.airdrops };
        fileName = `airdrop_compass_airdrops_${new Date().toISOString().split('T')[0]}.json`;
      } else if (dataType === 'recurringTasks') { 
        dataToExport = { recurringTasks: appData.recurringTasks };
        fileName = `airdrop_compass_recurring_tasks_${new Date().toISOString().split('T')[0]}.json`;
      } else if (dataType === 'strategyNotes') {
        dataToExport = { strategyNotes: appData.strategyNotes };
        fileName = `airdrop_compass_strategy_notes_${new Date().toISOString().split('T')[0]}.json`;
      } else { 
         dataToExport = appData;
      }

      const contentString = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
      const link = document.createElement('a');
      link.href = contentString;
      link.download = fileName;
      link.click();
      addToast(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported successfully (JSON)!`, 'success');
    } catch (error) {
      console.error("Export error:", error);
      addToast(`Failed to export ${dataType} data. Check console for details.`, 'error');
    }
  };

  const handleImportFullData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedData = JSON.parse(text) as Partial<AppData>; 
            
            if (importedData.wallets !== undefined && importedData.airdrops !== undefined && importedData.settings !== undefined) {
              if (window.confirm("Are you sure you want to import this data? This will overwrite ALL your current data if it's a full backup.")) {
                const fullImportData: AppData = {
                    ...initialAppDataForImport(), 
                    ...importedData, 
                    wallets: importedData.wallets || [],
                    airdrops: importedData.airdrops || [],
                    recurringTasks: importedData.recurringTasks || [],
                    learningResources: importedData.learningResources || [],
                    strategyNotes: importedData.strategyNotes || [],
                    userAlerts: importedData.userAlerts || [],
                    settings: importedData.settings || appData.settings, 
                    watchlist: importedData.watchlist || [],
                    airdropTemplates: importedData.airdropTemplates || [],
                    yieldPositions: importedData.yieldPositions || [], 
                    userBadges: importedData.userBadges || [], 
                    savedAiStrategies: importedData.savedAiStrategies || [], 
                };
                setAppData(fullImportData); 
                addToast('Full data imported successfully! Application will use imported data.', 'success');
              } else {
                 addToast('Import cancelled by user.', 'info');
              }
            } else {
              throw new Error("Invalid full backup structure. Ensure it's a valid 'Export All Data' file.");
            }
          }
        } catch (error) {
          console.error("Full data import error:", error);
          addToast(`Failed to import full data: ${(error as Error).message}`, 'error');
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    }
  };
  
  const initialAppDataForImport = (): AppData => ({
    wallets: [], airdrops: [], recurringTasks: [], learningResources: [], strategyNotes: [],
    userAlerts: [], settings: appData.settings, watchlist: [], airdropTemplates: [],
    yieldPositions: [], userBadges: [], savedAiStrategies: [], 
  });


  const handleSelectiveImport = (
    event: React.ChangeEvent<HTMLInputElement>,
    dataType: 'wallets' | 'airdrops' | 'recurringTasks' | 'strategyNotes'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const imported = JSON.parse(text) as Partial<Pick<AppData, 'wallets' | 'airdrops' | 'recurringTasks' | 'strategyNotes'>>;
            const itemsToImport = imported[dataType];

            if (itemsToImport && Array.isArray(itemsToImport)) {
              if (window.confirm(`Are you sure you want to import ${itemsToImport.length} ${dataType}? This will REPLACE all current ${dataType}.`)) {
                setAppData(prev => ({ ...prev, [dataType]: itemsToImport as any }));
                addToast(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} imported successfully!`, 'success');
              } else {
                addToast(`${dataType} import cancelled.`, 'info');
              }
            } else {
              throw new Error(`Invalid file format for ${dataType}. Expected a JSON file with a '${dataType}' array.`);
            }
          }
        } catch (error) {
          console.error(`${dataType} import error:`, error);
          addToast(`Failed to import ${dataType}: ${(error as Error).message}`, 'error');
        } finally {
          let currentInputRef = fileInputRef; 
          if (dataType === 'wallets') currentInputRef = walletsFileInputRef;
          else if (dataType === 'airdrops') currentInputRef = airdropsFileInputRef;
          else if (dataType === 'recurringTasks') currentInputRef = recurringTasksFileInputRef;
          else if (dataType === 'strategyNotes') currentInputRef = strategyNotesFileInputRef;
          
          if (currentInputRef.current) currentInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleCsvImportComingSoon = (dataType: string) => {
    addToast(`CSV Import for ${dataType} is coming soon!`, "info");
  };

  return (
    <Card className="md:col-span-2">
      <h3 className="text-md font-semibold mb-2 text-text-light dark:text-text-dark">Data Management</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-semibold mb-2 text-text-light dark:text-text-dark">Export Data (JSON)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button onClick={() => handleExportJsonData('all')} variant="outline" leftIcon={<Download size={16}/>}>Export All Data</Button>
            <Button onClick={() => handleExportJsonData('wallets')} variant="outline" leftIcon={<WalletCards size={16}/>}>Export Wallets</Button>
            <Button onClick={() => handleExportJsonData('airdrops')} variant="outline" leftIcon={<Droplets size={16}/>}>Export Airdrops</Button>
            <Button onClick={() => handleExportJsonData('recurringTasks')} variant="outline" leftIcon={<ListChecks size={16}/>}>Export Recurring Tasks</Button>
            <Button onClick={() => handleExportJsonData('strategyNotes')} variant="outline" leftIcon={<NotebookText size={16}/>}>Export Strategy Notes</Button>
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-2">Download your data as JSON files for backup.</p>
        </div>
        
        <div>
          <h4 className="text-md font-semibold mb-2 mt-3 text-text-light dark:text-text-dark">Export Data (CSV)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button onClick={exportAirdropsToCSV} variant="outline" leftIcon={<FileSpreadsheet size={16}/>}>Export Airdrops (CSV)</Button>
            <Button onClick={exportWalletsToCSV} variant="outline" leftIcon={<FileSpreadsheet size={16}/>}>Export Wallets (CSV)</Button>
            <Button onClick={exportRecurringTasksToCSV} variant="outline" leftIcon={<FileSpreadsheet size={16}/>}>Export Recurring Tasks (CSV)</Button>
            <Button onClick={exportSoldTokenLogsToCSV} variant="outline" leftIcon={<FileSpreadsheet size={16}/>}>Export Sold Token Logs (CSV)</Button>
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-2">Export specific data types to CSV format for use in spreadsheets.</p>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2 mt-3 text-text-light dark:text-text-dark">Import Data (JSON)</h4>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 rounded-md mb-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Importing JSON data will <strong className="font-semibold">overwrite or replace</strong> existing data of the same type. Ensure your import file is correctly formatted from a previous export.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" leftIcon={<Upload size={16}/>}>Import All Data (JSON)</Button>
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportFullData} className="hidden" />
            </div>
            <div>
              <Button onClick={() => walletsFileInputRef.current?.click()} variant="outline" leftIcon={<WalletCards size={16}/>}>Import Wallets (JSON)</Button>
              <input type="file" accept=".json" ref={walletsFileInputRef} onChange={(e) => handleSelectiveImport(e, 'wallets')} className="hidden" />
            </div>
            <div>
              <Button onClick={() => airdropsFileInputRef.current?.click()} variant="outline" leftIcon={<Droplets size={16}/>}>Import Airdrops (JSON)</Button>
              <input type="file" accept=".json" ref={airdropsFileInputRef} onChange={(e) => handleSelectiveImport(e, 'airdrops')} className="hidden" />
            </div>
            <div>
              <Button onClick={() => recurringTasksFileInputRef.current?.click()} variant="outline" leftIcon={<ListChecks size={16}/>}>Import Recurring Tasks (JSON)</Button>
              <input type="file" accept=".json" ref={recurringTasksFileInputRef} onChange={(e) => handleSelectiveImport(e, 'recurringTasks')} className="hidden" />
            </div>
            <div>
              <Button onClick={() => strategyNotesFileInputRef.current?.click()} variant="outline" leftIcon={<NotebookText size={16}/>}>Import Strategy Notes (JSON)</Button>
              <input type="file" accept=".json" ref={strategyNotesFileInputRef} onChange={(e) => handleSelectiveImport(e, 'strategyNotes')} className="hidden" />
            </div>
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-2">Import data from previously exported JSON files. Selective imports replace only that category of data.</p>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-2 mt-3 text-text-light dark:text-text-dark">Import Data (CSV)</h4>
          <p className="text-xs text-muted-light dark:text-muted-dark mb-2">CSV import is more complex. These buttons are placeholders for future functionality.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button onClick={() => handleCsvImportComingSoon('Wallets')} variant="outline" leftIcon={<FileSpreadsheet size={16}/>} >Import Wallets (CSV)</Button>
            <Button onClick={() => handleCsvImportComingSoon('Airdrops')} variant="outline" leftIcon={<FileSpreadsheet size={16}/>} >Import Airdrops (CSV)</Button>
            <Button onClick={() => handleCsvImportComingSoon('Tasks')} variant="outline" leftIcon={<FileSpreadsheet size={16}/>} >Import Tasks (CSV)</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
