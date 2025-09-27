// Enhanced context management for RAG system
export class ContextManager {
  constructor() {
    this.datasets = {
      Drivers: {
        description: "Driver data including fuel type preferences and operational metrics",
        pie: [
          { name: 'Petrol', value: 12, description: "Drivers preferring petrol vehicles" },
          { name: 'Diesel', value: 19, description: "Drivers preferring diesel vehicles" },
          { name: 'LPG', value: 7, description: "Drivers preferring LPG vehicles" },
        ],
        bar: [
          { name: 'Jan', shipments: 30, description: "Shipments handled by drivers in January" },
          { name: 'Feb', shipments: 45, description: "Shipments handled by drivers in February" },
          { name: 'Mar', shipments: 20, description: "Shipments handled by drivers in March" },
          { name: 'Apr', shipments: 50, description: "Shipments handled by drivers in April" },
        ],
      },
      Shipments: {
        description: "Shipment volume data across different categories and time periods",
        pie: [
          { name: 'Petrol', value: 5, description: "Petrol-related shipments" },
          { name: 'Diesel', value: 15, description: "Diesel-related shipments" },
          { name: 'LPG', value: 8, description: "LPG-related shipments" },
        ],
        bar: [
          { name: 'Jan', shipments: 15, description: "Total shipments in January" },
          { name: 'Feb', shipments: 30, description: "Total shipments in February" },
          { name: 'Mar', shipments: 50, description: "Total shipments in March" },
          { name: 'Apr', shipments: 25, description: "Total shipments in April" },
        ],
      },
      Locations: {
        description: "Geographic distribution of operations and facilities",
        pie: [
          { name: 'Petrol', value: 7, description: "Locations with petrol services" },
          { name: 'Diesel', value: 10, description: "Locations with diesel services" },
          { name: 'LPG', value: 5, description: "Locations with LPG services" },
        ],
        bar: [
          { name: 'Jan', shipments: 40, description: "Location-based operations in January" },
          { name: 'Feb', shipments: 20, description: "Location-based operations in February" },
          { name: 'Mar', shipments: 35, description: "Location-based operations in March" },
          { name: 'Apr', shipments: 45, description: "Location-based operations in April" },
        ],
      },
      Vehicles: {
        description: "Fleet composition and vehicle utilization data",
        pie: [
          { name: 'Truck', value: 10, description: "Truck fleet count" },
          { name: 'Tanker', value: 20, description: "Tanker fleet count" },
          { name: 'Van', value: 12, description: "Van fleet count" },
        ],
        bar: [
          { name: 'Jan', shipments: 25, description: "Vehicle utilization in January" },
          { name: 'Feb', shipments: 35, description: "Vehicle utilization in February" },
          { name: 'Mar', shipments: 40, description: "Vehicle utilization in March" },
          { name: 'Apr', shipments: 55, description: "Vehicle utilization in April" },
        ],
      },
      Products: {
        description: "Product distribution and movement across the supply chain",
        pie: [
          { name: 'Petrol', value: 22, description: "Petrol product volume" },
          { name: 'Diesel', value: 29, description: "Diesel product volume" },
          { name: 'LPG', value: 15, description: "LPG product volume" },
        ],
        bar: [
          { name: 'Jan', shipments: 20, description: "Product movements in January" },
          { name: 'Feb', shipments: 28, description: "Product movements in February" },
          { name: 'Mar', shipments: 42, description: "Product movements in March" },
          { name: 'Apr', shipments: 38, description: "Product movements in April" },
        ],
      },
    };

    this.chartTypes = {
      pie: {
        description: 'Pie charts show proportional data distribution',
        useCase: 'Best for showing parts of a whole, like market share or category distribution',
        insights: 'Reveals percentage breakdown and relative importance of categories'
      },
      bar: {
        description: 'Bar charts show comparative values across categories',
        useCase: 'Ideal for comparing quantities across different categories or time periods',
        insights: 'Highlights highest/lowest performers and trends over time'
      },
      line: {
        description: 'Line charts display trends over time',
        useCase: 'Perfect for showing changes, trends, and patterns over time periods',
        insights: 'Reveals growth patterns, seasonal trends, and correlation between datasets'
      },
      radar: {
        description: 'Radar charts show multi-dimensional data relationships',
        useCase: 'Excellent for comparing multiple variables across different entities',
        insights: 'Shows strengths/weaknesses across multiple dimensions'
      },
      stack: {
        description: 'Stacked bar charts show part-to-whole relationships',
        useCase: 'Great for showing composition changes over time',
        insights: 'Reveals both total values and individual component contributions'
      }
    };

    this.businessContext = {
      logistics: {
        keywords: ['shipment', 'delivery', 'transport', 'route', 'warehouse'],
        insights: 'Focus on efficiency, cost optimization, and delivery performance'
      },
      fuel: {
        keywords: ['petrol', 'diesel', 'lpg', 'fuel', 'energy'],
        insights: 'Analyze consumption patterns, cost implications, and environmental impact'
      },
      fleet: {
        keywords: ['vehicle', 'truck', 'tanker', 'van', 'fleet'],
        insights: 'Vehicle utilization, maintenance schedules, and operational efficiency'
      },
      operations: {
        keywords: ['driver', 'location', 'facility', 'operation'],
        insights: 'Resource allocation, geographic coverage, and operational capacity'
      }
    };
  }

  // Enhanced query analysis with business context
  analyzeQuery(query) {
    const queryLower = query.toLowerCase();
    const analysis = {
      type: this.determineQueryType(queryLower),
      entities: this.extractEntities(queryLower),
      businessContext: this.identifyBusinessContext(queryLower),
      chartRelevance: this.assessChartRelevance(queryLower),
      timeframe: this.extractTimeframe(queryLower),
      metrics: this.identifyMetrics(queryLower)
    };

    return analysis;
  }

  determineQueryType(query) {
    const types = {
      comparison: /compare|vs|versus|difference|between|against/.test(query),
      trend: /trend|over time|change|increase|decrease|growth|pattern/.test(query),
      quantitative: /how many|count|total|sum|average|maximum|minimum/.test(query),
      distribution: /share|percentage|proportion|distribution|breakdown/.test(query),
      ranking: /best|worst|top|bottom|highest|lowest|rank/.test(query),
      correlation: /relationship|correlation|impact|influence|affect/.test(query),
      explanation: /why|how|what|explain|describe|tell me about/.test(query)
    };

    return Object.entries(types)
      .filter(([, matches]) => matches)
      .map(([type]) => type);
  }

  extractEntities(query) {
    const entities = {
      datasets: Object.keys(this.datasets).filter(dataset => 
        query.includes(dataset.toLowerCase())
      ),
      fuelTypes: ['petrol', 'diesel', 'lpg'].filter(fuel => 
        query.includes(fuel)
      ),
      vehicleTypes: ['truck', 'tanker', 'van'].filter(vehicle => 
        query.includes(vehicle)
      ),
      timeframes: ['jan', 'feb', 'mar', 'apr', 'january', 'february', 'march', 'april']
        .filter(time => query.includes(time))
    };

    return entities;
  }

  identifyBusinessContext(query) {
    const contexts = [];
    for (const [context, config] of Object.entries(this.businessContext)) {
      if (config.keywords.some(keyword => query.includes(keyword))) {
        contexts.push({
          type: context,
          insights: config.insights
        });
      }
    }
    return contexts;
  }

  assessChartRelevance(query) {
    const relevance = {};
    for (const [chartType] of Object.entries(this.chartTypes)) {
      let score = 0;
      
      // Direct mentions
      if (query.includes(chartType)) score += 10;
      
      // Context-based relevance
      if (chartType === 'pie' && /share|proportion|percentage/.test(query)) score += 8;
      if (chartType === 'bar' && /compare|comparison/.test(query)) score += 8;
      if (chartType === 'line' && /trend|over time/.test(query)) score += 8;
      if (chartType === 'radar' && /multi|multiple|across/.test(query)) score += 6;
      if (chartType === 'stack' && /composition|breakdown/.test(query)) score += 7;
      
      relevance[chartType] = {
        score,
        recommended: score >= 6
      };
    }
    
    return relevance;
  }

  extractTimeframe(query) {
    const timeframes = {
      specific: ['jan', 'feb', 'mar', 'apr', 'january', 'february', 'march', 'april']
        .filter(time => query.includes(time)),
      relative: query.match(/last|previous|current|next|this/) ? 
        query.match(/\b(last|previous|current|next|this)\s+\w+/g) : [],
      quarter: query.includes('q1') || query.includes('quarter') ? ['Q1'] : []
    };
    
    return timeframes;
  }

  identifyMetrics(query) {
    const metricKeywords = {
      volume: /shipment|volume|quantity|amount/,
      performance: /efficiency|performance|utilization/,
      distribution: /share|distribution|allocation/,
      growth: /growth|increase|decrease|change/,
      comparison: /ratio|compare|versus|relative/
    };

    const identifiedMetrics = [];
    for (const [metric, pattern] of Object.entries(metricKeywords)) {
      if (pattern.test(query)) {
        identifiedMetrics.push(metric);
      }
    }

    return identifiedMetrics;
  }

  // Generate context-aware insights
  generateInsights(data, chartType, queryAnalysis) {
    const insights = [];

    // Data-driven insights
    if (data.pie && data.pie.length > 0) {
      const total = data.pie.reduce((sum, item) => sum + item.value, 0);
      const largest = data.pie.reduce((max, item) => item.value > max.value ? item : max);
      const percentage = ((largest.value / total) * 100).toFixed(1);
      
      insights.push(`${largest.name} represents the largest segment at ${percentage}% (${largest.value} out of ${total})`);
    }

    if (data.bar && data.bar.length > 0) {
      const max = data.bar.reduce((max, item) => item.shipments > max.shipments ? item : max);
      const min = data.bar.reduce((min, item) => item.shipments < min.shipments ? item : min);
      const avg = (data.bar.reduce((sum, item) => sum + item.shipments, 0) / data.bar.length).toFixed(1);
      
      insights.push(`Peak activity in ${max.name} (${max.shipments} shipments), lowest in ${min.name} (${min.shipments} shipments). Average: ${avg} shipments`);
    }

    // Query-specific insights
    if (queryAnalysis.type.includes('trend')) {
      insights.push("Trend analysis shows seasonal patterns that could inform resource planning");
    }
    
    if (queryAnalysis.type.includes('comparison')) {
      insights.push("Comparative analysis reveals operational strengths and areas for improvement");
    }

    return insights;
  }
}

// Utility functions for context enhancement
export function enhanceDataWithContext(data, contextType) {
  const enhanced = { ...data };
  
  if (enhanced.pie) {
    enhanced.pie = enhanced.pie.map(item => ({
      ...item,
      contextType,
      businessRelevance: getBusinessRelevance(item.name, contextType)
    }));
  }
  
  if (enhanced.bar) {
    enhanced.bar = enhanced.bar.map(item => ({
      ...item,
      contextType,
      trend: calculateTrend(item, enhanced.bar)
    }));
  }
  
  return enhanced;
}

function getBusinessRelevance(itemName, contextType) {
  const relevanceMap = {
    'Drivers': {
      'Petrol': 'Cost-effective for shorter routes',
      'Diesel': 'Preferred for long-haul transportation', 
      'LPG': 'Environmental benefit, growing adoption'
    },
    'Vehicles': {
      'Truck': 'Heavy-duty transport workhorse',
      'Tanker': 'Specialized fuel transport',
      'Van': 'Urban delivery and light cargo'
    }
  };
  
  return relevanceMap[contextType]?.[itemName] || 'Standard operational component';
}

function calculateTrend(currentItem, allItems) {
  const index = allItems.findIndex(item => item.name === currentItem.name);
  if (index === 0) return 'baseline';
  
  const previousValue = allItems[index - 1].shipments;
  const change = ((currentItem.shipments - previousValue) / previousValue * 100).toFixed(1);
  
  if (change > 10) return `+${change}% increase`;
  if (change < -10) return `${change}% decrease`;
  return `${change}% stable`;
}