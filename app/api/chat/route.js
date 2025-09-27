import { NextResponse } from 'next/server';

// RAG context management
class ContextManager {
  constructor() {
    this.datasets = {
      Drivers: {
        pie: [
          { name: 'Petrol', value: 12 },
          { name: 'Diesel', value: 19 },
          { name: 'LPG', value: 7 },
        ],
        bar: [
          { name: 'Jan', shipments: 30 },
          { name: 'Feb', shipments: 45 },
          { name: 'Mar', shipments: 20 },
          { name: 'Apr', shipments: 50 },
        ],
      },
      Shipments: {
        pie: [
          { name: 'Petrol', value: 5 },
          { name: 'Diesel', value: 15 },
          { name: 'LPG', value: 8 },
        ],
        bar: [
          { name: 'Jan', shipments: 15 },
          { name: 'Feb', shipments: 30 },
          { name: 'Mar', shipments: 50 },
          { name: 'Apr', shipments: 25 },
        ],
      },
      Locations: {
        pie: [
          { name: 'Petrol', value: 7 },
          { name: 'Diesel', value: 10 },
          { name: 'LPG', value: 5 },
        ],
        bar: [
          { name: 'Jan', shipments: 40 },
          { name: 'Feb', shipments: 20 },
          { name: 'Mar', shipments: 35 },
          { name: 'Apr', shipments: 45 },
        ],
      },
      Vehicles: {
        pie: [
          { name: 'Truck', value: 10 },
          { name: 'Tanker', value: 20 },
          { name: 'Van', value: 12 },
        ],
        bar: [
          { name: 'Jan', shipments: 25 },
          { name: 'Feb', shipments: 35 },
          { name: 'Mar', shipments: 40 },
          { name: 'Apr', shipments: 55 },
        ],
      },
      Products: {
        pie: [
          { name: 'Petrol', value: 22 },
          { name: 'Diesel', value: 29 },
          { name: 'LPG', value: 15 },
        ],
        bar: [
          { name: 'Jan', shipments: 20 },
          { name: 'Feb', shipments: 28 },
          { name: 'Mar', shipments: 42 },
          { name: 'Apr', shipments: 38 },
        ],
      },
    };

    this.chartTypes = {
      pie: 'Pie charts show proportional data distribution',
      bar: 'Bar charts show comparative values across categories',
      line: 'Line charts display trends over time',
      radar: 'Radar charts show multi-dimensional data relationships',
      stack: 'Stacked bar charts show part-to-whole relationships'
    };
  }

  getContextForQuery(query, activeDatasets = [], visibleCharts = []) {
    const context = {
      datasets: this.datasets,
      activeDatasets: activeDatasets.filter(ds => ds && this.datasets[ds]),
      visibleCharts: visibleCharts,
      chartTypes: this.chartTypes
    };

    // Enhanced context based on query content
    const queryLower = query.toLowerCase();
    
    // Identify relevant datasets based on query
    const relevantDatasets = Object.keys(this.datasets).filter(key => 
      queryLower.includes(key.toLowerCase())
    );
    
    // Identify chart types mentioned
    const mentionedCharts = Object.keys(this.chartTypes).filter(chart => 
      queryLower.includes(chart)
    );

    return {
      ...context,
      relevantDatasets: relevantDatasets.length > 0 ? relevantDatasets : activeDatasets,
      mentionedCharts: mentionedCharts.length > 0 ? mentionedCharts : visibleCharts,
      queryContext: this.extractQueryContext(query)
    };
  }

  extractQueryContext(query) {
    const queryLower = query.toLowerCase();
    const context = {
      isComparing: /compare|vs|versus|difference|between/.test(queryLower),
      isTrend: /trend|over time|change|increase|decrease/.test(queryLower),
      isQuantitative: /how many|count|total|sum|average/.test(queryLower),
      isDistribution: /share|percentage|proportion|distribution/.test(queryLower)
    };
    return context;
  }

  buildSystemPrompt(context) {
    return `You are a concise data analyst for a logistics dashboard. Provide brief, direct answers using only the provided data.

DATA: ${JSON.stringify(context.datasets, null, 2)}

CONTEXT: Active: ${context.activeDatasets.join(', ') || 'None'} | Charts: ${context.visibleCharts.join(', ') || 'None'}

RESPONSE RULES:
• Keep answers under 3 sentences
• Use specific numbers from the data
• Focus on key insights only
• No explanations unless asked
• Business context: logistics/shipping operations

Answer directly and concisely based on the data provided.`;
  }
}

const contextManager = new ContextManager();

export async function POST(request) {
  try {
    const { messages, activeDatasets = [], visibleCharts = [] } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.content) {
      return NextResponse.json({ error: 'No message content provided' }, { status: 400 });
    }

    // Get enhanced context for RAG
    const context = contextManager.getContextForQuery(
      lastMessage.content, 
      activeDatasets, 
      visibleCharts
    );

    // Build system prompt with context
    const systemPrompt = contextManager.buildSystemPrompt(context);

    // Prepare messages for Ollama
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Ollama API with streaming
          const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'deepseek-r1:1.5b', // Default model, can be configurable
              messages: ollamaMessages,
              stream: true,
              options: {
                temperature: 0.3,  // Lower for more focused responses
                max_tokens: 200,   // Reduced for concise answers
                top_p: 0.8,        // More focused sampling
              }
            }),
          });

          if (!ollamaResponse.ok) {
            throw new Error(`Ollama API error: ${ollamaResponse.status}`);
          }

          const reader = ollamaResponse.body?.getReader();
          if (!reader) {
            throw new Error('No response body from Ollama');
          }

          let buffer = '';
          let isThinking = false;
          let finalAnswer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += new TextDecoder().decode(value);
            const lines = buffer.split('\n');
            
            // Keep the last potentially incomplete line in buffer
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data.message && data.message.content) {
                    const content = data.message.content;
                    
                    // Send all content including thinking process to the client
                    finalAnswer += content;
                    const chunk = encoder.encode(`data: ${JSON.stringify({
                      content: content,
                      done: data.done || false
                    })}\n\n`);
                    controller.enqueue(chunk);
                  }
                  
                  if (data.done) {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                    return;
                  }
                } catch (parseError) {
                  console.error('Error parsing Ollama response:', parseError);
                }
              }
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          
        } catch (error) {
          console.error('Ollama streaming error:', error);
          
          // Send error message to client
          const errorMessage = {
            content: `I apologize, but I'm having trouble connecting to the local AI service. Please ensure Ollama is running locally on port 11434. Error: ${error.message}`,
            done: true,
            error: true
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if Ollama is available
    const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
    });
    
    const available = ollamaResponse.ok;
    
    return NextResponse.json({
      status: 'ok',
      ollama: {
        available,
        port: 11434,
        models: available ? await ollamaResponse.json() : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      ollama: {
        available: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
}