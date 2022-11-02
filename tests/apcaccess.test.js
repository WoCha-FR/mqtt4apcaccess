/* eslint-disable no-undef,no-new,camelcase */
const APCaccess = require('../lib/apcaccess')
const logger = require('../lib/logs')
const { eventEmitter } = require('../lib/utils')

const apcHost = '127.0.0.1'
const apcTime = 15
const sample = { apc: '001,032,0784', hostname: 'haut', upsname: 'haut', cable: 'USB Cable', driver: 'USB UPS Driver', upsmode: 'Stand Alone', model: 'Amazon400', status: 'ONLINE', bcharge: '100.0', timeleft: '37.0' }
const badsample = { apc: '001,032,0784', hostname: 'haut', upsname: 'hatu', cable: 'USB Cable', driver: 'USB UPS Driver', upsmode: 'Stand Alone', model: 'Amazon400', status: 'ONLINE', bcharge: '100.0', timeleft: '37.0' }

describe('Create APCAccess', () => {
  test('should throw error if no application id is provided', () => {
    expect(() => { new APCaccess(null) }).toThrowError(new Error('An host must be provided'))
  })
  test('should return a new instance of APCaccess with valid parameters', () => {
    const myclient = new APCaccess(apcHost, apcTime)
    expect(myclient.host).toStrictEqual(apcHost)
    expect(myclient.interval).toStrictEqual(apcTime)
  })
})

describe('Specific functions', () => {
  let myclient

  describe('Shell function', () => {
    beforeAll(async () => {
      myclient = new APCaccess(apcHost, apcTime)
    })

    test('exec should throw an error on invalid command', async () => {
      expect.assertions(1)
      await expect(myclient.execShellCommand('lsa')).rejects.toEqual(expect.stringMatching(/^Error: Command failed: /))
    })
    test('exec may return good value', async () => {
      expect.assertions(1)
      await expect(myclient.execShellCommand('uname')).resolves.toEqual('Linux\n')
    })
  })

  describe('Test Frame Equal', () => {
    beforeAll(async () => {
      myclient = new APCaccess(apcHost, apcTime)
    })

    test('should return false', () => {
      myclient.previousFrame = sample
      myclient.currentFrame = badsample
      const result = myclient.isSameFrame()
      expect(result).toBeFalsy()
    })
    test('Should return true', () => {
      myclient.previousFrame = sample
      myclient.currentFrame = sample
      const result = myclient.isSameFrame()
      expect(result).toBeTruthy()
    })
  })

  describe('Process Data', () => {
    const apcData = 'APC      : 001,032,0784\nHOSTNAME : haut\nUPSNAME  : haut\nCABLE    : USB Cable\nDRIVER   : USB UPS Driver\nUPSMODE  : Stand Alone\nMODEL    : Amazon400\nSTATUS   : ONLINE\nLOADPCT  : 16.0\nBCHARGE  : 100.0\nOUTPUTV  : 233.0\nEND APC  : 2022-09-27 23:05:03 +0200\n'
    beforeAll(async () => {
      myclient = new APCaccess(apcHost, apcTime)
    })

    test('shoulg log a warn on incorrect frame', () => {
      const spy1 = jest.spyOn(logger, 'warn')
      myclient.processData('APC      : 001,032,0784\nHOSTNAME : haut\nUPSNAME  : haut\nCABLE    : USB Cable\nDRIVER   :\nUPSMODE  : Stand Alone\nMODEL    : Amazon400\nSTATUS   : ONLINE\nLOADPCT  : 16.0\nBCHARGE  : 100.0\nEND APC  : 2022-09-27 23:05:03 +0200\n')
      expect.assertions(1)
      expect(spy1).toHaveBeenCalledWith('Corrupted line received [DRIVER   :]')
    })
    test('frame event is emited correctly', () => {
      const spy1 = jest.spyOn(eventEmitter, 'emit').mockImplementation(() => {})
      myclient.processData(apcData)
      expect(spy1).toHaveBeenCalledWith('frame', { apc: '001,032,0784', bcharge: '100.0', cable: 'USB Cable', driver: 'USB UPS Driver', hostname: 'haut', loadpct: '16.0', model: 'Amazon400', outputv: '233.0', status: 'ONLINE', upsmode: 'Stand Alone', upsname: 'haut' })
    })
  })

  describe('Poller', () => {
    beforeAll(async () => {
      myclient = new APCaccess(apcHost, apcTime)
      jest.useFakeTimers()
    })

    test('pollData may run with no errors', async () => {
      const apcData = 'APC      : 001,032,0784\nHOSTNAME : haut\nUPSNAME  : haut\nCABLE    : USB Cable\nDRIVER   : USB UPS Driver\nUPSMODE  : Stand Alone\nMODEL    : Amazon400\nSTATUS   : ONLINE\nLOADPCT  : 16.0\nBCHARGE  : 100.0\nOUTPUTV  : 233.0\nEND APC  : 2022-09-27 23:05:03 +0200\n'
      const mock1 = jest.spyOn(myclient, 'execShellCommand').mockImplementation(() => apcData)
      const spy1 = jest.spyOn(myclient, 'processData')
      await expect(async () => { await myclient.pollData() }).not.toThrow()
      expect(spy1).toHaveBeenCalledWith(apcData)
      mock1.mockRestore()
    })

    test('startPolling may start and stop correctly', async () => {
      const apcData = 'APC      : 001,032,0784\nHOSTNAME : haut\nUPSNAME  : haut\nCABLE    : USB Cable\nDRIVER   : USB UPS Driver\nUPSMODE  : Stand Alone\nMODEL    : Amazon400\nSTATUS   : ONLINE\nLOADPCT  : 16.0\nBCHARGE  : 100.0\nOUTPUTV  : 233.0\nEND APC  : 2022-09-27 23:05:03 +0200\n'
      const mock1 = jest.spyOn(myclient, 'execShellCommand').mockImplementation(() => apcData)
      const spy1 = jest.spyOn(global, 'setInterval')
      const spy2 = jest.spyOn(global, 'clearInterval')
      await myclient.startPolling()
      expect(spy1).toHaveBeenLastCalledWith(expect.any(Function), 15000)
      process.emit('SIGTERM')
      process.emit('SIGINT')
      expect(spy2).toHaveBeenCalled()
      mock1.mockRestore()
    })
  })
})
