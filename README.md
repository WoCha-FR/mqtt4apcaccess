# mqtt4apcaccess

![npm](https://img.shields.io/npm/v/mqtt4apcaccess)
![License](https://img.shields.io/github/license/WoCha-FR/mqtt4apcaccess)
[![Build Status](https://app.travis-ci.com/WoCha-FR/mqtt4apcaccess.svg?branch=main)](https://app.travis-ci.com/WoCha-FR/mqtt4apcaccess)
[![Coverage Status](https://coveralls.io/repos/github/WoCha-FR/mqtt4apcaccess/badge.svg?branch=main)](https://coveralls.io/github/WoCha-FR/mqtt4apcaccess?branch=main)
![npm](https://img.shields.io/npm/dt/mqtt4apcaccess)

Publish values from apcaccess to MQTT

## Prerequisites

1. Apcacces binary installed *(eg: apt install apcupsd)*
2. An APC UPS Daemon has to run on a local or/and remote machine and has to be configured as network information server (NIS). For more information visit the apcupsd website.

* [APC UPS Daemon](http://www.apcupsd.org/) - The APC UPS Daemon
* [APC Access](http://www.apcupsd.org/manual/#apcaccess) - The apcaccess tool
* [APCUPSD NIS Example Configuration](http://www.apcupsd.org/manual/manual.html#nis-server-client-configuration-using-the-net-driver) - Howto configure the APCUPSD as NIS

## Installing

Simply install the package over npm. This will install all the required dependencies.

```
npm install -g mqtt4apcaccess
```

## Usage

```
Usage: mqtt4apcaccess [options]

Options:
  -a, --ups-hosts       upshost[:upsport]         [array] [default: "127.0.0.1"]
  -f, --poll-frequency  frequency of polling in sec      [number] [default: "5"]
  -u, --mqtt-url        mqtt broker url            [default: "mqtt://127.0.0.1"]
  -t, --mqtt-topic      mqtt topic prefix                 [default: "apcaccess"]
  -v, --log-verbosity   possible values: "error", "warn", "info", "debug" [default: "info"]
  -s, --ssl-verify      allow ssl connections with invalid certs
      --version         Show version number                            [boolean]
  -h, --help            Show help                                      [boolean]
```

### Example

#### Single UPS on localhost - mqtt broker on 192.168.5.1

```
mqtt4apcaccess -u mqtt://192.168.5.1
```

#### Two UPS in localnet - mqtt borker on localhost

```
mqtt4apcaccess -a 192.168.1.9 -a 192.168.1.10
```

## MQTT Frame Output

```
[apcaccess/UnRaid] {
  apc: '001,034,0825',
  date: '2022-09-28 14:18:39 +0200',
  hostname: 'UnRaid',
  upsname: 'UnRaid',
  cable: 'USB Cable',
  driver: 'USB UPS Driver',
  upsmode: 'Stand Alone',
  starttime: '2022-09-25 04:40:03 +0200',
  model: 'Back-UPS ES 550G',
  status: 'ONLINE',
  linev: '234.0',
  loadpct: '40.0',
  bcharge: '100.0',
  timeleft: '18.9',
  mbattchg: '10',
  mintimel: '10',
  maxtime: '0',
  sense: 'Medium',
  lotrans: '180.0',
  hitrans: '266.0',
  alarmdel: '30',
  battv: '13.6',
  lastxfer: 'Low line voltage',
  numxfers: '0',
  tonbatt: '0',
  cumonbatt: '0',
  battdate: '2019-06-07',
  nominv: '230',
  nombattv: '12.0',
  firmware: '870.O4 .I USB FW:O4'
}
```

## Versioning

mqtt4apcaccess is maintained under the [semantic versioning](https://semver.org/) guidelines.

See the [releases](https://github.com/WoCha-FR/mqtt4apcaccess/releases) on this repository for changelog.

## License

This project is licensed under MIT License - see the [LICENSE](LICENSE.md) file for details
