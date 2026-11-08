import { strict as assert } from "node:assert";
import type * as utils from "@iobroker/adapter-core";
import axios from "axios";
import type { TeslaFiAPICaller as APICaller } from "./teslafiAPICaller";

// Install a mock HTTP adapter before loading the caller's private axios instance.
// No request (including command requests) can reach TeslaFi in these tests.
let TeslaFiAPICaller: typeof APICaller;
let responseData: string;
let requestedUrls: string[];

describe("TeslaFi optional encoding", () => {
	before(() => {
		const originalAdapter = axios.defaults.adapter;
		axios.defaults.adapter = config => {
			requestedUrls.push(config.url ?? "");
			return Promise.resolve({ data: responseData, status: 200, statusText: "OK", headers: {}, config });
		};
		try {
			// Deferred CommonJS load lets axios.create capture the mock before module initialization.
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			({ TeslaFiAPICaller } = require("./teslafiAPICaller") as { TeslaFiAPICaller: typeof APICaller });
		} finally {
			axios.defaults.adapter = originalAdapter;
		}
	});

	let caller: APICaller;
	let states: Map<string, unknown>;
	let errors: string[];
	beforeEach(() => {
		responseData = JSON.stringify({ display_name: "Test car", time_to_full_charge: null });
		requestedUrls = [];
		states = new Map();
		errors = [];
		const adapter = {
			config: { TeslaFiAPIToken: "dummy-test-token", UpdateTimeout: 5000, geofences: [] },
			log: { debug: () => {}, warn: () => {}, error: (message: string) => errors.push(message) },
			setObjectNotExistsAsync: async () => {},
			extendObject: async () => {},
			setState: (id: string, state: { val: unknown }) => {
				states.set(id, state.val);
				return Promise.resolve();
			},
		} as unknown as utils.AdapterInstance;
		caller = new TeslaFiAPICaller(adapter);
	});

	for (const useEncoding of [true, false, undefined]) {
		it(`uses the expected data URL with UseEncoding=${useEncoding}`, async () => {
			if (useEncoding !== undefined) {
				caller.adapter.config.UseEncoding = useEncoding;
			}
			assert.equal(await caller.ReadTeslaFi(), true, errors.join("; "));
			assert.deepEqual(requestedUrls, [`https://www.teslafi.com/feed.php?token=dummy-test-token&command=${useEncoding === true ? "&encoding=1" : ""}`]);
			assert.deepEqual(errors, []);
		});

		it(`leaves command parameters unchanged with UseEncoding=${useEncoding}`, async () => {
			if (useEncoding !== undefined) {
				caller.adapter.config.UseEncoding = useEncoding;
			}
			responseData = JSON.stringify({ response: { result: true, reason: "" }, time_to_full_charge: null });
			assert.equal(await caller.ReadTeslaFi("set_charge_limit&charge_limit_soc=80"), true, errors.join("; "));
			assert.deepEqual(requestedUrls, ["https://www.teslafi.com/feed.php?token=dummy-test-token&command=set_charge_limit&charge_limit_soc=80"]);
			assert.deepEqual(errors, []);
		});
	}

	for (const useEncoding of [true, false]) {
		for (const escaped of [false, true]) {
			it(`preserves raw JSON and special characters (encoding=${useEncoding}, escaped=${escaped})`, async () => {
				caller.adapter.config.UseEncoding = useEncoding;
				const name = 'Grüße ÄÖÜ äöü ß 🚗 "Tesla" & <car> %20 + \\';
				const raw = JSON.stringify({ display_name: name, time_to_full_charge: null });
				responseData = escaped ? raw.replace(/[\u0080-\uffff]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`) : raw;
				assert.equal(await caller.ReadTeslaFi(), true, errors.join("; "));
				assert.equal(states.get("vehicle-data.rawJSON"), responseData);
				assert.equal(states.get("vehicle-data.display_name"), name);
				assert.deepEqual(errors, []);
			});
		}
	}
});
