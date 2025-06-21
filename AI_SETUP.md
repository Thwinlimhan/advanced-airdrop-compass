# AI Provider Setup Guide

This application supports multiple AI providers for features like gas optimization tips, airdrop discovery, and strategy advice.

## Available Providers

### 1. Ollama (Recommended for Local Development)

**Pros:**
- Free and runs locally
- No API keys required
- Privacy-focused
- Supports many models

**Setup:**
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama service
4. The app will automatically detect and use Ollama

**Environment Variables (Optional):**
```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 2. DeepSeek

**Pros:**
- High-quality responses
- Good for technical content
- Competitive pricing

**Setup:**
1. Get API key from [deepseek.com](https://deepseek.com)
2. Set environment variable:
```bash
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-chat  # optional
```

### 3. Google Gemini

**Pros:**
- Google's latest AI model
- Good integration with Google services

**Setup:**
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set environment variable:
```bash
API_KEY=your_gemini_api_key_here
```

## Configuration via UI

You can also configure AI providers through the Settings page:

1. Go to Settings → AI Provider Settings
2. Select your preferred provider
3. Enter configuration details
4. Click "Save AI Configuration"

## Model Recommendations

### For Ollama:
- `llama3.2` - Good general purpose
- `llama3.1` - Faster, smaller
- `mistral` - Good for technical content
- `codellama` - Excellent for code-related tasks

### For DeepSeek:
- `deepseek-chat` - General purpose
- `deepseek-coder` - Code-focused

### For Gemini:
- `gemini-2.5-flash-preview-04-17` - Latest model
- `gemini-1.5-flash` - Faster alternative

## Usage

Once configured, AI features will be available in:
- Gas Tracker Widget (AI gas optimization tips)
- Airdrop Discovery Widget (AI-powered airdrop suggestions)
- AI Strategy Advisor (Farming strategy advice)
- AI Analyst Page (Portfolio analysis)

## Troubleshooting

### Ollama Issues:
- Ensure Ollama is running: `ollama serve`
- Check if model is downloaded: `ollama list`
- Verify API endpoint: `curl http://localhost:11434/api/tags`

### API Key Issues:
- Verify API key is correct
- Check environment variables are set
- Ensure you have sufficient credits/quota

### General Issues:
- Check browser console for error messages
- Verify network connectivity
- Try switching to a different provider 