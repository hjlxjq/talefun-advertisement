/**
 * Talefun framework 控制器基类
 * @module common/tale/BaseModel
 * @see module:thinkjs.Model
 */
import { think } from 'thinkjs';
import { Context } from 'koa';
import { assert } from 'console';
/**
 * Talefun framework 模型基类
 * @class BaseModel
 * @classdesc
 *      所有模型的基类,提供了数据操控能力
 *  <br/>thinkjs的基本model功能
 *  <br/>传入了当前请求的上下文环境
 *  <br/>增加了一套输出缓冲机制,用于处理复杂的业务的输出.
 *  <br/>增加基于内存的flash快速缓存功能,用于降低对同一缓存的多次IO请求。
 * @author yangzhu <yangzhu@talefun.com>
 */
export default class BaseModel extends think.Model {
    private flashCache: object = {};
    private static id: number = 0;
    public ctx: Context;
    public mid: number;
    constructor(...args: any[]) {
        super(...args);
    }

    /**
     * 设置当前上下文
     * @param ctx @type {Context} 当前的请求上下文(koa的context对像)
     */
    public setCTX(ctx: Context) {
        this.ctx = ctx;
    }

    /**
     * 取得当前model持有的上下文对像
     * @returns @type {Context}
     */
    public getCTX(): Context {
        return this.ctx;
    }

    /**
     * 向输出缓冲附加内容 KV格式
     * @method appendOut
     * @param key @type {string} key值 如果有同名key值将被覆盖
     * @param value @type {any} value值可为任意类型
     */
    appendOut(key: string, value: any) {
        assert(this.ctx, "如果Model中需调用ctx上下文,请使用this.taleModel()的方式创建Model对像!");
        if (!this.ctx.state.outBuffer) { this.ctx.state.outBuffer = {}; }
        this.ctx.state.outBuffer[key] = value;
    }

    /**
     * 设置缓存
     * <br/>     设置网络缓存(redis/memcache) （网络开销）
     * <br/>     设置内存缓冲(falsh/memory) 内存开销
     * @method setCache
     * @param key @type {string} 缓存键值
     * @param value @type {any} 缓存内容
     * @param expire @type {number} 过期时间(暂时没用 采用adapatch中统一配置)
     */
    async setCache(key: string, value: any, expire?: number) {
        assert(this.ctx, "如果Model中需调用ctx上下文,请使用this.taleModel()的方式创建Model对像!");
        think.logger.debug("BaseModel:setCache" + key + value);
        const isObj: boolean = typeof value === 'object';
        if (isObj) {
            value = JSON.stringify(value);
        }
        this.ctx.state.flashCache[key] = value;
        return await think.cache(key, value);
    }
    /**
     * 获取缓存
     * <br/>     从快速缓冲中取(内存开销)
     * <br/>     否则从缓存中取(网络开销)
     * @param key @type {string}
     * @returns @type {any}
     */
    async getCache(key: string) {
        assert(this.ctx, "如果Model中需调用ctx上下文,请使用this.taleModel()的方式创建Model对像!");
        if (!this.ctx.state.flashCache) { this.ctx.state.flashCache = {}; }
        if (this.ctx.state.flashCache[key]) {
            return this.ctx.state.flashCache[key];
        }
        const res = await think.cache(key);
        if (think.isEmpty(res)) { return false; }
        let data;
        try {
            data = JSON.parse(res);
        } catch (error) {
            data = res;
        }
        this.ctx.state.flashCache[key] = data;
        return data;
    }

    /**
     * 删除缓存
     * <br/>     删除网络缓存
     * <br/>     删除内存缓存
     * @param key @type {string}
     */
    async delCache(key: string) {
        assert(this.ctx, "如果Model中需调用ctx上下文,请使用this.taleModel()的方式创建Model对像!");
        if (this.ctx.state.flashCache[key]) {
            delete this.ctx.state.flashCache[key];
        }
        await think.cache(key, null);
    }
}
