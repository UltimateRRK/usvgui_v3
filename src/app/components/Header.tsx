import { Wifi, WifiOff, Satellite, Clock } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";


interface HeaderProps {
  isOnline: boolean;
  hasGpsFix: boolean;
  lastUpdate: Date;
}

export function Header({ isOnline, hasGpsFix, lastUpdate }: HeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="text-white shadow-lg" style={{ backgroundColor: '#0B2038' }}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl">USV Monitoring & Navigation Dashboard</h1>
            <p className="text-sm text-blue-100 mt-1">Water Quality Telemetry System</p>
          </div>

          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
