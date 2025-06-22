import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppData, AppContextType, Wallet, Airdrop, RecurringTask, LearningResource, StrategyNote, UserAlert, AppSettings, AirdropTask, ManualTransaction, Theme, TaskFrequency, ClaimedTokenLog, SybilChecklistItem, WatchlistItem, ConfidenceLevel, RoadmapEvent, AirdropStatus, AirdropPriority, AirdropTemplate, WidgetKey, AirdropCustomField, GasLogEntry, InteractionLogEntry, NftLogEntry, YieldPosition, AirdropNotificationSettings, NotificationType, UserBadge, SavedAiFarmingStrategy, AiFarmingStrategy, BalanceSnapshot, DayOfWeek, GasPrice, TransactionHistoryEntry, DashboardWidgetConfig, UserRegistrationInfo, CurrentUser, AuthResponse } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_SETTINGS, LOCAL_STORAGE_KEY, MOCK_GUIDES, MOCK_GLOSSARY_TERMS, APP_NAME, DEFAULT_SYBIL_CHECKLIST_ITEMS, DAYS_OF_WEEK, DEFAULT_AIRDROP_CARD_LAYOUT, DEFAULT_TRANSACTION_CATEGORIES, DEFAULT_AIRDROP_NOTIFICATION_SETTINGS, DEFAULT_USER_BADGES, COINGECKO_TOKEN_ID_MAP, AUTH_TOKEN_KEY, CURRENT_USER_KEY, API_BASE_URL } from '../constants';
import { useToast } from '../hooks/useToast';
import { formatRelativeDate, escapeCsvCell, parseMonetaryValue } from '../utils/formatting'; 

// Define an interface for the loading states
interface DataLoadingStates {
  wallets: boolean;
  airdrops: boolean;
  recurringTasks: boolean;
  // Add other data types as needed
}

const initialDataLoadingStates: DataLoadingStates = {
  wallets: false,
  airdrops: false,
  recurringTasks: false,
};


const initialAppData: AppData = {
  wallets: [],
  airdrops: [],
  recurringTasks: [],
  learningResources: [...MOCK_GUIDES, ...MOCK_GLOSSARY_TERMS], // Keep some default learning resources client-side for now
  strategyNotes: [],
  userAlerts: [],
  settings: DEFAULT_SETTINGS,
  watchlist: [],
  airdropTemplates: [],
  yieldPositions: [],
  userBadges: DEFAULT_USER_BADGES.map(b => ({ ...b, achieved: false, achievedDate: undefined })),
  savedAiStrategies: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Simplified fetch wrapper
const apiFetch = async (endpoint: string, token: string | null, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  if (token) {
    // @ts-ignore
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  // For 204 No Content or other non-JSON success responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null; 
  }
  return response.json();
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persistedData, setPersistedData] = useLocalStorage<AppData>(LOCAL_STORAGE_KEY, initialAppData);
  const [appData, setAppDataState] = useState<AppData>(persistedData);
  const { addToast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState<DataLoadingStates>(initialDataLoadingStates);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const setAndPersistAppData = useCallback((newAppDataOrCallback: AppData | ((prevState: AppData) => AppData)) => {
    setAppDataState(prevAppData => {
        let updatedData = typeof newAppDataOrCallback === 'function' 
            ? newAppDataOrCallback(prevAppData) 
            : newAppDataOrCallback;
        
        let pointsAddedInThisUpdate = 0;
        let taskCompletedToday = false; 

        if (typeof newAppDataOrCallback === 'function') { 
            const oldTotalCompletions = prevAppData.recurringTasks?.reduce((sum, t) => sum + (t.completionHistory?.length || 0), 0) || 0;
            const newTotalCompletions = updatedData.recurringTasks?.reduce((sum, t) => sum + (t.completionHistory?.length || 0), 0) || 0;

            if (newTotalCompletions > oldTotalCompletions) {
                pointsAddedInThisUpdate += 10 * (newTotalCompletions - oldTotalCompletions);
                taskCompletedToday = true;
            }

            let oldAirdropTasksCompleted = 0;
            prevAppData.airdrops.forEach(ad => ad.tasks.forEach(t => { if (t.completed) oldAirdropTasksCompleted++; if(t.subTasks) t.subTasks.forEach(st => {if(st.completed) oldAirdropTasksCompleted++;})}));
            let newAirdropTasksCompleted = 0;
            updatedData.airdrops.forEach(ad => ad.tasks.forEach(t => { if (t.completed) newAirdropTasksCompleted++; if(t.subTasks) t.subTasks.forEach(st => {if(st.completed) newAirdropTasksCompleted++;})}));
            if (newAirdropTasksCompleted > oldAirdropTasksCompleted) {
                 pointsAddedInThisUpdate += 25 * (newAirdropTasksCompleted - oldAirdropTasksCompleted);
                 taskCompletedToday = true;
            }
        }
        
        let currentSettings = { ...updatedData.settings };
        if (pointsAddedInThisUpdate > 0 && currentSettings.userPoints !== undefined) { 
            currentSettings.userPoints = (currentSettings.userPoints || 0) + pointsAddedInThisUpdate;
        }

        if (taskCompletedToday) {
            const todayString = getTodayDateString();
            if (currentSettings.lastTaskCompletionDate !== todayString) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toISOString().split('T')[0];

                if (currentSettings.lastTaskCompletionDate === yesterdayString) {
                    currentSettings.currentStreak = (currentSettings.currentStreak || 0) + 1;
                } else {
                    currentSettings.currentStreak = 1; 
                }
                currentSettings.lastTaskCompletionDate = todayString;
            }
        }
        
        updatedData = { ...updatedData, settings: currentSettings };
        
        const awardBadges = (data: AppData): AppData => {
            let internalUpdatedBadges = [...(data.userBadges || DEFAULT_USER_BADGES.map(b => ({ ...b, achieved: false, achievedDate: undefined })))];
            let madeChange = false;
            DEFAULT_USER_BADGES.forEach(defaultBadge => {
                let existingBadge = internalUpdatedBadges.find(ub => ub.id === defaultBadge.id);
                if (!existingBadge) {
                    existingBadge = { ...defaultBadge, achieved: false, achievedDate: undefined }; 
                    internalUpdatedBadges.push(existingBadge);
                }
                if (existingBadge.achieved) return; 

                let conditionMet = false;
                switch (defaultBadge.id) {
                    case 'welcome_farmer': conditionMet = true; break;
                    case 'first_airdrop_logged': conditionMet = data.airdrops.length > 0; break;
                }
                if (conditionMet) {
                    existingBadge.achieved = true;
                    existingBadge.achievedDate = new Date().toISOString();
                    madeChange = true;
                }
            });
            return madeChange ? { ...data, userBadges: internalUpdatedBadges } : data;
        };
        const dataWithBadges = awardBadges(updatedData);
        
        if (JSON.stringify(dataWithBadges) !== JSON.stringify(prevAppData)) {
             setPersistedData(dataWithBadges); 
        }
        return dataWithBadges;
    });
  }, [setPersistedData]);


  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAppDataState(initialAppData); 
    addToast('Logged out successfully.', 'info');
  }, [addToast]);

  const addUserAlert = useCallback(async (alertData: Omit<UserAlert, 'id' | 'date' | 'isRead'>) => {
    try {
        const newAlert: UserAlert = await apiFetch('/user-alerts', token, {method: 'POST', body: JSON.stringify(alertData)});
        setAndPersistAppData(prev => ({...prev, userAlerts: [newAlert, ...(prev.userAlerts || [])]}));
        if(appData.settings.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === "granted"){
            new Notification(newAlert.title || APP_NAME, { body: newAlert.body, icon: '/assets/icons/icon-192x192.png' });
        }
    } catch (e) { console.warn("Error adding user alert via API:", e); }
  }, [token, appData.settings.notificationsEnabled, setAndPersistAppData]);

  const markUserAlertAsRead = useCallback(async (alertId: string) => {
    try {
        const updatedAlert: UserAlert = await apiFetch(`/user-alerts/${alertId}/read`, token, {method: 'PUT'});
        setAndPersistAppData(prev => ({...prev, userAlerts: (prev.userAlerts || []).map(ua => ua.id === updatedAlert.id ? updatedAlert : ua)}));
    } catch (e) { addToast(`Error marking alert as read: ${(e as Error).message}`, 'error');}
  }, [token, setAndPersistAppData, addToast]);

  const deleteUserAlert = useCallback(async (alertId: string) => {
    try {
        await apiFetch(`/user-alerts/${alertId}`, token, {method: 'DELETE'});
        setAndPersistAppData(prev => ({...prev, userAlerts: (prev.userAlerts || []).filter(ua => ua.id !== alertId)}));
    } catch (e) { addToast(`Error deleting alert: ${(e as Error).message}`, 'error');}
  }, [token, setAndPersistAppData, addToast]);
  
  const markAllAlertsAsRead = useCallback(async () => {
    try {
        await apiFetch('/user-alerts/mark-all-read', token, {method: 'POST'});
        setAndPersistAppData(prev => ({...prev, userAlerts: (prev.userAlerts || []).map(ua => ({...ua, isRead: true}))}));
    } catch (e) { addToast(`Error marking all as read: ${(e as Error).message}`, 'error');}
  }, [token, setAndPersistAppData, addToast]);

  const clearReadAlerts = useCallback(async () => {
    try {
        await apiFetch('/user-alerts/read/clear', token, {method: 'DELETE'});
        setAndPersistAppData(prev => ({...prev, userAlerts: (prev.userAlerts || []).filter(ua => !ua.isRead)}));
    } catch (e) { addToast(`Error clearing read alerts: ${(e as Error).message}`, 'error');}
  }, [token, setAndPersistAppData, addToast]);
  
  const clearAllAlerts = useCallback(async () => {
    try {
        await apiFetch('/user-alerts/all/clear', token, {method: 'DELETE'});
        setAndPersistAppData(prev => ({...prev, userAlerts: []}));
    } catch (e) { addToast(`Error clearing all alerts: ${(e as Error).message}`, 'error');}
  }, [token, setAndPersistAppData, addToast]);


  const fetchAllUserData = useCallback(async (authToken: string) => {
    try {
      const [
        walletsData, airdropsData, recurringTasksData, 
        strategyNotesData, userAlertsData, settingsData, 
        watchlistData, airdropTemplatesData, yieldPositionsData, 
        userProfileData, 
        savedAiStrategiesData, 
      ] = await Promise.all([
        apiFetch('/wallets', authToken),
        apiFetch('/airdrops', authToken),
        apiFetch('/recurring-tasks', authToken),
        apiFetch('/strategy-notes', authToken),
        apiFetch('/user-alerts', authToken),
        apiFetch('/settings', authToken),
        apiFetch('/watchlist', authToken),
        apiFetch('/airdrop-templates', authToken),
        apiFetch('/yield-positions', authToken),
        apiFetch('/user-profile/preferences', authToken).then(prefs => 
            Promise.all([
                apiFetch('/user-profile/badges', authToken),
                apiFetch('/user-profile/points', authToken),
                apiFetch('/user-profile/streak', authToken)
            ]).then(([badges, points, streak]) => ({...prefs, badges, ...points, ...streak }))
        ),
        apiFetch('/ai-strategies', authToken),
        apiFetch('/learning-resources', authToken).catch(() => MOCK_GUIDES.concat(MOCK_GLOSSARY_TERMS))
      ]);

      setAndPersistAppData(prev => ({
        ...prev, 
        wallets: walletsData || [],
        airdrops: airdropsData || [],
        recurringTasks: recurringTasksData || [],
        strategyNotes: strategyNotesData || [],
        userAlerts: userAlertsData || [],
        settings: { 
            ...DEFAULT_SETTINGS, 
            ...settingsData,
            userPoints: userProfileData?.userPoints ?? DEFAULT_SETTINGS.userPoints,
            currentStreak: userProfileData?.currentStreak ?? DEFAULT_SETTINGS.currentStreak,
            lastTaskCompletionDate: userProfileData?.lastTaskCompletionDate ?? DEFAULT_SETTINGS.lastTaskCompletionDate,
        },
        userBadges: userProfileData?.badges || DEFAULT_USER_BADGES.map(b => ({ ...b, achieved: false, achievedDate: undefined })),
        watchlist: watchlistData || [],
        airdropTemplates: airdropTemplatesData || [],
        yieldPositions: yieldPositionsData || [],
        savedAiStrategies: savedAiStrategiesData || [],
        learningResources: Array.isArray(savedAiStrategiesData) ? savedAiStrategiesData : (MOCK_GUIDES.concat(MOCK_GLOSSARY_TERMS))
      }));
      addToast("All user data synced from server.", "success", 2000);
    } catch (e) {
      console.error("Error fetching user data:", e);
      addToast(`Error syncing data: ${(e as Error).message}. Using local data if available.`, "error");
    }
  }, [setAndPersistAppData, addToast]);


  useEffect(() => {
    const validateSession = async () => {
      setIsLoadingAuth(true);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        try {
          const userDataFromApi: CurrentUser = await apiFetch('/auth/me', storedToken);
          
          const finalUser: CurrentUser = {
              id: userDataFromApi.id,
              email: userDataFromApi.email,
              username: userDataFromApi.username || userDataFromApi.email.split('@')[0]
          };

          setToken(storedToken);
          setCurrentUser(finalUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(finalUser)); 
          setIsAuthenticated(true);
          
          await fetchAllUserData(storedToken);

        } catch (e) {
          console.error("Error validating session:", e);
          logout(); 
          addToast(`Session invalid: ${(e as Error).message}. Please login again.`, "warning");
        }
      }
      setIsLoadingAuth(false);
    };

    validateSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (appData.settings.language) {
      document.documentElement.lang = appData.settings.language;
    }
  }, [appData.settings.language, appData.settings.accentColor, appData.settings.fontFamily]);

   useEffect(() => {
    let dataToUpdate = JSON.parse(JSON.stringify(appData)); 
    let needsMigrationUpdate = false;

    if (dataToUpdate && dataToUpdate.settings) {
        Object.keys(DEFAULT_SETTINGS).forEach(key => {
            const settingKey = key as keyof AppSettings;
            if (dataToUpdate.settings[settingKey] === undefined) {
                // @ts-ignore
                dataToUpdate.settings[settingKey] = DEFAULT_SETTINGS[settingKey];
                needsMigrationUpdate = true;
            } else if (typeof DEFAULT_SETTINGS[settingKey] === 'object' && DEFAULT_SETTINGS[settingKey] !== null && !Array.isArray(DEFAULT_SETTINGS[settingKey])) {
                const defaultNested = DEFAULT_SETTINGS[settingKey] as Record<string, any>;
                const currentNested = dataToUpdate.settings[settingKey] as Record<string, any>;
                let nestedNeedsUpdate = false;
                Object.keys(defaultNested).forEach(nestedK => {
                    if (currentNested[nestedK] === undefined) {
                        currentNested[nestedK] = defaultNested[nestedK];
                        nestedNeedsUpdate = true;
                    }
                });
                if (nestedNeedsUpdate) needsMigrationUpdate = true;
            }
        });
    } else if (dataToUpdate) {
        dataToUpdate.settings = { ...DEFAULT_SETTINGS };
        needsMigrationUpdate = true;
    }
    
    const arrayKeys: (keyof AppData)[] = ['wallets', 'airdrops', 'recurringTasks', 'learningResources', 'strategyNotes', 'userAlerts', 'watchlist', 'airdropTemplates', 'yieldPositions', 'userBadges', 'savedAiStrategies'];
    arrayKeys.forEach(key => {
        if (!dataToUpdate[key]) {
            // @ts-ignore
            dataToUpdate[key] = [];
            needsMigrationUpdate = true;
        }
    });

    // Migrate AirdropTask objects to include webLink field
    if (dataToUpdate.airdrops && dataToUpdate.airdrops.length > 0) {
        const migrateTasksRecursive = (tasks: AirdropTask[]): AirdropTask[] => {
            return tasks.map(task => {
                let taskNeedsUpdate = false;
                const migratedTask = { 
                    ...task,
                    subTasks: task.subTasks || [],
                    cost: task.cost || undefined,
                    linkedGasLogId: task.linkedGasLogId || undefined,
                    completionDate: task.completionDate || undefined,
                    dependsOnTaskIds: task.dependsOnTaskIds || [], 
                    dependsOnAirdropMyStatusCompleted: task.dependsOnAirdropMyStatusCompleted || undefined,
                    webLink: task.webLink || undefined, // ADDED
                };
                
                // Check if any field was added
                if (task.webLink === undefined) {
                    taskNeedsUpdate = true;
                }
                
                // Migrate sub-tasks recursively
                if (migratedTask.subTasks && migratedTask.subTasks.length > 0) {
                    const migratedSubTasks = migrateTasksRecursive(migratedTask.subTasks);
                    if (migratedSubTasks.some(st => st !== migratedTask.subTasks!.find(original => original.id === st.id))) {
                        migratedTask.subTasks = migratedSubTasks;
                        taskNeedsUpdate = true;
                    }
                }
                
                if (taskNeedsUpdate) {
                    needsMigrationUpdate = true;
                }
                
                return migratedTask;
            });
        };

        dataToUpdate.airdrops = dataToUpdate.airdrops.map((airdrop: Airdrop) => {
            const migratedTasks = migrateTasksRecursive(airdrop.tasks);
            if (migratedTasks.some(t => t !== airdrop.tasks.find((original: AirdropTask) => original.id === t.id))) {
                return { ...airdrop, tasks: migratedTasks };
            }
            return airdrop;
        });
    }

    if (needsMigrationUpdate) {
        setAndPersistAppData(dataToUpdate); 
    }
  }, [appData, setAndPersistAppData]);


  const login = async (credentials: Pick<UserRegistrationInfo, 'email' | 'password'>): Promise<boolean> => {
    setIsLoadingAuth(true);
    try {
      const data: AuthResponse = await apiFetch('/auth/login', null, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (data.token && data.userId && data.email) {
        const user: CurrentUser = { id: data.userId, email: data.email, username: data.username || data.email.split('@')[0] };
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        setToken(data.token);
        setCurrentUser(user);
        setIsAuthenticated(true);
        addToast('Login successful!', 'success');
        await fetchAllUserData(data.token); 
        setIsLoadingAuth(false);
        return true;
      } else {
        addToast(data.message || 'Login failed', 'error');
        setIsLoadingAuth(false);
        return false;
      }
    } catch (error) {
      addToast((error as Error).message || 'Network error during login.', 'error');
      setIsLoadingAuth(false);
      return false;
    }
  };

  const register = async (userInfo: UserRegistrationInfo): Promise<boolean> => {
    setIsLoadingAuth(true);
    try {
      const data: AuthResponse = await apiFetch('/auth/register', null, {
        method: 'POST',
        body: JSON.stringify(userInfo),
      });
      addToast(data.message || 'Registration successful! Please login.', 'success');
      setIsLoadingAuth(false);
      return true; 
    } catch (error) {
      addToast((error as Error).message || 'Network error during registration.', 'error');
      setIsLoadingAuth(false);
      return false;
    }
  };
  
  const addWallet = useCallback(async (walletData: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'>) => {
    try {
      const newWallet: Wallet = await apiFetch('/wallets', token, { method: 'POST', body: JSON.stringify(walletData) });
      setAndPersistAppData(prev => ({ ...prev, wallets: [...prev.wallets, newWallet] }));
      addToast("Wallet added successfully.", "success");
    } catch (e) { addToast(`Error adding wallet: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateWallet = useCallback(async (updatedWallet: Wallet) => {
    try {
      const savedWallet: Wallet = await apiFetch(`/wallets/${updatedWallet.id}`, token, { method: 'PUT', body: JSON.stringify(updatedWallet) });
      setAndPersistAppData(prev => ({ ...prev, wallets: prev.wallets.map(w => (w.id === savedWallet.id ? savedWallet : w)) }));
      addToast("Wallet updated successfully.", "success");
    } catch (e) { addToast(`Error updating wallet: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteWallet = useCallback(async (walletId: string) => {
    try {
      await apiFetch(`/wallets/${walletId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({
        ...prev, wallets: prev.wallets.filter(w => w.id !== walletId),
        airdrops: prev.airdrops.map(ad => ({...ad, tasks: ad.tasks.map(t => t.associatedWalletId === walletId ? {...t, associatedWalletId: undefined, linkedGasLogId: undefined} : t)})),
      }));
      addToast("Wallet deleted successfully.", "success");
    } catch (e) { addToast(`Error deleting wallet: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const batchUpdateWallets = useCallback(async (walletIds: string[], updates: Partial<Pick<Wallet, 'isArchived' | 'group'>>) => {
    try {
        await apiFetch('/wallets/batch-update', token, { method: 'POST', body: JSON.stringify({ walletIds, updates }) });
        setAndPersistAppData(prev => ({ ...prev, wallets: prev.wallets.map(w => walletIds.includes(w.id) ? { ...w, ...updates } : w)}));
        addToast(`${walletIds.length} wallet(s) updated.`, 'success');
    } catch (e) { addToast(`Error batch updating wallets: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);

  const addGasLogToWallet = useCallback(async (walletId: string, logEntryData: Omit<GasLogEntry, 'id'>) => {
    try {
      const newLog: GasLogEntry = await apiFetch(`/wallets/${walletId}/gas-logs`, token, { method: 'POST', body: JSON.stringify(logEntryData) });
      setAndPersistAppData(prev => ({ ...prev, wallets: prev.wallets.map(w => w.id === walletId ? { ...w, gasLogs: [...(w.gasLogs || []), newLog] } : w) }));
      addToast("Gas log added.", "success");
    } catch(e) { addToast(`Error adding gas log: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteGasLogFromWallet = useCallback(async (walletId: string, logId: string) => {
    try {
      await apiFetch(`/wallets/${walletId}/gas-logs/${logId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({ ...prev, wallets: prev.wallets.map(w => w.id === walletId ? { ...w, gasLogs: (w.gasLogs || []).filter(l => l.id !== logId) } : w) }));
      addToast("Gas log deleted.", "success");
    } catch(e) { addToast(`Error deleting gas log: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);
  
  const addInteractionLogToWallet = useCallback(async (walletId: string, logEntryData: Omit<InteractionLogEntry, 'id'>) => {
    try {
      const newLog: InteractionLogEntry = await apiFetch(`/wallets/${walletId}/interaction-logs`, token, {method: 'POST', body: JSON.stringify(logEntryData)});
      setAndPersistAppData(prev => ({...prev, wallets: prev.wallets.map(w => w.id === walletId ? {...w, interactionLogs: [...(w.interactionLogs || []), newLog]} : w)}));
      addToast("Interaction log added.", "success");
    } catch (e) { addToast(`Error adding interaction log: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteInteractionLogFromWallet = useCallback(async (walletId: string, logId: string) => {
    try {
      await apiFetch(`/wallets/${walletId}/interaction-logs/${logId}`, token, {method: 'DELETE'});
      setAndPersistAppData(prev => ({...prev, wallets: prev.wallets.map(w => w.id === walletId ? {...w, interactionLogs: (w.interactionLogs || []).filter(l => l.id !== logId)} : w)}));
      addToast("Interaction log deleted.", "success");
    } catch (e) { addToast(`Error deleting interaction log: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);

  const addNftToWalletPortfolio = useCallback(async (walletId: string, nftEntryData: Omit<NftLogEntry, 'id'>) => {
    try {
      const newNft: NftLogEntry = await apiFetch(`/wallets/${walletId}/nfts`, token, {method: 'POST', body: JSON.stringify(nftEntryData)});
      setAndPersistAppData(prev => ({...prev, wallets: prev.wallets.map(w => w.id === walletId ? {...w, nftPortfolio: [...(w.nftPortfolio || []), newNft]} : w)}));
      addToast("NFT added to portfolio.", "success");
    } catch (e) { addToast(`Error adding NFT: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const updateNftInWalletPortfolio = useCallback(async (walletId: string, nftEntry: NftLogEntry) => {
    try {
      const updatedNft: NftLogEntry = await apiFetch(`/wallets/${walletId}/nfts/${nftEntry.id}`, token, {method: 'PUT', body: JSON.stringify(nftEntry)});
      setAndPersistAppData(prev => ({...prev, wallets: prev.wallets.map(w => w.id === walletId ? {...w, nftPortfolio: (w.nftPortfolio || []).map(n => n.id === updatedNft.id ? updatedNft : n)} : w)}));
      addToast("NFT updated.", "success");
    } catch (e) { addToast(`Error updating NFT: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const deleteNftFromWalletPortfolio = useCallback(async (walletId: string, nftId: string) => {
    try {
      await apiFetch(`/wallets/${walletId}/nfts/${nftId}`, token, {method: 'DELETE'});
      setAndPersistAppData(prev => ({...prev, wallets: prev.wallets.map(w => w.id === walletId ? {...w, nftPortfolio: (w.nftPortfolio || []).filter(n => n.id !== nftId)} : w)}));
      addToast("NFT deleted from portfolio.", "success");
    } catch (e) { addToast(`Error deleting NFT: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addAirdrop = useCallback(async (airdropData: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>): Promise<Airdrop | null> => {
    try {
      const newAirdrop: Airdrop = await apiFetch('/airdrops', token, { method: 'POST', body: JSON.stringify(airdropData) });
      setAndPersistAppData(prev => ({ ...prev, airdrops: [...prev.airdrops, newAirdrop] }));
      addToast("Airdrop added successfully.", "success");
      return newAirdrop;
    } catch (e) { addToast(`Error adding airdrop: ${(e as Error).message}`, "error"); return null; }
  }, [token, setAndPersistAppData, addToast]);

  const updateAirdrop = useCallback(async (updatedAirdrop: Airdrop) => {
    try {
      const savedAirdrop: Airdrop = await apiFetch(`/airdrops/${updatedAirdrop.id}`, token, { method: 'PUT', body: JSON.stringify(updatedAirdrop) });
      setAndPersistAppData(prev => ({ ...prev, airdrops: prev.airdrops.map(a => (a.id === savedAirdrop.id ? savedAirdrop : a)) }));
      addToast("Airdrop updated successfully.", "success");
      const oldAirdrop = appData.airdrops.find(a => a.id === savedAirdrop.id);
      if (oldAirdrop && (oldAirdrop.status !== savedAirdrop.status || oldAirdrop.myStatus !== savedAirdrop.myStatus)) {
          const notifySettings = savedAirdrop.notificationOverrides ?? appData.settings.defaultAirdropNotificationSettings;
          if(notifySettings.statusChange) {
              addUserAlert({ 
                type: NotificationType.STATUS_CHANGE, 
                title: `Status Update: ${savedAirdrop.projectName}`, 
                body: `Official status: ${savedAirdrop.status}, My status: ${savedAirdrop.myStatus}`, 
                relatedAirdropId: savedAirdrop.id 
              } as Omit<UserAlert, 'id' | 'date' | 'isRead'>);
          }
      }
    } catch (e) { addToast(`Error updating airdrop: ${(e as Error).message}`, "error"); }
  }, [token, appData.airdrops, appData.settings.defaultAirdropNotificationSettings, setAndPersistAppData, addToast, addUserAlert]); 

  const deleteAirdrop = useCallback(async (airdropId: string) => {
    try {
      await apiFetch(`/airdrops/${airdropId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({
        ...prev, airdrops: prev.airdrops.filter(a => a.id !== airdropId),
        recurringTasks: prev.recurringTasks.map(rt => rt.associatedAirdropId === airdropId ? { ...rt, associatedAirdropId: undefined } : rt)
      }));
      addToast("Airdrop deleted successfully.", "success");
    } catch (e) { addToast(`Error deleting airdrop: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const batchUpdateAirdrops = useCallback(async (airdropIds: string[], updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain' | 'isArchived'>>) => {
    try {
        await apiFetch('/airdrops/batch-update', token, { method: 'POST', body: JSON.stringify({ airdropIds, updates }) });
        setAndPersistAppData(prev => ({ ...prev, airdrops: prev.airdrops.map(a => airdropIds.includes(a.id) ? { ...a, ...updates } : a) }));
        addToast(`${airdropIds.length} airdrop(s) updated.`, 'success');
    } catch (e) { addToast(`Error batch updating airdrops: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);

  const batchAddNotesToAirdrops = useCallback(async (airdropIds: string[], notesToAppend: string) => {
    try {
        await apiFetch('/airdrops/batch-add-notes', token, { method: 'POST', body: JSON.stringify({ airdropIds, notesToAppend }) });
        setAndPersistAppData(prev => ({
            ...prev, airdrops: prev.airdrops.map(a => {
                if (airdropIds.includes(a.id)) {
                    return { ...a, notes: `${a.notes || ''}\n\n--- Appended Note (${new Date().toLocaleDateString()}) ---\n${notesToAppend}`.trim() };
                } return a;
            })
        }));
        addToast(`Notes added to ${airdropIds.length} airdrop(s).`, 'success');
    } catch (e) { addToast(`Error batch adding notes: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);
  
  const clearArchivedAirdrops = useCallback(async () => {
    try {
        await apiFetch('/airdrops/archived/all', token, { method: 'DELETE' });
        setAndPersistAppData(prev => ({ ...prev, airdrops: prev.airdrops.filter(a => !a.isArchived) }));
        addToast("All archived airdrops cleared.", "success");
    } catch(e) { addToast(`Error clearing archived airdrops: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);

  const addAirdropTask = useCallback(async (airdropId: string, taskData: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'>) => {
    try {
      const newTask: AirdropTask = await apiFetch(`/airdrops/${airdropId}/tasks`, token, { method: 'POST', body: JSON.stringify(taskData) });
      setAndPersistAppData(prev => ({
        ...prev, airdrops: prev.airdrops.map(a => {
          if (a.id === airdropId) {
            if (taskData.parentId) {
                const updateRecursive = (tasks: AirdropTask[]): AirdropTask[] => tasks.map(t => {
                    if (t.id === taskData.parentId) return {...t, subTasks: [...(t.subTasks || []), newTask]};
                    if (t.subTasks && t.subTasks.length > 0) return {...t, subTasks: updateRecursive(t.subTasks)};
                    return t;
                });
                return {...a, tasks: updateRecursive(a.tasks)};
            } else {
                return { ...a, tasks: [...a.tasks, newTask] };
            }
          }
          return a;
        })
      }));
      addToast("Task added.", "success");
    } catch (e) { addToast(`Error adding task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateAirdropTask = useCallback(async (airdropId: string, updatedTask: AirdropTask) => {
    try {
      const savedTask: AirdropTask = await apiFetch(`/airdrops/${airdropId}/tasks/${updatedTask.id}`, token, { method: 'PUT', body: JSON.stringify(updatedTask) });
      setAndPersistAppData(prev => ({
        ...prev, airdrops: prev.airdrops.map(a => {
          if (a.id === airdropId) {
            const updateTaskRecursive = (tasks: AirdropTask[]): AirdropTask[] => tasks.map(t => {
                if (t.id === savedTask.id) return savedTask;
                if (t.subTasks && t.subTasks.length > 0) return { ...t, subTasks: updateTaskRecursive(t.subTasks) };
                return t;
            });
            return { ...a, tasks: updateTaskRecursive(a.tasks) };
          }
          return a;
        })
      }));
      addToast("Task updated.", "success");
    } catch (e) { addToast(`Error updating task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateMultipleAirdropTasks = useCallback(async (airdropId: string, taskIds: string[], updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => {
    try {
        await apiFetch(`/airdrops/${airdropId}/tasks/batch-update`, token, { method: 'POST', body: JSON.stringify({ taskIds, updates}) });
        setAndPersistAppData(prev => {
            const newAirdrops = prev.airdrops.map(a => {
                if (a.id === airdropId) {
                    const updateTasksRecursive = (tasks: AirdropTask[]): AirdropTask[] => {
                        return tasks.map(t => {
                            let newT = {...t};
                            if(taskIds.includes(t.id)) newT = {...newT, ...updates};
                            if(newT.subTasks && newT.subTasks.length > 0) newT.subTasks = updateTasksRecursive(newT.subTasks);
                            return newT;
                        });
                    };
                    return {...a, tasks: updateTasksRecursive(a.tasks)};
                } return a;
            });
            return {...prev, airdrops: newAirdrops};
        });
        addToast(`${taskIds.length} tasks batch updated.`, 'success');
    } catch (e) { addToast(`Error batch updating tasks: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteAirdropTask = useCallback(async (airdropId: string, taskId: string) => { 
    try {
      await apiFetch(`/airdrops/${airdropId}/tasks/${taskId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({
        ...prev, airdrops: prev.airdrops.map(a => {
          if (a.id === airdropId) {
            const deleteTaskRecursive = (tasks: AirdropTask[]): AirdropTask[] => tasks.filter(t => t.id !== taskId).map(t => {
                if(t.subTasks && t.subTasks.length > 0) return {...t, subTasks: deleteTaskRecursive(t.subTasks)};
                return t;
            });
            return { ...a, tasks: deleteTaskRecursive(a.tasks) };
          }
          return a;
        })
      }));
      addToast("Task deleted.", "success");
    } catch (e) { addToast(`Error deleting task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const completeNextAirdropTask = useCallback(async (airdropId: string) => {
    let nextTaskToComplete: AirdropTask | undefined;
    const airdrop = appData.airdrops.find(a => a.id === airdropId);
    if (!airdrop) return;
    const findNext = (tasks: AirdropTask[]): AirdropTask | undefined => {
        for (const task of tasks) {
            if (!task.completed) return task;
            if (task.subTasks) { const sub = findNext(task.subTasks); if (sub) return sub; }
        } return undefined;
    };
    nextTaskToComplete = findNext(airdrop.tasks);
    if (nextTaskToComplete) {
        await updateAirdropTask(airdropId, { ...nextTaskToComplete, completed: true, completionDate: new Date().toISOString() });
    } else { addToast("No uncompleted tasks found.", "info"); }
  }, [appData.airdrops, updateAirdropTask, addToast]);
  
  const completeAllSubTasks = useCallback(async (airdropId: string, parentTaskId: string) => {
    const airdrop = appData.airdrops.find(a => a.id === airdropId);
    if (!airdrop) return;
    let parentTask: AirdropTask | undefined;
    const findParentRecursive = (tasks: AirdropTask[]): AirdropTask | undefined => {
        for (const task of tasks) {
            if (task.id === parentTaskId) return task;
            if (task.subTasks) { const sub = findParentRecursive(task.subTasks); if (sub) return sub; }
        } return undefined;
    };
    parentTask = findParentRecursive(airdrop.tasks);
    if (parentTask && parentTask.subTasks) {
        const updatedSubTasks = parentTask.subTasks.map(st => st.completed ? st : { ...st, completed: true, completionDate: new Date().toISOString() });
        const allSubsNowComplete = updatedSubTasks.every(st => st.completed);
        const updatedParentTask = { ...parentTask, subTasks: updatedSubTasks, completed: allSubsNowComplete ? true : parentTask.completed, completionDate: allSubsNowComplete && !parentTask.completed ? new Date().toISOString() : parentTask.completionDate };
        await updateAirdropTask(airdropId, updatedParentTask); 
        addToast("All sub-tasks marked complete.", "success");
    }
  }, [appData.airdrops, updateAirdropTask, addToast]);

  const addTransactionToAirdrop = useCallback(async (airdropId: string, transactionData: Omit<ManualTransaction, 'id' | 'airdropsId'>) => {
    try {
      const newTx: ManualTransaction = await apiFetch(`/airdrops/${airdropId}/transactions`, token, {method: 'POST', body: JSON.stringify(transactionData)});
      setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, transactions: [...a.transactions, newTx]} : a)}));
      addToast("Transaction logged.", "success");
    } catch(e) { addToast(`Error logging transaction: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);
  
  const deleteTransactionFromAirdrop = useCallback(async (airdropId: string, transactionId: string) => {
    try {
      await apiFetch(`/airdrops/${airdropId}/transactions/${transactionId}`, token, {method: 'DELETE'});
      setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, transactions: a.transactions.filter(tx => tx.id !== transactionId)} : a)}));
      addToast("Transaction deleted.", "success");
    } catch(e) { addToast(`Error deleting transaction: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);

  const addRecurringTask = useCallback(async (taskData: Omit<RecurringTask, 'id' | 'completionHistory' | 'notes' | 'tags'>) => {
    try {
      const newTask: RecurringTask = await apiFetch('/recurring-tasks', token, { method: 'POST', body: JSON.stringify(taskData) });
      setAndPersistAppData(prev => ({ ...prev, recurringTasks: [...prev.recurringTasks, newTask] }));
      addToast("Recurring task added.", "success");
    } catch (e) { addToast(`Error adding recurring task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateRecurringTask = useCallback(async (updatedTask: RecurringTask) => {
    try {
      const savedTask: RecurringTask = await apiFetch(`/recurring-tasks/${updatedTask.id}`, token, { method: 'PUT', body: JSON.stringify(updatedTask) });
      setAndPersistAppData(prev => ({ ...prev, recurringTasks: prev.recurringTasks.map(rt => (rt.id === savedTask.id ? savedTask : rt)) }));
      addToast("Recurring task updated.", "success");
    } catch (e) { addToast(`Error updating recurring task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteRecurringTask = useCallback(async (taskId: string) => {
    try {
      await apiFetch(`/recurring-tasks/${taskId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({ ...prev, recurringTasks: prev.recurringTasks.filter(rt => rt.id !== taskId) }));
      addToast("Recurring task deleted.", "success");
    } catch (e) { addToast(`Error deleting recurring task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const completeRecurringTask = useCallback(async (taskId: string) => {
    try {
      const updatedTask: RecurringTask = await apiFetch(`/recurring-tasks/${taskId}/complete`, token, { method: 'POST' });
      setAndPersistAppData(prev => ({ ...prev, recurringTasks: prev.recurringTasks.map(rt => (rt.id === updatedTask.id ? updatedTask : rt)) }));
      addToast(`Task "${updatedTask.name}" completed. Next due: ${formatRelativeDate(updatedTask.nextDueDate)}`, "success");
    } catch (e) { addToast(`Error completing task: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const snoozeRecurringTask = useCallback(async (taskId: string, daysToSnooze: number) => {
    try {
        const updatedTask: RecurringTask = await apiFetch(`/recurring-tasks/${taskId}/snooze`, token, { method: 'POST', body: JSON.stringify({ daysToSnooze }) });
        setAndPersistAppData(prev => ({...prev, recurringTasks: prev.recurringTasks.map(rt => rt.id === updatedTask.id ? updatedTask : rt)}));
        addToast(`Task "${updatedTask.name}" snoozed for ${daysToSnooze} day(s). New due date: ${formatRelativeDate(updatedTask.nextDueDate)}.`, "success");
    } catch (e) { addToast(`Error snoozing task: ${(e as Error).message}`, 'error'); }
  }, [token, setAndPersistAppData, addToast]);
  
  const addLearningResource = useCallback(async (resourceData: Omit<LearningResource, 'id'>): Promise<LearningResource | null> => {
    try {
      const newResource: LearningResource = await apiFetch('/learning-resources', token, { method: 'POST', body: JSON.stringify(resourceData) });
      setAndPersistAppData(prev => ({ ...prev, learningResources: [...prev.learningResources, newResource] }));
      addToast("Learning resource added.", "success");
      return newResource;
    } catch (e) { addToast(`Error adding resource: ${(e as Error).message}`, "error"); return null;}
  }, [token, setAndPersistAppData, addToast]);

  const updateLearningResource = useCallback(async (updatedResource: LearningResource) => {
    try {
      const savedResource: LearningResource = await apiFetch(`/learning-resources/${updatedResource.id}`, token, { method: 'PUT', body: JSON.stringify(updatedResource) });
      setAndPersistAppData(prev => ({ ...prev, learningResources: prev.learningResources.map(lr => (lr.id === savedResource.id ? savedResource : lr)) }));
      addToast("Learning resource updated.", "success");
    } catch (e) { addToast(`Error updating resource: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteLearningResource = useCallback(async (resourceId: string) => {
    try {
      await apiFetch(`/learning-resources/${resourceId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({ ...prev, learningResources: prev.learningResources.filter(lr => lr.id !== resourceId) }));
      addToast("Learning resource deleted.", "success");
    } catch (e) { addToast(`Error deleting resource: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addStrategyNote = useCallback(async (noteData: Omit<StrategyNote, 'id' | 'lastModified'>) => {
    try {
      const newNote: StrategyNote = await apiFetch('/strategy-notes', token, {method: 'POST', body: JSON.stringify(noteData)});
      setAndPersistAppData(prev => ({...prev, strategyNotes: [...(prev.strategyNotes || []), newNote]}));
      addToast("Strategy note added.", "success");
    } catch(e) { addToast(`Error adding strategy note: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);
  
  const updateStrategyNote = useCallback(async (updatedNote: StrategyNote) => {
    try {
      const savedNote: StrategyNote = await apiFetch(`/strategy-notes/${updatedNote.id}`, token, {method: 'PUT', body: JSON.stringify(updatedNote)});
      setAndPersistAppData(prev => ({...prev, strategyNotes: (prev.strategyNotes || []).map(sn => sn.id === savedNote.id ? savedNote : sn)}));
      addToast("Strategy note updated.", "success");
    } catch (e) { addToast(`Error updating strategy note: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);
  
  const deleteStrategyNote = useCallback(async (noteId: string) => {
    try {
      await apiFetch(`/strategy-notes/${noteId}`, token, {method: 'DELETE'});
      setAndPersistAppData(prev => ({...prev, strategyNotes: (prev.strategyNotes || []).filter(sn => sn.id !== noteId)}));
      addToast("Strategy note deleted.", "success");
    } catch (e) { addToast(`Error deleting strategy note: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);

  const updateSettings = useCallback(async (newSettingsPartial: Partial<AppSettings>) => {
    try {
      const updatedSettings: AppSettings = await apiFetch('/settings', token, { method: 'PUT', body: JSON.stringify(newSettingsPartial) });
      setAndPersistAppData(prev => ({ ...prev, settings: updatedSettings }));
    } catch (e) { addToast(`Error updating settings: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addClaimedTokenLog = useCallback(async (airdropId: string, logData: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'>) => {
    try {
        const newLog: ClaimedTokenLog = await apiFetch(`/airdrops/${airdropId}/claimed-tokens`, token, {method: 'POST', body: JSON.stringify(logData)});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, claimedTokens: [...a.claimedTokens, newLog]} : a)}));
        addToast("Claimed token log added.", "success");
    } catch (e) { addToast(`Error adding claimed token log: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const updateClaimedTokenLog = useCallback(async (airdropId: string, updatedLog: ClaimedTokenLog) => {
    try {
        const savedLog: ClaimedTokenLog = await apiFetch(`/airdrops/${airdropId}/claimed-tokens/${updatedLog.id}`, token, {method: 'PUT', body: JSON.stringify(updatedLog)});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, claimedTokens: a.claimedTokens.map(cl => cl.id === savedLog.id ? savedLog : cl)} : a)}));
        addToast("Claimed token log updated.", "success");
    } catch (e) { addToast(`Error updating claimed token log: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteClaimedTokenLog = useCallback(async (airdropId: string, logId: string) => {
    try {
        await apiFetch(`/airdrops/${airdropId}/claimed-tokens/${logId}`, token, {method: 'DELETE'});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, claimedTokens: a.claimedTokens.filter(cl => cl.id !== logId)} : a)}));
        addToast("Claimed token log deleted.", "success");
    } catch (e) { addToast(`Error deleting claimed token log: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const updateAirdropSybilItem = useCallback(async (airdropId: string, updatedItem: SybilChecklistItem) => {
    try {
        const savedItem: SybilChecklistItem = await apiFetch(`/airdrops/${airdropId}/sybil-checklist/${updatedItem.id}`, token, {method: 'PUT', body: JSON.stringify(updatedItem)});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, sybilChecklist: a.sybilChecklist.map(sci => sci.id === savedItem.id ? savedItem : sci)} : a)}));
    } catch (e) { addToast(`Error updating sybil item: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addWatchlistItem = useCallback(async (itemData: Omit<WatchlistItem, 'id' | 'addedDate'>) => {
    try {
      const newItem: WatchlistItem = await apiFetch('/watchlist', token, { method: 'POST', body: JSON.stringify(itemData) });
      setAndPersistAppData(prev => ({ ...prev, watchlist: [...(prev.watchlist || []), newItem] }));
      addToast("Item added to watchlist.", "success");
    } catch (e) { addToast(`Error adding to watchlist: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateWatchlistItem = useCallback(async (updatedItem: WatchlistItem) => {
    try {
      const savedItem: WatchlistItem = await apiFetch(`/watchlist/${updatedItem.id}`, token, { method: 'PUT', body: JSON.stringify(updatedItem) });
      setAndPersistAppData(prev => ({ ...prev, watchlist: (prev.watchlist || []).map(wi => (wi.id === savedItem.id ? savedItem : wi)) }));
      addToast("Watchlist item updated.", "success");
    } catch (e) { addToast(`Error updating watchlist item: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteWatchlistItem = useCallback(async (itemId: string) => {
    try {
      await apiFetch(`/watchlist/${itemId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({ ...prev, watchlist: (prev.watchlist || []).filter(wi => wi.id !== itemId) }));
      addToast("Watchlist item deleted.", "success");
    } catch (e) { addToast(`Error deleting watchlist item: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);
  
  const promoteWatchlistItemToAirdrop = useCallback(async (itemId: string): Promise<Airdrop | null> => {
    try {
        const response: { message: string, airdrop: Airdrop } = await apiFetch(`/watchlist/${itemId}/promote`, token, { method: 'POST' });
        const newAirdrop = await addAirdrop(response.airdrop); 
        if (newAirdrop) {
             setAndPersistAppData(prev => ({ ...prev, watchlist: (prev.watchlist || []).filter(wi => wi.id !== itemId)}));
            addToast(`Promoted "${response.airdrop.projectName}" to Airdrop Tracker!`, "success");
            return newAirdrop;
        } else {
            addToast(`Failed to finalize promotion for "${response.airdrop.projectName}".`, "error");
            return null;
        }
    } catch (e) { addToast(`Error promoting item: ${(e as Error).message}`, "error"); return null; }
  }, [token, addAirdrop, setAndPersistAppData, addToast]);

  const addRoadmapEvent = useCallback(async (airdropId: string, eventData: Omit<RoadmapEvent, 'id'>) => {
    try {
        const newEvent: RoadmapEvent = await apiFetch(`/airdrops/${airdropId}/roadmap-events`, token, {method: 'POST', body: JSON.stringify(eventData)});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, roadmapEvents: [...(a.roadmapEvents || []), newEvent]} : a)}));
        addToast("Roadmap event added.", "success");
    } catch (e) { addToast(`Error adding roadmap event: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);
  
  const updateRoadmapEvent = useCallback(async (airdropId: string, updatedEvent: RoadmapEvent) => {
    try {
        const savedEvent: RoadmapEvent = await apiFetch(`/airdrops/${airdropId}/roadmap-events/${updatedEvent.id}`, token, {method: 'PUT', body: JSON.stringify(updatedEvent)});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, roadmapEvents: (a.roadmapEvents || []).map(re => re.id === savedEvent.id ? savedEvent : re)} : a)}));
        addToast("Roadmap event updated.", "success");
    } catch (e) { addToast(`Error updating roadmap event: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);
  
  const deleteRoadmapEvent = useCallback(async (airdropId: string, eventId: string) => {
    try {
        await apiFetch(`/airdrops/${airdropId}/roadmap-events/${eventId}`, token, {method: 'DELETE'});
        setAndPersistAppData(prev => ({...prev, airdrops: prev.airdrops.map(a => a.id === airdropId ? {...a, roadmapEvents: (a.roadmapEvents || []).filter(re => re.id !== eventId)} : a)}));
        addToast("Roadmap event deleted.", "success");
    } catch (e) { addToast(`Error deleting roadmap event: ${(e as Error).message}`, "error");}
  }, [token, setAndPersistAppData, addToast]);
  
  const addAirdropTemplate = useCallback(async (templateData: Omit<AirdropTemplate, 'id'>) => {
    try {
      const newTemplate: AirdropTemplate = await apiFetch('/airdrop-templates', token, { method: 'POST', body: JSON.stringify(templateData) });
      setAndPersistAppData(prev => ({ ...prev, airdropTemplates: [...(prev.airdropTemplates || []), newTemplate] }));
      addToast("Airdrop template created.", "success");
    } catch (e) { addToast(`Error adding template: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateAirdropTemplate = useCallback(async (updatedTemplate: AirdropTemplate) => {
    try {
      const savedTemplate: AirdropTemplate = await apiFetch(`/airdrop-templates/${updatedTemplate.id}`, token, { method: 'PUT', body: JSON.stringify(updatedTemplate) });
      setAndPersistAppData(prev => ({ ...prev, airdropTemplates: (prev.airdropTemplates || []).map(at => (at.id === savedTemplate.id ? savedTemplate : at)) }));
      addToast("Airdrop template updated.", "success");
    } catch (e) { addToast(`Error updating template: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteAirdropTemplate = useCallback(async (templateId: string) => {
    try {
      await apiFetch(`/airdrop-templates/${templateId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({ ...prev, airdropTemplates: (prev.airdropTemplates || []).filter(at => at.id !== templateId) }));
      addToast("Airdrop template deleted.", "success");
    } catch (e) { addToast(`Error deleting template: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addYieldPosition = useCallback(async (positionData: Omit<YieldPosition, 'id'>) => {
    try {
      const newPosition: YieldPosition = await apiFetch('/yield-positions', token, { method: 'POST', body: JSON.stringify(positionData) });
      setAndPersistAppData(prev => ({ ...prev, yieldPositions: [...(prev.yieldPositions || []), newPosition] }));
      addToast("Yield position added.", "success");
    } catch (e) { addToast(`Error adding yield position: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const updateYieldPosition = useCallback(async (updatedPosition: YieldPosition) => {
    try {
      const savedPosition: YieldPosition = await apiFetch(`/yield-positions/${updatedPosition.id}`, token, { method: 'PUT', body: JSON.stringify(updatedPosition) });
      setAndPersistAppData(prev => ({ ...prev, yieldPositions: (prev.yieldPositions || []).map(p => (p.id === savedPosition.id ? savedPosition : p)) }));
      addToast("Yield position updated.", "success");
    } catch (e) { addToast(`Error updating yield position: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteYieldPosition = useCallback(async (positionId: string) => {
    try {
      await apiFetch(`/yield-positions/${positionId}`, token, { method: 'DELETE' });
      setAndPersistAppData(prev => ({ ...prev, yieldPositions: (prev.yieldPositions || []).filter(p => p.id !== positionId) }));
      addToast("Yield position deleted.", "success");
    } catch (e) { addToast(`Error deleting yield position: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addCustomTransactionCategory = useCallback(async (category: string) => {
    try {
        const response: {message: string, categories: string[]} = await apiFetch('/settings/transaction-categories', token, { method: 'POST', body: JSON.stringify({ category }) });
        setAndPersistAppData(prev => ({...prev, settings: {...prev.settings, customTransactionCategories: response.categories }}));
        addToast("Transaction category added.", "success");
    } catch (e) { addToast(`Error adding category: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteCustomTransactionCategory = useCallback(async (category: string) => {
    try {
        const response: {message: string, categories: string[]} = await apiFetch(`/settings/transaction-categories/${encodeURIComponent(category)}`, token, { method: 'DELETE' });
        setAndPersistAppData(prev => ({...prev, settings: {...prev.settings, customTransactionCategories: response.categories }}));
        addToast("Transaction category deleted.", "success");
    } catch (e) { addToast(`Error deleting category: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const addSavedAiStrategy = useCallback(async (strategy: AiFarmingStrategy) => {
    try {
        const newSavedStrategy: SavedAiFarmingStrategy = await apiFetch('/ai-strategies', token, { method: 'POST', body: JSON.stringify(strategy) });
        setAndPersistAppData(prev => ({ ...prev, savedAiStrategies: [...(prev.savedAiStrategies || []), newSavedStrategy] }));
        addToast("AI farming strategy saved.", "success");
    } catch (e) { addToast(`Error saving AI strategy: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);

  const deleteSavedAiStrategy = useCallback(async (strategyId: string) => {
    try {
        await apiFetch(`/ai-strategies/${strategyId}`, token, { method: 'DELETE' });
        setAndPersistAppData(prev => ({ ...prev, savedAiStrategies: (prev.savedAiStrategies || []).filter(s => s.id !== strategyId) }));
        addToast("Saved AI strategy deleted.", "success");
    } catch (e) { addToast(`Error deleting AI strategy: ${(e as Error).message}`, "error"); }
  }, [token, setAndPersistAppData, addToast]);


  const fetchTokenPricesAndUpdateLogs = useCallback(async (airdropsToUpdate: Airdrop[]) => {
    if (!token) { addToast("Not authenticated for fetching prices.", "error"); return; }
    const uniqueSymbols = new Set<string>();
    airdropsToUpdate.forEach(airdrop => { airdrop.claimedTokens.forEach(log => { if(log.symbol) uniqueSymbols.add(log.symbol.toUpperCase()); }); });
    (appData.yieldPositions || []).forEach(pos => { if(pos.assetSymbol) uniqueSymbols.add(pos.assetSymbol.toUpperCase()); });
    if (uniqueSymbols.size === 0) return;

    const coingeckoIds = Array.from(uniqueSymbols).map(symbol => COINGECKO_TOKEN_ID_MAP[symbol]).filter(Boolean);
    if (coingeckoIds.length === 0) { addToast("No known token IDs for price lookup via CoinGecko.", "info"); return; }

    try {
      const idsParam = coingeckoIds.join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`); 
      if (!response.ok) throw new Error(`CoinGecko API Error: ${response.status}`);
      const pricesData = await response.json();
      
      setAndPersistAppData(prev => {
        const updatedAirdrops = prev.airdrops.map(airdrop => {
          if (!airdropsToUpdate.find(au => au.id === airdrop.id)) return airdrop;
          const updatedClaimedTokens = airdrop.claimedTokens.map(log => {
            if(!log.symbol) return log; const symbolUpper = log.symbol.toUpperCase(); const coingeckoId = COINGECKO_TOKEN_ID_MAP[symbolUpper];
            let newPrice = log.currentMarketPricePerToken; 
            if (coingeckoId && pricesData[coingeckoId] && pricesData[coingeckoId].usd !== undefined) newPrice = pricesData[coingeckoId].usd;
            return { ...log, currentMarketPricePerToken: newPrice };
          });
          return { ...airdrop, claimedTokens: updatedClaimedTokens };
        });
        const updatedYieldPositions = (prev.yieldPositions || []).map(pos => {
            if (!pos.assetSymbol) return pos;
            const symbolUpper = pos.assetSymbol.toUpperCase(); const coingeckoId = COINGECKO_TOKEN_ID_MAP[symbolUpper];
            let newPrice = pos.currentValue; 
            if (coingeckoId && pricesData[coingeckoId] && pricesData[coingeckoId].usd !== undefined) {
                newPrice = pricesData[coingeckoId].usd * pos.amountStaked; 
            }
            return {...pos, currentValue: newPrice};
        });
        return { ...prev, airdrops: updatedAirdrops, yieldPositions: updatedYieldPositions };
      });
      addToast(`Live token prices updated for ${coingeckoIds.length} symbol(s).`, "success");
    } catch (e) { addToast(`Error fetching token prices: ${(e as Error).message}.`, "error"); }
  }, [token, appData.yieldPositions, setAndPersistAppData, addToast]);

  const fetchWalletBalances = useCallback(async (walletId: string) => {
    if (!token) { addToast("Not authenticated.", "error"); return; }
    const wallet = appData.wallets.find(w => w.id === walletId);
    if (!wallet) { addToast("Wallet not found.", "error"); return; }
    addToast(`Simulating data refresh for ${wallet.name}...`, "info", 2000);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        const newSnapshot: BalanceSnapshot = {
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            tokenSymbol: wallet.blockchain === 'Solana' ? 'SOL' : 'ETH',
            amount: parseFloat((Math.random() * 10 + 0.1).toFixed(3)),
            notes: 'Simulated API Sync',
        };
        const mockNft: NftLogEntry | undefined = Math.random() > 0.7 ? {
            id: crypto.randomUUID(), name: `Simulated NFT #${Math.floor(Math.random()*1000)}`,
            collectionName: 'Simulated Collection', contractAddress: `sim_contract_${Math.random().toString(16).substring(2,8)}`,
            notes: 'Fetched via API (Simulated)',
        } : undefined;

        setAndPersistAppData(prev => ({
            ...prev, wallets: prev.wallets.map(w => {
                if (w.id === walletId) {
                    return {
                        ...w,
                        balanceSnapshots: [...(w.balanceSnapshots || []), newSnapshot],
                        nftPortfolio: mockNft ? [...(w.nftPortfolio || []), mockNft] : w.nftPortfolio,
                        autoBalanceFetchEnabled: true, 
                    };
                } return w;
            })
        }));
        addToast(`Simulated data refresh complete for ${wallet.name}.`, "success");
    } catch (e) { addToast(`Error refreshing wallet data: ${(e as Error).message}`, 'error'); }
  }, [token, appData.wallets, setAndPersistAppData, addToast]);
  
  const fetchTransactionHistory = useCallback(async (walletId: string) => {
    if (!token) { addToast("Not authenticated.", "error"); return; }
    const wallet = appData.wallets.find(w => w.id === walletId);
    if (!wallet) { addToast("Wallet not found.", "error"); return; }
    addToast(`Fetching transaction history for ${wallet.name}...`, "info");
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockHistory: TransactionHistoryEntry[] = Array.from({length: Math.floor(Math.random()*8)+3}).map((_,i) => ({
            id: crypto.randomUUID(), hash: `0xsim${Math.random().toString(16).substring(2,10)}`,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            from: wallet.address, to: `0xreceiver${i}`, value: `${(Math.random()*0.5).toFixed(3)} ETH`,
            description: `Simulated transfer ${i+1}`, status: 'Success', isSimulated: true,
        }));
        setAndPersistAppData(prev => ({...prev, wallets: prev.wallets.map(w => w.id === walletId ? {...w, transactionHistory: mockHistory} : w)}));
        addToast(`Transaction history updated for ${wallet.name}.`, 'success');
    } catch (e) { addToast(`Error fetching transaction history: ${(e as Error).message}`, 'error');}
  }, [token, appData.wallets, setAndPersistAppData, addToast]);


  const getPortfolioSummaryForAI = useCallback((): Record<string, any> => {
    const summary = { totalAirdrops: appData.airdrops.length, activeAirdrops: appData.airdrops.filter(a => !a.isArchived && a.myStatus === AirdropStatus.IN_PROGRESS).length, totalWallets: appData.wallets.length, totalClaimedValueUSD: appData.airdrops.reduce((sum, ad) => sum + ad.claimedTokens.reduce((tokenSum, token) => tokenSum + ((parseMonetaryValue(token.salePricePerToken) || parseMonetaryValue(token.currentMarketPricePerToken) || 0) * token.quantity),0),0), totalCostsUSD: appData.airdrops.reduce((sum, ad) => sum + ad.transactions.reduce((txSum, tx) => txSum + parseFloat(tx.cost.replace(/[^0-9.-]+/g,"") || "0"), 0), 0) };
    return summary;
  }, [appData]);
  
  const markTutorialAsCompleted = useCallback((tutorialKey: string) => {
    updateSettings({ tutorialsCompleted: { ...(appData.settings.tutorialsCompleted || {}), [tutorialKey]: true } });
  }, [appData.settings.tutorialsCompleted, updateSettings]);

  const exportToCSV = (data: any[], headers: string[], fileName: string) => {
    const csvRows = [ headers.join(','), ...data.map(row => headers.map(header => escapeCsvCell(row[header.toLowerCase().replace(/\s+/g, '')] ?? row[header] ?? '')).join(',')) ];
    const csvString = csvRows.join('\n'); const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', fileName);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const exportAirdropsToCSV = useCallback(() => { exportToCSV(appData.airdrops.map(ad => ({ ...ad, tags: ad.tags?.join('; ') || '', dateAdded: new Date(ad.dateAdded).toLocaleDateString(), })), ['ID', 'ProjectName', 'Blockchain', 'Status', 'MyStatus', 'Potential', 'DateAdded', 'Description', 'EligibilityCriteria', 'Notes', 'Tags'], 'airdrops_export.csv'); addToast('Airdrops exported to CSV.', 'success'); }, [appData.airdrops, addToast]);
  const exportWalletsToCSV = useCallback(() => { exportToCSV(appData.wallets, ['ID', 'Name', 'Address', 'Blockchain', 'Group'], 'wallets_export.csv'); addToast('Wallets exported to CSV.', 'success'); }, [appData.wallets, addToast]);
  const exportRecurringTasksToCSV = useCallback(() => { exportToCSV(appData.recurringTasks.map(task => { const airdrop = appData.airdrops.find(ad => ad.id === task.associatedAirdropId); return { ...task, nextDueDate: new Date(task.nextDueDate).toLocaleDateString(), tags: task.tags?.join('; ') || '', associatedAirdropName: airdrop?.projectName || '', }; }), ['ID', 'Name', 'Frequency', 'NextDueDate', 'Description', 'Notes', 'Tags', 'AssociatedAirdropName'], 'recurring_tasks_export.csv'); addToast('Recurring tasks exported.', 'success'); }, [appData.recurringTasks, appData.airdrops, addToast]);
  const exportSoldTokenLogsToCSV = useCallback(() => { const rows: any[] = []; appData.airdrops.forEach(airdrop => { airdrop.claimedTokens.forEach(log => { if (log.salePricePerToken !== undefined && log.salePricePerToken !== null && log.saleDate) { const acqCostPerToken = parseMonetaryValue(log.acquisitionCostPerToken) || 0; const totalAcqCost = acqCostPerToken * log.quantity; const totalSaleValue = parseMonetaryValue(log.salePricePerToken)! * log.quantity; const netPL = totalSaleValue - totalAcqCost; rows.push({ airdropProjectName: airdrop.projectName, tokenSymbol: log.symbol, quantitySold: log.quantity, acquisitionCostPerToken: acqCostPerToken, totalAcquisitionCost: totalAcqCost, salePricePerToken: log.salePricePerToken, totalSaleValue: totalSaleValue, saleDate: new Date(log.saleDate).toLocaleDateString(), notes: log.notes || '', netPL: netPL }); } }); }); exportToCSV(rows, [ "AirdropProjectName", "TokenSymbol", "QuantitySold", "AcquisitionCostPerToken", "TotalAcquisitionCost", "SalePricePerToken", "TotalSaleValue", "SaleDate", "Notes", "NetPL" ], 'sold_token_logs.csv'); addToast('Sold token logs exported.', 'success'); }, [appData.airdrops, addToast]);

  const internalFetchWalletsFromApi = useCallback(async () => {
    if (!token) return;
    setIsDataLoading(prev => ({ ...prev, wallets: true }));
    try {
      const walletsFromApi: Wallet[] = await apiFetch('/wallets', token);
      setAndPersistAppData(prev => ({ ...prev, wallets: walletsFromApi || [] }));
    } catch (e) { addToast(`Failed to fetch wallets: ${(e as Error).message}`, "error"); }
    finally { setIsDataLoading(prev => ({ ...prev, wallets: false })); }
  }, [token, setAndPersistAppData, addToast]);

  const internalFetchAirdropsFromApi = useCallback(async () => {
    if (!token) return;
    setIsDataLoading(prev => ({ ...prev, airdrops: true }));
    try {
      const airdropsFromApi: Airdrop[] = await apiFetch('/airdrops', token);
      setAndPersistAppData(prev => ({ ...prev, airdrops: airdropsFromApi || [] }));
    } catch (e) { addToast(`Failed to fetch airdrops: ${(e as Error).message}`, "error"); }
    finally { setIsDataLoading(prev => ({ ...prev, airdrops: false })); }
  }, [token, setAndPersistAppData, addToast]);

  const internalFetchRecurringTasksFromApi = useCallback(async () => {
    if (!token) return;
     setIsDataLoading(prev => ({ ...prev, recurringTasks: true }));
    try {
      const tasksFromApi: RecurringTask[] = await apiFetch('/recurring-tasks', token);
      setAndPersistAppData(prev => ({ ...prev, recurringTasks: tasksFromApi || [] }));
    } catch (e) { addToast(`Failed to fetch recurring tasks: ${(e as Error).message}`, "error"); }
    finally { setIsDataLoading(prev => ({ ...prev, recurringTasks: false })); }
  }, [token, setAndPersistAppData, addToast]);


  const getRecentWalletLogs = useCallback((): { gasLogs: GasLogEntry[], interactionLogs: InteractionLogEntry[] } => {
    let allGasLogs: GasLogEntry[] = [];
    let allInteractionLogs: InteractionLogEntry[] = [];
    appData.wallets.forEach(wallet => {
        if (wallet.gasLogs) allGasLogs.push(...wallet.gasLogs.map(log => ({ ...log, walletName: wallet.name, walletId: wallet.id })));
        if (wallet.interactionLogs) allInteractionLogs.push(...wallet.interactionLogs.map(log => ({ ...log, walletName: wallet.name, walletId: wallet.id })));
    });
    allGasLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    allInteractionLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limit = 5; 
    return { gasLogs: allGasLogs.slice(0, limit), interactionLogs: allInteractionLogs.slice(0, limit) };
  }, [appData.wallets]);
  
  const checkAndAwardBadges = useCallback(() => {
    setAndPersistAppData(prev => prev); 
    addToast("Badge check re-evaluation (client-side).", "info");
  }, [setAndPersistAppData, addToast]);

  const runAiSentinelCheck = useCallback(async () => {
    addToast("AI Sentinel check feature not yet implemented.", "info");
  }, [addToast]);

  const runAiTaskValidation = useCallback(async (airdropId: string) => {
    addToast("AI Task validation feature not yet implemented.", "info");
  }, [addToast]);

  const scrapeAirdropDataFromURL = useCallback(async (url: string): Promise<Partial<Airdrop> | null> => {
    if (!token) {
        addToast("Not authenticated for AI scraping.", "error");
        return null;
    }

    // Try to extract a project name from the URL to help the AI
    let projectNameFromUrl = 'An Unnamed Project';
    try {
        const pathSegments = new URL(url).pathname.split('/');
        // Find the most likely project name from segments like /airdrop/some-project-name
        const projectSegment = pathSegments.find(seg => seg && seg.length > 3 && !['airdrop', 'project'].includes(seg));
        if (projectSegment) {
            projectNameFromUrl = projectSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    } catch(e) {
      console.warn("Could not parse project name from URL, using default.");
    }
    
    try {
        // For now, return mock data based on the URL
        // In a real implementation, this would call an AI service
        const mockPrefillData: Partial<Airdrop> = {
            projectName: projectNameFromUrl,
            description: `This is a mock project generated from the provided URL: ${url}. In a real implementation, this would be AI-generated based on the actual content of the page.`,
            blockchain: 'Ethereum',
            status: AirdropStatus.RUMORED,
            priority: AirdropPriority.MEDIUM,
            officialLinks: {
                website: url,
                twitter: '',
                discord: ''
            },
            projectCategory: 'DEX',
            potential: 'Medium'
        };
        
        return mockPrefillData;
    } catch(e) {
        console.error("AI Scrape Error: ", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during AI processing.";
        throw new Error(errorMessage);
    }
  }, [addToast, token]);

  const contextValue: AppContextType = {
    appData, setAppData: setAndPersistAppData, isAuthenticated, currentUser, token, isLoadingAuth, isDataLoading, // Added isDataLoading
    login, register, logout,
    addWallet, updateWallet, deleteWallet, batchUpdateWallets, getRecentWalletLogs,
    addGasLogToWallet, deleteGasLogFromWallet, addInteractionLogToWallet, deleteInteractionLogFromWallet,
    addNftToWalletPortfolio, updateNftInWalletPortfolio, deleteNftFromWalletPortfolio,
    addAirdrop, updateAirdrop, deleteAirdrop, batchUpdateAirdrops, batchAddNotesToAirdrops,
    addAirdropTask, updateAirdropTask, updateMultipleAirdropTasks, deleteAirdropTask, completeNextAirdropTask, completeAllSubTasks,
    addTransactionToAirdrop, deleteTransactionFromAirdrop,
    addRecurringTask, updateRecurringTask, deleteRecurringTask, completeRecurringTask, snoozeRecurringTask,
    addLearningResource, updateLearningResource, deleteLearningResource,
    addStrategyNote, updateStrategyNote, deleteStrategyNote,
    addUserAlert, markUserAlertAsRead, deleteUserAlert, markAllAlertsAsRead, clearReadAlerts, clearAllAlerts,
    updateSettings,
    addClaimedTokenLog, updateClaimedTokenLog, deleteClaimedTokenLog,
    updateAirdropSybilItem,
    addWatchlistItem, updateWatchlistItem, deleteWatchlistItem, promoteWatchlistItemToAirdrop,
    addRoadmapEvent, updateRoadmapEvent, deleteRoadmapEvent,
    markTutorialAsCompleted,
    addAirdropTemplate, updateAirdropTemplate, deleteAirdropTemplate,
    addYieldPosition, updateYieldPosition, deleteYieldPosition,
    addCustomTransactionCategory, deleteCustomTransactionCategory,
    fetchTokenPricesAndUpdateLogs, fetchWalletBalances,
    checkAndAwardBadges, 
    addSavedAiStrategy, deleteSavedAiStrategy,
    clearArchivedAirdrops,
    fetchTransactionHistory, 
    getPortfolioSummaryForAI,
    exportAirdropsToCSV, exportWalletsToCSV, exportRecurringTasksToCSV, exportSoldTokenLogsToCSV,
    internalFetchWalletsFromApi, internalFetchAirdropsFromApi, internalFetchRecurringTasksFromApi,
    isSidebarOpen, toggleSidebar,
    runAiSentinelCheck,
    runAiTaskValidation,
    scrapeAirdropDataFromURL
  };

  if (isLoadingAuth && !token) { 
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        Initializing application...
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
