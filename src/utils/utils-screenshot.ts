import setRequest from './utils-request';
import getPageHeight from './utils-page-height';
import lazyloadImg from './utils-lazyload';
import disguiser from './utils-disguiser';
import setGeo from './utils-geo';
import onConsole from './utils-console';

import { log, loadLevelConfig, computedDevice, waitTime } from './index';
import { Options } from './types';
import { Browser, ElementHandle } from 'puppeteer';

async function screenshot(browser: Browser, options: Options, loadLevel = 4): Promise<any> {
    // ===== 加载用户配置 =====
    log.blue('====> 加载用户配置', JSON.stringify(options));
    const {
        // 用户配置
        url = '',
        outfile = '',
        waitfortime = 0,
        emulate = '',
        w = 0,
        h = 0,
    } = options;
    const { waitUntil } = loadLevelConfig[loadLevel];
    // ===== 创建新页面 =====
    log.blue('====> 创建新页面', loadLevel);
    const page = await browser.newPage();
    const deviceData = computedDevice(emulate, w, h);
    page.setDefaultNavigationTimeout(waitfortime);
    await page.emulate(deviceData);
    // ===== 防反爬处理 =====
    log.blue('====> 做防反爬处理');
    await disguiser(page);
    // ===== 地理位置的权限 =====
    log.blue('====> 设置地理位置');
    setGeo(browser, page, options);
    // ===== 监听浏览器输出 =====
    // log.blue('====> 监听浏览器控制台输出');
    // onConsole(page);
    // ===== 请求拦截/模拟IP代理 =====
    log.blue('====> 处理页面请求');
    setRequest(page, options);
    if (options.auth) {
        const [username, password] = options.auth.split(';');
        await page.authenticate({ username, password });
    }
    // ===== 加载页面链接 =====
    try {
        log.blue('====> 加载页面链接');
        await page.goto(decodeURIComponent(url), { waitUntil });
    } catch (error: any) {
        if (loadLevel - 1) {
            await page.close();
            return screenshot(browser, options, loadLevel - 1);
        } else {
            log.red('====> 任务失败', outfile, error.message);
            return false;
        }
    }
    // ===== 懒加载检测处理 =====
    log.blue('====> 懒加载检测处理', 1000);
    await waitTime(1000);
    const resList = (await page.evaluate(lazyloadImg, { timeout: 3000 })) as Record<string, boolean>[];
    const resTimeoutList = resList.filter(i => !i.success);
    resTimeoutList.length && log.yellow('====> 图片加载超时 3000 个数：' + resTimeoutList.length);
    // ===== 页面高度获取 =====
    const newHeight = await page.evaluate(getPageHeight);
    const { width, height } = deviceData.viewport;
    log.blue('====> 页面高度获取', { 视口高度: height, 页面高度: newHeight });
    if (newHeight > height) {
        // ===== 浏览器高度矫正 =====
        log.blue('====> 调整浏览器高度', { 宽度: width, 高度: newHeight });
        await page.setViewport({ width: width, height: newHeight }); // This is ignored
        // ===== 加载页面链接 =====
        try {
            log.blue('====> 页面重载');
            await page.reload({ waitUntil });
        } catch (error: any) {
            if (loadLevel - 1) {
                await page.close();
                return screenshot(browser, options, loadLevel - 1);
            } else {
                log.red('====> 重载失败', outfile, error.message);
                return false;
            }
        }
        // ===== 懒加载检测处理 =====
        log.blue('====> 再次懒加载渲染');
        await waitTime(1000);
        const resList2 = (await page.evaluate(lazyloadImg, { timeout: 3000 })) as Record<string, boolean>[];
        const resTimeoutList2 = resList2.filter(i => !i.success);
        resTimeoutList2.length && log.yellow('====> 图片加载超时 3000 个数：' + resTimeoutList2.length);
    }

    if (options.waitforselector) await page.waitForSelector(options.waitforselector);
    if (options.click) {
        await Promise.all([page.waitForNavigation(), page.click(options.click)]);
    }
    // ===== 页面截图导出 =====
    log.blue('====> 开始截图页面');
    // const $body = (await page.$('body')) as unknown as ElementHandle<Element>;
    return await page.screenshot({
        path: outfile,
        fullPage: options.fullpage,
        captureBeyondViewport: true,
    });
}
export default screenshot;
