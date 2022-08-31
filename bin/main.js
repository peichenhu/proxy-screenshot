#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { Command } = require('commander');
const { createCanvas, loadImage } = require('canvas');
const pkg = require('../package.json');

const program = new Command();
const TASK_ID = String(Math.random()).replace('0.', '');
const TASK_TIME_ID = chalk.bgGreen('任务完成');

program.name('ks-screenshot');
program.version(pkg.version);
program.option('--url, [url]', '使用 encodeURIComponent 处理过的链接');
program.option('--emulate, [emulate]', '浏览器模拟器, 空格使用下划线连字符代替, 例如: PC 或者 iPhone_6', 'iPhone_6');
program.option('--fullpage, [fullpage]', '是否要全屏', true);
program.option('--maxheight, [maxheight]', '页面最大支持高度', String(10000));
program.option('--w, [w]', '自定义宽度', String(0));
program.option('--h, [h]', '自定义高度', String(0));
program.option('--waitfortime, [waitfortime]', '等待时间，单位毫秒', String(10 * 1000));
program.option('--waitforselector, [waitforselector]', '等待选择器出现在页面中', 'body');
program.option('--auth, [auth]', '基本 HTTP 身份验证,例如： username;password', '');
program.option('--cookies, [cookies]', '页面预设置cookie数据, 例如: JSON.stringify([{name, value, domain, url}]) ', '[]');
program.option('--ip, [ip]', '模拟代理IP,例如: 武汉 27.18.198.204', '');
program.option('--geo, [geo]', '模拟地理定位,例如: 武汉 114,30', '');
program.option('--outfile, [outfile]', '输出图像文件, 格式 JPEG, 默认 "./output/[url.hostname][hash].jpg"', '');
program.option('--quality, [quality]', '输出图像文件品质, ', '100');
program.option('--log', '输出实时进度');
program.action(options => {
    // ===== geo =====
    try {
        if (options.geo) {
            const [longitude, latitude] = options.geo.split(',').map(i => +i);
            if (isNaN(longitude) || isNaN(latitude) || longitude === 0 || latitude === 0) {
                console.log('参数 --geo 模拟地理定位配置有误');
                process.exit();
            }
            options.geo = { longitude, latitude };
        }
    } catch (error) {
        console.log('参数 --geo 模拟地理定位配置有误', error.message);
        process.exit();
    }
    // ===== url =====
    try {
        if (!options.url) {
            console.log('参数 --url 网页链接是必填参数');
            process.exit();
        }
        options.url = new URL(decodeURIComponent(options.url)).href;
    } catch (error) {
        console.log('参数 --url 网页链接配置有误', error.message);
        process.exit();
    }
    // ===== outfile =====
    const outfile = options.outfile;
    if (!outfile) {
        const hostname = new URL(options.url).hostname;
        const filename = `output/${hostname}.${TASK_ID}.jpg`;
        const filePath = path.resolve(process.cwd(), filename);
        options.outfile = filePath;
    } else if (!outfile.endsWith('.png') || !outfile.endsWith('.jpg')) {
        console.log('参数 --outfile 配置有误, 文件输出格式应该为 jpg 或者 png');
        process.exit();
    } else {
        options.outfile = path.resolve(process.cwd(), outfile);
    }

    // ===== emulate =====
    const [username = 'admin', password = '123456'] = options.auth.split(',').filter(Boolean);
    options.auth = { username, password };
    // ===== emulate =====
    options.emulate = options.emulate.replace('_', ' ');
    // ===== number =====
    options.w = !isNaN(Number(options.w)) ? Number(options.w) : 0;
    options.h = !isNaN(Number(options.h)) ? Number(options.h) : 0;
    options.quality = !isNaN(Number(options.quality)) ? Number(options.quality) : 100;
    options.maxheight = !isNaN(Number(options.maxheight)) ? Number(options.maxheight) : 10000;
    options.waitfortime = !isNaN(Number(options.waitfortime)) ? Number(options.waitfortime) : 10000;
});
program.parse(process.argv);

const OPTIONS = program.opts();
// console.log(OPTIONS);

class log {
    constructor(...args) {
        console.log(...args);
    }
    static red(...args) {
        console.log(chalk.red(args[0]), ...args.slice(1));
    }
    static blue(...args) {
        OPTIONS.log && console.log(chalk.blue(args[0]), ...args.slice(1));
    }
    static yellow(...args) {
        OPTIONS.log && console.log(chalk.yellow(args[0]), ...args.slice(1));
    }
    static green(...args) {
        console.log(chalk.green(args[0]), ...args.slice(1));
    }
}

const WAIT_UNITL = {
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

const getDevices = (deviceName = 'PC', width = null, height = null) => {
    log.blue('设置模拟器设备', deviceName, width, height);

    const isMobile = deviceName !== 'PC';

    const PC = {
        name: 'PC',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
        viewport: {
            width: 1600,
            height: 900,
            deviceScaleFactor: isMobile ? 2 : 1,
            isMobile: isMobile,
            hasTouch: isMobile,
            isLandscape: !isMobile,
        },
    };
    const device = puppeteer.devices[deviceName] || PC;

    if (width) {
        device.viewport.width = width;
    }

    if (height) {
        device.viewport.height = height;
    }

    return device;
};

const pageGoto = async function (page, url, loadCode = 4) {
    const waitUntil = WAIT_UNITL[loadCode];
    log.blue('加载配置', waitUntil);
    try {
        await page.goto(url, waitUntil);
        return waitUntil;
    } catch (error) {
        log.yellow('加载错误', error.message);
        if (loadCode - 1) {
            return await pageGoto(page, url, loadCode - 1);
        } else {
            log.red('加载失败');
            return false;
        }
    }
};

const setDisguiser = async function disguiser(page) {
    log.blue('设置防反爬伪装');
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
};

const setGeo = async function setGeo(browser, page, options) {
    log.blue('设置地理定位', options.geo || '无');
    const { url, geo } = options;
    const context = browser.defaultBrowserContext();
    const { origin } = new URL(decodeURIComponent(url));
    await context.overridePermissions(origin, ['geolocation']);
    geo && (await page.setGeolocation(geo)); // 地理位置设置 { longitude, latitude }
};

const onPageConsole = async function (page) {
    log.blue('监听控制台输出');
    page.on('console', function (message) {
        if (message.type() === 'error') {
            // log.red('控制台输出', message.text());
        } else if (message.type() === 'log') {
            // log.blue('控制台输出', message.text());
        } else if (message.type() === 'warning') {
            // log.yellow('控制台输出', message.text());
        }
    });
};

const lazyLoad = async function (page) {
    log.blue('图片懒加载检测处理');
    await page.waitForTimeout(3000);
    const resList = await page.evaluate(
        function ({ timeout }) {
            const images = Array.from(document.querySelectorAll('img'));
            const loadImage = img => {
                const res = {
                    timeout,
                    success: true,
                    src: '',
                };
                return new Promise(resolve => {
                    res.src = img.src;
                    const timer = setTimeout(() => {
                        res.success = false;
                        resolve(res);
                    }, timeout);

                    if (img.complete) {
                        clearTimeout(timer);
                        resolve(res);
                    }
                    img.onload = () => {
                        clearTimeout(timer);
                        resolve(res);
                    };
                    img.onerror = () => {
                        res.success = false;
                        clearTimeout(timer);
                        resolve(res);
                    };
                });
            };
            return Promise.all(images.map(img => loadImage(img)));
        },
        { timeout: 5000 }
    );

    log.yellow('图片加载总量', resList.length);
    log.yellow('图片超时总量', resList.filter(i => !i.success).length);
};

const correctPageHeight = async function (page, emulate) {
    const { width, height } = emulate.viewport;
    let newHeight = await page.evaluate(function () {
        // ===== 获取页面真实高度 =====
        /**
         * 父亲：滚动容器 => 父亲:scrollHeight
         * 父亲：非滚动容器
         *      儿子: 非滚动容器 => => 父亲: scrollHeight
         *      儿子: 含滚动容器 => => 儿子们: scrollHeight （误差偏大）
         *
         */
        let maxHeight = 0;
        const getStyle = (el, style) => window.getComputedStyle(el).getPropertyValue(style);
        document.querySelectorAll('*').forEach(el => {
            const sh = Array.from(el.children).reduce((sh, child) => {
                const position = getStyle(child, 'position');
                const display = getStyle(child, 'display');
                if (position !== 'fixed' && position !== 'absolute' && display !== 'none') {
                    if (getStyle(child, 'overflow-y') === 'auto' || getStyle(child, 'overflow-y') === 'scroll') {
                        sh += child.scrollHeight;
                    } else {
                        sh += child.clientHeight;
                    }
                }
                return sh;
            }, 0);
            if (getStyle(el, 'overflow-y') === 'auto' || getStyle(el, 'overflow-y') === 'scroll') {
                maxHeight = Math.max(maxHeight, el.scrollHeight);
            } else {
                maxHeight = Math.max(maxHeight, sh);
            }
        });
        console.info(maxHeight);
        return maxHeight.toFixed(0);
    });
    newHeight = Math.max(newHeight, height);
    log.blue('矫正浏览器宽高', { 宽度: width, 高度: newHeight });
    await page.setViewport({ width: width, height: newHeight });
};

const setProxyIP = async function (page, options) {
    log.blue('模拟IP', options.ip || '无');
    await page.setRequestInterception(true);
    page.on('request', function (request) {
        const url = request.url();
        const api = new URL(url);
        const method = request.method();
        const headers = request.headers();
        // 资源请求
        const ext = ['.png', '.jpg', '.css', '.woff2', '.jpeg', '.webp', '.gif', '.js', '.json', '.svg'];
        const allow1 = api.protocol !== 'http:' && api.protocol !== 'https:';
        const allow2 = ext.some(ext => api.href.endsWith(ext));
        if (allow1 || allow2) {
            request.continue();
            return;
        }
        // 代理请求
        if (options.ip && ['GET', 'POST'].includes(method)) {
            const pageLink = new URL(decodeURIComponent(options.url));

            if (pageLink.hostname !== api.hostname || method === 'POST') {
                headers['origin'] = pageLink.origin; // 只有跨域请求或者同域时发送post请求，才会携带origin请求头。
            }

            if (pageLink.protocol === api.protocol) {
                headers['referer'] = pageLink.origin; // 同安全协议和非本地资源添加
            }

            headers['X-Forwarded-For'] = options.ip;
            request.continue({ headers });
            return;
        }

        request.continue();
    });
};

const setCookie = async function (page, options) {
    try {
        log.blue('设置 Cookie');
        const cookieList = JSON.parse(options.cookies);
        await page.setCookie(...cookieList);
    } catch (error) {
        log.yellow('设置 Cookie 失败');
    }
};

const clipImageEmpty = async function (imageBinary, maxHeight = Infinity, allowEmptyHeight = 100) {
    // 获取图像像素信息
    async function getImageDataByImage(image) {
        const { width, height } = image;
        const canvas = createCanvas(width, Math.min(maxHeight, height));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    }
    // 获取含有像素的色块区域Y轴区间列表
    async function getHasColorBlockList(imageData) {
        const hasColorBlockList = []; // 内容色块区域
        const maxBlocHeight = allowEmptyHeight; // 检测色块高度
        // 获取 x 行 y 列的像素
        function getPixel(imageData, x, y) {
            const i = x * imageData.width + y;
            return {
                r: imageData.data[4 * i + 0],
                g: imageData.data[4 * i + 1],
                b: imageData.data[4 * i + 2],
                a: imageData.data[4 * i + 3],
            };
        }
        function isEqualPixel(p1, p2) {
            return p1.r === p2.r && p1.g === p2.g && p1.b === p2.b && p1.a === p2.a;
        }
        // 遍历全部色块
        for (let i = 0; i < imageData.height; i += maxBlocHeight) {
            // 获取色块第一个像素
            const firstPixel = getPixel(imageData, i, 0);
            let isPureColorBlock = true;
            // 遍历色块的每一行
            for (let x = i; x < i + maxBlocHeight; x++) {
                for (let y = 0; y < imageData.width; y++) {
                    // 比较色块的所有像素
                    const pixel = getPixel(imageData, x, y);
                    // 存在差异色
                    if (!isEqualPixel(firstPixel, pixel)) {
                        // 不是纯色块
                        isPureColorBlock = false;
                        break;
                    }
                }
            }
            // 不是纯色块
            if (!isPureColorBlock) {
                let start = i;
                let end = i + maxBlocHeight - 1;
                end = end < imageData.height ? end : imageData.height;
                hasColorBlockList.push([start, end]);
            }
        }
        return hasColorBlockList;
    }
    // 获取一个去除空白高度区域的新 canvas
    // hasColorBlockList: [ block:[yAxis.start, yAxis.end] ]
    async function getCanvasOfClipWhiteBlock(hasColorBlockList = [[0, 0]], image, imgWidth) {
        const height = hasColorBlockList.reduce((height, yAxis) => {
            return (height += yAxis[1] - yAxis[0]);
        }, 0);
        const canvas = createCanvas(imgWidth, height);
        const ctx = canvas.getContext('2d');
        let drawHeight = 0; // 新画布已填充像素的高度
        hasColorBlockList.forEach(yAxis => {
            const sx = 0; // 源图像裁剪原点X坐标
            const sy = yAxis[0]; // 源图像裁剪原点Y坐标
            const sWidth = imgWidth; // 源图像裁剪宽度
            const sHeight = yAxis[1] - yAxis[0]; // 源图像裁剪高度
            const dx = 0; // 图像绘制原点X坐标
            const dy = drawHeight; // 图像绘制原点Y坐标
            const dWidth = imgWidth; // 图像绘制宽度
            const dHeight = yAxis[1] - yAxis[0]; // 图像绘制高度
            ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            drawHeight += sHeight;
        });
        return canvas;
    }
    const image = await loadImage(imageBinary);
    const imageData = await getImageDataByImage(image);
    const hasColorBlockList = await getHasColorBlockList(imageData);
    return await getCanvasOfClipWhiteBlock(hasColorBlockList, image, imageData.width);
};

const saveImageByCanvas = async function (canvas, imageName) {
    const out = fs.createWriteStream(imageName);
    if (imageName.endsWith('.png')) {
        canvas.createPNGStream().pipe(out);
    }
    if (imageName.endsWith('.jpg')) {
        canvas.createJPEGStream({ quality: 100 }).pipe(out);
    }
    return imageName;
};

/**
 * 输出文件夹预检查
 */
const OUT_DIR = path.resolve(process.cwd(), './output');
!fs.existsSync(OUT_DIR) && fs.mkdirSync(OUT_DIR);

/**
 * 主函数
 */

(async () => {
    console.time(TASK_TIME_ID);
    console.log(chalk.green('任务开始'), OPTIONS.url);

    const browser = await puppeteer.launch({
        devtools: false,
        args: ['--disable-web-security'],
    });
    const page = await browser.newPage();
    const emulate = getDevices(OPTIONS.emulate, OPTIONS.w, OPTIONS.h);
    page.setDefaultNavigationTimeout(1000);
    await page.authenticate(OPTIONS.auth);
    await page.emulate(emulate);
    await setCookie(page, OPTIONS);
    await onPageConsole(page);
    await setDisguiser(page);
    await setGeo(browser, page, OPTIONS);
    await setProxyIP(page, OPTIONS);

    const waitUntil = await pageGoto(page, OPTIONS.url);
    log.blue('页面加载是否成功 ?', !!waitUntil);

    await lazyLoad(page);
    await correctPageHeight(page, emulate);
    await lazyLoad(page);
    await correctPageHeight(page, emulate);
    await lazyLoad(page);
    const imgBinary = await page.screenshot({
        quality: OPTIONS.outfile.endsWith('.png') ? undefined : OPTIONS.quality,
        encoding: 'binary',
        type: OPTIONS.outfile.endsWith('.png') ? 'png' : 'jpeg',
        fullPage: OPTIONS.fullpage,
        captureBeyondViewport: OPTIONS.fullpage,
        // path: OPTIONS.outfile
    });

    const canvas = await clipImageEmpty(imgBinary, OPTIONS.maxheight);

    await saveImageByCanvas(canvas, OPTIONS.outfile);

    await page.close();

    await browser.close();

    console.timeEnd(TASK_TIME_ID);
})();
