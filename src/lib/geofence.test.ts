/**
 * Unit tests for the pure geofence gate logic (evaluateGeofence).
 * These run without an ioBroker adapter instance.
 */

import { strict as assert } from "node:assert";
import { createGeofenceRuntime, evaluateGeofence, type GeofenceRuntime } from "./geofence";

const MIN = 60000; // one minute in ms

function makeConfig(overrides: Partial<ioBroker.GeofenceConfig> = {}): ioBroker.GeofenceConfig {
	return {
		location: "Home",
		minAwayMinutes: 10,
		requireMotion: true,
		minSpeedKmh: 5,
		debouncePolls: 2,
		...overrides,
	};
}

describe("evaluateGeofence", () => {
	it("does not fire enter on the first run, even when the car is at the location", () => {
		const cfg = makeConfig();
		const { runtime, enterEvent, leaveEvent } = evaluateGeofence(createGeofenceRuntime(), { isHere: true, speedKmh: 0, now: 1_000 }, cfg, true);
		assert.equal(enterEvent, false, "no enter event on first run");
		assert.equal(leaveEvent, false, "no leave event on first run");
		assert.equal(runtime.present, true, "presence is initialized to true");
		assert.equal(runtime.awaySince, 0, "awaySince cleared while present");
	});

	it("initializes awaySince on the first run when the car is away", () => {
		const cfg = makeConfig();
		const { runtime } = evaluateGeofence(createGeofenceRuntime(), { isHere: false, speedKmh: 0, now: 5_000 }, cfg, true);
		assert.equal(runtime.present, false);
		assert.equal(runtime.awaySince, 5_000, "awaySince set to current time");
	});

	it("keeps a persisted awaySince across a restart (first run, still away)", () => {
		const cfg = makeConfig();
		const persisted: GeofenceRuntime = { ...createGeofenceRuntime(), awaySince: 42 };
		const { runtime } = evaluateGeofence(persisted, { isHere: false, speedKmh: 0, now: 9_000 }, cfg, true);
		assert.equal(runtime.awaySince, 42, "persisted awaySince is not overwritten");
	});

	it("fires exactly one enter on a real homecoming (away long enough + motion + debounce)", () => {
		const cfg = makeConfig();
		let rt = createGeofenceRuntime();

		// t=0: present at home (first run)
		rt = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 0 }, cfg, true).runtime;

		// leave: needs debouncePolls (2) consecutive away polls
		let r = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 1 * MIN }, cfg, false);
		assert.equal(r.leaveEvent, false, "first away poll debounced");
		rt = r.runtime;
		r = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 2 * MIN }, cfg, false);
		assert.equal(r.leaveEvent, true, "leave fires after debounce");
		rt = r.runtime;

		// driving away -> motion observed
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 50, now: 3 * MIN }, cfg, false).runtime;
		assert.equal(rt.sawMotion, true, "motion recorded during absence");

		// arrival after >10 min away: first matching poll is debounced
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 20 * MIN }, cfg, false);
		assert.equal(r.enterEvent, false, "first arrival poll debounced");
		rt = r.runtime;

		// second matching poll -> enter fires
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 21 * MIN }, cfg, false);
		assert.equal(r.enterEvent, true, "enter fires once all gates pass");
		rt = r.runtime;
		assert.equal(rt.present, true);
		assert.equal(rt.awaySince, 0, "awaySince cleared after enter");
		assert.equal(rt.sawMotion, false, "motion flag reset after enter");

		// staying home -> no further enter events
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 22 * MIN }, cfg, false);
		assert.equal(r.enterEvent, false, "no repeated enter while present");
	});

	it("does not fire enter for brief repositioning (away shorter than minAwayMinutes)", () => {
		const cfg = makeConfig();
		let rt = evaluateGeofence(createGeofenceRuntime(), { isHere: true, speedKmh: 0, now: 0 }, cfg, true).runtime;

		// brief leave (2 polls) with a little motion
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 10, now: 1 * MIN }, cfg, false).runtime;
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 10, now: 2 * MIN }, cfg, false).runtime;

		// comes back after only ~3 min (< 10 min away gate)
		let r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 4 * MIN }, cfg, false);
		assert.equal(r.enterEvent, false, "away gate not satisfied");
		rt = r.runtime;
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 5 * MIN }, cfg, false);
		assert.equal(r.enterEvent, false, "still no enter for short absence");
	});

	it("produces no events for GPS jitter while parked at the location", () => {
		const cfg = makeConfig();
		let rt = evaluateGeofence(createGeofenceRuntime(), { isHere: true, speedKmh: 0, now: 0 }, cfg, true).runtime;
		for (let i = 1; i <= 10; i++) {
			const r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: i * MIN }, cfg, false);
			assert.equal(r.enterEvent, false);
			assert.equal(r.leaveEvent, false);
			rt = r.runtime;
		}
		assert.equal(rt.present, true);
	});

	it("blocks enter when motion is required but never observed during absence", () => {
		const cfg = makeConfig({ requireMotion: true });
		let rt = evaluateGeofence(createGeofenceRuntime(), { isHere: true, speedKmh: 0, now: 0 }, cfg, true).runtime;
		// leave without ever moving (speed stays 0)
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 1 * MIN }, cfg, false).runtime;
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 2 * MIN }, cfg, false).runtime;
		// arrive after long absence, still no motion recorded
		let r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 30 * MIN }, cfg, false);
		rt = r.runtime;
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 31 * MIN }, cfg, false);
		assert.equal(r.enterEvent, false, "motion gate blocks enter");
	});

	it("allows enter without motion when requireMotion is disabled", () => {
		const cfg = makeConfig({ requireMotion: false });
		let rt = evaluateGeofence(createGeofenceRuntime(), { isHere: true, speedKmh: 0, now: 0 }, cfg, true).runtime;
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 1 * MIN }, cfg, false).runtime;
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 2 * MIN }, cfg, false).runtime;
		let r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 30 * MIN }, cfg, false);
		rt = r.runtime;
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 31 * MIN }, cfg, false);
		assert.equal(r.enterEvent, true, "enter fires without motion gate");
	});

	it("debounces leave so a single flickering poll does not drop presence", () => {
		const cfg = makeConfig({ debouncePolls: 3 });
		let rt = evaluateGeofence(createGeofenceRuntime(), { isHere: true, speedKmh: 0, now: 0 }, cfg, true).runtime;

		// single flicker away, then back
		let r = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 1 * MIN }, cfg, false);
		assert.equal(r.leaveEvent, false, "single flicker does not fire leave");
		assert.equal(r.runtime.present, true, "presence kept during flicker");
		rt = r.runtime;
		r = evaluateGeofence(rt, { isHere: true, speedKmh: 0, now: 2 * MIN }, cfg, false);
		assert.equal(r.leaveEvent, false);
		assert.equal(r.runtime.present, true, "still present after flicker resolves");
		rt = r.runtime;

		// now a real, sustained leave (3 consecutive away polls)
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 3 * MIN }, cfg, false).runtime;
		rt = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 4 * MIN }, cfg, false).runtime;
		r = evaluateGeofence(rt, { isHere: false, speedKmh: 0, now: 5 * MIN }, cfg, false);
		assert.equal(r.leaveEvent, true, "leave fires after sustained absence");
		assert.equal(r.runtime.present, false);
	});

	it("does not fire enter when the car arrived during downtime (restart while home)", () => {
		const cfg = makeConfig();
		// persisted state says the car was away
		const persisted: GeofenceRuntime = { ...createGeofenceRuntime(), present: false, awaySince: 1_000 };
		// first run after restart: car is now home
		const r = evaluateGeofence(persisted, { isHere: true, speedKmh: 0, now: 60 * MIN }, cfg, true);
		assert.equal(r.enterEvent, false, "restart never fires enter");
		assert.equal(r.runtime.present, true);
	});
});
