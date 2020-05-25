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

import { UserAuthVO, CusProductAuth, CusProductGroupAuth } from '../defines';

/**
 * 用户权限处理相关 service
 * @class authService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class AuthService extends BaseService {

    private redis: Redis.Redis;
    private oneDaySeconds = 24 * 60 * 60;
    private productAuthKeyPrefix = 'p:';
    private productGroupAuthKeyPrefix = 'pg:';
    private userAuthKeyPrefix = 'u:';

    constructor() {
        super();
        this.redis = (think as any).redis('redis1');
    }

    /**
     * 查询 productGroupAuth, product, productAuth, userAuthModel 四张表,
     * <br/>获取用户在应用下权限
     * @augments {string} userId 用户表主键 id
     * @augments {string} productId 应用表主键 id
     * @returns {CusProductAuth} 用户在应用下权限
     */
    private async getProductAuth(userId: string, productId: string) {
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const [
            productVo,
            currentProductAuth,
            userAuth
        ] = await Promise.all([
            productModel.getProduct(productId),
            productAuthModel.getProductAuth(userId, productId),
            userAuthModel.getUserAuth(userId)
        ]);

        const { productGroupId } = productVo;
        const {
            productAuth: productAuthInGroup
        } = await productGroupAuthModel.getProductGroupAuth(userId, productGroupId);

        const productAuth: CusProductAuth = _.defaults(currentProductAuth, productAuthInGroup);

        if (userAuth.master === 1) {
            productAuth.master = 1;
        }
        return productAuth;
    }

    /**
     * 查询 productGroupAuth，userAuth 两张表,
     * <br/>获取用户在项目组下权限
     * @augments {string} userId 用户表主键 id
     * @augments {string} productGroupId 项目组表主键 id
     * @returns {CusProductGroupAuth} 用户在项目组下权限
     */
    private async getProductGroupAuth(userId: string, productGroupId: string) {
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const [
            { productGroupAuth: currentProductGroupAuth },
            userAuth
        ] = await Promise.all([
            productGroupAuthModel.getProductGroupAuth(userId, productGroupId),
            userAuthModel.getUserAuth(userId)
        ]);

        const productGroupAuth: CusProductGroupAuth = currentProductGroupAuth;
        if (userAuth.master === 1) {
            productGroupAuth.master = 1;
        }
        return productGroupAuth;
    }

    /**
     * 查询 userAuth 表,
     * <br/>获取用户权限
     * @augments {string} userId 用户表主键 id
     * @returns {UserAuthVO} 用户权限
     */
    private async getUserAuth(userId: string) {
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const userAuth = await userAuthModel.getUserAuth(userId);
        return userAuth;
    }

    /**
     * 获取用户在应用下权限,
     * <br/>从 redis 中获取，不存在则从数据库中获取
     * @augments {string} userId 用户表主键 id
     * @augments {string} productId 应用表主键 id
     * @returns {CusProductAuth} 用户在应用下权限
     */
    public async fetchProductAuth(userId: string, productId: string) {
        let productAuth: CusProductAuth;

        const productAuthKey = this.productAuthKeyPrefix + userId;
        const field = productId;
        const productAuthStr = await this.redis.hget(productAuthKey, field);

        if (productAuthStr) {
            productAuth = JSON.parse(productAuthStr);
        } else {
            productAuth = await this.getProductAuth(userId, productId);
            await this.redis.hset(productAuthKey, field, JSON.stringify(productAuth));
            await this.redis.expire(productAuthKey, this.oneDaySeconds);
        }

        return productAuth;
    }

    /**
     * 获取用户在项目组下权限,
     * <br/>从 redis 中获取，不存在则从数据库中获取
     * @augments {string} userId 用户表主键 id
     * @augments {string} productGroupId 项目组表主键 id
     * @returns {CusProductGroupAuth} 用户在项目组下权限
     */
    public async fetchProductGroupAuth(userId: string, productGroupId: string) {
        let productGroupAuth: CusProductGroupAuth;

        const productGroupAuthKey = this.productGroupAuthKeyPrefix + userId;
        const field = productGroupId;
        think.logger.debug(`productGroupAuthKey: ${productGroupAuthKey}`);
        think.logger.debug(`field: ${field}`);
        const productGroupAuthStr = await this.redis.hget(productGroupAuthKey, field);

        if (productGroupAuthStr) {
            productGroupAuth = JSON.parse(productGroupAuthStr);
        } else {
            productGroupAuth = await this.getProductGroupAuth(userId, productGroupId);
            await this.redis.hset(productGroupAuthKey, field, JSON.stringify(productGroupAuth));
            await this.redis.expire(productGroupAuthKey, this.oneDaySeconds);
        }

        return productGroupAuth;
    }

    /**
     * 获取用户权限,
     * <br/>从 redis 中获取，不存在则从数据库中获取
     * @augments {string} userId 用户表主键 id
     * @returns {UserAuthVO} 用户权限
     */
    public async fetchUserAuth(userId: string) {
        let userAuth: UserAuthVO;

        const userAuthKey = this.userAuthKeyPrefix + userId;
        const userAuthStr = await this.redis.get(userAuthKey);

        if (userAuthStr) {
            userAuth = JSON.parse(userAuthStr);
        } else {
            userAuth = await this.getUserAuth(userId);
            await this.redis.setex(userAuthKey, this.oneDaySeconds, JSON.stringify(userAuth));
        }

        return userAuth;
    }

    /**
     * 从 redis 中删除用户在应用下权限数据，
     * <br/>登出或者更新权限需要删除再从数据库读取到 redis
     * @augments {string} userId 用户表主键 id
     * @augments {string} productId 应用表主键 id
     * @returns {boolean} 删除用户在应用下权限成功与否
     */
    public async deleteProductAuthFromRedis(userId: string, productId: string) {
        const productAuthKey = this.productAuthKeyPrefix + userId;

        await this.redis.hdel(productAuthKey, productId);

        return  true;
    }

    /**
     * 从 redis 中删除用户所有权限数据，
     * <br/>登出或者更新用户权限需要删除再从数据库读取到 redis
     * @augments {string} userId 用户表主键 id
     * @returns {boolean} 删除用户所有权限成功与否
     */
    public async deleteAllAuthFromRedis(userId: string) {
        const userAuthKey = this.userAuthKeyPrefix + userId;
        const productAuthKey = this.productAuthKeyPrefix + userId;
        const productGroupAuthKey = this.productGroupAuthKeyPrefix + userId;

        await this.redis.del(userAuthKey, productAuthKey, productGroupAuthKey);

        return  true;
    }

}