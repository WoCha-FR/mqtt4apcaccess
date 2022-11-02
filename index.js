#!/usr/bin/env node
const config = require('./lib/config')
const logger = require('./lib/logs')
const MqttClient = require('./lib/mqtt')
const APCaccess = require('./lib/apcaccess')

/**
 * Main function.
 */
async function main () {
  const apcs = {}
  logger.info('Starting mqtt4apcaccess')
  logger.debug(JSON.stringify(config))
  try {
    // mqtt Client
    const mqtt = new MqttClient(config.mqttUrl, config.mqttTopic, config.sslVerify)
    await mqtt.connect()
    // APCaccess hosts
    for (let i = 0, len = config.upsHosts.length; i < len; i++) {
      apcs[i] = new APCaccess(config.upsHosts[i], config.pollFrequency)
      logger.info(`Get UPS data for ${config.upsHosts[i]}`)
      await apcs[i].startPolling()
    }
  } catch (e) {
    logger.error('Unable to run => See errors below')
    logger.error(e)
    process.exit(1)
  }
}
// Call the main code
main()
