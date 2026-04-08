"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const teslafiAPICaller_1 = require("./lib/teslafiAPICaller");
class TeslaFi extends utils.Adapter {
    intervalList;
    teslaFiAPICaller = new teslafiAPICaller_1.TeslaFiAPICaller(this);
    constructor(options = {}) {
        super({
            ...options,
            name: "teslafi",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
        this.intervalList = [];
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Reset the connection indicator during startup;
        if (!this.config.TeslaFiAPIToken) {
            // No Token defined in configuration
            this.log.error(`Missing API Token - please check configuration`);
            void this.setState(`info.connection`, false, true);
        }
        else {
            // Now read TeslaFi data from API for the first time
            // WIP const teslaFiAPICaller = new TeslaFiAPICaller(this);
            try {
                this.teslaFiAPICaller.SetupCommandStates();
                // set info.connection if data received
                if (await this.teslaFiAPICaller.ReadTeslaFi()) {
                    void this.setState("info.connection", true, true);
                    this.log.debug(`received data in first poll - good connection`);
                }
                else {
                    this.log.warn(`Got no data from TeslaFi - adapter restarts in 5 minutes`);
                    await this.delay(5 * 60 * 1000);
                    this.restart();
                }
            }
            catch (error) {
                this.log.error(this.teslaFiAPICaller.generateErrorMessage(error, `pull of data from TeslaFi-Server`));
            }
            // sentry.io ping
            if (this.supportsFeature && this.supportsFeature("PLUGINS")) {
                const sentryInstance = this.getPluginInstance("sentry");
                const today = new Date();
                const last = await this.getStateAsync("info.LastSentryLogDay");
                if (last?.val != today.getDate()) {
                    if (sentryInstance) {
                        const Sentry = sentryInstance.getSentryObject();
                        Sentry &&
                            Sentry.withScope((scope) => {
                                scope.setLevel("info");
                                scope.setTag("SentryDay", today.getDate());
                                scope.setTag("usedInterval", this.config.UpdateInterval);
                                scope.setTag("usesCommands", this.config.UseCarCommands ? 1 : 0);
                                Sentry.captureMessage("Adapter TeslaFi started", "info"); // Level "info"
                            });
                    }
                    void this.setState("info.LastSentryLogDay", {
                        val: today.getDate(),
                        ack: true,
                    });
                }
            }
            // Init Interval job
            const jobVehicleData = this.setInterval(async () => {
                this.log.debug(`Interval job VehicleData - Result: ${await this.teslaFiAPICaller.ReadTeslaFi()}`);
            }, Math.min(Math.max(this.config.UpdateInterval, 10), 86400) * 1000);
            if (jobVehicleData != null) {
                this.intervalList.push(jobVehicleData);
            }
        }
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback - callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            for (const intervalJob of this.intervalList) {
                this.clearInterval(intervalJob);
            }
            void this.setState("info.connection", false, true);
            callback();
        }
        catch (e) {
            this.log.warn(e.message);
            callback();
        }
    }
    /**
     * Is called if a subscribed state changes
     *
     * @param id - state ID
     * @param state - ioBroker state object
     */
    async onStateChange(id, state) {
        try {
            if (state) {
                // The state was changed
                // this.adapter.subscribeStates(`commands.*`);
                if (!state.ack) {
                    if (id.includes(`.commands.`)) {
                        const statePath = id.split(".");
                        const commandState = statePath[3];
                        if (commandState !== "" && commandState !== undefined) {
                            switch (commandState) {
                                case "Start-HVAC":
                                case "Stop-HVAC":
                                case "Start-Charging":
                                case "Stop-Charging":
                                    if (typeof state.val === "boolean") {
                                        if (state.val) {
                                            await this.teslaFiAPICaller.HandleCarCommand(commandState);
                                        }
                                        void this.setState(id, state.val, true);
                                    }
                                    else {
                                        this.log.warn(`Wrong type for command: ${commandState} - Value: ${state.val}`);
                                    }
                                    break;
                                case "Set-Temp":
                                case "Set-Seat-Heater-Left":
                                case "Set-Seat-Heater-Right":
                                case "Set-Seat-Heater-Rear-Left":
                                case "Set-Seat-Heater-Rear-Center":
                                case "Set-Seat-Heater-Rear-Right":
                                case "Set-Charge-Limit":
                                case "Set-Charge-Amps":
                                    if (typeof state.val === "number") {
                                        await this.teslaFiAPICaller.HandleCarCommand(commandState, state.val);
                                        void this.setState(id, state.val, true);
                                    }
                                    else {
                                        this.log.warn(`Wrong type for command: ${commandState} - Value: ${state.val}`);
                                    }
                                    break;
                                default:
                                    this.log.debug(`unknown value for command: ${commandState}`);
                            }
                        }
                    }
                }
            }
            else {
                // The state was deleted
                this.log.warn(`state ${id} deleted`);
            }
        }
        catch (error) {
            this.log.error(`Unhandled exception processing onstateChange: ${error}`);
        }
    }
}
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new TeslaFi(options);
}
else {
    // otherwise start the instance directly
    (() => new TeslaFi())();
}
//# sourceMappingURL=main.js.map