import { Droplet, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface WaterQualityStatusProps {
  status: "good" | "moderate" | "poor";
}

export function WaterQualityStatus({ status }: WaterQualityStatusProps) {
  const statusConfig = {
    good: {
      label: "Good",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      icon: <CheckCircle className="size-6 text-green-600" />,
    },
    moderate: {
      label: "Moderate",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-500",
      icon: <AlertTriangle className="size-6 text-yellow-600" />,
    },
    poor: {
      label: "Poor",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-500",
      icon: <XCircle className="size-6 text-red-600" />,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-4`}>
      <div className="flex items-center gap-3">
        <Droplet className="size-8 text-blue-600" />
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">Water Quality Status</div>
          <div className={`text-xl ${config.textColor} flex items-center gap-2`}>
            {config.icon}
            <span>{config.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
