import path from 'node:path';
import fs from 'node:fs';
import { Command } from 'commander';

const program = new Command();
const taskId = String(Math.random()).replace('0.', '');

/**
 * option('-简写, --全写 <必填参数>'， '参数说明', '默认值（可省略）')
 * option('-简写, --全写 [可选参数]'， '参数说明', '默认值（可省略）')
 */
program.name('ks-web-screenshot');
program.version('1.0.1');
program.option('--url, [url]', '使用 encodeURIComponent 处理过的链接');
program.option('--emulate, [emulate]', '浏览器模拟器, 例如: PC 或者 Mobile', 'Mobile');
program.option('--fullpage, [fullpage]', '是否要全屏', true);
program.option('--maxheight, [maxheight]', '页面最大支持高度', String(4000));
program.option('--w, [w]', '自定义宽度', String(1600));
program.option('--h, [h]', '自定义高度', String(900));
program.option('--waitfortime, [waitfortime]', '等待时间，单位毫秒', String(10 * 1000));
program.option('--waitforselector, [waitforselector]', '等待选择器出现在页面中', 'body');
program.option('--auth, [auth]', '基本 HTTP 身份验证,例如： username;password', '');
program.option('--ip, [auth]', '模拟代理IP,例如: 武汉 27.18.198.204', '');
program.option('--geo, [auth]', '模拟地理定位,例如: 武汉 114,30', '');
program.option('--block, [no]', '阻止请求API, 例如: /api1,/api2', '');
program.option('--click, [click]', '页面点击', '');
program.option('--outfile, [outfile]', '输出文件', '');
program.option('--log', '输出实时进度');
program.action((options: Record<string, any>): void => {
    // ===== geo =====
    try {
        if (options.geo) {
            const [longitude, latitude] = options.geo.split(',').map((i: string) => +i);
            if (isNaN(longitude) || isNaN(latitude) || longitude === 0 || latitude === 0) {
                console.log('参数 --geo 模拟地理定位配置有误');
                process.exit();
            }
            options.geo = { longitude, latitude };
        }
    } catch (error: any) {
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
    } catch (error: any) {
        console.log('参数 --url 网页链接配置有误', error.message);
        process.exit();
    }
    // ===== maxheight =====
    options.maxheight = +options.maxheight;
    if (isNaN(options.maxheight) || options.maxheight === 0) {
        console.log('参数 --maxheight 配置有误');
        process.exit();
    }
    // ===== w =====
    options.w = +options.w;
    if (isNaN(options.w) || options.w === 0) {
        console.log('参数 --w 配置有误');
        process.exit();
    }
    // ===== h =====
    options.h = +options.h;
    if (isNaN(options.h) || options.h === 0) {
        console.log('参数 --h 配置有误');
        process.exit();
    }
    // ===== waitfortime =====
    options.waitfortime = +options.waitfortime;
    if (isNaN(options.waitfortime) || options.waitfortime === 0) {
        console.log('参数 --w 配置有误');
        process.exit();
    }
    // ===== block =====
    if (options.block) {
        options.block = options.block.split(',').filter(Boolean);
    }
    // ===== outfile =====
    const outfile = options.outfile;
    if (!outfile) {
        const hostname = new URL(options.url).hostname;
        const filename = `output/${hostname}.${taskId}.png`;
        const filePath = path.resolve(process.cwd(), filename);
        options.outfile = filePath;
    } else if (!outfile.endsWith('.png') && !outfile.endsWith('.jpeg')) {
        console.log('参数 --outfile 配置有误, 文件输出格式应该为 png 或者 jpeg');
        process.exit();
    } else {
        options.outfile = path.resolve(process.cwd(), outfile);
    }
    // ===== outfile =====
    if (options.emulate) {
        options.emulate = options.emulate === 'PC' ? 'PC' : 'iPhone 6';
    }
});
program.parse(process.argv);

const ourDir = path.resolve(process.cwd(), './output');
!fs.existsSync(ourDir) && fs.mkdirSync(ourDir);

export default program.opts();
