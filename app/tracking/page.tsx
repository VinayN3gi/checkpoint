'use client'
import React, { useState } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";

// --- Static Driver Data ---
const drivers = [
  {
    id: 1,
    name: "Driver A - Petrol Tanker",
    location: [28.6139, 77.209], // Delhi
    checkpoints: [
      { name: "Depot", reached: true, time: "09:00 AM" },
      { name: "Highway Checkpoint", reached: true, time: "11:15 AM" },
      { name: "City Storage Yard", reached: false, time: null },
      { name: "Petroleum Plant", reached: false, time: null },
    ],
  },
  {
    id: 2,
    name: "Driver B - Diesel Truck",
    location: [19.076, 72.8777], // Mumbai
    checkpoints: [
      { name: "Depot", reached: true, time: "08:30 AM" },
      { name: "Toll Plaza", reached: true, time: "10:10 AM" },
      { name: "Fuel Distribution Center", reached: false, time: null },
      { name: "Industrial Refinery", reached: false, time: null },
    ],
  },
  {
    id: 3,
    name: "Driver C - LPG Ship",
    location: [13.0827, 80.2707], // Chennai
    checkpoints: [
      { name: "Port Dock", reached: true, time: "07:45 AM" },
      { name: "Offshore Checkpoint", reached: false, time: null },
      { name: "Main Harbor Storage", reached: false, time: null },
    ],
  },
];

export default function App() {
  const [selectedDriver, setSelectedDriver] = useState(drivers[0]);

  const handleVerifyCheckpoint = () => {
    const updatedCheckpoints = selectedDriver.checkpoints.map((cp, index) => {
      if (!cp.reached && index === selectedDriver.checkpoints.findIndex(c => !c.reached)) {
        return { ...cp, reached: true, time: new Date().toLocaleTimeString() };
      }
      return cp;
    });

    setSelectedDriver({ ...selectedDriver, checkpoints: updatedCheckpoints });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">
      {/* HEADER */}
      <header className="bg-blue-700 text-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          Petroleum Delivery Tracking Dashboard
        </h1>
        <p className="text-sm text-gray-300 text-center">
          Monitor live driver locations and checkpoint progress
        </p>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 space-x-4">
        {/* LEFT PANEL */}
        <aside className="w-1/5 bg-white p-4 rounded-lg shadow flex flex-col border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Drivers</h2>
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className={`p-3 mb-2 rounded cursor-pointer transition font-medium border-2 ${
                selectedDriver.id === driver.id
                  ? "bg-blue-400 text-white shadow border-blue-600 "
                  : "bg-gray-200 text-gray-800 border-gray-400/40 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedDriver(driver)}
            >
              {driver.name}
            </div>
          ))}
        </aside>

        {/* MAP SECTION */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 rounded-lg shadow bg-white border border-gray-200">
          <div className="w-full h-[80%] rounded-lg overflow-hidden border border-gray-300">
            <Map
              height={window.innerHeight * 0.65}
              defaultCenter={selectedDriver.location as [number, number]}
              center={selectedDriver.location as [number, number]}
              defaultZoom={18}
            >
              <Marker anchor={selectedDriver.location as [number, number]} />
              <Overlay
                anchor={selectedDriver.location as [number, number]}
                offset={[60, 20]}
              >
              </Overlay>
            </Map>
          </div>
          <p className="mt-3 text-gray-600 text-sm italic">
            Viewing live location of{" "}
            <span className="font-semibold text-gray-900">{selectedDriver.name}</span>
          </p>
        </main>
        {/* RIGHT PANEL */}
      <aside className="w-1/4 bg-white p-4 rounded-lg shadow border border-gray-200 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">
          Progress Checkpoints
        </h2>

        <div className="relative">
          {selectedDriver.checkpoints.map((cp, index) => (
            <div key={index} className="flex items-start relative">
              {/* Connector line */}
              {index !== selectedDriver.checkpoints.length - 1 && (
                <div
                  className={`absolute left-3 top-6 w-0.5 h-full ${
                    cp.reached ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
              )}

              {/* Circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 
                ${cp.reached ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
              >
              </div>

              {/* Label + Time */}
              <div className="ml-4 pb-8">
                <p className="font-medium text-gray-900">{cp.name}</p>
                {cp.time && (
                  <p className="text-sm text-gray-500">{cp.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
          <button
            onClick={handleVerifyCheckpoint}
            className="w-full mt-6 bg-blue-700 text-white py-2 rounded-lg shadow hover:bg-blue-800 transition"
          >
            Verify Next Checkpoint
          </button>
        </aside>
      </div>
    </div>
  );
}
