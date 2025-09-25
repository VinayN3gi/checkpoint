'use client'
import React, { useState } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import { ChartNoAxesCombined } from 'lucide-react';
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Static Driver Data with Safety Notifications ---
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
    safetyNotification: null,
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
    safetyNotification: "⚠️ Engine overheating detected near Toll Plaza",
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
    safetyNotification: "⚠️ Minor oil leakage observed at port dock",
  },
];

// --- Driver List Component ---
function DriverList({ drivers, selectedDriver, onSelect }) {
  return (
    <aside className="w-1/5 bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Drivers</h2>
      {drivers.map((driver) => (
        <div
          key={driver.id}
          className={`p-3 mb-2 rounded cursor-pointer transition font-medium border-2 ${
            selectedDriver.id === driver.id
              ? "bg-blue-700 text-white shadow border-blue-800 "
              : "bg-gray-200 text-gray-800 border-gray-400/40 hover:bg-gray-300"
          }`}
          onClick={() => onSelect(driver)}
        >
          {driver.name}
        </div>
      ))}
    </aside>
  );
}

// --- Map Panel Component ---
function MapPanel({ driver }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-lg shadow bg-white border border-gray-200">
      <div className="w-full h-[80%] rounded-lg overflow-hidden border border-gray-300">
        <Map
          height={window.innerHeight * 0.65}
          defaultCenter={driver.location}
          center={driver.location}
          defaultZoom={15}
        >
          <Marker anchor={driver.location}>
            <div className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shadow">
              {driver.name.split(" ")[1][0]}
            </div>
          </Marker>
          <Overlay
            anchor={driver.location}
            offset={[60, 20]}
          ></Overlay>
        </Map>
      </div>
      <p className="mt-3 text-gray-600 text-sm italic">
        Viewing live location of{" "}
        <span className="font-semibold text-gray-900">{driver.name}</span>
      </p>
    </div>
  );
}

// --- Checkpoint Panel Component ---
function CheckpointPanel({ checkpoints, onVerify }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-[70%] flex flex-col">
      {/* Fixed Header */}
      <h2 className="text-lg font-semibold mb-4 text-gray-800 shrink-0">
        Progress Checkpoints
      </h2>

      {/* Scrollable Checkpoint List */}
      <div className="relative flex-1 overflow-y-auto pr-2">
        {checkpoints.map((cp,index) => (
          <div key={index} className="flex items-start relative">
            {/* Connector line */}
            {index !== checkpoints.length - 1 && (
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
            ></div>

            {/* Label + Time */}
            <div className="ml-4 pb-8">
              <p className="font-medium text-gray-900">{cp.name}</p>
              {cp.time && <p className="text-sm text-gray-500">{cp.time}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Button */}
      <button
        onClick={onVerify}
        className="w-full mt-4 bg-blue-700 text-white py-2 rounded-lg shadow hover:bg-blue-800 transition shrink-0"
      >
        Verify Next Checkpoint
      </button>
    </div>
  );
}

// --- Safety Panel Component ---
function SafetyPanel({ safetyMessage }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-[30%] mt-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Safety Notifications
      </h2>
      {safetyMessage ? (
        <p className="text-red-600 font-medium">{safetyMessage}</p>
      ) : (
        <p className="text-green-600 font-medium">
          ✅ No safety notifications raised
        </p>
      )}
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [selectedDriver, setSelectedDriver] = useState(drivers[0]);
  const router=useRouter();

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
     <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen"
    >
    <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">
      {/* HEADER */}
     <header className="relative bg-blue-700 text-white p-4 rounded-lg shadow flex items-center justify-center">
            {/* Left-aligned button */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 transition">
                <ChartNoAxesCombined size={28} color="white"  onClick={()=>router.push("/")}/>
            </button>

            {/* Title and subtitle */}
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-wide">
                Petroleum Delivery Tracking Dashboard
                </h1>
                <p className="text-sm text-gray-300">
                Monitor live driver locations and checkpoint progress
                </p>
            </div>
            </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 space-x-4">
        <DriverList
          drivers={drivers}
          selectedDriver={selectedDriver}
          onSelect={setSelectedDriver}
        />

        <MapPanel driver={selectedDriver} />

        {/* Right side stacked panels with fixed height split */}
        <div className="w-1/4 flex flex-col h-full">
          <CheckpointPanel
            checkpoints={selectedDriver.checkpoints}
            onVerify={handleVerifyCheckpoint}
          />
          <SafetyPanel safetyMessage={selectedDriver.safetyNotification} />
        </div>
      </div>
    </div>
    </motion.div>
  );
}
