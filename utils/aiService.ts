export interface AIProvider {
  name: string;
  generateContent: (prompt: string, options?: any) => Promise<string>;
  isAvailable: () => boolean;
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
  name = 'Ollama';

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.2') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  isAvailable(): boolean {
    return true; // Ollama runs locally, so it's always available if running
  }

  async generateContent(prompt: string, options?: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            top_p: options?.top_p || 0.9,
            max_tokens: options?.maxTokens || 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider() {
    switch (this.config.provider) {
      case 'gemini':
        if (this.config.apiKey) {
          this.provider = new GeminiProvider(this.config.apiKey);
        }
        break;
      case 'ollama':
        this.provider = new OllamaProvider(this.config.baseUrl, this.config.model);
        break;
      case 'deepseek':
        if (this.config.apiKey) {
          this.provider = new DeepSeekProvider(this.config.apiKey, this.config.baseUrl);
        }
        break;
    }
  }

  async generateContent(prompt: string, options?: any): Promise<string> {
    if (!this.provider) {
      throw new Error(`No AI provider configured for ${this.config.provider}`);
    }

    if (!this.provider.isAvailable()) {
      throw new Error(`${this.provider.name} is not available`);
    }

    return await this.provider.generateContent(prompt, options);
  }

  getProviderName(): string {
    return this.provider?.name || 'None';
  }

  isAvailable(): boolean {
    return this.provider?.isAvailable() || false;
  }

  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initializeProvider();
  }
}

// Default configuration
const getDefaultConfig = (): AIServiceConfig => {
  // Check environment variables for configuration
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    };
  }
  
  if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL) {
    return {
      provider: 'ollama',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.2'
    };
  }
  
  if (process.env.API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.API_KEY
    };
  }

  // Default to Ollama if no API keys are configured
  return {
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2'
  };
};

// Create and export the AI service instance
export const aiService = new AIService(getDefaultConfig());

// Helper function to update AI service configuration
export const updateAIService = (config: Partial<AIServiceConfig>) => {
  aiService.updateConfig(config);
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