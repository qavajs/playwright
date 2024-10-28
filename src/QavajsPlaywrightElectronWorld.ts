import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { _electron, ElectronApplication, test, WorkerInfo } from '@playwright/test';

type ElectronFixture = {
    browser: ElectronApplication
}

const electron = test.extend<ElectronFixture>({
    browser: async ({ }, use: (used: any) => Promise<void>, workerInfo: WorkerInfo) => {
        const options = workerInfo.project.use.launchOptions;
        const electron = await _electron.launch(options as any)
        await use(electron);
        await electron.close();
    },
    context: async ({ browser }, use) => {
        await use(browser.context());
    },
    page: async ({ browser}, use)=> {
        await use(await browser.firstWindow());
    }
});

export class QavajsPlaywrightElectronWorld extends QavajsPlaywrightWorld {
    test = electron;
    constructor(options: any) {
        super(options);
    }
}