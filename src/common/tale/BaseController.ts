/**
 * Talefun framework 控制器基类
 * @module common/tale/BaseController
 * @see module:thinkjs.Controller
 */
import { think } from 'thinkjs';
import BaseService from './BaseService';
import BaseModel from './BaseModel';
import * as _ from 'lodash';
// import { TaleCode, TokenExemptVO } from '../tale/TaleDefine';
// import TokenService from '../service/token';
/**
 * Talefun framework 控制器基类
 * @class BaseController
 * @classdesc 所有业务控制器的基类,提供了基本的jwt校验<br/>除了thinkjs的基本success输出方式外 增加了一套输出缓冲机制 用于处理复杂的业务
 * @author yangzhu <yangzhu@talefun.com>
 */
export default class BaseController extends think.Controller {

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
        const serviceInstance = think.service(name, module, ...args);
        serviceInstance.setCTX(this.ctx);
        return serviceInstance;
    }

    /**
     * 实例化一个Model对像
     * <br/> 此方法会将当前请求的上下文传入model。
     * <br/> model将拥有操作ctx的能力(flashCache/output)。
     * @method taleModel
     * @param name @type {string} model名称(文件名称)
     * @param m @type {string} module名称{多模块项目下实例化其它模块中的model需指定 默认当前模块}
     * @param args @type {any[]} 向实例透传的参数
     * @returns @type {BaseModel} 一个model对像实例
     */
    taleModel(name: string, module?: string, config?: any): BaseModel {
        if (think.isEmpty(module)) {
            module = (this.ctx as any).module;
        }
        const modelInstance = think.model(name, config, module) as BaseModel;
        modelInstance.setCTX(this.ctx);
        return modelInstance;
    }
    /**
     *  从token中取得键值对
     *  <br/>token是从前端传过来的token中反解出来的。
     *  <br/>取出的值参考createToken时设置的值
     * @method getToken
     * @param key @type {string} 键名
     */
    getToken(key: string) {
        return this.ctx.state.tokenVerify[key];
    }
    /**
     * 向输出缓冲附加内容 KV格式
     * @method appendOut
     * @param key @type {string} key值 如果有同名key值将被覆盖
     * @param value @type {any} value值可为任意类型
     */
    appendOut(key: string, value: any) {
        if (!this.ctx.state.outBuffer) { this.ctx.state.outBuffer = {}; }
        const AppName = think.config("TLF_AppName");
        if (!this.ctx.state.outBuffer[AppName]) { this.ctx.state.outBuffer[AppName] = {}; }
        this.ctx.state.outBuffer[AppName][key] = value;
    }
    /**
     * 输出缓冲并清空 test6
     * <br/>用于替换thinkjs中的success
     * @method flush
     */
    flush(cleanKeys?: string[]) {
        const result = this.outBufferClean(this.ctx.state.outBuffer, cleanKeys);
        this.success(result);
    }

    private cleanRule(value: any, key: any, cleanKeys?: string[]): any {
        if (_.isArray(value)) {
            return _.map(value, (subValue) => {
                return this.outBufferClean(subValue, cleanKeys);
            });
        } else if (_.isObject(value)) {
            return this.outBufferClean(value, cleanKeys);
        } else if (_.isNull(value)) {
            return undefined;
        } else if (cleanKeys && _.indexOf(cleanKeys, key) !== -1) {
            return undefined;
        }
        return value;
    }

    /**
     * 清洗回调的数据
     * @param object 需要清洗的object
     */
    private outBufferClean(object = {}, cleanKeys?: string[]): object {
        if (_.isArray(object)) {
            return _.map(object, (value, key) => {
                return this.cleanRule(value, key, cleanKeys);
            });
        } else if (_.isObject(object)) {
            return _.mapValues(object, (value, key) => {
                return this.cleanRule(value, key, cleanKeys);
            });
        } else {
            return object;
        }
    }
}