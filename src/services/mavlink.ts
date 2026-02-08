/**
 * MAVLink Service Interface (Placeholder)
 * 
 * DEPRECATED: Use IBridgeService from bridge.ts instead.
 * 
 * This module defines the interface for future MAVLink protocol integration
 * with Pixhawk/ArduPilot autopilots.
 * 
 * NO IMPLEMENTATION INCLUDED - Interface only for type safety and future work.
 * 
 * SEE: ../types/bridge.ts for the production bridge API contract.
 */

import { Mission, Waypoint } from '../types/mission';

/**
 * Vehicle position telemetry
 */
export interface VehiclePosition {
    /** Latitude in degrees */
    lat: number;

    /** Longitude in degrees */
    lon: number;

    /** Altitude in meters (MSL or relative depending on frame) */
    alt: number;

    /** Heading in degrees (0-360, 0=North) */
    heading: number;

    /** Ground speed in m/s */
    groundspeed: number;

    /** Timestamp (ISO 8601) */
    timestamp: string;
}

/**
 * Result of a mission upload operation
 */
export interface MissionUploadResult {
    /** Whether the upload was successful */
    success: boolean;

    /** Number of waypoints accepted by the autopilot */
    acceptedWaypointCount: number;

    /** Error messages, if any */
    errors?: string[];

    /** Warning messages */
    warnings?: string[];
}

/**
 * MAVLink service interface for Pixhawk/ArduPilot communication
 * 
 * IMPORTANT: This is a placeholder interface only.
 * No WebSocket, serial, or HTTP implementation is included.
 * Future implementation will handle MAVLink protocol communication.
 */
export interface IMavLinkService {
    /**
     * Upload a mission to the connected Pixhawk/ArduPilot autopilot
     * 
     * @param mission - Mission to upload
     * @returns Promise resolving to upload result
     * 
     * Future implementation will:
     * 1. Convert Mission to MAVLink MISSION_ITEM messages
     * 2. Send via MAVLink protocol (serial/UDP/TCP)
     * 3. Handle MISSION_ACK response
     */
    uploadMission(mission: Mission): Promise<MissionUploadResult>;

    /**
     * Fetch the current mission from the connected autopilot
     * 
     * @returns Promise resolving to the mission stored in the autopilot
     * 
     * Future implementation will:
     * 1. Request mission count (MISSION_REQUEST_LIST)
     * 2. Request each MISSION_ITEM
     * 3. Convert to Mission object
     */
    fetchMission(): Promise<Mission>;

    /**
     * Subscribe to vehicle position updates
     * 
     * @param callback - Function called when position updates arrive
     * @returns Unsubscribe function
     * 
     * Future implementation will:
     * 1. Listen to GLOBAL_POSITION_INT MAVLink messages
     * 2. Parse lat/lon/alt/heading
     * 3. Invoke callback with VehiclePosition
     */
    subscribeToVehiclePosition(
        callback: (position: VehiclePosition) => void
    ): () => void;

    /**
     * Check if the service is connected to an autopilot
     * 
     * @returns True if connected, false otherwise
     */
    isConnected(): boolean;

    /**
     * Connect to the autopilot
     * 
     * @param connectionString - Connection parameters (e.g., "udp:127.0.0.1:14550")
     * @returns Promise resolving when connected
     */
    connect(connectionString: string): Promise<void>;

    /**
     * Disconnect from the autopilot
     */
    disconnect(): void;
}

/**
 * Placeholder implementation - NOT FUNCTIONAL
 * 
 * Returns a dummy service that throws errors on all methods.
 * Replace with real implementation when adding MAVLink support.
 */
export class MockMavLinkService implements IMavLinkService {
    async uploadMission(_mission: Mission): Promise<MissionUploadResult> {
        throw new Error('MAVLink service not implemented');
    }

    async fetchMission(): Promise<Mission> {
        throw new Error('MAVLink service not implemented');
    }

    subscribeToVehiclePosition(
        _callback: (position: VehiclePosition) => void
    ): () => void {
        throw new Error('MAVLink service not implemented');
    }

    isConnected(): boolean {
        return false;
    }

    async connect(_connectionString: string): Promise<void> {
        throw new Error('MAVLink service not implemented');
    }

    disconnect(): void {
        // No-op
    }
}
