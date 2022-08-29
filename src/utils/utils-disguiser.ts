import { Page } from 'puppeteer';
export default async function disguiser(page: Page) {
    await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        const newProto = navigator.__proto__;
        // @ts-ignore
        delete newProto.webdriver;
        // @ts-ignore
        navigator.__proto__ = newProto;
        // @ts-ignore
        window.navigator.chrome = { runtime: {} };
    });
}
