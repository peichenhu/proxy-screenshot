import { Browser, Page } from 'puppeteer';
import { Options } from './types';

export default async function setGeo(browser: Browser, page: Page, options: Options) {
    const { url, geo } = options;
    const context = browser.defaultBrowserContext();
    const { origin } = new URL(decodeURIComponent(url));
    await context.overridePermissions(origin, ['geolocation']);
    geo && (await page.setGeolocation(geo)); // 地理位置设置 { longitude, latitude }
}
