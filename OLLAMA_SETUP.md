# Enhanced Dashboard with Ollama AI Integration

This dashboard now features a sophisticated RAG (Retrieval Augmented Generation) system powered by local Ollama AI, providing context-aware responses about your data visualizations.

## 🚀 New Features

### 🤖 Local AI Integration
- **Ollama API**: Local AI processing with streaming responses
- **RAG System**: Context-aware responses about charts and data
- **Professional System Prompts**: Consistent, relevant AI responses
- **Real-time Streaming**: Live response generation with visual feedback

### 📊 Enhanced Context Awareness
- **Chart Context**: AI understands current visible charts (pie, bar, line, radar, stacked)
- **Data Context**: AI has access to all dataset tables (Drivers, Shipments, Locations, Vehicles, Products)
- **Business Intelligence**: AI provides logistics and operations insights
- **Smart Suggestions**: Context-aware chart and analysis recommendations

## 🛠️ Setup Instructions

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Ollama** (for local AI)

### Ollama Installation & Setup

#### Install Ollama
```bash
# Linux/WSL
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.com/download
```

#### Start Ollama Service
```bash
# Start the Ollama service
ollama serve
```

#### Pull AI Model (recommended)
```bash
# Pull a lightweight but capable model
ollama pull llama3.2

# Or pull other models:
ollama pull mistral        # Good balance of speed/quality
ollama pull codellama      # Code-focused model
ollama pull phi3          # Smaller, faster model
```

#### Verify Installation
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test with a simple prompt
ollama run llama3.2 "Hello, how are you?"
```

### Project Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Verify Integration
1. Open http://localhost:3000
2. The chat panel should show "Context-aware AI powered by Ollama"
3. Try asking: "What can you tell me about the current data?"
4. You should see streaming responses with context about your charts

## 🔧 Configuration

### Model Selection
Edit `/app/api/chat/route.js` to change the AI model:
```javascript
// Change this line in the Ollama API call
model: 'llama3.2', // Change to 'mistral', 'phi3', etc.
```

### Response Parameters
Customize AI behavior in the API route:
```javascript
options: {
  temperature: 0.7,    // Creativity (0.0-1.0)
  max_tokens: 1000,    // Response length
  top_p: 0.9,          // Response diversity
}
```

## 💡 Usage Examples

### Context-Aware Queries
- **Chart Analysis**: "Explain what the pie chart shows"
- **Data Insights**: "What trends do you see in the shipment data?"
- **Comparisons**: "Compare Diesel vs Petrol across all datasets"
- **Business Intelligence**: "Which vehicle type should we invest in?"

### Smart Features
- **Auto-Context**: AI automatically knows which charts are visible
- **Dataset Awareness**: AI has access to all your data tables
- **Business Focus**: Responses tailored for logistics operations
- **Streaming**: Real-time response generation

## 🎯 Best Practices

### For Optimal AI Responses
1. **Be Specific**: "Show me Q1 shipment trends" vs "Show trends"
2. **Use Context**: Have relevant charts visible when asking questions
3. **Business Focus**: Ask operation-specific questions for better insights

### Performance Tips
1. **Model Selection**: Use `phi3` for faster responses, `llama3.2` for quality
2. **Context Management**: Close unnecessary charts to reduce context size
3. **Query Length**: Keep questions concise but descriptive

## 🔍 Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
pkill ollama
ollama serve
```

### Model Issues
```bash
# List installed models
ollama list

# Pull missing model
ollama pull llama3.2

# Remove and re-pull corrupted model
ollama rm llama3.2
ollama pull llama3.2
```

### API Health Check
Visit: http://localhost:3000/api/chat (GET request)
Should return JSON with Ollama status and available models.

## 🎨 UI Enhancements

### New Chat Features
- **Context Indicators**: Shows active datasets and visible charts
- **Streaming Animation**: Visual feedback during AI responses
- **Enhanced Messages**: Better formatting with role indicators
- **Error Handling**: Graceful fallbacks when Ollama is unavailable

### Visual Improvements
- Professional message styling with borders and colors
- Loading animations and progress indicators
- Context-aware status display
- Improved typography and spacing

## 🔮 Advanced Features

### RAG System Details
- **Smart Context Selection**: AI receives only relevant data for queries
- **Business Intelligence**: Industry-specific insights and recommendations
- **Multi-Chart Analysis**: AI can correlate data across different visualizations
- **Historical Context**: AI maintains conversation context for follow-up questions

### System Prompt Engineering
- **Professional Tone**: Consistent business communication style
- **Data-Driven**: All responses backed by actual dataset values
- **Actionable Insights**: Focus on operational recommendations
- **Contextual Awareness**: Responses adapt to visible charts and active datasets

## 📊 Data Context

The AI has comprehensive access to:
- **5 Dataset Tables**: Drivers, Shipments, Locations, Vehicles, Products
- **5 Chart Types**: Pie, Bar, Line, Radar, Stacked Bar
- **Business Context**: Logistics, fleet management, fuel operations
- **Time-Series Data**: Monthly trends and patterns
- **Comparative Analysis**: Cross-dataset relationships

Enjoy your enhanced data analysis experience! 🚀