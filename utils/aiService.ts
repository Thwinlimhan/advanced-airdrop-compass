export interface AIProvider {
  name: string;
  generateContent: (prompt: string, options?: any) => Promise<string>;
  isAvailable: () => boolean;
  getAvailableModels?: () => Promise<string[]>;
  getCurrentModel?: () => Promise<string>;
}

export interface AIServiceConfig {
  provider: 'gemini' | 'ollama' | 'deepseek';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// Gemini Provider (existing)
class GeminiProvider implements AIProvider {
  private apiKey: string;
  name = 'Gemini';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateContent(prompt: string, options?: any): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    
    const response = await ai.models.generateContent({
      model: options?.model || 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: options?.config || {}
    });

    return response.text || '';
  }
}

// Ollama Provider
class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;
  private isAvailableStatus: boolean = false;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'auto') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  name = 'Ollama';

  isAvailable(): boolean {
    return this.isAvailableStatus;
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (response.ok) {
        this.isAvailableStatus = true;
        return true;
      }
    } catch (error) {
      console.warn('Ollama not available:', error);
    }
    
    this.isAvailableStatus = false;
    return false;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.warn('Failed to fetch Ollama models:', error);
      return [];
    }
  }

  async selectModel(): Promise<string> {
    if (this.model === 'auto') {
      const models = await this.getAvailableModels();
      if (models.length === 0) {
        throw new Error('No models found in Ollama. Please install at least one model.');
      }
      
      // Prefer llama2, mistral, or codellama if available
      const preferredModels = ['llama2', 'mistral', 'codellama', 'llama2:7b', 'mistral:7b'];
      for (const preferred of preferredModels) {
        if (models.some(model => model.includes(preferred))) {
          this.model = models.find(model => model.includes(preferred))!;
          break;
        }
      }
      
      // Fallback to first available model
      if (this.model === 'auto') {
        this.model = models[0];
      }
      
      console.log(`Auto-selected Ollama model: ${this.model}`);
    }
    
    return this.model;
  }

  async generateContent(prompt: string, options: any = {}): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Ollama is not available. Please ensure Ollama is running locally.');
    }

    const model = await this.selectModel();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            max_tokens: options.maxTokens || 2048,
            ...options.additionalParams
          }
        }),
        signal: AbortSignal.timeout((options.timeout || 60) * 1000)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'No response generated';
    } catch (error) {
      console.error('Ollama request failed:', error);
      throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCurrentModel(): Promise<string> {
    return await this.selectModel();
  }

  getProviderInfo() {
    return {
      name: this.name,
      baseUrl: this.baseUrl,
      model: this.model,
      isAvailable: this.isAvailableStatus,
      requiresApiKey: false
    };
  }
}

// DeepSeek Provider
class DeepSeekProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  name = 'DeepSeek';

  constructor(apiKey: string, baseUrl: string = 'https://api.deepseek.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateContent(prompt: string, options?: any): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 1000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`DeepSeek request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// AI Service Manager
class AIService {
  private provider: AIProvider | null = null;
  private config: AIServiceConfig;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.initializationPromise = this.initializeProvider();
  }

  private async initializeProvider() {
    switch (this.config.provider) {
      case 'gemini':
        if (this.config.apiKey) {
          this.provider = new GeminiProvider(this.config.apiKey);
        }
        break;
      case 'ollama':
        this.provider = new OllamaProvider(this.config.baseUrl, this.config.model);
        // Check availability for Ollama provider
        if (this.provider instanceof OllamaProvider) {
          await this.provider.checkAvailability();
        }
        break;
      case 'deepseek':
        if (this.config.apiKey) {
          this.provider = new DeepSeekProvider(this.config.apiKey, this.config.baseUrl);
        }
        break;
    }
  }

  private async ensureInitialized() {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  async generateContent(prompt: string, options?: any): Promise<string> {
    await this.ensureInitialized();
    
    if (!this.provider) {
      throw new Error(`No AI provider configured for ${this.config.provider}`);
    }

    if (!this.provider.isAvailable()) {
      throw new Error(`${this.provider.name} is not available`);
    }

    return await this.provider.generateContent(prompt, options);
  }

  async analyze(data: any, options?: any): Promise<string> {
    // This is a wrapper around generateContent for analysis tasks
    const prompt = `Please analyze the following data and provide insights:\n\n${JSON.stringify(data, null, 2)}`;
    return await this.generateContent(prompt, options);
  }

  getProviderName(): string {
    return this.provider?.name || 'None';
  }

  async isAvailable(): Promise<boolean> {
    await this.ensureInitialized();
    return this.provider?.isAvailable() || false;
  }

  async getAvailableModels(): Promise<string[]> {
    await this.ensureInitialized();
    if (this.provider?.getAvailableModels) {
      return await this.provider.getAvailableModels();
    }
    return [];
  }

  async getCurrentModel(): Promise<string | null> {
    await this.ensureInitialized();
    if (this.provider?.getCurrentModel) {
      return await this.provider.getCurrentModel();
    }
    return null;
  }

  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initializationPromise = this.initializeProvider();
  }
}

// Default configuration
const getDefaultConfig = (): AIServiceConfig => {
  // Try to get settings from localStorage
  try {
    const storedSettings = localStorage.getItem('cryptoAirdropCompassData');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      return {
        provider: settings.aiProvider || 'ollama',
        apiKey: settings.aiApiKey || '',
        baseUrl: settings.aiProvider === 'ollama' ? 'http://localhost:11434' : undefined,
        model: settings.aiModel || 'auto'
      };
    }
  } catch (error) {
    console.warn('Failed to load AI settings from localStorage:', error);
  }

  return {
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'auto'
  };
};

// Initialize the AI service with default configuration
let aiService = new AIService(getDefaultConfig());

// Helper function to update AI service configuration
export const updateAIService = (config: Partial<AIServiceConfig>) => {
  const currentConfig = getDefaultConfig();
  const newConfig = { ...currentConfig, ...config };
  
  // Update localStorage settings
  try {
    const storedSettings = localStorage.getItem('cryptoAirdropCompassData');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      const updatedSettings = {
        ...settings,
        aiProvider: newConfig.provider,
        aiApiKey: newConfig.apiKey || '',
        aiModel: newConfig.model || 'auto'
      };
      localStorage.setItem('cryptoAirdropCompassData', JSON.stringify(updatedSettings));
    }
  } catch (error) {
    console.warn('Failed to update AI settings in localStorage:', error);
  }
  
  // Reinitialize the service with new config
  aiService = new AIService(newConfig);
};

// Helper function to check if a specific provider is available
export const isProviderAvailable = (provider: AIServiceConfig['provider']): boolean => {
  switch (provider) {
    case 'gemini':
      return !!process.env.API_KEY;
    case 'ollama':
      return true; // Always available if Ollama is running
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY;
    default:
      return false;
  }
};

// Helper functions for model management
export const getAvailableModels = async (): Promise<string[]> => {
  return await aiService.getAvailableModels();
};

export const getCurrentModel = async (): Promise<string | null> => {
  return await aiService.getCurrentModel();
};

// Synchronous version for backward compatibility
export const isAIServiceAvailable = (): boolean => {
  // For Ollama, we assume it's available if it's the selected provider
  // This is a fallback for components that need immediate availability check
  try {
    const storedSettings = localStorage.getItem('cryptoAirdropCompassData');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (settings.aiProvider === 'ollama') {
        return true; // Assume Ollama is available
      }
    }
  } catch (error) {
    console.warn('Failed to check AI service availability:', error);
  }
  return false;
};

// Test function for development
export const testOllamaConnection = async (baseUrl: string = 'http://localhost:11434'): Promise<{success: boolean, models?: string[], error?: string}> => {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const data = await response.json();
    const models = data.models?.map((model: any) => model.name) || [];
    return { success: true, models };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Export the aiService instance
export { aiService }; 