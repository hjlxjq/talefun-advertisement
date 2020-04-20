// production config, it will load in production enviroment
module.exports = {
    workers: 0,
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
