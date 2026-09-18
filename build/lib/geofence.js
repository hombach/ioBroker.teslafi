"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofenceProcessor = void 0;
exports.createGeofenceRuntime = createGeofenceRuntime;
exports.evaluateGeofence = evaluateGeofence;
const projectUtils_1 = require("./projectUtils");
function createGeofenceRuntime() {
    return { present: false, enterCount: 0, awayCount: 0, sawMotion: false, awaySince: 0 };
}
function evaluateGeofence(prev, input, cfg, firstRun) {
    const rt = { ...prev };
    const debounce = Math.max(1, Math.floor(cfg.debouncePolls || 1));
    if (firstRun) {
        rt.present = input.isHere;
        rt.enterCount = 0;
        rt.awayCount = 0;
        rt.sawMotion = false;
        if (input.isHere) {
            rt.awaySince = 0;
        }
        else if (rt.awaySince === 0) {
            rt.awaySince = input.now;
        }
        return { runtime: rt, enterEvent: false, leaveEvent: false };
    }
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
    }
    else {
        rt.awayCount += 1;
        rt.enterCount = 0;
        if (rt.present) {
            if (rt.awayCount >= debounce) {
                rt.present = false;
                leaveEvent = true;
                rt.awaySince = input.now;
                rt.sawMotion = false;
                rt.awayCount = 0;
            }
        }
        else if (rt.awaySince === 0) {
            rt.awaySince = input.now;
        }
    }
    return { runtime: rt, enterEvent, leaveEvent };
}
class GeofenceProcessor extends projectUtils_1.ProjectUtils {
    basePath = "geofence";
    runtime = new Map();
    firstRun = true;
    constructor(adapter) {
        super(adapter);
    }
    get configs() {
        const list = this.adapter.config.geofences;
        if (!Array.isArray(list)) {
            return [];
        }
        return list.filter(g => g && typeof g.location === "string" && g.location.trim() !== "");
    }
    async SetupGeofenceStates() {
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
            const persistedAway = Number(await this.getStateValue(`${base}.awaySince`)) || 0;
            const persistedPresent = Boolean(await this.getStateValue(`${base}.present`));
            this.runtime.set(cfg.location, {
                ...createGeofenceRuntime(),
                present: persistedPresent,
                awaySince: persistedAway,
            });
            await this.checkAndSetValueBoolean(`${base}.present`, persistedPresent, "Confirmed presence at this location", "indicator");
            await this.checkAndSetValueBoolean(`${base}.enter`, false, "Enter event - pulses true for a single poll", "indicator");
            await this.checkAndSetValueBoolean(`${base}.leave`, false, "Leave event - pulses true for a single poll", "indicator");
            await this.checkAndSetValueNumber(`${base}.awaySince`, persistedAway, "Timestamp (ms) since the car left this location; 0 while present", undefined, "value.time", false, true);
        }
    }
    async ProcessGeofences(location, speedKmh) {
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
            await this.checkAndSetValueNumber(`${base}.awaySince`, runtime.awaySince, "Timestamp (ms) since the car left this location; 0 while present", undefined, "value.time");
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
exports.GeofenceProcessor = GeofenceProcessor;
//# sourceMappingURL=geofence.js.map