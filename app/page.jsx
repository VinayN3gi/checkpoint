'use client';
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { MdPieChart, MdBarChart, MdShowChart } from 'react-icons/md';
import { Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Rnd } from "react-rnd";

// dummy datasets
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
      { name: 'Delivered', value: 22 },
      { name: 'Pending', value: 9 },
      { name: 'Cancelled', value: 4 },
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
      { name: 'North', value: 14 },
      { name: 'South', value: 8 },
      { name: 'East', value: 11 },
      { name: 'West', value: 6 },
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

  const pieData = datasets[selectedTable].pie;
  const barData = datasets[selectedTable].bar;

  // fixed initial sizes
  const [pieSize, setPieSize] = useState({ width: 500, height: 350 });
  const [barSize, setBarSize] = useState({ width: 500, height: 350 });

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
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md flex flex-col rounded-2xl overflow-hidden">
            <div className="flex-1 p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Charts</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                  <MdPieChart className="text-blue-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Pie Chart</span>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                  <MdBarChart className="text-green-600 text-2xl" />
                  <span className="text-gray-700 font-medium">Bar Chart</span>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
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

          {/* Main content */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 flex flex-row flex-wrap gap-4 justify-center items-start">
              {/* Pie Chart */}
              <Rnd
                size={{ width: pieSize.width, height: pieSize.height }}
                onResizeStop={(e, dir, ref) => {
                  setPieSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                }}
                className="bg-white rounded-2xl shadow p-4 flex flex-col"
                minWidth={300}
                minHeight={250}
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {selectedTable} by Type
                </h2>
                <ResponsiveContainer width="100%" height={pieSize.height - 60}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Rnd>

              {/* Bar Chart */}
              <Rnd
                size={{ width: barSize.width, height: barSize.height }}
                onResizeStop={(e, dir, ref) => {
                  setBarSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                }}
                className="bg-white rounded-2xl shadow p-4 flex flex-col"
                minWidth={300}
                minHeight={250}
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {selectedTable} Monthly Data
                </h2>
                <ResponsiveContainer width="100%" height={barSize.height - 60}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="shipments" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Rnd>
            </div>

            {/* Input bar */}
            <div className="mt-4">
              <div className="flex items-center bg-white border border-gray-300 rounded-full shadow px-4 py-2">
                <input
                  type="text"
                  placeholder="Ask something about the data..."
                  className="flex-1 px-3 py-2 outline-none rounded-full text-gray-800"
                />
                <button className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition">
                  Send
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}
