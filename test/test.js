'use strict';
const { URL } = require('node:url');
// const { saveImageByCanvas, screenshot } = require('proxy-screenshot');
const { saveImageByCanvas, screenshot } = require('../dist/index.js');
// IP 定位
const IP = {
    beijing: '111.13.147.215',
    wuhan: '27.18.198.204',
    shenzhen: '211.136.236.0',
    chengdu: '171.221.172.76',
};
// 经纬度定位
const GEO = {
    beijing: { longitude: 116, latitude: 40 },
    wuhan: { longitude: 114, latitude: 30 },
    hangzhou: { longitude: 120, latitude: 30 },
    shenzhen: { longitude: 103, latitude: 31 },
};
const IP_list = [
    'https://ip38.com/',
    'https://www.ip.cn/',
    'http://www.cip.cc/',
    'https://a.suv18.com/leads/multi/custom/0/1221?account_id=73&project_id=880&C=ks13medc',
];
// 待处理列表
const list = [
    ...IP_list,
    'https://subad16.richclick.cn/views/product/detail?id=20211208135027392000162&index=1&orderSource=000010',
    'https://app.kwaixiaodian.com/merchant/shop/detail?id=3822098374573&hyId=kwaishop&layoutType=4&extType=1',
    'https://i.bianxianmao.com/activities?appKey=4c140e60899d4df4a20b74b8f3020109&appEntrance=58&business=money',
    'https://wx4fa0607a7eb09a52.weike.goweike.net/ocpx/133?source_id=20eb2c615a836bc1&ks_aid=__AID__&ks_cid=__CID__&ks_did=__DID__',
    'https://wp.m.163.com/163/page/news/2021_happy/index.html',
    'https://tc1.rmxxg.com/adver/ab/xiangtan/1?c=ks42MEAC',
    'https://mr.baidu.com/r/x1zy9Ed9ss?f=cp&u=0e3c315c1eee51e6',
    'https://app.sxfoundation.com/foundation/web/fullpageNew?fid=481815526092312576',
    'https://a.zhenai.com/abt/link.do?channelId=919425&subChannelId=193&pageKey=za_m_landing&t=Zg%2BlPAukk9hjHLlL%2Fw94Ksj0bD8Nej87', // 失败
    'https://juejin.cn/frontend',
    'https://www.kuaijinniu.com/m/goods?productId=168584873384246&layoutType=4&hyId=kuaijinniu_product&preview=1',
    'http://disney.biubiubiubang.com/?wx_aid=4341621944&tid=4341621947&gdt_vid=wx0y6shxhzgf2qc400&aceid=wx0y6shxhzgf2qc400#/',
    'https://pusidun.cn/kuaishou/lhh/10664866/index.html',
    'https://h5.ele.me/',
    'https://topicsec.cdyouchun.com/channel?channelCode=mdxwow&channelId=324',
    'https://sg.music.163.com/love/notebook/radsjl095',
    'https://w3.soulapp.cn/feeling/#/?activityIdEcpt=dU5TRmtxU2JDTmc9&pageIdEcpt=cU1XdzBMM2pNcjg9&pageType=2',
    'https://interaction.doumoed.com/static2/aTqd6z/v2/mangguoTv13/index.html?ssId=fdddcd61e13a67b05668e0228668eb04&hdgghtmlid=933&appkey=d8c71a45db350b65bf8d0df3ad54ddc0&ceKey=f7d7809866bf8396226579c279445683&sourceType=media&from=H5&callback=__CALLBACK__&t=1638704199347&actionType=html',
    'https://h5.yueyuechuxing.cn/yueyue/h5-driver-recruiting/etravel-put/index.html#/index?tenantId=800189&e=200101',
    'https://v.book.qq.com/bookInfo.html?cbid=16672287405492604&hidetitlebar=1&ptag=viphome',
    'https://www.17xueba.com/',
    'https://s.immomo.com/fep/momo/fep-web/business-channel-download/index.html?id=61920f692cd17&version=2',
    'https://chenzhongkj.com/rest/n/lp/page/getHtml?hyId=landingPg&pageId=267476982209454080'
];
// 遍历
list.forEach(link => {
    const { hostname, pathname } = new URL(link);
    const path = pathname.replace(/\//g, '') || '';
    const outImgFile = `test/images/${hostname}${path && '.' + path}.jpeg`;
    screenshot({
        showProgress: true,
        width: 375,
        height: 667,
        maxHeight: 667 * 20,
        link,
        ip: IP.wuhan,
        geo: GEO.wuhan,
        deviceName: 'iPhone 6',
    }).then(({ canvas, error }) => {
        if (error) {
            console.log(error);
        } else {
            saveImageByCanvas(canvas, outImgFile);
        }
    });
});
