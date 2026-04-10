![Logo](admin/teslafi.png)

# ioBroker.teslafi

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.teslafi.svg?color=red&label=beta)
![Stable](https://iobroker.live/badges/teslafi-stable.svg)
![Installed](https://iobroker.live/badges/teslafi-installed.svg)

[![NPM](https://nodei.co/npm/iobroker.teslafi.png?downloads=true)](https://nodei.co/npm/iobroker.teslafi/)

# ioBroker TeslaFi Adapter – Seamless Tesla Data Integration for Your Smart Home

The TeslaFi adapter enables effortless integration of vehicle data from your TeslaFi account into the ioBroker system. Leverage this data to enhance your Tesla experience and optimize home automation workflows.

## Changelog - OLD CHANGES

### 1.5.0 (2025-04-14)

- (hombach) add set HVAC temperature (#121)
- (hombach) acknowledge commands after sending to TeslaFi
- (hombach) add commands count state (#127)
- (hombach) add set seat heater commands (#121)

### 1.4.0 (2025-03-31)

- (hombach) add charge limit commands (#121)
- (hombach) add statevalue range to projectUtils

### 1.3.0 (2025-03-30)

- (hombach) add stop HVAC command (#121)
- (hombach) add start/stop charging command (#121)

### 1.2.2 (2025-03-11)

- (hombach) fix "Invalid time value" error (#115)
- (hombach) fix vulnerability in axios <1.8.2

### 1.2.1 (2025-03-06)

- (hombach) bump dependencies

### 1.2.0 (2025-02-23)

- (hombach) change to admin 7.4.10 as recommended by ioBroker (#102)

### 1.1.2 (2025-02-22)

- (hombach) added @alcalzone/release-script (#97)
- (hombach) bump @iobroker/adapter-dev to 1.4.0 (#104)
- (hombach) fix error in config (#106)

### 1.1.1 (2025-02-01)

- (hombach) fix deletion of newversion (#93)

### 1.1.0 (2025-01-23)

- (hombach) deprecated object calls removed
- (hombach) add start HVAC command and commands tab (#36)

### 1.0.1 (2025-01-11)

- (hombach) year 2025 changes
- (hombach) code optimizations
- (hombach) bump typescript

### 1.0.0 (2024-12-25)

- (hombach) set version to 1.0 for stable release
- (hombach) add newVersionStatus (#80)
- (hombach) add configurable poll timeout

### 0.4.6 (2024-12-21)

- (hombach) fix chai-as-promised
- (hombach) enrich documentation

### 0.4.5 (2024-12-11)

- (hombach) change some state roles

### 0.4.4 (2024-12-10)

- (hombach) add roles to projectUtils

### 0.4.3 (2024-12-09)

- (hombach) use of ioBroker.setInterval

### 0.4.2 (2024-12-06)

- (hombach) intruduce i18n for translations (#41)

### 0.4.1 (2024-11-28)

- (hombach) intruduce 'iobroker/eslint-config' (#67)
- (hombach) add axios timeout
- (hombach) optimized code stability
- (hombach) remove message handler

### 0.4.0 (2024-11-10)

- (hombach) implement managed charging time (#29)
- (hombach) implement battery range
- (hombach) fixed errors in 'time to finish charge'
- (hombach) changed min update interval to 10 sec

### 0.3.0 (2024-11-08)

- (hombach) implement string for time to finish charge (#42)
- (hombach) reorganize data in folders (#43)
- (hombach) show 3rd row seat heater only if 3rd row is available (#40)
- (hombach) implement 'charging_state' (#37)

### 0.2.1 (2024-11-08)

- (hombach) change 'time_to_full_charge' type to number (#38)
- (hombach) total rework of vehicle data parser
- (hombach) set speed to 0 if null in API data (#39)

### 0.2.0 (2024-11-07)

- (hombach) implement raw data state (#26)
- (hombach) implement charger_phases (#28)
- (hombach) implement driver_temp_setting (#31)
- (hombach) implement seat and steeringwheel heater states (#30)

### 0.1.5 (2024-11-06)

- (hombach) harmonize project tools
- (hombach) removed doubled texts in state names

### 0.1.4 (2024-11-01)

- (hombach) fix conversion error

### 0.1.3 (2024-10-30)

- (hombach) fix typo in error text
- (hombach) optimize responsive design

### 0.1.2 (2024-10-28)

- (hombach) introduce to ioBroker latest repo

### 0.1.1 (2024-10-26)

- (hombach) fix npm error

### 0.1.0 (2024-10-26)

- (hombach) first working version

### 0.0.1 (2024-10-24)

- (hombach) initial release
