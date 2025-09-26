'use client'
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter,
} from "recharts";

// Static data
const shipments = [
  { shipment_id: 1, date: "2025-09-01", product_id: 1, volume_liters: 5000, driver_id: 1, status: "Delivered" },
  { shipment_id: 2, date: "2025-09-02", product_id: 2, volume_liters: 3000, driver_id: 2, status: "In Transit" },
  { shipment_id: 3, date: "2025-09-03", product_id: 1, volume_liters: 4500, driver_id: 3, status: "Delivered" },
];
const drivers = [
  { driver_id: 1, name: "John", experience_years: 5 },
  { driver_id: 2, name: "Sara", experience_years: 3 },
  { driver_id: 3, name: "Alex", experience_years: 7 },
];
const shipmentsWithDrivers = shipments.map((s) => {
  const d = drivers.find((dr) => dr.driver_id === s.driver_id);
  return { ...s, driver_name: d?.name, experience_years: d?.experience_years };
});

// Sidebar data
const chartTypes = ["Bar Chart", "Scatter Chart"];
const tables = [
  { name: "ShipmentsWithDrivers", fields: Object.keys(shipmentsWithDrivers[0]) },
];

export default function Dashboard() {
  const [chartType, setChartType] = useState("Bar Chart");
  const [xField, setXField] = useState("");
  const [yField, setYField] = useState("");

  const handleDragStart = (e, field) => {
    e.dataTransfer.setData("field", field);
  };
  const handleDrop = (setter) => (e) => {
    const field = e.dataTransfer.getData("field");
    setter(field);
  };

  const DropBox = ({ label, value, onDrop }) => (
    <div
      className="flex-1 border-2 border-dashed rounded-lg p-3 text-center h-20 flex items-center justify-center text-gray-500"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {value ? `${label}: ${value}` : `Drop field here for ${label}`}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT PANEL */}
      <div className="w-72 bg-white border-r flex flex-col">
        {/* Top part: Chart types */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold mb-2">Chart Types</h2>
          <div className="space-y-2">
            {chartTypes.map((ct) => (
              <div
                key={ct}
                onClick={() => setChartType(ct)}
                className={`p-2 rounded cursor-pointer text-center ${
                  chartType === ct ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {ct}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom part: Table names & fields */}
        <div className="flex-1 overflow-auto p-4">
          <h2 className="text-lg font-bold mb-2">Tables</h2>
          {tables.map((t) => (
            <div key={t.name} className="mb-4">
              <div className="font-semibold">{t.name}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {t.fields.map((f) => (
                  <div
                    key={f}
                    draggable
                    onDragStart={(e) => handleDragStart(e, f)}
                    className="px-2 py-1 bg-gray-200 rounded cursor-move text-xs"
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Analytics Builder</h1>

        {/* Two drop boxes at the top */}
        <div className="flex space-x-4 mb-6">
          <DropBox label="X Axis" value={xField} onDrop={handleDrop(setXField)} />
          <DropBox label="Y Axis" value={yField} onDrop={handleDrop(setYField)} />
        </div>

        {/* Chart Area */}
        <div className="bg-white border rounded-xl p-4 min-h-[350px] flex items-center justify-center">
          {xField && yField ? (
            <>
              {chartType === "Bar Chart" && (
                <BarChart width={700} height={300} data={shipmentsWithDrivers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xField} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={yField} fill="#3b82f6" />
                </BarChart>
              )}
              {chartType === "Scatter Chart" && (
                <ScatterChart width={700} height={300}>
                  <CartesianGrid />
                  <XAxis dataKey={xField} name={xField} />
                  <YAxis dataKey={yField} name={yField} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={shipmentsWithDrivers} fill="#10b981" />
                </ScatterChart>
              )}
            </>
          ) : (
            <p className="text-gray-400">
              Drag fields from the left panel to the boxes above to build your chart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
