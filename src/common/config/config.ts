// default config
module.exports = {
    workers: 1,
    TLF_AppId: "900X",
    TLF_AppName: '广告分发管理系统',
    TLF_TokenSecret: 'www.talefun.com',
    XXTEA_KEY_2: '):NGnA.>L5yO',
    XXTEA_KEY: 'gn:g>-7WSWN/',
    PreviewDir: 'upload/image/preview',
    local_domain: 'http://adtest.weplayer.cc/',
    manager_domain: 'http://ad-manager.weplayer.cc/',
    distribute_domain: 'http://ad-dis.weplayer.cc/',
    LiveActiveTime: '2020-05-01 00:00:00',    // 线上数据
    CacheActiveTime: '2020-05-02 00:00:00',    // 未发布的数据
    redis_config: {
        redis1: {
            port: 6379,
            host: 'r-7gojox5hx56m1e285v.redis.rds.aliyuncs.com',
            password: 'talefun@#$ADdispatcher',
            family: 4,
            db: 0
        }
    }
};