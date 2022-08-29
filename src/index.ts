
import puppeteer from 'puppeteer';
import options from './utils/utils-options';
import screenshot from './utils/utils-screenshot';
import { log } from './utils/index';
import { Options } from './utils/types';
import chalk from 'chalk';

/**
 * 执行截图
 */
(async () => {
    try {
        log.green('====> 创建浏览器, 任务开始', options.url);
        const startTime = Date.now();
        const browser = await puppeteer.launch({
            // devtools: true
            args: ['--disable-web-security'],
        });
        await screenshot(browser, options as Options);
        const lifecycle = chalk.bgGreen('耗时' + ((Date.now() - startTime) / 1000).toFixed(3) + '秒');
        log.green('====> 关闭浏览器，任务完成', lifecycle, options.outfile);
        await browser.close();
    } catch (error: any) {
        log.red('====> 异常关闭浏览器', error.message);
        process.exit(1);
    }
})();
