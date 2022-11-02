const exec = require('child_process').exec
const _ = require('lodash')
const logger = require('./logs')
const { eventEmitter } = require('./utils')

class APCaccess {
  /**
   * Build a new APCaccess service.
   */
  constructor (host, interval = 5) {
    if (!host) {
      throw new Error('An host must be provided')
    }
    this.host = host
    this.interval = interval
    this.previousFrame = {}
    this.currentFrame = {}
    this.intervalId = null

    process.on('SIGTERM', () => clearInterval(this.intervalId))
    process.on('SIGINT', () => clearInterval(this.intervalId))
  }

  /**
   * Start the poller.
   */
  async startPolling () {
    // First polling
    await this.pollData()
    // Set interval polling
    this.intervalId = setInterval(this.pollData.bind(this), this.interval * 1000)
  }

  /**
   * Poll for new data.
   */
  async pollData () {
    try {
      const result = await this.execShellCommand('/sbin/apcaccess -u -h ' + this.host)
      this.processData(result)
    } catch (e) {
      if (!e.message) {
        throw new Error(`Exec apcaccess error [${e}]`)
      } else {
        throw new Error(`Exec apcaccess error [${e.message}]`)
      }
    }
  }

  /**
   * Process apcaccess data.
   * @param data
   */
  processData (data) {
    // Split data into lines
    const lines = data.trim().split('\n')
    // loop over every line
    for (let i = 0, len = lines.length; i < len; i++) {
      // Split line
      const lineItems = lines[i].split(': ')
      logger.debug(`Split frame [${lineItems.toString()}]`)
      if (lineItems.length < 2) {
        logger.warn(`Corrupted line received [${lineItems}]`)
        return
      }
      // Assign values
      const label = lineItems[0].toLowerCase().replace(/(^\s+|\s+$)/g, '')
      const value = lineItems[1].trim()
      logger.debug(`Value for label ${label} = ${value}`)
      // Frame end? -> Dispatch frame event
      if (label === 'end apc') {
        if (!this.isSameFrame()) {
          logger.debug(`Dispatch frame ${JSON.stringify(this.currentFrame)}`)
          eventEmitter.emit('frame', this.currentFrame)
        } else {
          logger.debug(`Ignoring identical frame ${JSON.stringify(this.currentFrame)}`)
        }
        return
      }
      // Frame start? -> Reset frame object
      if (label === 'apc') {
        this.previousFrame = this.currentFrame
        this.currentFrame = {}
      }
      // Add the new item to the current frame
      this.currentFrame[label] = value
    }
  }

  /**
   * Connect to the NISSERVER.
   * @param cmd
   * @return {Promise<unknown>}
   */
  async execShellCommand (cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error.toString())
        if (stderr) return reject(stderr.toString())
        resolve(stdout)
      })
    })
  }

  /**
   * Are previous & current frames equal?
   * @return {*|boolean}
   */
  isSameFrame () {
    return _.isEqual(this.currentFrame, this.previousFrame)
  }
}

module.exports = APCaccess
