/**
 * advertisement cacheService
 * @module advertisement/service/cacheServer
 * @see module:../../common/tale/BaseService
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as Redis from 'ioredis';

import BaseService from '../../common/tale/BaseService';

/**
 * 发布之前数据更新缓存相关 service
 * @class cacheService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class CacheService extends BaseService {

    private redis: Redis.Redis;
    private oneDaySeconds = 24 * 60 * 60;
    private cacheKeyPrefix = 'cache:';

    constructor() {
        super();
        this.redis = (think as any).redis('redis1');
    }

    /**
     * 缓存更新数据，
     * 以用户表主键 id 加数据表名作为 key, 以表主键 id 作为 field, 已更新的 json 对象作为 value
     */
    public async setCacheData(
        userId: string,
        tableName: string,
        tableId: string,
        modelVo: object
    ) {
        const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;
        const cacheField = tableId;
        let cacheValue = modelVo;

        const preJsonStr = await this.redis.hget(cacheKey, cacheField);
        // 覆盖之前的更新
        if (preJsonStr) {
            const preModelVo = JSON.parse(preJsonStr);
            cacheValue = _.assign(preModelVo, cacheValue);
        }

        await this.redis.hset(cacheKey, cacheField, JSON.stringify(cacheValue));    // 哈希值为字符串
        await this.redis.expire(cacheKey, this.oneDaySeconds);    // 设置过期时间为一天
    }

    /**
     * 获取用户缓存的更新数据
     */
    public async fetchCacheData(
        userId: string,
        tableName: string,
        tableId: string,
    ) {
        const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;
        const cacheField = tableId;

        const preJsonStr = await this.redis.hget(cacheKey, cacheField);

        let preModelVo;
        if (preJsonStr) {
            preModelVo = JSON.parse(preJsonStr);
        }

        return preModelVo;

    }

    /**
     * 批量获取用户缓存的更新数据
     */
    public async fetchCacheDataHash(
        userId: string,
        tableName: string,
    ) {
        const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;

        const jsonhash = await this.redis.hgetall(cacheKey);
        const cacheDataHash = {};

        for (const key in jsonhash) {

            if (jsonhash.hasOwnProperty(key)) {
                const preJsonStr = jsonhash[key];
                let preModelVo;
                if (preJsonStr) {
                    preModelVo = JSON.parse(preJsonStr);
                }
                cacheDataHash[key] = preModelVo;
            }
        }
        return cacheDataHash;
    }

    /**
     * 批量删除用户缓存的更新数据
     */
    public async delCacheDataList(tableNameList: string[], userId: string) {
        const pipeline = this.redis.pipeline();

        tableNameList.forEach((tableName) => {
            const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;
            pipeline.del(cacheKey);

        });
        return await pipeline.exec();
        // return await this.redis.del(cachetKeyList);
    }

    /**
     * 批量获取用户缓存的更新数据
     */
    public async fetchDeployModelList(
        userId: string,
    ): Promise<{ tableNameList: string[], cachetKeyList: string[] }> {
        const pattern = this.cacheKeyPrefix + userId + ':' + '*';
        think.logger.debug(`pattern: ${pattern}`);
        const stream = this.redis.scanStream({
            // only returns keys following the pattern
            match: pattern,
            // returns approximately 9 elements per call
            count: 9,
        });

        return new Promise((resolve, reject) => {
            stream.on('data', (cachetKeyList: string[]) => {
                // `resultKeys` is an array of strings representing key names.
                // Note that resultKeys may contain 0 keys, and that it will sometimes
                // contain duplicates due to SCAN's implementation in Redis.
                const tableNameList = _.map(cachetKeyList, (resultKey) => {
                    // cacheKeyPrefix 长度为 2， userId 长度为 36
                    return resultKey.substr(39);
                });
                think.logger.debug(`fetchDeployModelList: ${JSON.stringify(tableNameList)}`);
                resolve({ tableNameList, cachetKeyList });
            });

            stream.on('end', () => {
                think.logger.debug('all keys have been visited');
            });
        });
    }
}