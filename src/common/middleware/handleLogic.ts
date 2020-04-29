'use strict';
import { Context } from 'koa';
import { think } from 'thinkjs';
import { TaleCode } from '../tale/TaleDefine';

/**
 * 错误处理,返回json错误信息
 */
export default (options: {}) => {
    return async (ctx: Context, next: () => Promise<any>) => {
        try {
            await next();
        } catch (e) {
            think.logger.debug(e);
            if (e.eid !== undefined) {
                const errmsg: string = e.message || JSON.stringify(e);
                return ctx.body = {
                    errno: e.eid,
                    errmsg
                };
            } else {
                const errmsg: string = e.sqlMessage || e.code || e.message || JSON.stringify(e);
                return ctx.body = {
                    errno: TaleCode.DBFaild,
                    errmsg
                };
            }
        }
    };
};