## WaitForOptions

-   timeout：以毫秒为单位的最大导航时间，默认为 30 秒，传递 0 以禁用超时。可以使用该页面更改默认值。setDefaultNavigationTimeout（）或页面。setDefaultTimeout（）
    方法。

-   waitUntil：当考虑导航成功时，默认为加载。给定一组事件字符串，在触发所有事件后，导航被认为是成功的。事件可以是：

    -   load：页面的 html、css、js、图片等资源都已经加载完之后才会触发 load 事件

    -   domcontentloaded：DOM 树已经构建完毕就会触发 DOMContentLoaded 事件

    -   networkidle0：在 500ms 内没有任何网络连接

    -   networkidle2：在 500ms 内网络连接个数不超过 2 个

## 问题根源

> networkidle 页面存在轮询 API 会导致页面加载超时

## 城市经纬度查询、国内地区经度纬度查询工具

http://www.jsons.cn/lngcode/

## Puppeteer 在工作中是如何伪装自己的(爬虫与反爬虫)

https://juejin.cn/post/6872666746139246606
