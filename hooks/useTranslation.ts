
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';

export interface TranslationHook {
  t: (key: string, options?: { defaultValue?: string; [key: string]: any }) => string;
  currentLanguage: string;
  setLanguage: (lang: string) => Promise<void>;
  isLoading: boolean;
}

// Cache for loaded translation files
const translationsCache: Record<string, Record<string, string>> = {};
// Fallback English translations, in case fetching en.json fails initially
const embeddedEnTranslations: Record<string, string> = {
  "app_name": "Advanced Crypto Airdrop Compass",
  "nav_dashboard": "Dashboard",
  "nav_watchlist": "Watchlist",
  "nav_airdrop_tracker": "Airdrop Tracker",
  "nav_recurring_tasks": "Recurring Tasks",
  "nav_portfolio_overview": "Portfolio Overview",
  "nav_yield_tracker": "Yield Tracker",
  "nav_learning_hub": "Learning Hub",
  "nav_wallet_manager": "Wallet Manager",
  "nav_settings": "Settings",
  "nav_achievements": "Achievements",
  "nav_reports": "Reports",
  "notification_center": "Notification Center",
  "add_new_airdrop_button": "Add New Airdrop",
  "add_new_wallet_button": "Add New Wallet",
  "add_new_task_button": "Add New Task",
  "theme_label": "Theme",
  "language_label": "Language",
  "settings_title": "Application Settings",
  "settings_appearance_title": "Appearance",
  "settings_font_family_label": "Font Family",
  "settings_language_label": "Language",
  "settings_notifications_title": "Notifications",
  "settings_enable_reminders": "Enable Task Reminders",
  "settings_notifications_blocked": "Notifications are blocked by your browser. Please enable them in your browser settings.",
  "settings_notifications_request_permission": "Click the toggle to request notification permission.",
  "settings_dashboard_widgets_title": "Dashboard Widget Visibility",
  "settings_dashboard_widgets_desc": "Choose which widgets to display on your main dashboard.",
  "settings_widget_summary": "Summary Stats",
  "settings_widget_user_stats": "User Stats (Points)",
  "settings_widget_ai_discovery": "AI Discovery",
  "settings_widget_gas": "Gas Tracker",
  "settings_widget_priority_tasks": "Priority Tasks",
  "settings_widget_alerts": "Airdrop Alerts",
  "settings_gas_tracker_title": "Dashboard Gas Tracker Networks",
  "settings_gas_tracker_desc": "Select which blockchain networks to display in the gas tracker widget on your dashboard.",
  "settings_reset_title": "Reset Settings",
  "settings_reset_desc": "This will reset all application settings (Theme, Notifications, Gas Networks, Widget Visibility) to their default values. Your airdrops, wallets, tasks, and learning data will NOT be affected.",
  "settings_reset_button": "Reset All Settings to Default",
  "settings_language_updated_toast": "Language settings saved.",
  "settings_language_load_error_toast": "Error loading {{lang}} translations. Falling back to English.",
  "settings_reset_confirm_message": "Are you sure you want to reset all settings to their defaults? This will not affect your airdrop data.",
  "settings_reset_success_toast": "All application settings have been reset to default.",
  "settings_card_display_title": "Airdrop Card Display",
  "settings_card_display_desc": "Customize what information is visible on the airdrop cards in the main list.",
  "settings_card_opt_showTags": "Show Tags",
  "settings_card_opt_showDescriptionSnippet": "Show Description Snippet",
  "settings_card_opt_showPriority": "Show Priority",
  "settings_card_opt_showMyStatus": "Show My Status",
  "settings_card_opt_showOfficialStatus": "Show Official Status",
  "settings_card_opt_showPotential": "Show Potential",
  "settings_card_opt_showProgressBar": "Show Task Progress Bar",
  "settings_tx_categories_title": "Transaction Categories",
  "settings_tx_categories_desc": "Manage categories for labeling wallet interactions and airdrop transactions.",
  "settings_new_category_placeholder": "New category name",
  "settings_add_category_button": "Add Category",
  "settings_category_exists_toast": "Category \"{{category}}\" already exists.",
  "settings_category_added_toast": "Category \"{{category}}\" added.",
  "settings_category_delete_confirm": "Are you sure you want to delete the category \"{{category}}\"? This action cannot be undone.",
  "settings_category_deleted_toast": "Category \"{{category}}\" deleted.",
  "settings_no_custom_categories": "No custom categories defined.",
  "settings_airdrop_templates_title": "Airdrop Templates",
  "settings_airdrop_templates_desc": "Create templates with predefined tasks to quickly start tracking new airdrops.",
  "settings_create_template_button": "Create New Template",
  "settings_no_templates_message": "No templates created yet.",
  "settings_edit_template_title": "Edit Airdrop Template",
  "settings_create_template_title": "Create Airdrop Template",
  "settings_template_updated_toast": "Airdrop template updated.",
  "settings_template_created_toast": "Airdrop template created.",
  "settings_template_delete_confirm": "Are you sure you want to delete the template \"{{templateName}}\"? This cannot be undone.",
  "settings_template_deleted_toast": "Template \"{{templateName}}\" deleted.",
  "settings_automation_title": "Automation Settings (Conceptual)",
  "settings_automation_desc": "Configure parameters for conceptual automated interactions. These settings are for UI demonstration only and do not perform any real actions.",
  "settings_api_webhooks_title": "API & Webhooks (Developer Preview)",
  "settings_api_webhooks_desc": "Access your data programmatically or set up webhooks for integrations (conceptual).",
  "common_add": "Add", "common_edit": "Edit", "common_delete": "Delete", "common_save": "Save", "common_cancel": "Cancel","common_close": "Close", "common_yes": "Yes", "common_no": "No", "common_confirm": "Confirm", "common_error": "Error", "common_success": "Success", "common_warning": "Warning", "common_info": "Information"
};
translationsCache['en'] = embeddedEnTranslations; // Pre-fill cache with embedded English

export const useTranslation = (): TranslationHook => {
  const { appData, updateSettings } = useAppContext();
  const currentLanguageSetting = appData.settings.language || 'en';
  const [currentLang, setCurrentLang] = useState<string>(currentLanguageSetting);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTranslations = useCallback(async (lang: string) => {
    if (translationsCache[lang]) {
      setCurrentLang(lang);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      const data = await response.json();
      translationsCache[lang] = data;
      setCurrentLang(lang);
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Fallback to English if selected language fails to load
      if (lang !== 'en') {
        await loadTranslations('en'); // Attempt to load English
      } else {
         // If 'en' itself fails, use embedded (already in cache)
        setCurrentLang('en');
      }
      // Consider adding a toast message for failed language load
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(currentLanguageSetting);
  }, [currentLanguageSetting, loadTranslations]);

  const setLanguage = async (lang: string) => {
    await loadTranslations(lang);
    updateSettings({ language: lang });
    // AppContext useEffect will handle document.documentElement.lang
  };

  const t = useCallback((key: string, options?: { defaultValue?: string; [key: string]: any }): string => {
    const { defaultValue, ...replacements } = options || {};
    let translationSet = translationsCache[currentLang] || translationsCache['en'] || {}; // Fallback chain
    
    let translation = translationSet[key];

    if (translation === undefined) {
      // If key not found in current or English, use defaultValue or format key
      translation = defaultValue || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        const regex = new RegExp(`{{${k}}}`, 'g');
        translation = translation.replace(regex, String(v));
      });
    }
    return translation;
  }, [currentLang]);

  return { t, currentLanguage: currentLang, setLanguage, isLoading };
};
