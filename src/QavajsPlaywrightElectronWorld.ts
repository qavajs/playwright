import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { _electron, Browser, BrowserContext, ElectronApplication, Page, test, WorkerInfo } from '@playwright/test';

type ElectronFixture = {
    browser: ElectronApplication
}

type ElectronLaunchOptions = Parameters<typeof _electron.launch>[0];

const electron = test.extend<ElectronFixture>({
    // `use` is any because built-in `browser` fixture is typed as Browser, but electron app is provided instead
    // oxlint-disable-next-line no-empty-pattern -- Playwright fixtures require object destructuring
    browser: async ({ }, use: (electron: any) => Promise<void>, workerInfo: WorkerInfo) => {
        // electron launch options are provided via `use.launchOptions` of playwright project
        const options = workerInfo.project.use.launchOptions as ElectronLaunchOptions;
        const electron = await _electron.launch(options);
        await use(electron);
        await electron.close();
    },
    context: async ({ browser }, use) => {
        await use(browser.context());
    },
    page: async ({ browser }, use)=> {
        await use(await browser.firstWindow());
    }
});

export class QavajsPlaywrightElectronWorld extends QavajsPlaywrightWorld {
    test = electron;
    electron!: ElectronApplication;

    init = ({ browser, context, page }: { browser: ElectronApplication, context: BrowserContext, page: Page } ) => {
        this.browser = browser as unknown as Browser;
        this.electron = browser;
        this.context = context;
        this.page = page;
    }
}