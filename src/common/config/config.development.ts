// default config
module.exports = {
    workers: 4,
    redis_config: {
        redis1: {
            port: 6379,          // Redis port
            host: '172.16.120.73',   // Redis host
            family: 4,           // 4 (IPv4) or 6 (IPv6)
            password: 'auth',
            db: 0
        },
        redis2: {
            port: 6379,          // Redis port
            host: '172.16.120.73',   // Redis host
            family: 4,           // 4 (IPv4) or 6 (IPv6)
            password: 'auth',
            db: 0
        },
    }
};