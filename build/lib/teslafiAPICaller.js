"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeslaFiAPICaller = void 0;
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const projectUtils_1 = require("./projectUtils");
const axiosInstance = axios_1.default.create({});
const stVD = {
    Date: { key: `Date`, desc: `Last connection to your Tesla`, value: "" },
    display_name: {
        key: `display_name`,
        desc: `Name of your Tesla`,
        value: "",
    },
    vin: { key: `vin`, desc: `VIN of your Tesla`, value: "" },
    state: { key: `state`, desc: `State of your Tesla`, value: "" },
    time_to_full_charge: {
        key: `time_to_full_charge`,
        desc: `Time to full charge`,
        value: "",
    },
    charge_current_request: {
        key: `charge_current_request`,
        desc: `requested charge current by your car`,
        value: "",
    },
    charger_phases: {
        key: `charger_phases`,
        desc: `current number of charge phases`,
        value: "",
    },
    battery_range: {
        key: `battery_range`,
        desc: `current battery range`,
        value: "",
    },
    charger_power: {
        key: `charger_power`,
        desc: `current charge power`,
        value: "",
    },
    charge_limit_soc: {
        key: `charge_limit_soc`,
        desc: `charge limit defined in your Tesla`,
        value: "",
    },
    usable_battery_level: {
        key: `usable_battery_level`,
        desc: `usable battery SoC at this temperature conditions`,
        value: "",
    },
    battery_level: {
        key: `battery_level`,
        desc: `battery SoC of your Tesla`,
        value: "",
    },
    charging_state: {
        key: `charging_state`,
        desc: `charging state of the car`,
        value: "",
    },
    scheduled_charging_start_time: {
        key: `scheduled_charging_start_time`,
        desc: `scheduled charging start time`,
        value: "",
    },
    est_battery_range: {
        key: `est_battery_range`,
        desc: `estimated battery range`,
        value: "",
    },
    inside_temp: {
        key: `inside_temp`,
        desc: `inside temperature in your Tesla`,
        value: "",
    },
    longitude: {
        key: `longitude`,
        desc: `current positional longitude of your Tesla`,
        value: "",
    },
    latitude: {
        key: `latitude`,
        desc: `current positional latitude of your Tesla`,
        value: "",
    },
    speed: { key: `speed`, desc: `current driving speed`, value: "" },
    seat_heater_rear_right: {
        key: `seat_heater_rear_right`,
        desc: `level of the right second row seat heater`,
        value: "",
    },
    seat_heater_rear_left_back: {
        key: `seat_heater_rear_left_back`,
        desc: `level of the left third row seat heater`,
        value: "",
    },
    seat_heater_left: {
        key: `seat_heater_left`,
        desc: `level of the left first row seat heater`,
        value: "",
    },
    driver_temp_setting: {
        key: `driver_temp_setting`,
        desc: `inside temperature setting of your Tesla`,
        value: "",
    },
    outside_temp: {
        key: `outside_temp`,
        desc: `outside temperature near your Tesla`,
        value: "",
    },
    seat_heater_rear_center: {
        key: `seat_heater_rear_center`,
        desc: `level of the second row center seat heater`,
        value: "",
    },
    seat_heater_rear_right_back: {
        key: `seat_heater_rear_right_back`,
        desc: `level of the right third row seat heater`,
        value: "",
    },
    seat_heater_right: {
        key: `seat_heater_right`,
        desc: `level of the right seat heater`,
        value: "",
    },
    seat_heater_rear_left: {
        key: `seat_heater_rear_left`,
        desc: `level of the left second row seat heater`,
        value: "",
    },
    odometer: { key: `odometer`, desc: `current odometer level`, value: "" },
    third_row_seats: {
        key: `third_row_seats`,
        desc: `third seating row present`,
        value: "",
    },
    car_version: {
        key: `car_version`,
        desc: `Current software version`,
        value: "",
    },
    steering_wheel_heater: {
        key: `steering_wheel_heater`,
        desc: `level of the steering wheel heater`,
        value: "",
    },
    carState: { key: `carState`, desc: `Sleep-state of your Tesla`, value: "" },
    location: { key: `location`, desc: `Location of your Tesla`, value: "" },
    newVersion: {
        key: `newVersion`,
        desc: `Next software version if available`,
        value: "",
    },
    newVersionStatus: { key: `newVersionStatus`, desc: ``, value: `` },
};
const stVCom = {
    auto_conditioning_start: { key: `Start-HVAC`, desc: `Start HVAC of your Tesla`, command: `auto_conditioning_start` },
    auto_conditioning_stop: { key: `Stop-HVAC`, desc: `Stop HVAC of your Tesla`, command: `auto_conditioning_stop` },
    set_HVAC_temp: { key: `Set-Temp`, desc: `Set Temp for HVAC`, command: `set_temps&temp` },
    set_seat_heat_left: {
        key: `Set-Seat-Heater-Left`,
        desc: `Set left seat heater level`,
        command: `seat_heater&heater=0&level`,
    },
    set_seat_heat_right: {
        key: `Set-Seat-Heater-Right`,
        desc: `Set right seat heater level`,
        command: `seat_heater&heater=1&level`,
    },
    set_seat_heat_rear_left: {
        key: `Set-Seat-Heater-Rear-Left`,
        desc: `Set left second row seat heater level`,
        command: `seat_heater&heater=2&level`,
    },
    set_seat_heat_rear_center: {
        key: `Set-Seat-Heater-Rear-Center`,
        desc: `Set center second row seat heater level`,
        command: `seat_heater&heater=4&level`,
    },
    set_seat_heat_rear_right: {
        key: `Set-Seat-Heater-Rear-Right`,
        desc: `Set right second row seat heater level`,
        command: `seat_heater&heater=5&level`,
    },
    start_charging: { key: `Start-Charging`, desc: `Start charging your Tesla`, command: `charge_start` },
    stop_charging: { key: `Stop-Charging`, desc: `Stop charging your Tesla`, command: `charge_stop` },
    set_charge_limit: { key: `Set-Charge-Limit`, desc: `set charging SoC limit`, command: `set_charge_limit&charge_limit_soc` },
    set_charge_amps: { key: `Set-Charge-Amps`, desc: `set charging ampere limit`, command: `set_charging_amps&charging_amps` },
};
function convertUnixToLocalTime(unixTimestamp, dateFormat = "dd.MM.yyyy HH:mm:ss") {
    const date = (0, date_fns_1.fromUnixTime)(unixTimestamp);
    return (0, date_fns_1.format)(date, dateFormat);
}
function calculateEndTimeFromNow(hours, dateFormat = "dd.MM.yyyy HH:mm:ss") {
    const totalSeconds = hours * 3600;
    const endTime = (0, date_fns_1.add)(new Date(), { seconds: totalSeconds });
    return (0, date_fns_1.format)(endTime, dateFormat);
}
class TeslaFiAPICaller extends projectUtils_1.ProjectUtils {
    queryUrl = "";
    constructor(adapter) {
        super(adapter);
        this.queryUrl = "https://www.teslafi.com/feed.php?token=";
    }
    SetupCommandStates() {
        if (this.adapter.config.UseCarCommands) {
            void this.checkAndSetValueNumber(`commands.command_counter`, 0, `Used commands counter`, "", `value`, false, true);
            void this.checkAndSetValueNumber(`commands.wakes_counter`, 0, `Used car wakeups counter`, "", `value`, false, true);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_seat_heat_left.key}`, 0, stVCom.set_seat_heat_left.desc, "", `level.temperature`, true, true, false, 0, 3, 1);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_seat_heat_right.key}`, 0, stVCom.set_seat_heat_right.desc, "", `level.temperature`, true, true, false, 0, 3, 1);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_seat_heat_rear_left.key}`, 0, stVCom.set_seat_heat_rear_left.desc, "", `level.temperature`, true, true, false, 0, 3, 1);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_seat_heat_rear_right.key}`, 0, stVCom.set_seat_heat_rear_right.desc, "", `level.temperature`, true, true, false, 0, 3, 1);
            void this.checkAndSetValueBoolean(`commands.${stVCom.auto_conditioning_start.key}`, false, stVCom.auto_conditioning_start.desc, `button.start`, true);
            void this.checkAndSetValueBoolean(`commands.${stVCom.auto_conditioning_stop.key}`, false, stVCom.auto_conditioning_stop.desc, `button.start`, true);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_HVAC_temp.key}`, 20, stVCom.set_HVAC_temp.desc, "°C", `level.temperature`, true, true, false, 15, 28, 0.5);
            void this.checkAndSetValueBoolean(`commands.${stVCom.start_charging.key}`, false, stVCom.start_charging.desc, `button.start`, true);
            void this.checkAndSetValueBoolean(`commands.${stVCom.stop_charging.key}`, false, stVCom.stop_charging.desc, `button.start`, true);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_charge_limit.key}`, 80, stVCom.set_charge_limit.desc, "%", `level.battery.max`, true, true, false, 50, 100, 1);
            void this.checkAndSetValueNumber(`commands.${stVCom.set_charge_amps.key}`, 10, stVCom.set_charge_amps.desc, "A", `level.current.max`, true, true, false, 5, 32, 1);
            this.adapter.subscribeStates(`commands.*`);
        }
    }
    async HandleCarCommand(command, value) {
        this.adapter.log.info(`TeslaFI adapter got command ${command} and sends this to the vehicle`);
        let clampedValue;
        switch (command) {
            case stVCom.auto_conditioning_start.key:
                await this.ReadTeslaFi(stVCom.auto_conditioning_start.command);
                void this.adapter.setState(`commands.${stVCom.auto_conditioning_start.key}`, false, true);
                break;
            case stVCom.auto_conditioning_stop.key:
                await this.ReadTeslaFi(stVCom.auto_conditioning_stop.command);
                void this.adapter.setState(`commands.${stVCom.auto_conditioning_stop.key}`, false, true);
                break;
            case stVCom.set_HVAC_temp.key:
                clampedValue = Math.min(28, Math.max(15, Number(value)));
                await this.ReadTeslaFi(`${stVCom.set_HVAC_temp.command}=${clampedValue ?? 20}`);
                break;
            case stVCom.set_seat_heat_left.key:
                clampedValue = Math.min(3, Math.max(0, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_seat_heat_left.command}=${clampedValue ?? 0}`);
                break;
            case stVCom.set_seat_heat_right.key:
                clampedValue = Math.min(3, Math.max(0, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_seat_heat_right.command}=${clampedValue ?? 0}`);
                break;
            case stVCom.set_seat_heat_rear_left.key:
                clampedValue = Math.min(3, Math.max(0, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_seat_heat_rear_left.command}=${clampedValue ?? 0}`);
                break;
            case stVCom.set_seat_heat_rear_center.key:
                clampedValue = Math.min(3, Math.max(0, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_seat_heat_rear_center.command}=${clampedValue ?? 0}`);
                break;
            case stVCom.set_seat_heat_rear_right.key:
                clampedValue = Math.min(3, Math.max(0, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_seat_heat_rear_right.command}=${clampedValue ?? 0}`);
                break;
            case stVCom.start_charging.key:
                await this.ReadTeslaFi(stVCom.start_charging.command);
                break;
            case stVCom.stop_charging.key:
                await this.ReadTeslaFi(stVCom.stop_charging.command);
                break;
            case stVCom.set_charge_limit.key:
                clampedValue = Math.min(100, Math.max(50, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_charge_limit.command}=${clampedValue ?? 80}`);
                break;
            case stVCom.set_charge_amps.key:
                clampedValue = Math.min(32, Math.max(5, Math.round(Number(value))));
                await this.ReadTeslaFi(`${stVCom.set_charge_amps.command}=${clampedValue ?? 10}`);
                break;
            default:
        }
    }
    async ReadTeslaFi(command = "") {
        try {
            const getString = `${this.queryUrl}${this.adapter.config.TeslaFiAPIToken}&command=${command}`;
            this.adapter.log.debug(`sending command/request to TeslaFi: ${getString}`);
            const response = await axiosInstance.get(getString, {
                transformResponse: r => r,
                timeout: this.adapter.config.UpdateTimeout,
            });
            if (!response.data) {
                throw new Error(`Empty answer from TeslaFi.`);
            }
            const result = JSON.parse(response.data);
            if (result.response?.result === "unauthorized") {
                this.adapter.log.warn(`TeslaFI data read - unauthorized access detected - please verify your API Token`);
                return false;
            }
            if (result.response?.result === true) {
                this.adapter.log.debug(`TeslaFI command received with response TRUE`);
            }
            if (result.tesla_request_counter && typeof result.tesla_request_counter === "object") {
                if (result.tesla_request_counter.commands != null) {
                    void this.checkAndSetValueNumber(`commands.command_counter`, result.tesla_request_counter.commands, `Used commands counter`, "", `value`, false);
                }
                if (result.tesla_request_counter.wakes != null) {
                    void this.checkAndSetValueNumber(`commands.wakes_counter`, result.tesla_request_counter.wakes, `Used car wakeups counter`, "", `value`, false);
                }
            }
            else {
            }
            void this.checkAndSetValue(`vehicle-data.rawJSON`, response.data, `JSON raw data from TeslaFi`, `json`);
            for (const [key, value] of Object.entries(result)) {
                if (key in stVD) {
                    stVD[key].value = value;
                }
            }
            if (stVD.Date.value !== null) {
                void this.checkAndSetValue(`vehicle-data.${stVD.Date.key}`, stVD.Date.value, stVD.Date.desc, `date`);
            }
            if (stVD.vin.value !== null) {
                void this.checkAndSetValue(`vehicle-data.${stVD.vin.key}`, stVD.vin.value, stVD.vin.desc);
            }
            if (stVD.display_name.value !== null) {
                void this.checkAndSetValue(`vehicle-data.${stVD.display_name.key}`, stVD.display_name.value, stVD.display_name.desc);
            }
            if (stVD.carState.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.carState.key}`, stVD.carState.value, stVD.carState.desc);
            }
            if (stVD.state.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.state.key}`, stVD.state.value, stVD.state.desc);
            }
            if (stVD.charging_state.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.charging_state.key}`, stVD.charging_state.value, stVD.charging_state.desc);
            }
            else {
                void this.checkAndSetValue(`vehicle-state.${stVD.charging_state.key}`, "---", stVD.charging_state.desc);
            }
            if (stVD.car_version.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.car_version.key}`, stVD.car_version.value, stVD.car_version.desc);
            }
            if (stVD.newVersion.value && stVD.newVersion.value.trim() !== "") {
                void this.checkAndSetValue(`vehicle-state.${stVD.newVersion.key}`, stVD.newVersion.value, stVD.newVersion.desc);
            }
            else {
                void this.checkAndSetValue(`vehicle-state.${stVD.newVersion.key}`, "---", stVD.newVersion.desc);
            }
            if (stVD.newVersionStatus.value && stVD.newVersionStatus.value.trim() !== "") {
                void this.checkAndSetValue(`vehicle-state.${stVD.newVersionStatus.key}`, stVD.newVersionStatus.value, stVD.newVersionStatus.desc);
            }
            else {
                void this.checkAndSetValue(`vehicle-state.${stVD.newVersionStatus.key}`, "---", stVD.newVersionStatus.desc);
            }
            if (stVD.location.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.location.key}`, stVD.location.value, stVD.location.desc);
            }
            if (stVD.longitude.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.longitude.key}`, stVD.longitude.value, stVD.longitude.desc, `value.gps.longitude`);
            }
            if (stVD.latitude.value !== null) {
                void this.checkAndSetValue(`vehicle-state.${stVD.latitude.key}`, stVD.latitude.value, stVD.latitude.desc, `value.gps.latitude`);
            }
            if (stVD.odometer.value !== null) {
                void this.checkAndSetValueNumber(`vehicle-state.${stVD.odometer.key}`, Math.round(parseFloat(stVD.odometer.value) * 100) / 100, stVD.odometer.desc, "mi");
                void this.checkAndSetValueNumber(`vehicle-state.${stVD.odometer.key}_km`, Math.round(parseFloat(stVD.odometer.value) * 160.934) / 100, stVD.odometer.desc, "km");
            }
            if (stVD.speed.value !== null) {
                void this.checkAndSetValueNumber(`vehicle-state.${stVD.speed.key}`, Math.round(parseFloat(stVD.speed.value) * 100) / 100, stVD.speed.desc, "km/h");
            }
            else {
                void this.checkAndSetValueNumber(`vehicle-state.${stVD.speed.key}`, 0, stVD.speed.desc, "km/h");
            }
            if (stVD.battery_level.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.battery_level.key}`, parseFloat(stVD.battery_level.value), stVD.battery_level.desc, "%", `value.battery`);
            }
            if (stVD.usable_battery_level.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.usable_battery_level.key}`, parseFloat(stVD.usable_battery_level.value), stVD.usable_battery_level.desc, "%", `value.battery`);
            }
            if (stVD.battery_range.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.battery_range.key}`, parseFloat(stVD.battery_range.value), stVD.battery_range.desc, "mi");
                void this.checkAndSetValueNumber(`battery-state.${stVD.battery_range.key}_km`, Math.round(parseFloat(stVD.battery_range.value) * 160.934) / 100, stVD.battery_range.desc, "km");
            }
            if (stVD.est_battery_range.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.est_battery_range.key}`, parseFloat(stVD.est_battery_range.value), stVD.est_battery_range.desc, "mi");
                void this.checkAndSetValueNumber(`battery-state.${stVD.est_battery_range.key}_km`, Math.round(parseFloat(stVD.est_battery_range.value) * 160.934) / 100, stVD.est_battery_range.desc, "km");
            }
            if (stVD.charge_current_request.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charge_current_request.key}`, parseFloat(stVD.charge_current_request.value), stVD.charge_current_request.desc, "A", `value.current`);
            }
            else {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charge_current_request.key}`, 0, stVD.charge_current_request.desc, "A", `value.current`);
            }
            if (stVD.charge_limit_soc.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charge_limit_soc.key}`, parseFloat(stVD.charge_limit_soc.value), stVD.charge_limit_soc.desc, "%", `value.battery`);
            }
            if (stVD.charger_phases.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charger_phases.key}`, parseFloat(stVD.charger_phases.value), stVD.charger_phases.desc);
            }
            else {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charger_phases.key}`, 0, stVD.charger_phases.desc);
            }
            if (stVD.charger_power.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charger_power.key}`, parseFloat(stVD.charger_power.value), stVD.charger_power.desc, "kW", `value.power`);
            }
            else {
                void this.checkAndSetValueNumber(`battery-state.${stVD.charger_power.key}`, 0, stVD.charger_power.desc, "kW", `value.power`);
            }
            if (stVD.time_to_full_charge.value !== null) {
                void this.checkAndSetValueNumber(`battery-state.${stVD.time_to_full_charge.key}`, parseFloat(stVD.time_to_full_charge.value), stVD.time_to_full_charge.desc, "h");
                if (parseFloat(stVD.time_to_full_charge.value) != 0) {
                    void this.checkAndSetValue(`battery-state.time_to_finish_charge`, calculateEndTimeFromNow(parseFloat(stVD.time_to_full_charge.value)), stVD.time_to_full_charge.desc);
                }
                else {
                    void this.checkAndSetValue(`battery-state.time_to_finish_charge`, `---`, stVD.time_to_full_charge.desc);
                }
            }
            else {
                void this.checkAndSetValueNumber(`battery-state.${stVD.time_to_full_charge.key}`, 0, stVD.time_to_full_charge.desc);
                void this.checkAndSetValue(`battery-state.time_to_finish_charge`, `---`, stVD.time_to_full_charge.desc);
            }
            if (stVD.scheduled_charging_start_time.value !== null && stVD.scheduled_charging_start_time.value !== "") {
                void this.checkAndSetValue(`battery-state.${stVD.scheduled_charging_start_time.key}`, convertUnixToLocalTime(parseFloat(stVD.scheduled_charging_start_time.value)), stVD.scheduled_charging_start_time.desc);
            }
            else {
                if (stVD.carState.value !== "Sleeping") {
                    void this.checkAndSetValue(`battery-state.${stVD.scheduled_charging_start_time.key}`, `---`, stVD.scheduled_charging_start_time.desc);
                }
            }
            if (stVD.inside_temp.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.inside_temp.key}`, parseFloat(stVD.inside_temp.value), stVD.inside_temp.desc, "°C", `value.temperature`);
            }
            if (stVD.outside_temp.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.outside_temp.key}`, parseFloat(stVD.outside_temp.value), stVD.outside_temp.desc, "°C", `value.temperature`);
            }
            if (stVD.driver_temp_setting.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.driver_temp_setting.key}`, parseFloat(stVD.driver_temp_setting.value), stVD.driver_temp_setting.desc, "°C", `value.temperature`);
            }
            if (stVD.seat_heater_left.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_left.key}`, parseFloat(stVD.seat_heater_left.value), stVD.seat_heater_left.desc);
            }
            if (stVD.seat_heater_right.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_right.key}`, parseFloat(stVD.seat_heater_right.value), stVD.seat_heater_right.desc);
            }
            if (stVD.seat_heater_rear_left.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_rear_left.key}`, parseFloat(stVD.seat_heater_rear_left.value), stVD.seat_heater_rear_left.desc);
            }
            if (stVD.seat_heater_rear_center.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_rear_center.key}`, parseFloat(stVD.seat_heater_rear_center.value), stVD.seat_heater_rear_center.desc);
            }
            if (stVD.seat_heater_rear_right.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_rear_right.key}`, parseFloat(stVD.seat_heater_rear_right.value), stVD.seat_heater_rear_right.desc);
            }
            if (stVD.third_row_seats.value !== null) {
                if (stVD.seat_heater_rear_left_back.value !== null) {
                    void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_rear_left_back.key}`, parseFloat(stVD.seat_heater_rear_left_back.value), stVD.seat_heater_rear_left_back.desc);
                }
                if (stVD.seat_heater_rear_right_back.value !== null) {
                    void this.checkAndSetValueNumber(`thermal-state.${stVD.seat_heater_rear_right_back.key}`, parseFloat(stVD.seat_heater_rear_right_back.value), stVD.seat_heater_rear_right_back.desc);
                }
            }
            if (stVD.steering_wheel_heater.value !== null) {
                void this.checkAndSetValueNumber(`thermal-state.${stVD.steering_wheel_heater.key}`, parseFloat(stVD.steering_wheel_heater.value), stVD.steering_wheel_heater.desc);
            }
            return true;
        }
        catch (error) {
            this.adapter.log.error(`Error reading TeslaFi data: ${error.message}`);
            return false;
        }
    }
    async HandleConnectionError(stError, sOccasion, sErrorOccInt) {
        if (stError.response) {
            switch (stError.response.status) {
                case 401:
                    this.adapter.log.error(`The TeslaFi API request has not been completed because it lacks valid authentication credentials.`);
                    this.adapter.log.error(`HTTP error 401 when calling ${sOccasion}!! (e${sErrorOccInt}.0)`);
                    this.adapter.log.error(`Adapter is shutting down`);
                    void this.adapter.stop;
                    break;
                default:
                    this.adapter.log.error(`HTTP error ${stError.response.status} when polling ${sOccasion}!! (e${sErrorOccInt}.1)`);
            }
        }
        else if (stError.code) {
            switch (stError.code) {
                case "ETIMEDOUT":
                    this.adapter.log.warn(`Connection timeout error when calling ${sOccasion}`);
                    this.adapter.log.warn(`Please verify the API Token or adapt your poll interval, (e${sErrorOccInt}.2)`);
                    break;
                case "EHOSTUNREACH":
                    this.adapter.log.warn(`TeslaFi not reachable error when calling ${sOccasion}`);
                    this.adapter.log.warn(`Please verify your network environment, (e${sErrorOccInt}.2)`);
                    break;
                case "ENETUNREACH":
                    this.adapter.log.warn(`Inverter network not reachable error when calling ${sOccasion}`);
                    this.adapter.log.warn(`Please verify your network environment, (e${sErrorOccInt}.2)`);
                    break;
            }
        }
        else {
            this.adapter.log.error(`Unknown error when calling ${sOccasion}: ${stError.message}`);
            this.adapter.log.error(`Please verify the API Token or adapt your poll interval, (e${sErrorOccInt}.3)`);
            if (this.adapter.supportsFeature && this.adapter.supportsFeature("PLUGINS")) {
                const sentryInstance = this.adapter.getPluginInstance("sentry");
                if (sentryInstance) {
                    const oldError = await this.adapter.getStateAsync("LastSentryLoggedError");
                    if (oldError?.val != stError.message) {
                        const Sentry = sentryInstance.getSentryObject();
                        const date = new Date();
                        Sentry &&
                            Sentry.withScope((scope) => {
                                scope.setLevel("info");
                                scope.setTag("Hour of event", date.getHours());
                                Sentry.captureMessage(`Catched error: ${stError.message}`, "info");
                            });
                        void this.adapter.setState("LastSentryLoggedError", {
                            val: stError.message,
                            ack: true,
                        });
                    }
                }
            }
        }
    }
}
exports.TeslaFiAPICaller = TeslaFiAPICaller;
//# sourceMappingURL=teslafiAPICaller.js.map