import type * as utils from "@iobroker/adapter-core";
import { ProjectUtils } from "./projectUtils";

/**
 * Mutable per-location runtime state that is carried between polls.
 * Only `present` and `awaySince` are persisted (as ioBroker states) so they survive an adapter restart.
 */
export interface GeofenceRuntime {
	/** Confirmed presence at the location (after all gates passed). */
	present: boolean;
	/** Consecutive polls the car has been reported at the location. */
	enterCount: number;
	/** Consecutive polls the car has been reported away from the location. */
	awayCount: number;
	/** Whether the car actually moved (speed >= minSpeedKmh) at least once during the current absence. */
	sawMotion: boolean;
	/** Timestamp (ms epoch) when the car left; 0 while present / unknown. */
	awaySince: number;
}

/** Per-poll input for the geofence evaluation. */
export interface GeofenceInput {
	/** True if the current TeslaFi tagged location matches the configured location exactly. */
	isHere: boolean;
	/** Current speed in km/h. */
	speedKmh: number;
	/** Current time as ms epoch. */
	now: number;
}

/** Result of a single geofence evaluation step. */
export interface GeofenceDecision {
	/** The updated runtime state to carry into the next poll. */
	runtime: GeofenceRuntime;
	/** True exactly on the poll where a filtered enter event fires. */
	enterEvent: boolean;
	/** True exactly on the poll where a debounced leave event fires. */
	leaveEvent: boolean;
}

/** Factory for a fresh, empty runtime record. */
export function createGeofenceRuntime(): GeofenceRuntime {
	return { present: false, enterCount: 0, awayCount: 0, sawMotion: false, awaySince: 0 };
}

/**
 * Pure geofence gate logic — no ioBroker dependencies, fully unit-testable.
 *
 * Rules:
 * - No enter/leave events on the first run after (re)start (only state initialization).
 * - `enter` fires only when: location matches + away-gate satisfied (minAwayMinutes) +
 *   motion-gate satisfied (if requireMotion: at least one poll with speed >= minSpeedKmh while away) +
 *   debounce satisfied (debouncePolls consecutive matching polls).
 * - `leave` fires only after `debouncePolls` consecutive non-matching polls (protects against GPS flicker).
 *
 * @param prev - Runtime state from the previous poll.
 * @param input - Current poll input (isHere, speedKmh, now).
 * @param cfg - The geofence configuration for this location.
 * @param firstRun - True on the first evaluation after adapter (re)start.
 * @returns The updated runtime plus enter/leave event flags.
 */
export function evaluateGeofence(prev: GeofenceRuntime, input: GeofenceInput, cfg: ioBroker.GeofenceConfig, firstRun: boolean): GeofenceDecision {
	const rt: GeofenceRuntime = { ...prev };
	const debounce = Math.max(1, Math.floor(cfg.debouncePolls || 1));

	// First run after (re)start: initialize presence without emitting any event.
	if (firstRun) {
		rt.present = input.isHere;
		rt.enterCount = 0;
		rt.awayCount = 0;
		rt.sawMotion = false;
		if (input.isHere) {
			rt.awaySince = 0;
		} else if (rt.awaySince === 0) {
			// Only set if not restored from a persisted state, so away-duration survives a restart.
			rt.awaySince = input.now;
		}
		return { runtime: rt, enterEvent: false, leaveEvent: false };
	}

	// Motion gate bookkeeping: remember whether the car moved during the current absence.
	if (!rt.present && input.speedKmh >= cfg.minSpeedKmh) {
		rt.sawMotion = true;
	}

	let enterEvent = false;
	let leaveEvent = false;

	if (input.isHere) {
		rt.enterCount += 1;
		rt.awayCount = 0;
		if (!rt.present) {
			const awayGateOk = rt.awaySince > 0 && input.now - rt.awaySince >= cfg.minAwayMinutes * 60000;
			const motionGateOk = !cfg.requireMotion || rt.sawMotion;
			const debounceOk = rt.enterCount >= debounce;
			if (awayGateOk && motionGateOk && debounceOk) {
				rt.present = true;
				enterEvent = true;
				rt.awaySince = 0;
				rt.sawMotion = false;
				rt.enterCount = 0;
			}
		}
	} else {
		rt.awayCount += 1;
		rt.enterCount = 0;
		if (rt.present) {
			// Debounce the leave so a single flickering poll does not drop presence.
			if (rt.awayCount >= debounce) {
				rt.present = false;
				leaveEvent = true;
				rt.awaySince = input.now;
				rt.sawMotion = false;
				rt.awayCount = 0;
			}
		} else if (rt.awaySince === 0) {
			rt.awaySince = input.now;
		}
	}

	return { runtime: rt, enterEvent, leaveEvent };
}

/**
 * GeofenceProcessor
 *
 * Creates and maintains the `geofence.*` states based on TeslaFi's tagged location
 * (`vehicle-state.location`). Uses exact string matching against the configured location names.
 */
export class GeofenceProcessor extends ProjectUtils {
	private readonly basePath = "geofence";
	private readonly runtime = new Map<string, GeofenceRuntime>();
	private firstRun = true;

	/**
	 * constructor
	 *
	 * @param adapter - ioBroker adapter instance
	 */
	constructor(adapter: utils.AdapterInstance) {
		super(adapter);
	}

	/**
	 * Returns the sanitized list of configured geofences (ignores empty/invalid rows).
	 */
	private get configs(): ioBroker.GeofenceConfig[] {
		const list = this.adapter.config.geofences;
		if (!Array.isArray(list)) {
			return [];
		}
		return list.filter(g => g && typeof g.location === "string" && g.location.trim() !== "");
	}

	/**
	 * SetupGeofenceStates
	 *
	 * Creates the geofence folder and per-location states, and restores persisted
	 * `present` / `awaySince` values so the away-timer survives an adapter restart.
	 * Call this once in onReady().
	 */
	async SetupGeofenceStates(): Promise<void> {
		this.firstRun = true;
		this.runtime.clear();
		const cfgs = this.configs;
		if (cfgs.length === 0) {
			return;
		}
		await this.checkAndSetFolder(this.basePath, "Geofence");

		for (const cfg of cfgs) {
			const base = `${this.basePath}.${this.sanitizeIdSegment(cfg.location)}`;
			await this.checkAndSetChannel(base, cfg.location);

			// Restore persisted values (null if the states do not exist yet).
			const persistedAway = Number(await this.getStateValue(`${base}.awaySince`)) || 0;
			const persistedPresent = Boolean(await this.getStateValue(`${base}.present`));
			this.runtime.set(cfg.location, {
				...createGeofenceRuntime(),
				present: persistedPresent,
				awaySince: persistedAway,
			});

			// Ensure the states exist. awaySince uses dontUpdate=true so a persisted value is not clobbered.
			await this.checkAndSetValueBoolean(`${base}.present`, persistedPresent, "Confirmed presence at this location", "indicator");
			await this.checkAndSetValueBoolean(`${base}.enter`, false, "Enter event - pulses true for a single poll", "indicator");
			await this.checkAndSetValueBoolean(`${base}.leave`, false, "Leave event - pulses true for a single poll", "indicator");
			await this.checkAndSetValueNumber(
				`${base}.awaySince`,
				persistedAway,
				"Timestamp (ms) since the car left this location; 0 while present",
				undefined,
				"value.time",
				false,
				true,
			);
		}
	}

	/**
	 * ProcessGeofences
	 *
	 * Evaluates all configured geofences for the current poll and updates their states.
	 * Call this once per poll after `vehicle-state.location` and speed are known.
	 *
	 * @param location - The current TeslaFi tagged location string.
	 * @param speedKmh - The current speed converted to km/h.
	 */
	async ProcessGeofences(location: string | null | undefined, speedKmh: number): Promise<void> {
		const cfgs = this.configs;
		if (cfgs.length === 0) {
			return;
		}
		const now = Date.now();
		const loc = (location ?? "").trim();
		if (loc) {
			await this.checkAndSetValue(`${this.basePath}.current`, loc, "Currently tagged location");
		}

		for (const cfg of cfgs) {
			const base = `${this.basePath}.${this.sanitizeIdSegment(cfg.location)}`;
			const prev = this.runtime.get(cfg.location) ?? createGeofenceRuntime();
			const isHere = loc === cfg.location;

			const { runtime, enterEvent, leaveEvent } = evaluateGeofence(prev, { isHere, speedKmh, now }, cfg, this.firstRun);
			this.runtime.set(cfg.location, runtime);

			await this.checkAndSetValueBoolean(`${base}.present`, runtime.present, "Confirmed presence at this location", "indicator");
			await this.checkAndSetValueBoolean(`${base}.enter`, enterEvent, "Enter event - pulses true for a single poll", "indicator");
			await this.checkAndSetValueBoolean(`${base}.leave`, leaveEvent, "Leave event - pulses true for a single poll", "indicator");
			await this.checkAndSetValueNumber(
				`${base}.awaySince`,
				runtime.awaySince,
				"Timestamp (ms) since the car left this location; 0 while present",
				undefined,
				"value.time",
			);

			if (enterEvent) {
				this.adapter.log.info(`Geofence '${cfg.location}': ENTER event fired`);
			}
			if (leaveEvent) {
				this.adapter.log.info(`Geofence '${cfg.location}': LEAVE event fired`);
			}
		}

		this.firstRun = false;
	}
}
