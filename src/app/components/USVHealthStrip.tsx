import { Wifi, WifiOff, Battery, Radio, Clock } from "lucide-react";

interface USVHealthStripProps {
    connectionStatus: 'online' | 'degraded' | 'offline';
    lastTelemetryTimestamp: Date;
    batteryLevel?: number; // 0-100, optional
    samplingMode: string;
}

export function USVHealthStrip({
    connectionStatus,
    lastTelemetryTimestamp,
    batteryLevel,
    samplingMode
}: USVHealthStripProps) {
    const getConnectionColor = () => {
        switch (connectionStatus) {
            case 'online':
                return 'text-green-500 dark:text-green-400';
            case 'degraded':
                return 'text-yellow-500 dark:text-yellow-400';
            case 'offline':
                return 'text-red-500 dark:text-red-400';
        }
    };

    const getConnectionIcon = () => {
        if (connectionStatus === 'offline') {
            return <WifiOff className="size-4" />;
        }
        return <Wifi className="size-4" />;
    };

    const getBatteryColor = () => {
        if (!batteryLevel) return 'text-gray-400';
        if (batteryLevel > 60) return 'text-green-500 dark:text-green-400';
        if (batteryLevel > 30) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex items-center justify-center flex-wrap gap-10">
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                    <div className={getConnectionColor()}>
                        {getConnectionIcon()}
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Connection</div>
                        <div className={`text-sm font-semibold capitalize ${getConnectionColor()}`}>
                            {connectionStatus}
                        </div>
                    </div>
                </div>

                {/* Last Telemetry */}
                <div className="flex items-center gap-2">
                    <Clock className="size-4 text-gray-400" />
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Last Update</div>
                        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {formatTimestamp(lastTelemetryTimestamp)}
                        </div>
                    </div>
                </div>

                {/* Battery (if available) */}
                {batteryLevel !== undefined && (
                    <div className="flex items-center gap-2">
                        <Battery className={`size-4 ${getBatteryColor()}`} />
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Battery</div>
                            <div className={`text-sm font-semibold ${getBatteryColor()}`}>
                                {batteryLevel}%
                            </div>
                        </div>
                    </div>
                )}

                {/* Sampling Mode */}
                <div className="flex items-center gap-2">
                    <Radio className="size-4 text-blue-500 dark:text-blue-400" />
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Sampling Mode</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {samplingMode}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
