/**
 * advertisement authService
 * @module advertisement/service/authServer
 * @see module:../../common/tale/BaseService
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as Redis from 'ioredis';

import BaseService from '../../common/tale/BaseService';

import UserAuthModel from '../model/userAuth';
import ProductModel from '../model/product';
import ProductAuthModel from '../model/productAuth';
import ProductGroupAuthModel from '../model/productGroupAuth';

import { UserAuthVO, ProductAuthVO, ProductGroupAuthVO } from '../defines';

/**
 * 用户权限处理相关 service
 * @class authService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class AuthService extends BaseService {
    private redis: Redis.Redis;
    private oneDaySeconds = 24 * 60 * 60;    // 一天，redis 过期时间
    private productAuthKeyPrefix = 'pAuth:';    // 应用权限哈希表 key 前缀
    private productGroupAuthKeyPrefix = 'pgAuth:';    // 项目组权限哈希表 key 前缀
    private userAuthKeyPrefix = 'uAuth:';    // 用户权限哈希表 key 前缀

    constructor() {
        super();
        this.redis = (think as any).redis('redis1');    // 初始化 redis 实例
    }

    /**
     * <br/>获取用户在应用下权限。
     * @augments {string} userId 用户表主键
     * @augments {string} productId 应用表主键
     * @returns {CusProductAuth} 用户在应用下权限
     */
    private async getProductAuth(userId: string, productId: string) {
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const [
            productVo,
            productAuthVo,    // 应用下配置的权限
            userAuthVo
        ] = await Promise.all([
            productModel.getVo(productId),
            productAuthModel.getVo(userId, productId),
            userAuthModel.getVo(userId)
        ]);

        // 项目组下包含的应用权限
        const { productGroupId } = productVo;
        const {
            productAuthVo: InGroupProductAuthVo
        } = await productGroupAuthModel.getVo(userId, productGroupId);

        // 最终应用权限，为应用下配置的权限加上项目组下的所有应用权限
        // lodash defaults 函数只覆盖 undefined
        for (const auth in InGroupProductAuthVo) {
            if (_.isNil(productAuthVo[auth])) {
                productAuthVo[auth] = InGroupProductAuthVo[auth];

            } else if (InGroupProductAuthVo[auth] === 1) {
                productAuthVo[auth] = 1;

            }

        }

        // 用户为管理员，则拥有全部权限
        if (userAuthVo.master === 1) {
            productAuthVo.master = 1;

        }
        return productAuthVo;

    }

    /**
     * <br/>获取用户在项目组下操作权限
     * @augments {string} userId 用户表主键
     * @augments {string} productGroupId 项目组表主键
     * @returns {CusProductGroupAuth} 用户在项目组下能操作权限
     */
    private async getProductGroupAuth(userId: string, productGroupId: string) {
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const [
            { productGroupAuthVo },    // 项目组下排除 项目组下所有应用都包含的权限
            userAuthVo
        ] = await Promise.all([
            productGroupAuthModel.getVo(userId, productGroupId),
            userAuthModel.getVo(userId)
        ]);

        // 用户是管理员，则在项目组下卫视管理员
        if (userAuthVo.master === 1) {
            productGroupAuthVo.master = 1;

        }
        return productGroupAuthVo;

    }

    /**
     * <br/>获取用户权限
     * @augments {string} userId 用户表主键
     * @returns {UserAuthVO} 用户权限
     */
    private async getUserAuth(userId: string) {
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const userAuthVo = await userAuthModel.getVo(userId);
        return userAuthVo;

    }

    /**
     * 获取用户在应用下权限,
     * <br/>从 redis 中获取，不存在则从数据库中获取
     * @augments {string} userId 用户表主键
     * @augments {string} productId 应用表主键
     * @returns {CusProductAuth} 用户在应用下权限
     */
    public async fetchProductAuth(userId: string, productId: string) {
        // 用户在应用下权限
        let productAuthVo: ProductAuthVO;

        // 从 redis 中获取
        const productAuthKey = this.productAuthKeyPrefix + userId;
        const field = productId;
        const productAuthStr = await this.redis.hget(productAuthKey, field);

        // 存在则直接 json parse 返回
        if (productAuthStr) {
            productAuthVo = JSON.parse(productAuthStr);

            // 不存在则从数据库中获取
        } else {
            productAuthVo = await this.getProductAuth(userId, productId);
            // 再更新到 redis 缓存中去
            await this.redis.hset(productAuthKey, field, JSON.stringify(productAuthVo));
            await this.redis.expire(productAuthKey, this.oneDaySeconds);

        }

        return productAuthVo;

    }

    /**
     * 获取用户在项目组下权限,
     * <br/>从 redis 中获取，不存在则从数据库中获取
     * @augments {string} userId 用户表主键
     * @augments {string} productGroupId 项目组表主键
     * @returns {CusProductGroupAuth} 用户在项目组下权限
     */
    public async fetchProductGroupAuth(userId: string, productGroupId: string) {
        let productGroupAuthVo: ProductGroupAuthVO;

        const productGroupAuthKey = this.productGroupAuthKeyPrefix + userId;
        const field = productGroupId;
        // think.logger.debug(`productGroupAuthKey: ${productGroupAuthKey}`);
        // think.logger.debug(`field: ${field}`);
        const productGroupAuthStr = await this.redis.hget(productGroupAuthKey, field);

        if (productGroupAuthStr) {
            productGroupAuthVo = JSON.parse(productGroupAuthStr);

        } else {
            productGroupAuthVo = await this.getProductGroupAuth(userId, productGroupId);
            await this.redis.hset(productGroupAuthKey, field, JSON.stringify(productGroupAuthVo));
            await this.redis.expire(productGroupAuthKey, this.oneDaySeconds);

        }
        return productGroupAuthVo;

    }

    /**
     * 获取用户权限,
     * <br/>从 redis 中获取，不存在则从数据库中获取
     * @augments {string} userId 用户表主键
     * @returns {UserAuthVO} 用户权限
     */
    public async fetchUserAuth(userId: string) {
        let userAuthVo: UserAuthVO;

        const userAuthKey = this.userAuthKeyPrefix + userId;
        const userAuthStr = await this.redis.get(userAuthKey);

        if (userAuthStr) {
            userAuthVo = JSON.parse(userAuthStr);

        } else {
            userAuthVo = await this.getUserAuth(userId);
            await this.redis.setex(userAuthKey, this.oneDaySeconds, JSON.stringify(userAuthVo));

        }
        return userAuthVo;

    }

    /**
     * 从 redis 中删除用户在应用下权限数据，
     * <br/>登出或者更新权限需要删除再从数据库读取到 redis
     * @augments {string} userId 用户表主键
     * @augments {string} productId 应用表主键
     * @returns {boolean} 删除用户在应用下权限成功与否
     */
    public async deleteProductAuthFromRedis(userId: string, productId: string) {
        const productAuthKey = this.productAuthKeyPrefix + userId;

        // 从 redis 删除用户在应用下权限数据
        await this.redis.hdel(productAuthKey, productId);
        return true;

    }

    /**
     * 从 redis 中删除用户所有权限数据，
     * <br/>登出或者更新用户权限需要删除再从数据库读取到 redis
     * @augments {string} userId 用户表主键
     * @returns {boolean} 删除用户所有权限成功与否
     */
    public async deleteAllAuthFromRedis(userId: string) {
        const userAuthKey = this.userAuthKeyPrefix + userId;
        const productAuthKey = this.productAuthKeyPrefix + userId;
        const productGroupAuthKey = this.productGroupAuthKeyPrefix + userId;

        // 从 redis 删除用户所有权限数据
        await this.redis.del(userAuthKey, productAuthKey, productGroupAuthKey);
        return true;

    }

}