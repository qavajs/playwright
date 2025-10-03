import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { _electron, Browser, BrowserContext, ElectronApplication, Page, test, WorkerInfo } from '@playwright/test';

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
    electron!: ElectronApplication;
    constructor(options: any) {
        super(options);
    }

    init = ({ browser, context, page }: { browser: ElectronApplication, context: BrowserContext, page: Page } ) => {
        this.browser = browser as unknown as Browser;
        this.electron = browser;
        this.context = context;
        this.page = page;
    }
}