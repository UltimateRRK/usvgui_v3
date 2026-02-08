/**
 * Bridge API Contract
 * 
 * Data contract between Frontend ↔ Bridge ↔ Pixhawk (MAVLink)
 * 
 * SCOPE: Payload definitions and interfaces ONLY
 * - No WebSocket / HTTP / Serial / UDP code
 * - No MAVLink parsing implementation
 * - No UI logic
 * - No control commands (arm, mode, params)
 * 
 * Vehicle: USV / ArduRover
 * 
 * CRITICAL: Frontend stores lat/lon in degrees.
 * Bridge handles MAVLink scaling (1e7) internally.
 */

import { Mission, Waypoint } from './mission';

// ============================================================================
// MISSION UPLOAD / DOWNLOAD
// ============================================================================

/**
 * Request to upload a mission to the vehicle
 * 
 * Maps to MAVLink sequence:
 * 1. MISSION_CLEAR_ALL
 * 2. MISSION_COUNT
 * 3. MISSION_ITEM_INT (for each waypoint)
 * 4. MISSION_SET_CURRENT (seq=0)
 */
export interface MissionUploadRequest {
    /** Mission to upload */
    mission: Mission;

    /** 
     * Set as current mission after upload
     * Maps to MISSION_SET_CURRENT
     */
    setAsCurrent?: boolean;
}

/**
 * Result of mission upload operation
 * 
 * Derived from:
 * - MISSION_ACK (accepted/error codes)
 * - MISSION_REQUEST (count verification)
 */
export interface MissionUploadResult {
    /** Upload successful */
    success: boolean;

    /** Number of waypoints accepted by autopilot */
    acceptedWaypointCount: number;

    /** MAVLink error code (if failed) */
    errorCode?: number;

    /** Human-readable error message */
    errorMessage?: string;

    /** Warnings (non-fatal issues) */
    warnings?: string[];

    /** Upload timestamp */
    timestamp: string;
}

/**
 * Request to fetch current mission from vehicle
 * 
 * Maps to MAVLink sequence:
 * 1. MISSION_REQUEST_LIST
 * 2. MISSION_REQUEST_INT (for each item)
 */
export interface MissionFetchRequest {
    /** Optional: Fetch only partial mission (start seq) */
    startSeq?: number;

    /** Optional: Fetch only partial mission (end seq) */
    endSeq?: number;
}

/**
 * Response containing mission from vehicle
 * 
 * Derived from:
 * - MISSION_COUNT
 * - MISSION_ITEM_INT (all items)
 * - MISSION_CURRENT
 */
export interface MissionFetchResponse {
    /** Mission retrieved from vehicle */
    mission: Mission;

    /** Current active waypoint index (from MISSION_CURRENT) */
    currentWaypointIndex: number;

    /** Fetch timestamp */
    timestamp: string;
}

// ============================================================================
// MISSION EXECUTION STATE
// ============================================================================

/**
 * Mission execution progress
 * 
 * Derived from:
 * - MISSION_CURRENT (current waypoint seq)
 * - MISSION_COUNT (total waypoints)
 * 
 * IMPORTANT: Frontend does NOT own execution state.
 * This is Pixhawk-driven telemetry only.
 */
export interface MissionProgress {
    /** Current waypoint sequence number (0-based) */
    currentWaypointSeq: number;

    /** Total waypoints in mission */
    totalWaypoints: number;

    /** 
     * Distance to current waypoint (meters)
     * Derived from NAV_CONTROLLER_OUTPUT.wp_dist
     */
    distanceToWaypoint?: number;

    /** 
     * Estimated time to waypoint (seconds)
     * Calculated by bridge from distance / groundspeed
     */
    etaToWaypoint?: number;

    /** Timestamp of this progress update */
    timestamp: string;
}

// ============================================================================
// VEHICLE TELEMETRY
// ============================================================================

/**
 * Vehicle position and movement telemetry
 * 
 * Derived from:
 * - GLOBAL_POSITION_INT (lat, lon, alt, velocities)
 * - VFR_HUD (heading, groundspeed)
 */
export interface VehiclePosition {
    /** Latitude in degrees (WGS84) */
    lat: number;

    /** Longitude in degrees (WGS84) */
    lon: number;

    /** 
     * Altitude in meters (MSL or relative depending on frame)
     * From GLOBAL_POSITION_INT.alt (scaled from mm)
     */
    alt: number;

    /** 
     * Heading in degrees (0-360, 0=North)
     * From VFR_HUD.heading or GLOBAL_POSITION_INT.hdg
     */
    heading: number;

    /** 
     * Ground speed in m/s
     * From VFR_HUD.groundspeed
     */
    groundspeed: number;

    /** 
     * Vertical speed in m/s (positive = up)
     * From GLOBAL_POSITION_INT.vz (scaled from cm/s)
     */
    verticalSpeed?: number;

    /** Telemetry timestamp (ISO 8601) */
    timestamp: string;
}

/**
 * Vehicle system status
 * 
 * Derived from:
 * - HEARTBEAT (armed, mode, system_status)
 * - SYS_STATUS (battery, failsafe flags)
 */
export interface VehicleStatus {
    /** 
     * Vehicle armed state
     * From HEARTBEAT.base_mode & MAV_MODE_FLAG_SAFETY_ARMED
     */
    armed: boolean;

    /** 
     * Flight mode (e.g., "MANUAL", "AUTO", "GUIDED", "HOLD")
     * From HEARTBEAT.custom_mode decoded to ArduRover mode
     */
    mode: string;

    /** 
     * MAVLink system status
     * From HEARTBEAT.system_status
     * (BOOT, STANDBY, ACTIVE, CRITICAL, EMERGENCY)
     */
    systemStatus: string;

    /** 
     * Failsafe active
     * From SYS_STATUS or HEARTBEAT flags
     */
    failsafe: boolean;

    /** 
     * Battery voltage (V)
     * From SYS_STATUS.voltage_battery (scaled from mV)
     */
    batteryVoltage?: number;

    /** 
     * Battery remaining (0-100%)
     * From SYS_STATUS.battery_remaining
     */
    batteryPercent?: number;

    /** 
     * Battery current (A)
     * From SYS_STATUS.current_battery (scaled from cA)
     */
    batteryCurrent?: number;

    /** Telemetry timestamp (ISO 8601) */
    timestamp: string;
}

/**
 * Connection state between bridge and vehicle
 */
export interface ConnectionStatus {
    /** Connected to vehicle via MAVLink */
    connected: boolean;

    /** Connection type (e.g., "serial", "udp", "tcp") */
    connectionType?: string;

    /** Last heartbeat received timestamp */
    lastHeartbeat?: string;

    /** Milliseconds since last heartbeat */
    heartbeatAge?: number;
}

// ============================================================================
// BRIDGE SERVICE INTERFACE
// ============================================================================

/**
 * Unsubscribe function returned by subscription methods
 */
export type Unsubscribe = () => void;

/**
 * Bridge service interface
 * 
 * Frontend-facing contract for Pixhawk communication.
 * Backend implementation handles MAVLink protocol.
 * 
 * TRANSPORT-AGNOSTIC: Works with any backend (WebSocket, HTTP polling, etc.)
 */
export interface IBridgeService {
    // --------------------------------------------------------------------------
    // Connection Management
    // --------------------------------------------------------------------------

    /**
     * Check if bridge is connected to vehicle
     * @returns True if receiving heartbeats from vehicle
     */
    isConnected(): boolean;

    /**
     * Subscribe to connection status changes
     * @param callback - Called when connection state changes
     * @returns Unsubscribe function
     */
    onConnectionStatus(callback: (status: ConnectionStatus) => void): Unsubscribe;

    // --------------------------------------------------------------------------
    // Mission Management
    // --------------------------------------------------------------------------

    /**
     * Upload mission to vehicle
     * 
     * @param request - Mission upload request
     * @returns Promise resolving to upload result
     * 
     * Backend will:
     * 1. Convert Mission to MISSION_ITEM_INT messages
     * 2. Send via MAVLink (MISSION_CLEAR_ALL, MISSION_COUNT, MISSION_ITEM_INT)
     * 3. Wait for MISSION_ACK
     * 4. Return success/failure
     */
    uploadMission(request: MissionUploadRequest): Promise<MissionUploadResult>;

    /**
     * Fetch current mission from vehicle
     * 
     * @param request - Optional fetch parameters
     * @returns Promise resolving to mission
     * 
     * Backend will:
     * 1. Send MISSION_REQUEST_LIST
     * 2. Receive MISSION_COUNT
     * 3. Request each MISSION_ITEM_INT
     * 4. Convert to Mission object
     */
    fetchMission(request?: MissionFetchRequest): Promise<MissionFetchResponse>;

    // --------------------------------------------------------------------------
    // Telemetry Streams (Subscription-based)
    // --------------------------------------------------------------------------

    /**
     * Subscribe to vehicle position updates
     * 
     * @param callback - Called when GLOBAL_POSITION_INT received
     * @returns Unsubscribe function
     * 
     * Typical update rate: 1-10 Hz
     */
    onPosition(callback: (position: VehiclePosition) => void): Unsubscribe;

    /**
     * Subscribe to vehicle status updates
     * 
     * @param callback - Called when HEARTBEAT or SYS_STATUS received
     * @returns Unsubscribe function
     * 
     * Typical update rate: 1 Hz
     */
    onStatus(callback: (status: VehicleStatus) => void): Unsubscribe;

    /**
     * Subscribe to mission progress updates
     * 
     * @param callback - Called when MISSION_CURRENT received
     * @returns Unsubscribe function
     * 
     * Updates when:
     * - Waypoint reached
     * - Mission started/stopped
     * - Mission edited
     */
    onMissionProgress(callback: (progress: MissionProgress) => void): Unsubscribe;
}

// ============================================================================
// NOTES FOR BACKEND IMPLEMENTERS
// ============================================================================

/*
 * SCALING CONVENTIONS (Bridge responsibility):
 * 
 * MAVLink → Frontend:
 * - lat/lon: Divide by 1e7 (GLOBAL_POSITION_INT uses int32 scaled)
 * - altitude: Divide by 1000 (mm → m)
 * - velocities: Divide by 100 (cm/s → m/s)
 * - voltage: Divide by 1000 (mV → V)
 * - current: Divide by 100 (cA → A)
 * 
 * Frontend → MAVLink:
 * - lat/lon: Multiply by 1e7
 * - altitude: Multiply by 1000
 * - frame: Use MAV_FRAME_GLOBAL_RELATIVE_ALT (3) for ArduRover
 * 
 * FRAME SELECTION:
 * - Frontend sends: MAV_FRAME_GLOBAL_RELATIVE_ALT (3)
 * - Bridge converts to: MISSION_ITEM_INT format
 * - Altitude (z) always 0 for USV
 * 
 * ERROR HANDLING:
 * - Timeout on mission upload: Return MissionUploadResult with success=false
 * - Invalid waypoint: Include in warnings array
 * - Connection loss: Fire onConnectionStatus callback
 * 
 * SUBSCRIPTION CLEANUP:
 * - All onXxx() methods return Unsubscribe function
 * - Frontend MUST call unsubscribe on component unmount
 * - Bridge should handle cleanup internally
 */
