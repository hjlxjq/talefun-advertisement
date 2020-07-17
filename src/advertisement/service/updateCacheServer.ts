/**
 * advertisement updateCacheServer
 * @module advertisement/service/updateCacheServer
 * @see module:../../common/tale/BaseService
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as Redis from 'ioredis';

import BaseService from '../../common/tale/BaseService';
import Utils from '../utils';

function delUndefinedFromObj(obj: object): object {
    for (const key of _.keys(obj)) {

        if (_.isUndefined(obj[key])) {
           delete obj[key];

        }

    }
    return obj;

}

/**
 * 发布之前的数据更新缓存相关 service
 * @class updateCacheServer
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class UpdateCacheServer extends BaseService {
    private redis: Redis.Redis;
    private oneDaySeconds = 24 * 60 * 60;
    private cacheKeyPrefix = 'updateCache:';    // 数据库更新缓存数据，redis 哈希表的 key 前缀
    private deployKeyPrefix = 'deploy:';    // 用户发布状态，redis 哈希表的 key 前缀

    constructor() {
        super();
        this.redis = (think as any).redis('redis1');

    }

    /**
     * 缓存用户发布状态，
     * <br/>用户在在应用下进行增删改操作的时候记录
     * @argument {string} userId 用户表主键;
     */
    public async setDeployStatus(userId: string, type: number, productId: string) {
        //  用户发布状态，redis 哈希表的 key
        const deployKey = this.deployKeyPrefix + userId;

        // redis 记录用户更新状态为 true
        // @ts-ignore
        await this.redis.set(deployKey, type + productId);

    }

    /**
     * 获取缓存的用户发布状态，
     * @argument {string} userId 用户表主键;
     */
    public async fetchDeployStatus(userId: string) {
        //  用户发布状态，redis 哈希表的 key
        const deployKey = this.deployKeyPrefix + userId;

        // 用户更新状态
        return this.redis.get(deployKey);

    }

    /**
     * 删除缓存的用户发布状态，
     * <br/>发布或者回滚操作之后，清除用户的发布状态
     * @argument {string} userId 用户表主键;
     */
    public async delDeployStatus(userId: string) {
        //  用户发布状态，redis 哈希表的 key
        const deployKey = this.deployKeyPrefix + userId;

        // 删除用户更新状态
        return this.redis.del(deployKey);

    }

    /**
     * 缓存更新数据，以用户表主键加数据表名作为 key, 以数据表主键作为 field, 已更新的 json 对象作为 value，
     * <br/>更新线上的数据，不直接去更新数据库，而是把更新内容缓存在 redis 中，待发布的时候一起更新到数据库
     * @argument {string} userId 用户表主键;
     * @argument {string} tableName 数据表名;
     * @argument {string} tableId 数据表主键;
     * @argument {object} modelVo 待更新的数据表对象;
     */
    public async setCacheData(
        userId: string,
        tableName: string,
        tableId: string,
        modelVo: object
    ) {
        // 数据库更新缓存数据，redis 哈希表的 key
        const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;

        // field 为数据表主键
        const cacheField = tableId;

        let cacheVo = modelVo;
        Utils.delUndefinedFromObj(cacheVo);

        const preJsonStr = await this.redis.hget(cacheKey, cacheField);
        // 覆盖之前的更新
        if (preJsonStr) {
            const preModelVo = JSON.parse(preJsonStr);

            cacheVo = _.assign(preModelVo, cacheVo);
            think.logger.debug(`cacheVo: ${JSON.stringify(cacheVo)}`);

        }
        const cacheValue = JSON.stringify(cacheVo);    // 哈希表为字符串

        await this.redis.hset(cacheKey, cacheField, cacheValue);

    }

    /**
     * 获取用户缓存的更新数据
     * @argument {string} userId 用户表主键;
     * @argument {string} tableName 数据表名;
     * @argument {string} tableId 数据表主键;
     */
    public async fetchCacheData(
        userId: string,
        tableName: string,
        tableId: string,
    ) {
        // 数据库更新缓存数据，redis 哈希表的 key
        const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;
        // field 为数据表主键
        const cacheField = tableId;

        const preJsonStr = await this.redis.hget(cacheKey, cacheField);

        let preModelVo;
        if (preJsonStr) {
            preModelVo = JSON.parse(preJsonStr);

        }

        // 返回用户缓存的更新数据
        return preModelVo;

    }

    /**
     * 批量获取用户缓存的更新数据
     * @argument {string} userId 用户表主键;
     * @argument {string} tableName 数据表名;
     */
    public async fetchCacheDataHash(
        userId: string,
        tableName: string,
    ) {
        // 数据库更新缓存数据，redis 哈希表的 key
        const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;

        // 获取用户全部的缓存的更新数据，redis 中的哈希表
        const jsonhash = await this.redis.hgetall(cacheKey);
        // 返回用户全部的缓存的更新数据，值为 json , 转换为对象
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
     * @argument {string} tableNameList 数据表名列表;
     * @argument {string} userId 用户表主键;
     */
    public async delCacheDataList(tableNameList: string[], userId: string) {
        const pipeline = this.redis.pipeline();

        tableNameList.forEach((tableName) => {
            // 数据库更新缓存数据，redis 哈希表的 key
            const cacheKey = this.cacheKeyPrefix + userId + ':' + tableName;
            pipeline.del(cacheKey);

        });
        return await pipeline.exec();
        // return await this.redis.del(cachetKeyList);
    }

}