import { ChartNoAxesCombined } from 'lucide-react';
import { useRouter } from 'next/navigation'; // or react-router depending on your setup

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



const DashboardHeader = () => {
  const router = useRouter();

  return (
  <header className="relative bg-blue-700 text-white p-4 rounded-lg shadow flex items-center justify-center mt-4 w-[90%]">
      {/* left icon */}
      <button
        onClick={() => router.push('/')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 transition"
      >
        <ChartNoAxesCombined size={28} color="white" />
      </button>

      {/* title + subtitle */}
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
};

export default DashboardHeader;
