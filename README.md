# ks-screenshot

一个使用 Puppeteer 对网站进行页面截图 NPM 工具包

> sudo npm i ks-screenshot -g

```bash

Options:
  -V, --version                         output the version number
  --url, [url]                          使用 encodeURIComponent 处理过的链接
  --emulate, [emulate]                  浏览器模拟器, 例如: PC 或者 Mobile (default: "Mobile")
  --fullpage, [fullpage]                是否要全屏 (default: true)
  --maxheight, [maxheight]              页面最大支持高度 (default: "4000")
  --w, [w]                              自定义宽度 (default: "1600")
  --h, [h]                              自定义高度 (default: "900")
  --waitfortime, [waitfortime]          等待时间，单位毫秒 (default: "10000")
  --waitforselector, [waitforselector]  等待选择器出现在页面中 (default: "body")
  --auth, [auth]                        基本 HTTP 身份验证,例如： username;password (default: "")
  --ip, [auth]                          模拟代理IP,例如: 武汉 27.18.198.204 (default: "")
  --geo, [auth]                         模拟地理定位,例如: 武汉 114,30 (default: "")
  --block, [no]                         阻止请求API, 例如: /api1,/api2 (default: "")
  --click, [click]                      页面点击 (default: "")
  --outfile, [outfile]                  输出文件 (default: "")
  --log                                 输出实时进度

```
