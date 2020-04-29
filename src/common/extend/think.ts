// src/extend/think.js
import * as Redis from 'ioredis';
import * as Helper from 'think-helper';
import { think} from 'thinkjs';
// Tale(think.app);
module.exports = {
    /**
     * 获取redis实例
     * @param key string 配置键值
     */
    redis(key: string): Redis.Redis {
        if (Helper.isEmpty(key)) { throw new Error('You must specify redis configuration.'); }
        if (!this.redisInstances) { this.redisInstances = {}; }
        if (!this.redisInstances[key]) {
            const redisConfigs = this.config('redis_config');
            think.logger.debug(`redisConfigs: ${JSON.stringify(redisConfigs)}`);
            this.redisInstances[key] = new Redis(redisConfigs[key]);
        }
        return this.redisInstances[key];
    }
};