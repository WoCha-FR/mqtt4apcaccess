const yargs = require('yargs')

const config = yargs
  .usage('Usage: $0 [options]')
  .describe('a', 'upshost[:upsport]')
  .describe('f', 'frequency of polling in sec')
  .describe('u', 'mqtt broker url')
  .describe('t', 'mqtt topic prefix')
  .describe('v', 'possible values: "error", "warn", "info", "debug"')
  .describe('s', 'allow ssl connections with invalid certs')
  .alias({
    a: 'upsHosts',
    f: 'pollFrequency',
    u: 'mqttUrl',
    t: 'mqttTopic',
    v: 'logVerbosity',
    s: 'sslVerify',
    h: 'help'
  })
  .array('upsHosts')
  .number('pollFrequency')
  .boolean('sslVerify')
  .default({
    a: '127.0.0.1',
    f: '5',
    u: 'mqtt://127.0.0.1',
    t: 'apcaccess',
    v: 'info'
  })
  .version()
  .help('help')
  .strictOptions(true)
  .parserConfiguration({
    'camel-case-expansion': false,
    'strip-dashed': true
  })
  .argv

module.exports = config
