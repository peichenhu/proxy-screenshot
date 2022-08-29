import { Options } from './types';
import { HTTPRequest, Page } from 'puppeteer';

export default async function setRequest(page: Page, options: Options) {
    await page.setRequestInterception(true);
    page.on('request', function (request: HTTPRequest) {
        const url = request.url();
        const api = new URL(request.url());
        const method = request.method();
        const headers = request.headers();
        const postData = request.postData();
        // 拒绝请求
        if (options.block.includes(api.pathname)) {
            // log.blue('====> 设置请求拦截', block.join());
            request.abort();
            return;
        }
        // 资源请求
        if (api.protocol !== 'http:' && api.protocol !== 'https:') {
            request.continue();
            return;
        }
        // 代理请求
        if (options.ip && ['GET', 'POST'].includes(method)) {
            // 请求模拟代理
            // log.blue('====> 设置模拟代理', ip);
            const link = new URL(decodeURIComponent(options.url));
            if (link.hostname !== api.hostname || method === 'POST') {
                headers['origin'] = link.origin; // 只有跨域请求或者同域时发送post请求，才会携带origin请求头。
            }
            if (link.protocol === api.protocol) {
                headers['referer'] = link.origin; // 同安全协议和非本地资源添加
            }
            headers['X-Forwarded-For'] = options.ip;
            request.continue({});
            return;
        }
        request.continue();
    });
}
