import { AlertTriangle, CheckCircle } from "lucide-react";

interface Alert {
  id: string;
  parameter: string;
  value: number;
  threshold: { min: number; max: number };
  status: "warning" | "critical" | "normal";
  message: string;
}

interface AlertsThresholdsProps {
  sensorData: {
    ph: number;
    temperature: number;
    turbidity: number;
    tds: number;
  };
}

export function AlertsThresholds({ sensorData }: AlertsThresholdsProps) {
  // Define thresholds for each parameter
  const thresholds = {
    ph: { min: 6.5, max: 8.5, optimal: 7.0 },
    temperature: { min: 15, max: 30, optimal: 22 },
    turbidity: { min: 0, max: 5, optimal: 2 },
    tds: { min: 0, max: 500, optimal: 300 },
  };

  // Check alerts
  const alerts: Alert[] = [];

  // pH Alert
  if (sensorData.ph < thresholds.ph.min || sensorData.ph > thresholds.ph.max) {
    alerts.push({
      id: "ph",
      parameter: "pH Level",
      value: sensorData.ph,
      threshold: thresholds.ph,
      status: sensorData.ph < 6.0 || sensorData.ph > 9.0 ? "critical" : "warning",
      message: sensorData.ph < thresholds.ph.min ? "pH too low" : "pH too high",
    });
  }

  // Temperature Alert
  if (sensorData.temperature < thresholds.temperature.min || sensorData.temperature > thresholds.temperature.max) {
    alerts.push({
      id: "temperature",
      parameter: "Temperature",
      value: sensorData.temperature,
      threshold: thresholds.temperature,
      status: sensorData.temperature < 10 || sensorData.temperature > 35 ? "critical" : "warning",
      message: sensorData.temperature < thresholds.temperature.min ? "Temperature too low" : "Temperature too high",
    });
  }

  // Turbidity Alert
  if (sensorData.turbidity > thresholds.turbidity.max) {
    alerts.push({
      id: "turbidity",
      parameter: "Turbidity",
      value: sensorData.turbidity,
      threshold: thresholds.turbidity,
      status: sensorData.turbidity > 10 ? "critical" : "warning",
      message: "Turbidity exceeds limit",
    });
  }

  // TDS Alert
  if (sensorData.tds > thresholds.tds.max) {
    alerts.push({
      id: "tds",
      parameter: "TDS",
      value: sensorData.tds,
      threshold: thresholds.tds,
      status: sensorData.tds > 1000 ? "critical" : "warning",
      message: "TDS exceeds limit",
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Alerts & Thresholds</h2>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <div className="text-sm text-green-900 dark:text-green-200">All Systems Normal</div>
            <div className="text-xs text-green-700 dark:text-green-400 mt-1">All parameters within acceptable range</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 ${alert.status === "critical"
                ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600"
                : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600"
                }`}
            >
              <AlertTriangle
                className={`size-6 flex-shrink-0 ${alert.status === "critical" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
                  }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-base font-bold ${alert.status === "critical" ? "text-red-900 dark:text-red-300" : "text-yellow-900 dark:text-yellow-300"
                      }`}
                  >
                    {alert.parameter}: {alert.message}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold ${alert.status === "critical"
                      ? "bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100"
                      : "bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100"
                      }`}
                  >
                    {alert.status.toUpperCase()}
                  </span>
                </div>
                <div
                  className={`text-sm font-semibold ${alert.status === "critical" ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400"
                    }`}
                >
                  Current: {alert.value.toFixed(2)} | Range: {alert.threshold.min} - {alert.threshold.max}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threshold Reference */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm mb-3 text-gray-900 dark:text-gray-100">Threshold Reference</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">pH Level</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1">{thresholds.ph.min} - {thresholds.ph.max}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">Temperature</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1">{thresholds.temperature.min}°C - {thresholds.temperature.max}°C</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">Turbidity</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1">&lt; {thresholds.turbidity.max} NTU</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">TDS</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1">&lt; {thresholds.tds.max} ppm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
