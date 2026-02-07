import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  timestamp: string;
  ph: number;
  temperature: number;
  turbidity: number;
  tds: number;
}

interface ChartsPanelProps {
  data: ChartData[];
}

export function ChartsPanel({ data }: ChartsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm mb-4 text-gray-700">pH vs Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[6, 9]}
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm mb-4 text-gray-700">Temperature vs Time (°C)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[15, 35]}
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm mb-4 text-gray-700">Turbidity vs Time (NTU)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[0, 20]}
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="turbidity" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
