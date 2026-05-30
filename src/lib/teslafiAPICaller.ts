import type * as utils from "@iobroker/adapter-core";
import axios, { type AxiosError } from "axios";
import { add, format, fromUnixTime } from "date-fns";
import { ProjectUtils } from "./projectUtils";

const axiosInstance = axios.create({
	//timeout: 5000, //by default
});

interface VehicleData {
	key: string; // the key user in API-JSON
	desc: string; // description for ioBroker state
	value: string; // value as string as saved in the JSON
}

interface VehicleCommands {
	key: string; // the key user in API-JSON
	desc: string; // description for ioBroker state
	command: string; // command as string to be send to TeslaFi
}

// structure of vehicle data
const stVD: Record<string, VehicleData> = {
	Date: { key: `Date`, desc: `Last connection to your Tesla`, value: "" },
	// calendar_enabled: null, remote_start_enabled: "1"
	display_name: {
		key: `display_name`,
		desc: `Name of your Tesla`,
		value: "",
	},
	// color: "1 FanOnly ", fast_charger_brand: "", notifications_enabled: null
	vin: { key: `vin`, desc: `VIN of your Tesla`, value: "" },
	// conn_charge_cable: "IEC", id: "NULL", charge_port_cold_weather_mode: "0", id_s: ""
	state: { key: `state`, desc: `State of your Tesla`, value: "" },
	// option_codes: null, user_charge_enable_request: null
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
	// charge_enable_request: "1", charge_to_max_range: ""
	charger_phases: {
		key: `charger_phases`,
		desc: `current number of charge phases`,
		value: "",
	},
	// battery_heater_on: "0"
	// managed_charging_start_time: { key: `managed_charging_start_time`, desc: `planned managed charging time`, value: null },
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
	// charger_pilot_current: "16", charge_port_latch: "Engaged", battery_current: "", charger_actual_current: "0", scheduled_charging_pending: "0", fast_charger_type: ""
	usable_battery_level: {
		key: `usable_battery_level`,
		desc: `usable battery SoC at this temperature conditions`,
		value: "",
	},
	// motorized_charge_port: null, charge_limit_soc_std: null, not_enough_power_to_heat: null
	battery_level: {
		key: `battery_level`,
		desc: `battery SoC of your Tesla`,
		value: "",
	},
	// charge_energy_added: "0.0", charge_port_door_open: "1", max_range_charge_counter: null, charge_limit_soc_max: null, ideal_battery_range: "237.17"
	// managed_charging_active: { key: `managed_charging_active`, desc: `managed charging planned`, value: null },
	charging_state: {
		key: `charging_state`,
		desc: `charging state of the car`,
		value: "",
	},
	// fast_charger_present: "0", trip_charging: "1", managed_charging_user_canceled: null
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
	// charge_rate: "0.0", charger_voltage: "1", charge_current_request_max: "16", eu_vehicle: "1", charge_miles_added_ideal: "0.0", charge_limit_soc_min: null, charge_miles_added_rated: "0.0"
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
	// heading: "", gps_as_of: null
	latitude: {
		key: `latitude`,
		desc: `current positional latitude of your Tesla`,
		value: "",
	},
	speed: { key: `speed`, desc: `current driving speed`, value: "" },
	// shift_state: null
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
	// passenger_temp_setting: "20.5", is_auto_conditioning_on: "0"
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
	// is_rear_defroster_on: "0"
	seat_heater_rear_right_back: {
		key: `seat_heater_rear_right_back`,
		desc: `level of the right third row seat heater`,
		value: "",
	},
	// smart_preconditioning: ""
	seat_heater_right: {
		key: `seat_heater_right`,
		desc: `level of the right seat heater`,
		value: "",
	},
	// fan_status: "0", is_front_defroster_on: "0"
	seat_heater_rear_left: {
		key: `seat_heater_rear_left`,
		desc: `level of the left second row seat heater`,
		value: "",
	},
	// gui_charge_rate_units: null, gui_24_hour_time: null, gui_temperature_units: null, gui_range_display: null, gui_distance_units: null, sun_roof_installed: null,
	// rhd: "0", remote_start_supported: null, homelink_nearby: "0", parsed_calendar_supported: null, spoiler_type: null, ft: "0"
	odometer: { key: `odometer`, desc: `current odometer level`, value: "" },
	// remote_start: null, pr: "0", climate_keeper_mode: "off", roof_color: null, perf_config: null, valet_mode: "0", calendar_supported: null, pf: "0", sun_roof_percent_open: null,
	third_row_seats: {
		key: `third_row_seats`,
		desc: `third seating row present`,
		value: "",
	},
	// seat_type: null, api_version: null, rear_seat_heaters: null, rt: "0", exterior_color: null, df: "0", autopark_state: "NULL", sun_roof_state: null, notifications_supported: null, vehicle_name: null,
	// dr: "0", autopark_style: null, car_type: null, wheel_type: "Apollo19MetallicShad", locked: "1", center_display_state: null, last_autopark_error: null
	car_version: {
		key: `car_version`,
		desc: `Current software version`,
		value: "",
	},
	// defrost_mode: "0", autopark_state_v2: null, is_preconditioning: "0", inside_tempF: "60", driver_temp_settingF: "", outside_tempF: "57", battery_heater: "0", Notes: "", odometerF: "", idleNumber: 14780,
	// sleepNumber: 0, driveNumber: 0, chargeNumber: 0, polling: "", idleTime: 1, maxRange: "314.14", left_temp_direction: null, max_avail_temp: null, is_climate_on: "0", right_temp_direction: null,
	// min_avail_temp: null, is_user_present: "0", in_service: "0", valet_pin_needed: null, charge_port_led_color: null, timestamp: null, power: "0", side_mirror_heaters: "0", wiper_blade_heater: "0",
	steering_wheel_heater: {
		key: `steering_wheel_heater`,
		desc: `level of the steering wheel heater`,
		value: "",
	},
	// elevation: "", sentry_mode: "0", fd_window: "0", fp_window: "0", rd_window: "0", rp_window: "0", measure: "metric", temperature: "C", currency: "â‚¬"
	carState: { key: `carState`, desc: `Sleep-state of your Tesla`, value: "" },
	location: { key: `location`, desc: `Location of your Tesla`, value: "" },
	// rangeDisplay: "rated",
	newVersion: {
		key: `newVersion`,
		desc: `Next software version if available`,
		value: "", //" "
	},
	newVersionStatus: { key: `newVersionStatus`, desc: ``, value: `` }, //"installing", ""
	// allow_cabin_overheat_protection: "1", cabin_overheat_protection: "FanOnly", cabin_overheat_protection_actively_cooling: "", cop_activation_temperature: null, pressure: null,
	// tpms_front_left: "41.7", tpms_front_right: "41.0", tpms_rear_left: "41.7", tpms_rear_right: "41.0"
};

// structure of vehicle commands
const stVCom: Record<string, VehicleCommands> = {
	auto_conditioning_start: { key: `Start-HVAC`, desc: `Start HVAC of your Tesla`, command: `auto_conditioning_start` },
	auto_conditioning_stop: { key: `Stop-HVAC`, desc: `Stop HVAC of your Tesla`, command: `auto_conditioning_stop` },
	set_HVAC_temp: { key: `Set-Temp`, desc: `Set Temp for HVAC`, command: `set_temps&temp` },
	//		`set_temps&temp=XX` - temp is entered in your default TeslaFi measurement Celcius and can include one decimal point

	// WiP  NEW:
	set_seat_heat_left: {
		key: `Set-Seat-Heater-Left`,
		desc: `Set left seat heater level`,
		command: `seat_heater&heater=0&level`,
	},
	//		`seat_heater&heater=X&level=X`
	//		Heater: 0-Driver, 1-Passenger, 2-Rear Left, 4-Rear Center, 5-Rear Right   -   Level: 0-3 (0 is off)
	//		Conditioning must be on before sending.
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
	//		`set_charge_limit&charge_limit_soc=XX`
	set_charge_amps: { key: `Set-Charge-Amps`, desc: `set charging ampere limit`, command: `set_charging_amps&charging_amps` },
	//		`set_charging_amps&charging_amps=XX`
};

function convertUnixToLocalTime(unixTimestamp: number, dateFormat = "dd.MM.yyyy HH:mm:ss"): string {
	const date = fromUnixTime(unixTimestamp);
	return format(date, dateFormat);
}

function calculateEndTimeFromNow(hours: number, dateFormat = "dd.MM.yyyy HH:mm:ss"): string {
	const totalSeconds = hours * 3600;
	const endTime = add(new Date(), { seconds: totalSeconds });
	return format(endTime, dateFormat);
}

/**
 * TeslaFiAPICaller
 */
export class TeslaFiAPICaller extends ProjectUtils {
	queryUrl = "";

	/**
	 * constructor
	 *
	 * @param adapter - ioBroker adapter instance
	 */
	constructor(adapter: utils.AdapterInstance) {
		super(adapter);
		this.queryUrl = "https://www.teslafi.com/feed.php?token=";
	}

	/**
	 * SetupCommandStates
	 */
	SetupCommandStates(): void {
		if (this.adapter.config.UseCarCommands) {
			void this.checkAndSetValueNumber(`commands.command_counter`, 0, `Used commands counter`, "", `value`, false, true);
			void this.checkAndSetValueNumber(`commands.wakes_counter`, 0, `Used car wakeups counter`, "", `value`, false, true);

			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_seat_heat_left.key}`,
				0,
				stVCom.set_seat_heat_left.desc,
				"",
				`level.temperature`,
				true,
				true,
				false,
				0,
				3,
				1,
			);
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_seat_heat_right.key}`,
				0,
				stVCom.set_seat_heat_right.desc,
				"",
				`level.temperature`,
				true,
				true,
				false,
				0,
				3,
				1,
			);
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_seat_heat_rear_left.key}`,
				0,
				stVCom.set_seat_heat_rear_left.desc,
				"",
				`level.temperature`,
				true,
				true,
				false,
				0,
				3,
				1,
			);
			/*
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_seat_heat_rear_center.key}`,
				0,
				stVCom.set_seat_heat_rear_center.desc,
				"",
				`level.temperature`,
				true,
				true,
				false,
				0,
				3,
				1,
			);
			*/
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_seat_heat_rear_right.key}`,
				0,
				stVCom.set_seat_heat_rear_right.desc,
				"",
				`level.temperature`,
				true,
				true,
				false,
				0,
				3,
				1,
			);

			void this.checkAndSetValueBoolean(
				`commands.${stVCom.auto_conditioning_start.key}`,
				false,
				stVCom.auto_conditioning_start.desc,
				`button.start`,
				true,
			);
			void this.checkAndSetValueBoolean(`commands.${stVCom.auto_conditioning_stop.key}`, false, stVCom.auto_conditioning_stop.desc, `button.start`, true);
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_HVAC_temp.key}`,
				20,
				stVCom.set_HVAC_temp.desc,
				"°C",
				`level.temperature`,
				true,
				true,
				false,
				15,
				28,
				0.5,
			);

			void this.checkAndSetValueBoolean(`commands.${stVCom.start_charging.key}`, false, stVCom.start_charging.desc, `button.start`, true);
			void this.checkAndSetValueBoolean(`commands.${stVCom.stop_charging.key}`, false, stVCom.stop_charging.desc, `button.start`, true);
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_charge_limit.key}`,
				80,
				stVCom.set_charge_limit.desc,
				"%",
				`level.battery.max`,
				true,
				true,
				false,
				50,
				100,
				1,
			);
			void this.checkAndSetValueNumber(
				`commands.${stVCom.set_charge_amps.key}`,
				10,
				stVCom.set_charge_amps.desc,
				"A",
				`level.current.max`,
				true,
				true,
				false,
				5,
				32,
				1,
			);

			this.adapter.subscribeStates(`commands.*`);
		}
	}

	/**
	 * HandleCarCommand
	 *
	 * @param command - command to be send to TeslaFi
	 * @param value - optional number value for command
	 */
	async HandleCarCommand(command: string, value?: number): Promise<void> {
		// Usage Details
		// If the vehicle is awake: The command will be sent, and one usage will be deducted from your command count.
		// If the vehicle is asleep: TeslaFi will send a wake command and pause for 15 seconds before sending the command.
		// 		One usage will be deducted from both the command count and the wake count.
		// 		The pause duration can be customized by adding &wake=X to the command, where X specifies the number
		// 		of seconds to pause (up to 60 seconds).

		this.adapter.log.info(`TeslaFI adapter got command ${command} and sends this to the vehicle`);
		let clampedValue: number;
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

	/**
	 * ReadTeslaFi
	 *
	 * @param command - optional command to be send to TeslaFi - default ""
	 */
	async ReadTeslaFi(command = ""): Promise<boolean> {
		try {
			const getString = `${this.queryUrl}${this.adapter.config.TeslaFiAPIToken}&command=${command}`;
			this.adapter.log.debug(`sending command/request to TeslaFi: ${getString}`);
			const response = await axiosInstance.get(getString, {
				transformResponse: r => r,
				timeout: this.adapter.config.UpdateTimeout, // 5000 by default
			});

			if (!response.data) {
				throw new Error(`Empty answer from TeslaFi.`);
			}

			const result = JSON.parse(response.data);
			// debug
			// this.adapter.log.debug(`TeslaFi full response: ${JSON.stringify(result, null, 2)}`);

			// verify authorized access
			if (result.response?.result === "unauthorized") {
				this.adapter.log.warn(`TeslaFI data read - unauthorized access detected - please verify your API Token`);
				return false;
			}

			//#region *** "commands" properties ***
			/*	Response in case of sent command
				{
					"response": {
						"result": true,
						"reason": ""
					},
					"tesla_request_counter": {
						"commands": 8,
						"wakes": 3
					}
				}
			*/
			if (result.response?.result === true) {
				this.adapter.log.debug(`TeslaFI command received with response TRUE`);
			}
			if (result.tesla_request_counter && typeof result.tesla_request_counter === "object") {
				if (result.tesla_request_counter.commands != null) {
					// await this.adapter.setState(`commands.command_counter`, { val: result.tesla_request_counter.commands, ack: true });
					void this.checkAndSetValueNumber(
						`commands.command_counter`,
						result.tesla_request_counter.commands,
						`Used commands counter`,
						"",
						`value`,
						false,
					);
				}
				if (result.tesla_request_counter.wakes != null) {
					void this.checkAndSetValueNumber(
						`commands.wakes_counter`,
						result.tesla_request_counter.wakes,
						`Used car wakeups counter`,
						"",
						`value`,
						false,
					);
				}
			} else {
				// debug
				// this.adapter.log.debug(`tesla_request_counter is missing or not an object`);
				// debug
			}
			//#endregion

			// save raw JSON
			void this.checkAndSetValue(`vehicle-data.rawJSON`, response.data, `JSON raw data from TeslaFi`, `json`);

			// fill values into predefined structur
			for (const [key, value] of Object.entries(result)) {
				if (key in stVD) {
					stVD[key].value = value as string; // Wert direkt in die Struktur einfügen
				}
			}
			// now process property structure

			//#region *** "vehicle-data" properties ***
			if (stVD.Date.value !== null) {
				//"2024-10-25 20:43:33"
				void this.checkAndSetValue(`vehicle-data.${stVD.Date.key}`, stVD.Date.value, stVD.Date.desc, `date`);
			}
			if (stVD.vin.value !== null) {
				//"LRWYGCEKXNC44xxxx"
				void this.checkAndSetValue(`vehicle-data.${stVD.vin.key}`, stVD.vin.value, stVD.vin.desc);
			}
			if (stVD.display_name.value !== null) {
				//"Red Elephant"
				void this.checkAndSetValue(`vehicle-data.${stVD.display_name.key}`, stVD.display_name.value, stVD.display_name.desc);
			}
			//#endregion

			//#region *** "vehicle-state" properties ***
			if (stVD.carState.value !== null) {
				//"Idling"
				void this.checkAndSetValue(`vehicle-state.${stVD.carState.key}`, stVD.carState.value, stVD.carState.desc);
			}
			if (stVD.state.value !== null) {
				//"online"
				void this.checkAndSetValue(`vehicle-state.${stVD.state.key}`, stVD.state.value, stVD.state.desc);
			}
			if (stVD.charging_state.value !== null) {
				//"NoPower", "Charging", null
				void this.checkAndSetValue(`vehicle-state.${stVD.charging_state.key}`, stVD.charging_state.value, stVD.charging_state.desc);
			} else {
				void this.checkAndSetValue(`vehicle-state.${stVD.charging_state.key}`, "---", stVD.charging_state.desc);
			}

			if (stVD.car_version.value !== null) {
				//"2024.32.7 3f0d0fff88"
				void this.checkAndSetValue(`vehicle-state.${stVD.car_version.key}`, stVD.car_version.value, stVD.car_version.desc);
			}
			if (stVD.newVersion.value && stVD.newVersion.value.trim() !== "") {
				//" "
				void this.checkAndSetValue(`vehicle-state.${stVD.newVersion.key}`, stVD.newVersion.value, stVD.newVersion.desc);
			} else {
				void this.checkAndSetValue(`vehicle-state.${stVD.newVersion.key}`, "---", stVD.newVersion.desc);
			}

			if (stVD.newVersionStatus.value && stVD.newVersionStatus.value.trim() !== "") {
				//"installing"
				void this.checkAndSetValue(`vehicle-state.${stVD.newVersionStatus.key}`, stVD.newVersionStatus.value, stVD.newVersionStatus.desc);
			} else {
				void this.checkAndSetValue(`vehicle-state.${stVD.newVersionStatus.key}`, "---", stVD.newVersionStatus.desc);
			}

			if (stVD.location.value !== null) {
				//"Home"
				void this.checkAndSetValue(`vehicle-state.${stVD.location.key}`, stVD.location.value, stVD.location.desc);
			}
			if (stVD.longitude.value !== null) {
				//"9.899749"
				void this.checkAndSetValue(`vehicle-state.${stVD.longitude.key}`, stVD.longitude.value, stVD.longitude.desc, `value.gps.longitude`);
			}
			if (stVD.latitude.value !== null) {
				//"49.873095"
				void this.checkAndSetValue(`vehicle-state.${stVD.latitude.key}`, stVD.latitude.value, stVD.latitude.desc, `value.gps.latitude`);
			}
			if (stVD.odometer.value !== null) {
				//"16434.079511"
				void this.checkAndSetValueNumber(
					`vehicle-state.${stVD.odometer.key}`,
					Math.round(parseFloat(stVD.odometer.value) * 100) / 100,
					stVD.odometer.desc,
					"mi",
				);
				void this.checkAndSetValueNumber(
					`vehicle-state.${stVD.odometer.key}_km`,
					Math.round(parseFloat(stVD.odometer.value) * 160.934) / 100,
					stVD.odometer.desc,
					"km",
				);
			}
			if (stVD.speed.value !== null) {
				//"28"
				void this.checkAndSetValueNumber(
					`vehicle-state.${stVD.speed.key}`,
					Math.round(parseFloat(stVD.speed.value) * 100) / 100,
					stVD.speed.desc,
					"km/h",
				);
			} else {
				void this.checkAndSetValueNumber(`vehicle-state.${stVD.speed.key}`, 0, stVD.speed.desc, "km/h");
			}
			//#endregion

			//#region *** "battery-state" properties ***
			if (stVD.battery_level.value !== null) {
				//"76"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.battery_level.key}`,
					parseFloat(stVD.battery_level.value),
					stVD.battery_level.desc,
					"%",
					`value.battery`,
				);
			}
			if (stVD.usable_battery_level.value !== null) {
				//"75"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.usable_battery_level.key}`,
					parseFloat(stVD.usable_battery_level.value),
					stVD.usable_battery_level.desc,
					"%",
					`value.battery`,
				);
			}
			if (stVD.battery_range.value !== null) {
				//"237.17"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.battery_range.key}`,
					parseFloat(stVD.battery_range.value),
					stVD.battery_range.desc,
					"mi",
				);
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.battery_range.key}_km`,
					Math.round(parseFloat(stVD.battery_range.value) * 160.934) / 100,
					stVD.battery_range.desc,
					"km",
				);
			}
			if (stVD.est_battery_range.value !== null) {
				//"208.25"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.est_battery_range.key}`,
					parseFloat(stVD.est_battery_range.value),
					stVD.est_battery_range.desc,
					"mi",
				);
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.est_battery_range.key}_km`,
					Math.round(parseFloat(stVD.est_battery_range.value) * 160.934) / 100,
					stVD.est_battery_range.desc,
					"km",
				);
			}

			if (stVD.charge_current_request.value !== null) {
				//"16"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.charge_current_request.key}`,
					parseFloat(stVD.charge_current_request.value),
					stVD.charge_current_request.desc,
					"A",
					`value.current`,
				);
			} else {
				void this.checkAndSetValueNumber(`battery-state.${stVD.charge_current_request.key}`, 0, stVD.charge_current_request.desc, "A", `value.current`);
			}
			if (stVD.charge_limit_soc.value !== null) {
				//"80"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.charge_limit_soc.key}`,
					parseFloat(stVD.charge_limit_soc.value),
					stVD.charge_limit_soc.desc,
					"%",
					`value.battery`,
				);
			}
			if (stVD.charger_phases.value !== null) {
				//"3"
				void this.checkAndSetValueNumber(`battery-state.${stVD.charger_phases.key}`, parseFloat(stVD.charger_phases.value), stVD.charger_phases.desc);
			} else {
				void this.checkAndSetValueNumber(`battery-state.${stVD.charger_phases.key}`, 0, stVD.charger_phases.desc);
			}
			if (stVD.charger_power.value !== null) {
				//"0"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.charger_power.key}`,
					parseFloat(stVD.charger_power.value),
					stVD.charger_power.desc,
					"kW",
					`value.power`,
				);
			} else {
				void this.checkAndSetValueNumber(`battery-state.${stVD.charger_power.key}`, 0, stVD.charger_power.desc, "kW", `value.power`);
			}
			if (stVD.time_to_full_charge.value !== null) {
				//"0.0"
				void this.checkAndSetValueNumber(
					`battery-state.${stVD.time_to_full_charge.key}`,
					parseFloat(stVD.time_to_full_charge.value),
					stVD.time_to_full_charge.desc,
					"h",
				);
				if (parseFloat(stVD.time_to_full_charge.value) != 0) {
					void this.checkAndSetValue(
						`battery-state.time_to_finish_charge`,
						calculateEndTimeFromNow(parseFloat(stVD.time_to_full_charge.value)),
						stVD.time_to_full_charge.desc,
					);
				} else {
					void this.checkAndSetValue(`battery-state.time_to_finish_charge`, `---`, stVD.time_to_full_charge.desc);
				}
			} else {
				void this.checkAndSetValueNumber(`battery-state.${stVD.time_to_full_charge.key}`, 0, stVD.time_to_full_charge.desc);
				void this.checkAndSetValue(`battery-state.time_to_finish_charge`, `---`, stVD.time_to_full_charge.desc);
			}

			if (stVD.scheduled_charging_start_time.value !== null && stVD.scheduled_charging_start_time.value !== "") {
				// ""; "1731031200"; "1731193200",
				void this.checkAndSetValue(
					`battery-state.${stVD.scheduled_charging_start_time.key}`,
					convertUnixToLocalTime(parseFloat(stVD.scheduled_charging_start_time.value)),
					stVD.scheduled_charging_start_time.desc,
				);
			} else {
				if (stVD.carState.value !== "Sleeping") {
					void this.checkAndSetValue(`battery-state.${stVD.scheduled_charging_start_time.key}`, `---`, stVD.scheduled_charging_start_time.desc);
				}
			}
			//#endregion

			//#region *** "thermal-state" properties ***
			if (stVD.inside_temp.value !== null) {
				//"15.8"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.inside_temp.key}`,
					parseFloat(stVD.inside_temp.value),
					stVD.inside_temp.desc,
					"°C",
					`value.temperature`,
				);
			}
			if (stVD.outside_temp.value !== null) {
				//"14.0"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.outside_temp.key}`,
					parseFloat(stVD.outside_temp.value),
					stVD.outside_temp.desc,
					"°C",
					`value.temperature`,
				);
			}

			if (stVD.driver_temp_setting.value !== null) {
				//"20.5"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.driver_temp_setting.key}`,
					parseFloat(stVD.driver_temp_setting.value),
					stVD.driver_temp_setting.desc,
					"°C",
					`value.temperature`,
				);
			}

			if (stVD.seat_heater_left.value !== null) {
				//"2"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.seat_heater_left.key}`,
					parseFloat(stVD.seat_heater_left.value),
					stVD.seat_heater_left.desc,
				);
			}
			if (stVD.seat_heater_right.value !== null) {
				//"0"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.seat_heater_right.key}`,
					parseFloat(stVD.seat_heater_right.value),
					stVD.seat_heater_right.desc,
				);
			}
			if (stVD.seat_heater_rear_left.value !== null) {
				//"2"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.seat_heater_rear_left.key}`,
					parseFloat(stVD.seat_heater_rear_left.value),
					stVD.seat_heater_rear_left.desc,
				);
			}
			if (stVD.seat_heater_rear_center.value !== null) {
				//"0"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.seat_heater_rear_center.key}`,
					parseFloat(stVD.seat_heater_rear_center.value),
					stVD.seat_heater_rear_center.desc,
				);
			}
			if (stVD.seat_heater_rear_right.value !== null) {
				//"3"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.seat_heater_rear_right.key}`,
					parseFloat(stVD.seat_heater_rear_right.value),
					stVD.seat_heater_rear_right.desc,
				);
			}
			if (stVD.third_row_seats.value !== null) {
				if (stVD.seat_heater_rear_left_back.value !== null) {
					//"3"
					void this.checkAndSetValueNumber(
						`thermal-state.${stVD.seat_heater_rear_left_back.key}`,
						parseFloat(stVD.seat_heater_rear_left_back.value),
						stVD.seat_heater_rear_left_back.desc,
					);
				}
				if (stVD.seat_heater_rear_right_back.value !== null) {
					//"2"
					void this.checkAndSetValueNumber(
						`thermal-state.${stVD.seat_heater_rear_right_back.key}`,
						parseFloat(stVD.seat_heater_rear_right_back.value),
						stVD.seat_heater_rear_right_back.desc,
					);
				}
			}
			if (stVD.steering_wheel_heater.value !== null) {
				//"0"
				void this.checkAndSetValueNumber(
					`thermal-state.${stVD.steering_wheel_heater.key}`,
					parseFloat(stVD.steering_wheel_heater.value),
					stVD.steering_wheel_heater.desc,
				);
			}
			//#endregion

			return true;
		} catch (error) {
			this.adapter.log.error(`Error reading TeslaFi data: ${(error as Error).message}`);
			return false;
		}
	}

	/*****************************************************************************************/
	private async HandleConnectionError(stError: AxiosError, sOccasion: string, sErrorOccInt: string): Promise<void> {
		if (stError.response) {
			//get HTTP error code
			switch (stError.response.status) {
				case 401:
					//this.SendSentryError(stError.Message);
					this.adapter.log.error(`The TeslaFi API request has not been completed because it lacks valid authentication credentials.`);
					this.adapter.log.error(`HTTP error 401 when calling ${sOccasion}!! (e${sErrorOccInt}.0)`);
					this.adapter.log.error(`Adapter is shutting down`);
					void this.adapter.stop;
					break;
				default:
					this.adapter.log.error(`HTTP error ${stError.response.status} when polling ${sOccasion}!! (e${sErrorOccInt}.1)`);
			}
		} else if (stError.code) {
			//get error code
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
			// errors: 'Unexpected end of JSON input' 'read ECONNRESET' 'connect ECONNREFUSED 192.168.0.1:80'
		} else {
			this.adapter.log.error(`Unknown error when calling ${sOccasion}: ${stError.message}`);
			this.adapter.log.error(`Please verify the API Token or adapt your poll interval, (e${sErrorOccInt}.3)`);

			if (this.adapter.supportsFeature && this.adapter.supportsFeature("PLUGINS")) {
				// send Sentry error
				const sentryInstance = this.adapter.getPluginInstance("sentry");
				if (sentryInstance) {
					const oldError = await this.adapter.getStateAsync("LastSentryLoggedError");
					if (oldError?.val != stError.message) {
						// if new error
						const Sentry = sentryInstance.getSentryObject();
						const date = new Date();
						Sentry &&
							Sentry.withScope((scope: { setLevel: (arg0: string) => void; setTag: (arg0: string, arg1: number | string) => void }) => {
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
