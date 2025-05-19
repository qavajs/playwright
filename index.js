const adapter= require('@qavajs/playwright-runner-adapter');
const { QavajsPlaywrightWorld } = require('./lib/QavajsPlaywrightWorld');
const { QavajsPlaywrightElectronWorld } = require('./lib/QavajsPlaywrightElectronWorld.js');
const { locator } = require('./lib/pageObject');

module.exports = {
    ...adapter,
    QavajsPlaywrightWorld,
    QavajsPlaywrightElectronWorld,
    locator
}