'use client';
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { MdPieChart, MdBarChart, MdShowChart } from 'react-icons/md';
import { Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Rnd } from "react-rnd";

// unified static datasets with matching categories/months
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
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function DashboardHeader() {
  const router = useRouter();
  return (
    <header className="relative bg-blue-700 text-white p-4 rounded-lg shadow flex items-center justify-center">
      <button
        onClick={() => router.push('/tracking')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 transition"
      >
        <Map size={28} color="white" />
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-wide">
          Petroleum Delivery Tracking Dashboard
        </h1>
        <p className="text-sm text-gray-300">
          Monitor live driver locations and checkpoint progress
        </p>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  const [selectedTable, setSelectedTable] = useState('Drivers');

  // size + position for each widget
  const [pieSize, setPieSize] = useState({ width: 500, height: 350 });
  const [barSize, setBarSize] = useState({ width: 500, height: 350 });
  const [lineSize, setLineSize] = useState({ width: 500, height: 350 });
  const [piePos, setPiePos] = useState({ x: 0, y: 100 });
  const [barPos, setBarPos] = useState({ x: 520, y: 100 });
  const [linePos, setLinePos] = useState({ x: 260, y: 480 });

  // visible toggles – line true by default
  const [visible, setVisible] = useState({
    pie: true,
    bar: true,
    line: true,
  });

  // X and Y table drop states
  const [xTable, setXTable] = useState(null);
  const [yTable, setYTable] = useState(null);

  // drag handlers for table names
  const handleDragStart = (e, table) => {
    e.dataTransfer.setData("table", table);
  };

  // combine pie data (category-wise)
  let combinedPie = [];
  if (xTable && yTable) {
    const xPie = datasets[xTable].pie;
    const yPie = datasets[yTable].pie;
    combinedPie = xPie.map((x) => {
      const y = yPie.find((yy) => yy.name === x.name);
      return {
        name: x.name,
        xValue: x.value,
        yValue: y ? y.value : 0,
      };
    });
  }

  // combine bar/line data (month-wise)
  let combinedBarLine = [];
  if (xTable && yTable) {
    const xBar = datasets[xTable].bar;
    const yBar = datasets[yTable].bar;
    combinedBarLine = xBar.map((x) => {
      const y = yBar.find((yy) => yy.name === x.name);
      return {
        name: x.name,
        xShipments: x.shipments,
        yShipments: y ? y.shipments : 0,
      };
    });
  }

  // chat state unchanged
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    setMessages((m) => [...m, { role: 'user', content: query }]);
    setLoading(true);
    try {
      const localData = JSON.stringify(datasets[selectedTable], null, 2);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an analytics assistant. Use only the following local dataset for ${selectedTable} to answer:
              ${localData}`,
            },
            { role: 'user', content: query },
          ],
        }),
      });
      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || 'No response';
      setMessages((m) => [...m, { role: 'assistant', content: answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error fetching response' }]);
    } finally {
      setQuery('');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen"
    >
      <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">
        <DashboardHeader />
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* LEFT: Sidebar */}
          <aside className="w-64 bg-white shadow-md flex flex-col rounded-2xl overflow-hidden">
            <div className="flex-1 p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Charts</h2>
              <div className="space-y-3">
                <div
                  onClick={() => setVisible((v) => ({ ...v, pie: !v.pie }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                    visible.pie ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <MdPieChart className="text-blue-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Pie Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, bar: !v.bar }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                    visible.bar ? 'bg-green-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <MdBarChart className="text-green-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Bar Chart</span>
                </div>
                <div
                  onClick={() => setVisible((v) => ({ ...v, line: !v.line }))}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                    visible.line ? 'bg-purple-100' : 'hover:bg-blue-50'
                  }`}
                >
                  <MdShowChart className="text-purple-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Line Chart</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tables</h2>
              <ul className="space-y-2">
                {['Drivers', 'Shipments', 'Locations'].map((table) => (
                  <li
                    key={table}
                    draggable
                    onDragStart={(e) => handleDragStart(e, table)}
                    onClick={() => setSelectedTable(table)}
                    className={`p-2 rounded-lg cursor-pointer font-medium ${
                      selectedTable === table
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    {table}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* CENTER: Stage */}
          <main className="flex-1 overflow-hidden">
            {/* Drop boxes for X and Y tables */}
            <div className="flex space-x-4 mb-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => setXTable(e.dataTransfer.getData("table"))}
                className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-20 flex items-center justify-center text-gray-500"
              >
                {xTable ? `X Axis Table: ${xTable}` : "Drag a table here for X Axis"}
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => setYTable(e.dataTransfer.getData("table"))}
                className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-20 flex items-center justify-center text-gray-500"
              >
                {yTable ? `Y Axis Table: ${yTable}` : "Drag a table here for Y Axis"}
              </div>
            </div>

            <div className="relative w-full h-full overflow-auto rounded-2xl overflow-x-hidden overflow-y-hidden">
              {visible.pie && (
                <Rnd
                  bounds="parent"
                  size={{ width: pieSize.width, height: pieSize.height }}
                  position={{ x: piePos.x, y: piePos.y }}
                  onDragStop={(_, d) => setPiePos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setPieSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setPiePos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Combined Pie ({xTable || 'X'} vs {yTable || 'Y'})
                  </h2>
                  {combinedPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height={pieSize.height - 60}>
                      <PieChart>
                        <Pie
                          data={combinedPie}
                          dataKey="xValue"
                          cx="30%" cy="50%"
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
                          cx="70%" cy="50%"
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
                    <p className="text-gray-400">Drag two tables above to see combined pie chart.</p>
                  )}
                </Rnd>
              )}

              {visible.bar && (
                <Rnd
                  bounds="parent"
                  size={{ width: barSize.width, height: barSize.height }}
                  position={{ x: barPos.x, y: barPos.y }}
                  onDragStop={(_, d) => setBarPos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setBarSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setBarPos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Combined Bar ({xTable || 'X'} vs {yTable || 'Y'})
                  </h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={barSize.height - 60}>
                      <BarChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="xShipments" fill="#3b82f6" name={`${xTable} Shipments`} />
                        <Bar dataKey="yShipments" fill="#10b981" name={`${yTable} Shipments`} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above to see combined bar chart.</p>
                  )}
                </Rnd>
              )}

              {visible.line && (
                <Rnd
                  bounds="parent"
                  size={{ width: lineSize.width, height: lineSize.height }}
                  position={{ x: linePos.x, y: linePos.y }}
                  onDragStop={(_, d) => setLinePos({ x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, pos) => {
                    setLineSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                    setLinePos(pos);
                  }}
                  minWidth={300}
                  minHeight={250}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col absolute"
                >
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Combined Line ({xTable || 'X'} vs {yTable || 'Y'})
                  </h2>
                  {combinedBarLine.length > 0 ? (
                    <ResponsiveContainer width="100%" height={lineSize.height - 60}>
                      <LineChart data={combinedBarLine}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="xShipments" stroke="#3b82f6" strokeWidth={2} name={`${xTable} Shipments`} />
                        <Line type="monotone" dataKey="yShipments" stroke="#10b981" strokeWidth={2} name={`${yTable} Shipments`} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400">Drag two tables above to see combined line chart.</p>
                  )}
                </Rnd>
              )}
            </div>
          </main>

          {/* RIGHT: Chat panel unchanged */}
          <aside className="w-[380px] bg-white rounded-2xl shadow-md flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Ask the data</h2>
              <p className="text-xs text-gray-500">Natural-language queries</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-xs text-gray-500 text-center">
                  No messages yet — ask something like:
                  <div className="mt-2 text-gray-700">
                    “Show shipments trend for Q1” or “Share of Diesel vs Petrol”
                  </div>
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg text-sm ${
                    m.role === 'user'
                      ? 'bg-blue-50 text-gray-800 self-end'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="text-xs text-gray-500">Thinking…</div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask something about the data..."
                  className="flex-1 bg-transparent outline-none px-2 py-1 text-gray-800"
                />
                <button
                  disabled={loading}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition disabled:opacity-50"
                  onClick={handleSend}
                >
                  {loading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
