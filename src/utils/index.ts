import puppeteer, { PuppeteerLifeCycleEvent } from 'puppeteer';
import chalk from 'chalk';
import options from './utils-options';

export class log {
    constructor(...args: any[]) {
        console.log(...args);
    }
    static red(...args: any[]) {
        console.log(chalk.red(args[0]), ...args.slice(1));
    }
    static blue(...args: any[]) {
        options.log && console.log(chalk.blue(args[0]), ...args.slice(1));
    }
    static yellow(...args: any[]) {
        console.log(chalk.yellow(args[0]), ...args.slice(1));
    }
    static green(...args: any[]) {
        console.log(chalk.green(args[0]), ...args.slice(1));
    }
}

export const computedDevice = (deviceName = 'PC', width = 1600, height = 900) => {
    const isMobile = width <= 1366;
    const isLandscape = width >= height;

    const PC = {
        name: 'PC',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
        viewport: {
            width: width,
            height: height,
            deviceScaleFactor: isMobile ? 2 : 1,
            isMobile: isMobile,
            hasTouch: isMobile,
            isLandscape: isLandscape,
        },
    };
    return puppeteer.devices[deviceName] || PC;
};

/**
 * 页面加载策略
 * load              // 等待 “load” 事件触发
 * domcontentloaded  // 等待 “domcontentloaded” 事件触发
 * networkidle0      // 在 500ms 内没有任何网络连接
 * networkidle2      // 在 500ms 内网络连接个数不超过 2 个
 */
export const loadLevelConfig: Record<number, { waitUntil: PuppeteerLifeCycleEvent[] }> = {
    4: {
        waitUntil: ['load', 'networkidle0'],
    },
    3: {
        waitUntil: ['load', 'networkidle2'],
    },
    2: {
        waitUntil: ['load'],
    },
    1: {
        waitUntil: ['domcontentloaded'],
    },
};

export const waitTime = (milliseconds: number) => new Promise(r => setTimeout(r, milliseconds));
