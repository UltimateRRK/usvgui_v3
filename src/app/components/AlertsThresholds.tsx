import { AlertTriangle, CheckCircle, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

interface Thresholds {
  ph: { min: number; max: number; optimal: number };
  temperature: { min: number; max: number; optimal: number };
  turbidity: { min: number; max: number; optimal: number };
  tds: { min: number; max: number; optimal: number };
}

export function AlertsThresholds({ sensorData }: AlertsThresholdsProps) {
  // Load thresholds from localStorage or use defaults
  const getInitialThresholds = (): Thresholds => {
    const saved = localStorage.getItem('waterQualityThresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved thresholds:', e);
      }
    }
    return {
      ph: { min: 6.5, max: 8.5, optimal: 7.0 },
      temperature: { min: 15, max: 30, optimal: 22 },
      turbidity: { min: 0, max: 5, optimal: 2 },
      tds: { min: 0, max: 500, optimal: 300 },
    };
  };

  const [thresholds, setThresholds] = useState<Thresholds>(getInitialThresholds);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [previousAlerts, setPreviousAlerts] = useState<string[]>([]);

  // Save thresholds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('waterQualityThresholds', JSON.stringify(thresholds));
  }, [thresholds]);

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

  // Show toast notifications for new alerts
  useEffect(() => {
    const currentAlertIds = alerts.map(a => a.id);

    // Find new alerts that weren't in the previous state
    alerts.forEach(alert => {
      if (!previousAlerts.includes(alert.id)) {
        // New alert detected - show notification
        if (alert.status === "critical") {
          toast.error(`${alert.parameter}: ${alert.message}`, {
            description: `Current: ${alert.value.toFixed(2)} | Range: ${alert.threshold.min} - ${alert.threshold.max}`,
            duration: 5000,
          });
        } else {
          toast.warning(`${alert.parameter}: ${alert.message}`, {
            description: `Current: ${alert.value.toFixed(2)} | Range: ${alert.threshold.min} - ${alert.threshold.max}`,
            duration: 5000,
          });
        }
      }
    });

    // Update previous alerts
    setPreviousAlerts(currentAlertIds);
  }, [alerts.length, sensorData]);

  const handleEdit = (field: string, currentValue: number) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleSave = (param: keyof Thresholds, field: 'min' | 'max') => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue) && numValue >= 0) {
      setThresholds(prev => ({
        ...prev,
        [param]: {
          ...prev[param],
          [field]: numValue
        }
      }));
    }
    setEditingField(null);
    setTempValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, param: keyof Thresholds, field: 'min' | 'max') => {
    if (e.key === 'Enter') {
      handleSave(param, field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue("");
    }
  };

  const ThresholdValue = ({
    param,
    field,
    value,
    unit
  }: {
    param: keyof Thresholds;
    field: 'min' | 'max';
    value: number;
    unit?: string;
  }) => {
    const fieldKey = `${param}-${field}`;
    const isEditing = editingField === fieldKey;

    return isEditing ? (
      <input
        type="number"
        step="0.1"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => handleSave(param, field)}
        onKeyDown={(e) => handleKeyDown(e, param, field)}
        className="w-16 px-1 py-0.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
    ) : (
      <span
        onClick={() => handleEdit(fieldKey, value)}
        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 py-0.5 rounded transition-colors inline-flex items-center gap-1 group"
        title="Click to edit"
      >
        {value}{unit}
        <Pencil className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </span>
    );
  };

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
                ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 animate-pulse-red"
                : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600 animate-pulse-yellow"
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-gray-900 dark:text-gray-100">Threshold Reference</h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">Click values to edit</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">pH Level</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
              <ThresholdValue param="ph" field="min" value={thresholds.ph.min} /> - <ThresholdValue param="ph" field="max" value={thresholds.ph.max} />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">Temperature</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
              <ThresholdValue param="temperature" field="min" value={thresholds.temperature.min} unit="°C" /> - <ThresholdValue param="temperature" field="max" value={thresholds.temperature.max} unit="°C" />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">Turbidity</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
              &lt; <ThresholdValue param="turbidity" field="max" value={thresholds.turbidity.max} unit=" NTU" />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-gray-600 dark:text-gray-400">TDS</div>
            <div className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
              &lt; <ThresholdValue param="tds" field="max" value={thresholds.tds.max} unit=" ppm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
