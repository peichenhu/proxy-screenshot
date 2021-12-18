'use strict';
import { URL } from 'node:url';
import { createWriteStream } from 'node:fs';
import * as events from 'node:events';
import { Canvas, Image, createCanvas, loadImage } from 'canvas';
import type { Device, PuppeteerLifeCycleEvent } from 'puppeteer';
const puppeteer = require('puppeteer');
interface IPixel {
    r: number;
    g: number;
    b: number;
    a: number;
}
interface IOptions {
    width?: number;
    height?: number;
    link?: string;
    geo?: { longitude: number; latitude: number };
    ip?: string;
    maxHeight?: number;
    deviceName?: string;
    showProgress?: false;
    xff?: boolean;
}
class Browser {
    browser: any;
    constructor() {
        this.browser = null;
    }
    async screenshot(options: IOptions) {
        events.EventEmitter.defaultMaxListeners = 0; // 禁止 MaxListenersExceededWarning
        const { getDevice, getPageHeight, preloadImage, clipImageEmpty } = Browser;
        const {
            width = 375,
            height = 667,
            link = '',
            geo = { longitude: 0, latitude: 0 },
            ip = Array(4)
                .fill(1)
                .map(() => Math.ceil(Math.random() * 255))
                .join('.'),
            maxHeight = 667,
            deviceName = 'iPhone 6',
            showProgress = false,
            xff = true,
        } = options;
        let waitUntil: PuppeteerLifeCycleEvent[] = ['load', 'networkidle0'];
        const { devices } = puppeteer;
        const location = new URL(link);
        const start_time = Date.now();
        const uuid = location.host + '.' + start_time;
        const timeFlag = ('运行时间' + location.host + '.' + start_time).padEnd(60);
        const progress = (msg: string) => showProgress && console.log((msg + uuid).padEnd(40), ((Date.now() - start_time) / 1000).toFixed(5) + '秒');
        console.time(timeFlag);
        progress('开始执行');
        const page: any = await Browser.newPage(this, link);
        progress('模拟位置');
        await page.setGeolocation(geo); // 地理位置设置
        await page.setRequestInterception(true); // 请求拦截
        page.on('request', (request: any) => {
            const headers = request.headers();
            const api = new URL(request.url());
            if (location.hostname !== api.hostname) {
                headers['origin'] = location.origin; // 仅跨域时添加
            }
            headers['referer'] = location.origin;
            if (xff) {
                headers['X-Forwarded-For'] = ip;
            }
            request.continue({ headers });
        });
        progress('页面加载');
        await page.emulate(getDevice(devices[deviceName], width, height));
        try {
            await page.goto(link, { waitUntil });
            progress('完美加载');
        } catch (error) {
            try {
                waitUntil = ['domcontentloaded'];
                await page.goto(link, { waitUntil });
                progress('降级加载');
            } catch (error) {
                await page.close();
                if (xff) {
                    progress('!XFF加载');
                    return this.screenshot({ ...options, xff: false });
                } else {
                    progress('加载失败');
                    return { error: { message: error.message, link } };
                }
            }
        }
        progress('计算高度');
        // 第1遍获取页面高度：视口高度 + 未进入视口的页面高度
        let pageHeight = await page.evaluate(getPageHeight, width, height);
        progress(`页面高度`);
        // 第2遍调整视口，激活所有懒加载
        await page.emulate(getDevice(devices[deviceName], width, pageHeight));
        await page.waitForTimeout(1000);
        await page.evaluate(preloadImage);
        // 第2遍获取页面高度：页面元素完全展示后的真实高度
        pageHeight = await page.evaluate(getPageHeight, width, height);
        progress(`页面高度`);
        // 第3遍调整视口，设置为页面真实高度
        await page.emulate(getDevice(devices[deviceName], width, pageHeight));
        try {
            await page.reload({});
            progress('页面重载');
        } catch (error) {
            progress('重载失败');
            await page.close();
            return { error: { message: error.message, link } };
        }
        await page.waitForTimeout(1000);
        await page.evaluate(preloadImage);
        progress('页面截图');
        const imageBinary = await page.screenshot({ fullPage: false, captureBeyondViewport: true });
        progress('图像裁剪');
        const canvas = await clipImageEmpty(imageBinary as string, maxHeight);
        await page.close();
        console.timeEnd(timeFlag);
        return { canvas };
    }
    async saveImageByCanvas(canvas: Canvas, imageName: string) {
        const out = createWriteStream(imageName);
        canvas.createJPEGStream({ quality: 100 }).pipe(out);
        return imageName;
    }
    static async newPage(instance: any, link: string) {
        const browser = await puppeteer.launch();
        if (!instance.browser) {
            instance.browser = browser;
        } else {
            browser.close();
        }
        const context = instance.browser.defaultBrowserContext(); // 获取浏览器对象
        await context.overridePermissions(link, ['geolocation']); // 授予更改地理位置的权限
        const page = await instance.browser.newPage(); // 创建页面
        page.on('close', async () => {
            const pages = await instance.browser.pages();
            const urls = pages.map((p: any) => p.url());
            if (urls.every((url: string) => url === 'about:blank')) {
                instance.browser.close();
                instance.browser = null;
            }
        });
        return page;
    }
    static async clipImageEmpty(imageBinary: string, maxHeight: number) {
        const image = await loadImage(imageBinary);
        // 获取图像像素信息
        async function getImageDataByImage(image: Image) {
            const { width, height } = image;
            const canvas = createCanvas(width, Math.min(maxHeight, height));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);
            return ctx.getImageData(0, 0, width, height);
        }
        // 获取含有像素的色块区域Y轴区间列表
        async function getHasColorBlockList(imageData: ImageData) {
            const hasColorBlockList = []; // 内容色块区域
            const maxBlocHeight = 30; // 检测色块高度
            // 获取 x 行 y 列的像素
            function getPixel(imageData: ImageData, x: number, y: number): IPixel {
                const i = x * imageData.width + y;
                return {
                    r: imageData.data[4 * i + 0],
                    g: imageData.data[4 * i + 1],
                    b: imageData.data[4 * i + 2],
                    a: imageData.data[4 * i + 3],
                };
            }
            function isEqualPixel(p1: IPixel, p2: IPixel): boolean {
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
        async function getCanvasOfClipWhiteBlock(hasColorBlockList = [[0, 0]], image: Image, imgWidth: number) {
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
        const imageData = await getImageDataByImage(image);
        const hasColorBlockList = await getHasColorBlockList(imageData);
        return await getCanvasOfClipWhiteBlock(hasColorBlockList, image, imageData.width);
    }
    static preloadImage() {
        const images = Array.from(document.querySelectorAll('img'));
        const loadImage = (img: HTMLImageElement) => {
            return new Promise(resolve => {
                img.complete && resolve(img.src);
                img.onload = () => resolve(img.src);
                img.onerror = () => resolve(img.src);
            });
        };
        return Promise.all(images.map(img => loadImage(img)));
    }
    static getDevice(device: Device, width: number, height: number) {
        device = device || {
            name: 'Default',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
            viewport: {
                width: width,
                height: height,
                deviceScaleFactor: 1,
                isMobile: false,
                hasTouch: true,
                isLandscape: true,
            },
        };
        device.viewport.height = height;
        device.viewport.width = width;
        device.viewport.deviceScaleFactor = 1;
        return device;
    }
    static getPageHeight(width: number, height: number) {
        // 重置视口为标准视口
        const view: any = document.querySelector('meta[name="viewport"]') || {};
        view.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
        // 获取页面真实高度
        let maxHeight = height;
        // var maxHeight = 667;
        const getStyle = (el: Element, style: string) => window.getComputedStyle(el).getPropertyValue(style);
        document.querySelectorAll('*').forEach(el => {
            const sh = Array.from(el.children).reduce((sh, child) => {
                const position = getStyle(child, 'position');
                if (position !== 'fixed' && position !== 'absolute') {
                    sh += child.clientHeight;
                }
                return sh;
            }, 0);
            maxHeight = Math.max(maxHeight, sh);
        });
        // console.log(maxHeight);
        return maxHeight;
    }
}
export const page = new Browser();
