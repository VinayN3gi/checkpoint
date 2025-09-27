'use client';
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { MdPieChart, MdBarChart, MdShowChart } from 'react-icons/md';
import { motion } from "framer-motion";
import { Rnd } from "react-rnd";
import DashboardHeader from '../components/DashboardHeader';
import { GiRadarSweep } from "react-icons/gi";

const datasets = {
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [pieSize, setPieSize] = useState({ width: 500, height: 350 });
  const [barSize, setBarSize] = useState({ width: 500, height: 350 });
  const [stackSize, setStackSize] = useState({ width: 500, height: 350 });
  const [piePos, setPiePos] = useState({ x: 0, y: 100 });
  const [barPos, setBarPos] = useState({ x: 520, y: 100 });
  const [stackPos, setStackPos] = useState({ x: 0, y: 180 });
  const [lineSize, setLineSize] = useState({ width: 500, height: 350 });
  const [linePos, setLinePos] = useState({ x: 0, y: 100 });
  const [radarSize, setRadarSize] = useState({ width: 500, height: 350 });
  const [radarPos, setRadarPos] = useState({ x: 0, y: 100 });



  const [visible, setVisible] = useState({
    pie: false,
    bar: false,
    stack: false,
    line: false,
    radar: false
  });

  const [xTable, setXTable] = useState(null);
  const [yTable, setYTable] = useState(null);

  const handleDragStart = (e, table) => {
    e.dataTransfer.setData("table", table);
  };

  // combine data
  let combinedPie = [];
  let combinedBarLine = [];
  if (xTable && yTable) {
    const xPie = datasets[xTable].pie;
    const yPie = datasets[yTable].pie;
    combinedPie = xPie.map((x) => {
      const y = yPie.find((yy) => yy.name === x.name);
      return { name: x.name, xValue: x.value, yValue: y ? y.value : 0 };
    });

    const xBar = datasets[xTable].bar;
    const yBar = datasets[yTable].bar;
    combinedBarLine = xBar.map((x) => {
      const y = yBar.find((yy) => yy.name === x.name);
      return { name: x.name, xShipments: x.shipments, yShipments: y ? y.shipments : 0 };
    });
  }

  // chat state
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query };
    setMessages((m) => [...m, userMessage]);
    setQuery('');
    setLoading(true);
    setIsStreaming(true);

    // Add empty assistant message that will be populated with streaming content
    const assistantMessageIndex = messages.length + 1;
    setMessages((m) => [...m, { role: 'assistant', content: '', streaming: true }]);

    try {
      // Get current context for RAG
      const activeDatasets = [xTable, yTable].filter(Boolean);
      const visibleCharts = Object.entries(visible)
        .filter(([_, isVisible]) => isVisible)
        .map(([chartType]) => chartType);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [userMessage], // Send only the current user message
          activeDatasets,
          visibleCharts,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              setIsStreaming(false);
              setMessages((m) => {
                const newMessages = [...m];
                if (newMessages[assistantMessageIndex]) {
                  newMessages[assistantMessageIndex] = {
                    ...newMessages[assistantMessageIndex],
                    streaming: false
                  };
                }
                return newMessages;
              });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;

                setMessages((m) => {
                  const newMessages = [...m];
                  if (newMessages[assistantMessageIndex]) {
                    newMessages[assistantMessageIndex] = {
                      ...newMessages[assistantMessageIndex],
                      content: assistantContent
                    };
                  }
                  return newMessages;
                });
              }

              if (parsed.error) {
                throw new Error(parsed.content || 'Streaming error');
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((m) => {
        const newMessages = [...m];
        if (newMessages[assistantMessageIndex]) {
          newMessages[assistantMessageIndex] = {
            role: 'assistant',
            content: `I apologize, but I encountered an error: ${error.message}. Please make sure Ollama is running locally and try again.`,
            streaming: false,
            error: true
          };
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen"
    >
      <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">
        
        <DashboardHeader toggleChat={toggleChat} />

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* LEFT */}
          <aside className="w-64 bg-white shadow-md flex flex-col rounded-2xl overflow-hidden">
            {/* CHARTS SECTION */}
            <div className="border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 px-4 pt-4">Charts</h2>
              <div className="mt-2 px-4 space-y-3 h-64 overflow-y-auto scrollbar-hide">
                <div
                  onClick={() => setVisible((v) => ({ ...v, pie: !v.pie }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.pie ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdPieChart className="text-blue-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Pie Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, bar: !v.bar }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.bar ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdBarChart className="text-green-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Bar Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, stack: !v.stack }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.stack ? 'bg-purple-100 border-l-4 border-purple-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdBarChart className="text-purple-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Stacked Bar</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, line: !v.line }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.line ? 'bg-red-100 border-l-4 border-red-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <MdShowChart className="text-red-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Line Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, radar: !v.radar }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${visible.radar ? 'bg-pink-100 border-l-4 border-pink-600' : 'hover:bg-blue-50'
                    }`}
                >
                  <GiRadarSweep className="text-pink-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Radar Chart</span>
                </div>
                {/* add more chart toggles here */}
              </div>
            </div>

            {/* TABLES SECTION */}
            <div className="flex-1 px-4 py-4 overflow-y-auto scrollbar-hide">
              <ul className="space-y-2">
                {Object.keys(datasets).map((table) => (
                  <li
                    key={table}
                    draggable
                    onDragStart={(e) => handleDragStart(e, table)}
                    className="p-2 rounded-md cursor-pointer font-medium bg-gray-200/20 hover:bg-blue-50 transition-colors duration-200 text-gray-700 shadow-sm"
                  >
                    {table}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* CENTER */}
          <main className="flex-1">
            <div className="flex space-x-4 mb-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => setXTable(e.dataTransfer.getData("table"))}
                className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-10 flex items-center justify-center text-gray-500"
              >
                {xTable ? `X Axis Table: ${xTable}` : "Drag a table here for X Axis"}
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => setYTable(e.dataTransfer.getData("table"))}
                className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-10 flex items-center justify-center text-gray-500"
              >
                {yTable ? `Y Axis Table: ${yTable}` : "Drag a table here for Y Axis"}
              </div>
            </div>

            <div className="relative w-full h-full overflow-auto rounded-2xl overflow-x-hidden overflow-y-hidden">
              {visible.pie && (
                <Rnd
                  bounds="parent"
                  size={pieSize}
                  position={piePos}
                  onDragStop={(_, d) => setPiePos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setPieSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setPiePos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Pie</h2>
                  {combinedPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height={pieSize.height - 60}>
                      <PieChart>
                        <Pie
                          data={combinedPie}
                          dataKey="xValue"
                          cx="30%"
                          cy="50%"
                          outerRadius={80}
                          fill="#3b82f6"
                          nameKey="name"
                          label
                        >
                          {combinedPie.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Pie
                          data={combinedPie}
                          dataKey="yValue"
                          cx="70%"
                          cy="50%"
                          outerRadius={80}
                          fill="#10b981"
                          nameKey="name"
                          label
                        >
                          {combinedPie.map((entry, index) => (
                            <Cell key={index} fill={COLORS[(index + 1) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}

              {visible.line && (
                <Rnd
                  bounds="parent"
                  size={lineSize}
                  position={linePos}
                  onDragStop={(_, d) => setLinePos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setLineSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setLinePos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Line</h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={lineSize.height - 60}>
                      <LineChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="xShipments" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="yShipments" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}

              {visible.radar && (
                <Rnd bounds="parent" size={radarSize} position={radarPos}
                  onDragStop={(_, d) => setRadarPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setRadarSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setRadarPos(pos);
                  }}
                  minWidth={300} minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Radar</h2>
                  {combinedPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height={radarSize.height - 60}>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={combinedPie}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Radar name={`${xTable} Values`} dataKey="xValue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Radar name={`${yTable} Values`} dataKey="yValue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-gray-400">Drag two tables above.</p>}
                </Rnd>
              )}

              {visible.bar && (
                <Rnd
                  bounds="parent"
                  size={barSize}
                  position={barPos}
                  onDragStop={(_, d) => setBarPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setBarSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setBarPos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Combined Bar</h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={barSize.height - 60}>
                      <BarChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="xShipments" fill="#3b82f6" name={`${xTable}`} />
                        <Bar dataKey="yShipments" fill="#10b981" name={`${yTable}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}

              {visible.stack && (
                <Rnd
                  bounds="parent"
                  size={stackSize}
                  position={stackPos}
                  onDragStop={(_, d) => setStackPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setStackSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setStackPos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Stacked Bar</h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={stackSize.height - 60}>
                      <BarChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="xShipments" stackId="a" fill="#3b82f6" name={`${xTable}`} />
                        <Bar dataKey="yShipments" stackId="a" fill="#10b981" name={`${yTable}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above.</p>
                  )}
                </Rnd>
              )}
            </div>
          </main>

          {/* RIGHT panel (chat) restored */}
          <aside style={{ width: chatOpen ? 300 : 0, transition: "width 200ms" }} className="bg-white rounded-2xl shadow-md flex flex-col">
            <div className="px-3 py-2 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 text-center">Ask the data</h2>
              <p className="text-[12px] text-gray-500 text-center">Context-aware AI powered by Ollama</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-[12px] text-gray-500 text-center">
                  <div className="mb-2">🤖 AI ready to help with your data!</div>
                  <div className="text-gray-700 space-y-1">
                    <div>"What's the trend in shipments this quarter?"</div>
                    <div>"Compare Diesel vs Petrol distribution"</div>
                    <div>"Explain the bar chart data"</div>
                    <div>"Which vehicle type is most used?"</div>
                  </div>
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg text-[13px] ${m.role === 'user'
                    ? 'bg-blue-50 text-gray-800 ml-4 border border-blue-200'
                    : m.error
                      ? 'bg-red-50 text-red-700 mr-4 border border-red-200'
                      : 'bg-gray-50 text-gray-700 mr-4 border border-gray-200'
                    }`}
                >
                  <div className="flex items-start space-x-2">
                    {m.role === 'user' ? (
                      <span className="text-blue-600 font-semibold text-xs">You:</span>
                    ) : (
                      <span className={`font-semibold text-xs ${m.error ? 'text-red-600' : 'text-green-600'}`}>
                        🤖 AI:
                      </span>
                    )}
                    <div className="flex-1">
                      {m.content}
                      {m.streaming && (
                        <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1">|</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && !isStreaming && (
                <div className="text-[12px] text-gray-500 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Connecting to AI...</span>
                </div>
              )}
            </div>

            <div className="p-2 border-t border-gray-200">
              {/* Context indicator */}
              <div className="flex items-center justify-between mb-2 text-[10px] text-gray-500">
                <div className="flex items-center space-x-1">
                  <span>📊 Context:</span>
                  <span className="text-blue-600">
                    {[xTable, yTable].filter(Boolean).join(' + ') || 'No tables'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📈 Charts:</span>
                  <span className="text-green-600">
                    {Object.entries(visible).filter(([_, v]) => v).length}
                  </span>
                </div>
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about your data and charts..."
                  className="flex-1 bg-transparent outline-none px-1 text-[13px] text-gray-800"
                  disabled={loading}
                />
                <button
                  disabled={loading || !query.trim()}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-[12px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  onClick={handleSend}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span>...</span>
                    </>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </motion.div>
  );
}
