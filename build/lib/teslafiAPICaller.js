"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeslaFiAPICaller = void 0;
const axios_1 = __importDefault(require("axios"));
const teslafiHelper_1 = require("./teslafiHelper");
//import { IHomeInfo, TeslaFiHelper } from "./teslafiHelper";
function resolveAfterXSeconds(x) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(x);
        }, x * 1000);
    });
}
class TeslaFiAPICaller extends teslafiHelper_1.TeslaFiHelper {
    queryUrl = "";
    constructor(adapter) {
        super(adapter);
        this.queryUrl = "https://www.teslafi.com/feed.php?token=";
    }
    /****************************************************************************************
     * ReadTeslaFi **************************************************************************/
    async ReadTeslaFi() {
        await axios_1.default
            .get(`${this.queryUrl}${this.adapter.config.TeslaFiAPIToken}`, { transformResponse: (r) => r })
            .then((response) => {
            //.status == 200
            // access parsed JSON response data using response.data field
            if (!response.data) {
                throw new Error(`Empty answear from TeslaFi.`);
            }
            this.adapter.log.debug(`TeslaFI data read - response data: ${response.data}`);
            const result = JSON.parse(response.data);
            this.adapter.log.debug(`TeslaFI data read - result data: ${JSON.stringify(result)}`);
            //InverterType = result[0].value;
            //this.setState("Info.InverterType", { val: InverterType, ack: true });
            //InverterAPIPiko = true;
            //this.setState("info.connection", { val: true, ack: true });
            //InverterUIVersion = result[1].value;
            //this.setState("Info.InverterName", { val: result[2].value, ack: true });
        })
            .catch((error) => {
            this.HandleConnectionError(error, `TeslaFi API call`, `FI0`);
            return false;
        });
        await resolveAfterXSeconds(2);
        // eslint-disable-next-line no-constant-condition
        if (true)
            return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const DemoERGTeslaFiSLEEP = {
            data_id: 2307428,
            Date: "2024-10-25 12:20:33",
            calendar_enabled: "169",
            remote_start_enabled: "1",
            vehicle_id: "739 0 0 0 0 0 0",
            display_name: null,
            color: null,
            fast_charger_brand: null,
            notifications_enabled: null,
            vin: null,
            conn_charge_cable: null,
            id: null,
            charge_port_cold_weather_mode: null,
            id_s: null,
            state: "offline",
            option_codes: null,
            user_charge_enable_request: null,
            time_to_full_charge: null,
            charge_current_request: null,
            charge_enable_request: null,
            charge_to_max_range: null,
            charger_phases: null,
            battery_heater_on: null,
            managed_charging_start_time: null,
            battery_range: null,
            charger_power: null,
            charge_limit_soc: null,
            charger_pilot_current: null,
            charge_port_latch: null,
            battery_current: null,
            charger_actual_current: null,
            scheduled_charging_pending: null,
            fast_charger_type: null,
            usable_battery_level: null,
            motorized_charge_port: null,
            charge_limit_soc_std: null,
            not_enough_power_to_heat: null,
            battery_level: null,
            charge_energy_added: null,
            charge_port_door_open: null,
            max_range_charge_counter: null,
            charge_limit_soc_max: null,
            ideal_battery_range: null,
            managed_charging_active: null,
            charging_state: null,
            fast_charger_present: null,
            trip_charging: null,
            managed_charging_user_canceled: null,
            scheduled_charging_start_time: null,
            est_battery_range: null,
            charge_rate: null,
            charger_voltage: null,
            charge_current_request_max: null,
            eu_vehicle: null,
            charge_miles_added_ideal: null,
            charge_limit_soc_min: null,
            charge_miles_added_rated: null,
            inside_temp: null,
            longitude: null,
            heading: null,
            gps_as_of: null,
            latitude: null,
            speed: null,
            shift_state: null,
            seat_heater_rear_right: null,
            seat_heater_rear_left_back: null,
            seat_heater_left: null,
            passenger_temp_setting: null,
            is_auto_conditioning_on: null,
            driver_temp_setting: null,
            outside_temp: null,
            seat_heater_rear_center: null,
            is_rear_defroster_on: null,
            seat_heater_rear_right_back: null,
            smart_preconditioning: null,
            seat_heater_right: null,
            fan_status: null,
            is_front_defroster_on: null,
            seat_heater_rear_left: null,
            gui_charge_rate_units: null,
            gui_24_hour_time: null,
            gui_temperature_units: null,
            gui_range_display: null,
            gui_distance_units: null,
            sun_roof_installed: null,
            rhd: null,
            remote_start_supported: null,
            homelink_nearby: null,
            parsed_calendar_supported: null,
            spoiler_type: null,
            ft: null,
            odometer: null,
            remote_start: null,
            pr: null,
            climate_keeper_mode: null,
            roof_color: null,
            perf_config: null,
            valet_mode: null,
            calendar_supported: null,
            pf: null,
            sun_roof_percent_open: null,
            third_row_seats: null,
            seat_type: null,
            api_version: null,
            rear_seat_heaters: null,
            rt: null,
            exterior_color: null,
            df: null,
            autopark_state: null,
            sun_roof_state: null,
            notifications_supported: null,
            vehicle_name: null,
            dr: null,
            autopark_style: null,
            car_type: null,
            wheel_type: null,
            locked: null,
            center_display_state: null,
            last_autopark_error: null,
            car_version: null,
            defrost_mode: null,
            autopark_state_v2: null,
            is_preconditioning: "",
            inside_tempF: "",
            driver_temp_settingF: "",
            outside_tempF: "",
            battery_heater: "",
            Notes: "Offline Asleep",
            odometerF: "",
            idleNumber: 0,
            sleepNumber: 6750,
            driveNumber: 0,
            chargeNumber: 0,
            polling: "",
            idleTime: 0,
            maxRange: "314.14",
            left_temp_direction: null,
            max_avail_temp: null,
            is_climate_on: null,
            right_temp_direction: null,
            min_avail_temp: null,
            is_user_present: null,
            in_service: null,
            valet_pin_needed: null,
            charge_port_led_color: null,
            timestamp: null,
            power: null,
            side_mirror_heaters: null,
            wiper_blade_heater: null,
            steering_wheel_heater: null,
            elevation: "",
            sentry_mode: "",
            fd_window: "",
            fp_window: "",
            rd_window: "",
            rp_window: "",
            measure: "metric",
            temperature: "C",
            currency: "â‚¬",
            carState: "Sleeping",
            location: "Home",
            rangeDisplay: "rated",
            newVersion: " ",
            newVersionStatus: "",
            allow_cabin_overheat_protection: "",
            cabin_overheat_protection: null,
            cabin_overheat_protection_actively_cooling: null,
            cop_activation_temperature: null,
            pressure: null,
            tpms_front_left: "39.5",
            tpms_front_right: "39.2",
            tpms_rear_left: "39.5",
            tpms_rear_right: "39.2",
        };
    } // END ReadTeslaFi
    /*
    async updateTeslaFromAPI(): Promise<IHomeInfo[]> {
        try {
            this.adapter.log.debug(`Got homes from tibber api: ${JSON.stringify(Homes)}`);
            const homeInfoList: IHomeInfo[] = [];
            for (const index in Homes) {
                const currentHome = Homes[index];
                homeInfoList.push({
                    ID: currentHome.id,
                    NameInApp: currentHome.appNickname,
                    RealTime: currentHome.features.realTimeConsumptionEnabled,
                    FeedActive: false,
                    PriceDataPollActive: true,
                });
                // Set HomeId in tibberConfig for further API Calls
                // Home GENERAL
                this.checkAndSetValue(this.getStatePrefix(currentHome.id, "General", "Id"), currentHome.id, "ID of your home");
                this.checkAndSetValue(this.getStatePrefix(currentHome.id, "General", "Timezone"), currentHome.timeZone, "The time zone the home resides in");
                this.checkAndSetValue(this.getStatePrefix(currentHome.id, "General", "NameInApp"), currentHome.appNickname, "The nickname given to the home");
                this.checkAndSetValue(
                    this.getStatePrefix(currentHome.id, "General", "AvatarInApp"),
                    currentHome.appAvatar,
                    "The chosen app avatar for the home",
                );
                // Values: APARTMENT, ROWHOUSE, FLOORHOUSE1, FLOORHOUSE2, FLOORHOUSE3, COTTAGE, CASTLE
                this.checkAndSetValue(this.getStatePrefix(currentHome.id, "General", "Type"), currentHome.type, "The type of home.");
                // Values: APARTMENT, ROWHOUSE, HOUSE, COTTAGE
                this.checkAndSetValue(
                    this.getStatePrefix(currentHome.id, "General", "PrimaryHeatingSource"),
                    currentHome.primaryHeatingSource,
                    "The primary form of heating in the home",
                );
                // Values: AIR2AIR_HEATPUMP, ELECTRICITY, GROUND, DISTRICT_HEATING, ELECTRIC_BOILER, AIR2WATER_HEATPUMP, OTHER
                this.checkAndSetValueNumber(this.getStatePrefix(currentHome.id, "General", "Size"), currentHome.size, "The size of the home in square meters");
                this.checkAndSetValueNumber(
                    this.getStatePrefix(currentHome.id, "General", "NumberOfResidents"),
                    currentHome.numberOfResidents,
                    "The number of people living in the home",
                );
                this.checkAndSetValueNumber(this.getStatePrefix(currentHome.id, "General", "MainFuseSize"), currentHome.mainFuseSize, "The main fuse size");
                this.checkAndSetValueBoolean(
                    this.getStatePrefix(currentHome.id, "General", "HasVentilationSystem"),
                    currentHome.hasVentilationSystem,
                    "Whether the home has a ventilation system",
                );

                this.checkAndSetValueBoolean(
                    this.getStatePrefix(currentHome.id, "Features", "RealTimeConsumptionEnabled"),
                    currentHome.features.realTimeConsumptionEnabled,
                    "Whether Tibber server will send consumption data by API",
                );
            }
            return homeInfoList;
        } catch (error) {
            this.adapter.log.error(this.generateErrorMessage(error, "fetching homes from Tibber API"));
            return [];
        }
    }
    */
    /**
     * updates current price of one home
     *
     * @param homeId - homeId string
     * @param forceUpdate - OPTIONAL: force mode, without verification if existing data is fitting to current date, default: false
     * @returns okprice - got new data
     */
    /*
    private async updateCurrentPrice(homeId: string, forceUpdate = false): Promise<boolean> {
        try {
            if (homeId) {
                let exDateCurrent: Date | null = null;
                let pricesToday: IPrice[] = [];
                const now = new Date();
                if (!forceUpdate) {
                    exDateCurrent = new Date(await this.getStateValue(`Homes.${homeId}.CurrentPrice.startsAt`));
                    pricesToday = JSON.parse(await this.getStateValue(`Homes.${homeId}.PricesToday.json`));
                }
                // update remaining average
                if (Array.isArray(pricesToday) && pricesToday[2] && pricesToday[2].startsAt) {
                    const exDateToday: Date = new Date(pricesToday[2].startsAt);
                    if (now.getDate == exDateToday.getDate) this.fetchPriceRemainingAverage(homeId, `PricesToday.averageRemaining`, pricesToday);
                }

                if (!exDateCurrent || now.getHours() !== exDateCurrent.getHours() || forceUpdate) {
                    const currentPrice = await this.tibberQuery.getCurrentEnergyPrice(homeId);
                    await this.fetchPrice(homeId, "CurrentPrice", currentPrice);
                    this.adapter.log.debug(`Got current price from tibber api: ${JSON.stringify(currentPrice)} Force: ${forceUpdate}`);
                    exDateCurrent = new Date(currentPrice.startsAt);
                    if (exDateCurrent && now.getHours() === exDateCurrent.getHours()) {
                        return true;
                    }
                } else if (now.getHours() !== exDateCurrent.getHours()) {
                    this.adapter.log.debug(
                        `Hour (${exDateCurrent.getHours()}) of known current price is already the current hour, polling of current price from Tibber skipped`,
                    );
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error: any) {
            if (forceUpdate) this.adapter.log.error(this.generateErrorMessage(error, `pull of current price`));
            else this.adapter.log.warn(this.generateErrorMessage(error, `pull of current price`));
            return false;
        }
        return false;
    }
    */
    /**
     * updates lists of todays prices of all homes
     *
     * @param homeInfoList - homeInfo list object
     * @param forceUpdate - OPTIONAL: force mode, without verification if existing data is fitting to current date, default: false
     * @returns okprice - got correct data
     */
    /*
    async updatePricesTodayAllHomes(homeInfoList: IHomeInfo[], forceUpdate = false): Promise<boolean> {
        let okprice = true;
        for (const curHomeInfo of homeInfoList) {
            if (!curHomeInfo.PriceDataPollActive) continue;
            if (!(await this.updatePricesToday(curHomeInfo.ID, forceUpdate))) {
                okprice = false;
            } else {
                const now = new Date();
                this.checkAndSetValue(this.getStatePrefix(curHomeInfo.ID, "PricesToday", "lastUpdate"), now.toString(), `last update of prices today`);
            }
        }
        return okprice;
    }
    */
    /**
     * updates list of todays prices of one home
     *
     * @param homeId - homeId string
     * @param forceUpdate - OPTIONAL: force mode, without verification if existing data is fitting to current date, default: false
     * @returns okprice - got correct data
     */
    /*
    private async updatePricesToday(homeId: string, forceUpdate = false): Promise<boolean> {
        try {
            let exDate: Date | null = null;
            let exPricesToday: IPrice[] = [];
            if (!forceUpdate) {
                exPricesToday = JSON.parse(await this.getStateValue(`Homes.${homeId}.PricesToday.json`));
            }
            if (Array.isArray(exPricesToday) && exPricesToday[2] && exPricesToday[2].startsAt) {
                exDate = new Date(exPricesToday[2].startsAt);
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0); // sets clock to 0:00
            if (!exDate || exDate <= today || forceUpdate) {
                const pricesToday = await this.tibberQuery.getTodaysEnergyPrices(homeId);
                if (!(Array.isArray(pricesToday) && pricesToday.length > 0 && pricesToday[2] && pricesToday[2].total)) {
                    throw new Error(`Got invalid data structure from Tibber [you might not have a valid (or fully confirmed) contract]`);
                }
                this.adapter.log.debug(`Got prices today from tibber api: ${JSON.stringify(pricesToday)} Force: ${forceUpdate}`);
                this.checkAndSetValue(this.getStatePrefix(homeId, "PricesToday", "json"), JSON.stringify(pricesToday), "The prices today as json"); // write also it might be empty
                this.fetchPriceRemainingAverage(homeId, `PricesToday.averageRemaining`, pricesToday);
                this.fetchPriceMinimum(
                    homeId,
                    `PricesToday.minimum`,
                    pricesToday.sort((a, b) => a.total - b.total),
                );
                for (const i in pricesToday) {
                    const price = pricesToday[i];
                    const hour = new Date(price.startsAt.substr(0, 19)).getHours();
                    await this.fetchPrice(homeId, `PricesToday.${hour}`, price);
                }
                if (Array.isArray(pricesToday) && pricesToday[2] && pricesToday[2].startsAt) {
                    this.checkAndSetValue(
                        this.getStatePrefix(homeId, "PricesToday", "jsonBYpriceASC"),
                        JSON.stringify(pricesToday.sort((a, b) => a.total - b.total)),
                        "prices sorted by cost ascending as json",
                    );
                    exDate = new Date(pricesToday[2].startsAt);
                    if (exDate && exDate >= today) {
                        return true;
                    }
                } else {
                    // Handle the case when pricesToday is not an array, it's empty!, so just don't sort and write
                    this.checkAndSetValue(
                        this.getStatePrefix(homeId, "PricesToday", "jsonBYpriceASC"),
                        JSON.stringify(pricesToday),
                        "prices sorted by cost ascending as json",
                    );
                    return false;
                }
            } else {
                this.adapter.log.debug(`Existing date (${exDate}) of price info is already the today date, polling of prices today from Tibber skipped`);
                return true;
            }
        } catch (error: any) {
            if (forceUpdate) this.adapter.log.error(this.generateErrorMessage(error, `force pull of prices today`));
            else this.adapter.log.warn(this.generateErrorMessage(error, `pull of prices today`));
            return false;
        }
        return false;
    }
    */
    /**
     * updates lists of tomorrows prices of all homes
     *
     * @param homeInfoList - homeInfo list object
     * @param forceUpdate - OPTIONAL: force mode, without verification if existing data is fitting to current date, default: false
     * @returns okprice - got correct data
     */
    /*
    async updatePricesTomorrowAllHomes(homeInfoList: IHomeInfo[], forceUpdate = false): Promise<boolean> {
        let okprice = true;
        for (const curHomeInfo of homeInfoList) {
            if (!curHomeInfo.PriceDataPollActive) continue;
            if (!(await this.updatePricesTomorrow(curHomeInfo.ID, forceUpdate))) {
                okprice = false; // single fault sets all false
            } else {
                const now = new Date();
                this.checkAndSetValue(this.getStatePrefix(curHomeInfo.ID, "PricesTomorrow", "lastUpdate"), now.toString(), `last update of prices tomorrow`);
            }
        }
        return okprice;
    }
    */
    /**
     * updates list of tomorrows prices of one home
     *
     * @param homeId - homeId string
     * @param forceUpdate - OPTIONAL: force mode, without verification if existing data is fitting to current date, default: false
     * @returns okprice - got new data
     */
    /*
    private async updatePricesTomorrow(homeId: string, forceUpdate = false): Promise<boolean> {
        try {
            let exDate: Date | null = null;
            let exPricesTomorrow: IPrice[] = [];
            if (!forceUpdate) {
                exPricesTomorrow = JSON.parse(await this.getStateValue(`Homes.${homeId}.PricesTomorrow.json`));
            }
            if (Array.isArray(exPricesTomorrow) && exPricesTomorrow[2] && exPricesTomorrow[2].startsAt) {
                exDate = new Date(exPricesTomorrow[2].startsAt);
            }
            const morgen = new Date();
            morgen.setDate(morgen.getDate() + 1);
            morgen.setHours(0, 0, 0, 0); // sets clock to 0:00
            if (!exDate || exDate < morgen || forceUpdate) {
                const pricesTomorrow = await this.tibberQuery.getTomorrowsEnergyPrices(homeId);
                this.adapter.log.debug(`Got prices tomorrow from tibber api: ${JSON.stringify(pricesTomorrow)} Force: ${forceUpdate}`);
                this.checkAndSetValue(this.getStatePrefix(homeId, "PricesTomorrow", "json"), JSON.stringify(pricesTomorrow), "The prices tomorrow as json"); // write also it might be empty
                if (pricesTomorrow.length === 0) {
                    // pricing not known, before about 13:00 - delete all the states
                    this.adapter.log.debug(`Emptying prices tomorrow and average cause existing ones are obsolete...`);
                    this.emptyingPriceAverage(homeId, `PricesTomorrow.average`);
                    this.checkAndSetValue(
                        this.getStatePrefix(homeId, "PricesTomorrow", "jsonBYpriceASC"),
                        JSON.stringify(pricesTomorrow),
                        "prices sorted by cost ascending as json",
                    );
                    return false;
                } else if (Array.isArray(pricesTomorrow)) {
                    // pricing known, after about 13:00 - write the states
                    this.checkAndSetValue(
                        this.getStatePrefix(homeId, "PricesTomorrow", "jsonBYpriceASC"),
                        JSON.stringify(pricesTomorrow.sort((a, b) => a.total - b.total)),
                        "prices sorted by cost ascending as json",
                    );
                    exDate = new Date(pricesTomorrow[2].startsAt);
                    if (exDate && exDate >= morgen) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else if (exDate && exDate >= morgen) {
                this.adapter.log.debug(`Existing date (${exDate}) of price info is already the tomorrow date, polling of prices tomorrow from Tibber skipped`);
                return true;
            }
            return false;
        } catch (error: any) {
            if (forceUpdate) this.adapter.log.error(this.generateErrorMessage(error, `force pull of prices tomorrow`));
            else this.adapter.log.warn(this.generateErrorMessage(error, `pull of prices tomorrow`));
            return false;
        }
    }
    */
    /**
     * Updates the list of tomorrow's prices for one home.
     *
     * @param homeId - The unique identifier of the home.
     * @param objectDestination - The destination object for storing price data.
     * @param price - The price object containing price information.
     * @returns Promise<void> - Resolves when the price data is successfully fetched and updated.
     */
    /*
    private async fetchPrice(homeId: string, objectDestination: string): Promise<void> {
        await this.checkAndSetValueNumber(this.getStatePrefix(homeId, objectDestination, "total"), price.total, "Total price (energy + taxes)");
        this.checkAndSetValueNumber(this.getStatePrefix(homeId, objectDestination, "energy"), price.energy, "Spotmarket energy price");
        this.checkAndSetValueNumber(this.getStatePrefix(homeId, objectDestination, "tax"), price.tax, "Tax part of the price (energy, tax, VAT...)");
        this.checkAndSetValue(this.getStatePrefix(homeId, objectDestination, "startsAt"), price.startsAt, "Start time of the price");
        this.checkAndSetValue(this.getStatePrefix(homeId, objectDestination, "level"), price.level, "Price level compared to recent price values");
    }
    */
    emptyingPriceAverage(homeId, objectDestination) {
        this.checkAndSetValueNumber(this.getStatePrefix(homeId, objectDestination, "total"), 0, "The todays total price average");
        this.checkAndSetValueNumber(this.getStatePrefix(homeId, objectDestination, "energy"), 0, "The todays avarage spotmarket price");
        this.checkAndSetValueNumber(this.getStatePrefix(homeId, objectDestination, "tax"), 0, "The todays avarage tax price");
    }
    /*****************************************************************************************/
    async HandleConnectionError(stError, sOccasion, sErrorOccInt) {
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
        }
        else if (stError.code) {
            //get error code
            switch (stError.code) {
                case "ETIMEDOUT":
                    this.adapter.log.warn(`Connection timeout error when calling ${sOccasion}`);
                    this.adapter.log.warn(`Please verify the API Token or adapt yout poll interval, (e${sErrorOccInt}.2)`);
                    break;
                case "EHOSTUNREACH":
                    this.adapter.log.warn(`TeslaFi not reachable error when calling ${sOccasion}`);
                    this.adapter.log.warn(`Please verify yout network environment, (e${sErrorOccInt}.2)`);
                    break;
                case "ENETUNREACH":
                    this.adapter.log.warn(`Inverter network not reachable error when calling ${sOccasion}`);
                    this.adapter.log.warn(`Please verify yout network environment, (e${sErrorOccInt}.2)`);
                    break;
            }
            // errors: 'Unexpected end of JSON input' 'read ECONNRESET' 'connect ECONNREFUSED 192.168.0.1:80'
        }
        else {
            this.adapter.log.error(`Unknown error when calling ${sOccasion}: ${stError.message}`);
            this.adapter.log.error(`Please verify the API Token or adapt yout poll interval, (e${sErrorOccInt}.3)`);
            if (this.adapter.supportsFeature && this.adapter.supportsFeature("PLUGINS")) {
                // send Sentry error
                const sentryInstance = this.adapter.getPluginInstance("sentry");
                if (sentryInstance) {
                    const oldError = await this.adapter.getStateAsync("LastSentryLoggedError");
                    if (oldError?.val != stError.message) {
                        // if new error
                        const Sentry = sentryInstance.getSentryObject();
                        const date = new Date();
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        Sentry &&
                            Sentry.withScope((scope) => {
                                scope.setLevel("info");
                                scope.setTag("Hour of event", date.getHours());
                                Sentry.captureMessage(`Catched error: ${stError.message}`, "info");
                            });
                        this.adapter.setState("LastSentryLoggedError", { val: stError.message, ack: true });
                    }
                }
            }
        }
    }
}
exports.TeslaFiAPICaller = TeslaFiAPICaller;
//# sourceMappingURL=teslafiAPICaller.js.map