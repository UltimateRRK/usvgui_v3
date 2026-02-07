import { useState, useEffect } from "react";
import { Droplets, Thermometer, Gauge, Waves } from "lucide-react";
import { Header } from "./components/Header";
import { SensorCard } from "./components/SensorCard";
import { WaterQualityStatus } from "./components/WaterQualityStatus";
import { MapView } from "./components/MapView";
import { SystemSettings } from "./components/SystemSettings";
import { CombinedScientificData } from "./components/CombinedScientificData";
import { AlertsThresholds } from "./components/AlertsThresholds";
import { DataExport } from "./components/DataExport";
import { MissionLog, MissionLogEntry } from "./components/MissionLog";
import { USVHealthStrip } from "./components/USVHealthStrip";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/ThemeProvider";


interface SensorData {
  ph: number;
  temperature: number;
  tds: number;
  turbidity: number;
}

interface ChartDataPoint {
  timestamp: string;
  ph: number;
  temperature: number;
  turbidity: number;
  tds: number;
}

// Mock data generator - simulates live telemetry
function generateSensorData(): SensorData {
  return {
    ph: 7.2 + (Math.random() - 0.5) * 0.8,
    temperature: 24 + (Math.random() - 0.5) * 4,
    tds: 450 + (Math.random() - 0.5) * 100,
    turbidity: 5 + (Math.random() - 0.5) * 4,
  };
}

// Calculate water quality status based on sensor readings
function calculateWaterQuality(data: SensorData): "good" | "moderate" | "poor" {
  let score = 0;

  // pH should be between 6.5 and 8.5
  if (data.ph >= 6.5 && data.ph <= 8.5) score++;
  else if (data.ph >= 6.0 && data.ph <= 9.0) score += 0.5;

  // Temperature should be between 20-28°C
  if (data.temperature >= 20 && data.temperature <= 28) score++;
  else if (data.temperature >= 15 && data.temperature <= 32) score += 0.5;

  // TDS should be less than 500 ppm
  if (data.tds < 500) score++;
  else if (data.tds < 600) score += 0.5;

  // Turbidity should be less than 5 NTU
  if (data.turbidity < 5) score++;
  else if (data.turbidity < 10) score += 0.5;

  if (score >= 3.5) return "good";
  if (score >= 2) return "moderate";
  return "poor";
}

export default function App() {
  // Connection and GPS state
  const [isOnline, setIsOnline] = useState(true);
  const [hasGpsFix, setHasGpsFix] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Sensor data
  const [sensorData, setSensorData] = useState<SensorData>(generateSensorData());
  const [waterQuality, setWaterQuality] = useState<"good" | "moderate" | "poor">("good");

  // USV position and navigation
  const [usvPosition, setUsvPosition] = useState<[number, number]>([15.4909, 73.8278]); // Mandovi River, Panaji, Goa
  const [trail, setTrail] = useState<[number, number][]>([[15.4909, 73.8278]]);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [addWaypointMode, setAddWaypointMode] = useState(false);
  const [heading, setHeading] = useState(0); // Heading in degrees (0-360)

  // Chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // System settings
  const [sensorInterval, setSensorInterval] = useState(2); // in seconds

  // Mission log
  const [missionLog, setMissionLog] = useState<MissionLogEntry[]>([]);

  // Battery level (simulated)
  const [batteryLevel, setBatteryLevel] = useState(85);

  // Derive sampling mode from sensor interval
  const getSamplingMode = () => {
    if (sensorInterval <= 60) return 'Survey Mode';
    if (sensorInterval <= 900) return 'Routine Monitoring';
    return 'Low-Power / Standby';
  };

  // Simulate live telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateSensorData();
      setSensorData(newData);
      setWaterQuality(calculateWaterQuality(newData));
      setLastUpdate(new Date());

      // Update chart data (keep last 20 points)
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setChartData(prev => {
        const newPoint = {
          timestamp,
          ph: newData.ph,
          temperature: newData.temperature,
          turbidity: newData.turbidity,
          tds: newData.tds,
        };
        return [...prev.slice(-19), newPoint];
      });
    }, sensorInterval * 1000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [sensorInterval]);

  // Simulate USV movement
  useEffect(() => {
    const interval = setInterval(() => {
      setUsvPosition(prev => {
        // Small random movement to simulate navigation
        const newLat = prev[0] + (Math.random() - 0.5) * 0.0005;
        const newLng = prev[1] + (Math.random() - 0.5) * 0.0005;
        const newPos: [number, number] = [newLat, newLng];

        // Calculate heading based on movement direction
        const latDiff = newLat - prev[0];
        const lngDiff = newLng - prev[1];
        const newHeading = (Math.atan2(lngDiff, latDiff) * 180 / Math.PI + 90 + 360) % 360;
        setHeading(newHeading);

        // Update trail (keep last 50 positions)
        setTrail(prevTrail => [...prevTrail.slice(-49), newPos]);

        return newPos;
      });
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize chart data
  useEffect(() => {
    const initialData: ChartDataPoint[] = [];
    for (let i = 0; i < 10; i++) {
      const data = generateSensorData();
      initialData.push({
        timestamp: `${i}s`,
        ...data,
      });
    }
    setChartData(initialData);
  }, []);

  const handleAddWaypoint = (position: [number, number]) => {
    setWaypoints(prev => [...prev, position]);
    setAddWaypointMode(false);
    toast.success(`Waypoint ${waypoints.length + 1} added`);
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
    toast.info("Waypoints cleared");
  };

  const handleSendWaypoints = () => {
    if (waypoints.length > 0) {
      // Create mission log entry
      const missionEntry: MissionLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        waypoints: [...waypoints],
        waypointCount: waypoints.length,
        status: Math.random() > 0.2 ? "Accepted" : "Rejected", // Simulate 80% acceptance rate
        message: Math.random() > 0.2
          ? `Mission accepted. USV will navigate to ${waypoints.length} waypoint${waypoints.length !== 1 ? 's' : ''}.`
          : "Mission rejected. Waypoint path exceeds safe navigation parameters.",
      };

      setMissionLog(prev => [missionEntry, ...prev]);

      toast.success(`${waypoints.length} waypoints sent to USV via Pixhawk`);
      // In a real implementation, this would send waypoints to the backend
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Toaster position="top-right" />

        <Header
          isOnline={isOnline}
          hasGpsFix={hasGpsFix}
          lastUpdate={lastUpdate}
        />

        <USVHealthStrip
          connectionStatus={isOnline ? 'online' : 'offline'}
          lastTelemetryTimestamp={lastUpdate}
          batteryLevel={batteryLevel}
          samplingMode={getSamplingMode()}
        />

        <main className="flex-1 p-6">
          {/* Main Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
            {/* Left Panel - Map */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <MapView
                usvPosition={usvPosition}
                heading={heading}
                trail={trail}
                waypoints={waypoints}
                onAddWaypoint={handleAddWaypoint}
                onClearWaypoints={handleClearWaypoints}
                onSendWaypoints={handleSendWaypoints}
                addWaypointMode={addWaypointMode}
                setAddWaypointMode={setAddWaypointMode}
              />
            </div>

            {/* Right Panel - Telemetry */}
            <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2">
              <div>
                <h2 className="text-lg mb-3 text-gray-700 dark:text-gray-200">Live Sensor Data</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SensorCard
                    title="pH Level"
                    value={sensorData.ph}
                    unit="pH"
                    icon={<Droplets className="size-5 text-white" />}
                    timestamp={lastUpdate.toLocaleTimeString('en-US')}
                  />
                  <SensorCard
                    title="Temperature"
                    value={sensorData.temperature}
                    unit="°C"
                    icon={<Thermometer className="size-5 text-white" />}
                    timestamp={lastUpdate.toLocaleTimeString('en-US')}
                  />
                  <SensorCard
                    title="TDS"
                    value={sensorData.tds}
                    unit="ppm"
                    icon={<Gauge className="size-5 text-white" />}
                    timestamp={lastUpdate.toLocaleTimeString('en-US')}
                  />
                  <SensorCard
                    title="Turbidity"
                    value={sensorData.turbidity}
                    unit="NTU"
                    icon={<Waves className="size-5 text-white" />}
                    timestamp={lastUpdate.toLocaleTimeString('en-US')}
                  />
                </div>
              </div>

              <div>
                <WaterQualityStatus status={waterQuality} />
              </div>

            </div>
          </div>

          {/* Combined Scientific Data */}
          <div className="mt-6">
            <CombinedScientificData data={chartData} currentData={sensorData} />
          </div>

          {/* Alerts Thresholds */}
          <div className="mt-6">
            <AlertsThresholds sensorData={sensorData} />
          </div>

          {/* Data Export */}
          <div className="mt-6">
            <DataExport data={chartData} />
          </div>

          {/* System Settings */}
          <div className="mt-6">
            <SystemSettings
              sensorInterval={sensorInterval}
              onIntervalChange={setSensorInterval}
            />
          </div>

          {/* Mission Log */}
          <div className="mt-6">
            <MissionLog missions={missionLog} />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 py-4 px-6">
          <div className="flex items-center justify-center text-sm">
            <div>Made with rrk</div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}