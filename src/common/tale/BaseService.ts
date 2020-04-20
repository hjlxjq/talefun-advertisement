/**
 * Talefun framework Service基类
 * @module common/tale/BaseService
 * @see module:thinkjs.Controller
 */
import { Context } from 'koa';
import { think } from 'thinkjs';
import BaseModel from './BaseModel';
const assert = require('assert');
/**
 * Talefun framework service基类
 * @class BaseService
 * @classdesc 所有service的基类
 * <br/> 传入了ctx上下文 提供了操作输出的接口
 * @author yangzhu <yangzhu@talefun.com>
 */
export default class BaseService extends think.Service {
    public ctx: Context;
    public mname: string;
    constructor(...args: any[]) {
        super();
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
     * 实例化一个service对像
     * <br/> 此方法会将当前请求的上下文传入service。
     * <br/> service将拥有操作ctx的能力(flashCache/output)。
     *
     * @method taleService
     * @param name @type {string} service名称(文件名称)
     * @param m @type {string} module名称{多模块项目下实例化其它模块中的service需指定 默认当前模块}
     * @param args @type {any[]} 向实例透传的参数
     * @returns @type {BaseService} 一个service对像实例
     */
    taleService(name: string, module: any = (this.ctx as any).module, ...args: any[]) {
        // assert(this.ctx, "如果service中需调用ctx上下文,请使用this.taleService()的方式创建service对像");
        const serviceInstance = think.service(name, module, ...args) as BaseService;
        serviceInstance.setCTX(this.ctx);
        return serviceInstance;
    }

    /**
     * 实例化一个Model对像
     * <br/> 此方法会将当前请求的上下文传入service。
     * <br/> model将拥有操作ctx的能力(flashCache/output)。
     * @method taleModel
     * @param name @type {string} model名称(文件名称)
     * @param m @type {string} module名称{多模块项目下实例化其它模块中的model需指定 默认当前模块}
     * @param args @type {any[]} 向实例透传的参数
     * @returns @type {BaseModel} 一个model对像实例
     */
    taleModel(name: string, module?: string, config?: any) {
        // assert(this.ctx, "如果service中需调用ctx上下文,请使用this.taleService()的方式创建service对像");
        if (think.isEmpty(module)) {
            module = (this.ctx as any).module;
        }
        const modelInstance = think.model(name, config, module) as BaseModel;
        modelInstance.setCTX(this.ctx);
        return modelInstance;
    }

    /**
     * 向输出缓冲附加内容 KV格式
     * @method appendOut
     * @param key @type {string} key值 如果有同名key值将被覆盖
     * @param value @type {any} value值可为任意类型
     */
    appendOut(key: string, value: any) {
        assert(this.ctx, "如果service中需调用ctx上下文,请使用this.taleService()的方式创建service对像");
        if (!this.ctx.state.outBuffer) { this.ctx.state.outBuffer = {}; }
        this.ctx.state.outBuffer[key] = value;
    }
}