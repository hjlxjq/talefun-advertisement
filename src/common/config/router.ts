module.exports = [
    // ['/advertisement/ad/:id?', '/advertisement/ad', 'rest'], // 第二种方式
    // ['/jsonrpc', '/user/jsonrpcsub/jsonrpc']
    // ['/advertisement/test/adInfo', '/distributeAd/index/adInfo', 'post'],
    ['/1.1/functions/adControlInfo', '/distributeAd/index/adControlInfo'],
    ['/adInfo', '/distributeAd/index/adInfo', 'post'],
    ['/acig', '/distributeAd/index/acig', 'post'],
    ['/configInfo', '/distributeAd/index/configInfo', 'post'],
    ['/instantAdInfo', '/distributeAd/index/instantAdInfo', 'post'],
    ['/getIPAdress', '/distributeAd/index/getIPAdress', 'get'],
    ['/getClientIp', '/distributeAd/index/getClientIp', 'get'],
];
