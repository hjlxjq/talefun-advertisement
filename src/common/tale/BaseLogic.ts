/**
 * Talefun framework Logic基类
 * @module common/tale/BaseLogic
 * @see module:think.Logic
 */
import { think } from 'thinkjs';
import { TaleCode, TokenExemptVO, TokenVirifyVO, TokenVirifyStatus } from './TaleDefine';
import TokenService from '../service/token';
import BaseModel from './BaseModel';

/**
 * @class BaseLogic
 * @classdesc 所有的验证控制器基类
 * @author yangzhu <yangzhu@talefun.com>
 */
export default class BaseLogic extends think.Logic {

    /**
     * logic before token校验
     * <br/>所有对logic请求都会触发此方法,当前主要校验传入的token是否合法.
     * <br/>部分不需要校验的logic方法可以配置例外,在isTokenExem方法中定义.
     * <br/>此处如果不通过将直接返回错误信息,不能进入logic后续的正常逻辑.
     */
    async __before() {
        // think.logger.debug("baseController __before: " + this.ctx.controller + this.ctx.action);
        const excVO: TokenExemptVO = { controller: this.ctx.controller, action: this.ctx.action };
        const isExe = this.isTokenExempt(excVO);

        // think.logger.info(`是否豁免token检测：${isExe}`);
        if (isExe) { return true; }
        const isAcc = await this.verifyToken();
        if (!isAcc) {
            return false;
        }
    }

    /**
     * 检测token 验证格式和有效期
     */
    public async verifyToken() {
        const tokenService = think.service("token") as TokenService;
        const token = this.header("authorization") || this.get("authorization");
        const tokenVerifyVO = tokenService.verifyToken(token);
        switch (tokenVerifyVO.status) {
            case TokenVirifyStatus.Faild:
                this.fail(TaleCode.UserNotLogin, "token校验失败");
                return false;
            case TokenVirifyStatus.Expired:
                this.fail(TaleCode.SessionExpired, "token过期");
                return false;
            default:
                /** 透传 token解析的数据 */
                this.ctx.state.tokenVerify = tokenVerifyVO.tradeVO;
                return true;
        }
    }

    /**
     * 判断当前请求是否检测token
     */
    isTokenExempt(exeVO: TokenExemptVO) {
        const eces = this.tokenExempts();
        for (const i in eces) {
            if (eces[i].action === exeVO.action) {
                    return true;
                }
        }
        return false;
    }

    /**
     * 取得访问豁免
     * 如果有action不验证token需在此返回
     */
    tokenExempts(): TokenExemptVO[] {
        return [];
    }

    /**
     * @method validateMsg
     * 将校验错误信息拼接成字符串
     * <br/>用于向前端展示
     */
    validateMsg() {
        let msg = "";
        for (const key in this.validateErrors) {
            if (this.validateErrors.hasOwnProperty(key)) {
                msg += this.validateErrors[key] + "\r\n";
            }
        }
        return msg;
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
}