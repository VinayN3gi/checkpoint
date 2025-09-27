import { Map, BotMessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation'; // or react-router depending on your setup


const DashboardHeader = ({toggleChat}) => {
  const router = useRouter();
  return (
    <header className="relative bg-blue-700 text-white p-4 rounded-lg shadow flex items-center justify-center">
      <button
        onClick={() => router.push('/tracking')}
        className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 transition"
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

      <button
        onClick={toggleChat}
        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-blue-600 transition"
      >
        <BotMessageSquare size={28} color="white" />
      </button>
    </header>
  );
};

export default DashboardHeader;
