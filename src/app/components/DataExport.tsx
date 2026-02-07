import { Download, FileText } from "lucide-react";

interface ChartData {
  timestamp: string;
  ph: number;
  temperature: number;
  turbidity: number;
  tds: number;
}

interface DataExportProps {
  data: ChartData[];
}

export function DataExport({ data }: DataExportProps) {
  const handleDownloadCSV = () => {
    if (data.length === 0) {
      alert("No data available to export");
      return;
    }

    // Create CSV content
    const headers = ["Timestamp", "pH Level", "Temperature (°C)", "Turbidity (NTU)", "TDS (ppm)"];
    const csvRows = [headers.join(",")];

    data.forEach((row) => {
      const values = [
        row.timestamp,
        row.ph.toFixed(2),
        row.temperature.toFixed(2),
        row.turbidity.toFixed(2),
        row.tds.toFixed(0),
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.setAttribute("href", url);
    link.setAttribute("download", `water_quality_data_${timestamp}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (data.length === 0) {
      alert("No data available to export");
      return;
    }

    // Create JSON content
    const jsonContent = JSON.stringify(data, null, 2);

    // Create blob and download
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.setAttribute("href", url);
    link.setAttribute("download", `water_quality_data_${timestamp}.json`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Data Export</h2>

      <div className="space-y-4">
        {/* Export Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-blue-900 dark:text-blue-200 mb-1">Export Data for Reporting</div>
              <div className="text-xs text-blue-700 dark:text-blue-400">
                Download sensor readings for validation, analysis, and compliance reporting. Data includes
                all recorded timestamps and measurements.
              </div>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Records</div>
            <div className="text-xl text-gray-900 dark:text-gray-100">{data.length}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">First Reading</div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {data.length > 0 ? data[0].timestamp : "N/A"}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">Latest Reading</div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {data.length > 0 ? data[data.length - 1].timestamp : "N/A"}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadCSV}
            disabled={data.length === 0}
            className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="size-4" />
            Download CSV
          </button>
          <button
            onClick={handleDownloadJSON}
            disabled={data.length === 0}
            className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="size-4" />
            Download JSON
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Files will be downloaded with timestamp for record keeping
        </div>
      </div>
    </div>
  );
}
