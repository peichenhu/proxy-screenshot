import { Page } from 'puppeteer';
import { log } from './index';

export default function onConsole(page: Page) {
    page.on('console', function (message) {
        if (message.type() === 'error') {
            log.red(message.text());
        } else if (message.type() === 'log') {
            log.blue(message.text());
        }
    });
}
