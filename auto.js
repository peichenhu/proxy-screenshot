const IP_list = [
    'https://ip38.com/',
    'https://www.ip.cn/',
    'http://www.cip.cc/',
    'https://a.suv18.com/leads/multi/custom/0/1221?account_id=73&project_id=880&C=ks13medc',
];
// 待处理列表
const list = [
    'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=baidu&wd=%E5%B9%B4%E5%8E%86',
    'https://kwai-ui.corp.kuaishou.com/v2/#/component/color',
    'https://app.kwaixiaodian.com/merchant/shop/detail?id=4154405891535&hyId=kwaishop&layoutType=4&extType=1',
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
    'https://chenzhongkj.com/rest/n/lp/page/getHtml?hyId=landingPg&pageId=267476982209454080',
];

/**
 * H5 巡检回查随机抽取页面 1/2/4/8/16/32/64/128/256
 */
const list_h5 = [
    'https://gm2cn.com/siyue/',
    'https://www.yxc9988.com/yxc555.html',
    'https://icard.usuredata.com/v2/channel/yhwtl1md24',
    'https://ksjs.cuxiao8848.cn/',
    'https://wx4c6fd1a1fad284a2.qiyuezw.cn/ks/2038?appid=wx4c6fd1a1fad284a2',
    'https://shengdianhuadk.com/external_service/common?appid=3&funid=1&blindBoxId=39&spchannel=1&notCheckPhone=1&channel=88525&page=KS',
    'https://zypage.duyunkj.cn/wapi/v6/index.html?autocookie=0&automatic=1&channel_id=ksznhuawei&link_id=042136&pkg=com.ss.happy&page=pages/welfareTasks&landingPageCode=012&utm_ad_id=__POS__&utm_campaign=__CID__&utm_source=__AID__&IMEI=__IMEI2__&oaidmd5=__OAID2__&callback=__CALLBACK__',
    'https://ldpage.adcdn.com/wapi/v6/index.html?automatic=1&autocookie=0&page=pages/bookDetail&pkg=com.dd.reading&channel_id=ksznxiaomi&link_id=0418888&book_id=2356&utm_content=redpacket&utm_ad_id=__POS__&utm_campaign=__CID__&utm_source=__AID__&IMEI=__IMEI2__&oaidmd5=__OAID2__&clicktime=__TS__&landingPageCode=001',
    'https://lpx.zhiziedu.net/34515/SKaJN9/index.html?urlId=6734&campaign_id=__DID__&adgroup_id=__AID__&creative_id=__CID__',
    'https://shengdianhuadk.com/external_service/common?appid=3&service=shop_user&funid=18&pageType=luckyMore&productType=blindBox&blindBoxId=46&channel=88833&spchannel=1&notCheckPhone=1&page=KS',
    'https://cdn.guangtuikeji.com/com.guangtui.novel.quick/index.html?pid=rta-kssk01&ksEvent=9',
    'https://tfh5.lidwq.cn/xb/xz1q/index?channelId=6118JW',
    'https://h5.yueyuechuxing.cn/yueyue/h5-driver-recruiting/focusV4/recruitFocus.html#/?utm_source=ks&utm_content=110686',
];

const geo = {
    北京: '116.29812,39.95931',
    武汉: '114.31589,30.55389',
    成都: '104.08347,30.65614',
    广州: '113.36112,23.12467',
};

const ip = {
    北京: '111.13.147.215',
    武汉: '27.18.198.204',
    成都: '171.221.172.76',
    广州: '59.42.241.159',
};

function createTask(list) {
    list.forEach(link => {
        let url = ['node ./lib/index.js'];
        url.push(`--geo ${geo['成都']}`);
        url.push(`--ip ${ip['成都']}`);
        url.push(`--url ${encodeURIComponent(link)}`);
        console.log(url.join(' '));
    });
}

createTask(list_h5);
