// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			TeslaFiAPIToken: string;
			UpdateInterval: number;
			UpdateTimeout: number;
			UseCarCommands: boolean;
			SendWakeCommand: boolean;
			geofences: GeofenceConfig[];
		}

		interface GeofenceConfig {
			/** TeslaFi tagged location name to match exactly (e.g. "Home") */
			location: string;
			/** Minimum minutes the car must have been away before an enter event may fire */
			minAwayMinutes: number;
			/** Require that the car actually moved (speed >= minSpeedKmh) at least once while away */
			requireMotion: boolean;
			/** Speed threshold in km/h that counts as motion */
			minSpeedKmh: number;
			/** Number of consecutive polls a location change must persist before enter/leave fires */
			debouncePolls: number;
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
