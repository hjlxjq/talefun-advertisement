'use strict';
import { Context } from 'koa';
import { think } from "thinkjs";

/**
 * 环境变量控制模块
 */
export default (options: {}) => {
    return async (ctx: Context, next: () => Promise<any>) => {
        // think.logger.debug(`path: ${ctx.path}`);
        const CTR_ENV = process.env.CTR_ENV;
        // think.logger.debug(`CTR_ENV: ${CTR_ENV}`);
        if (
            (CTR_ENV === 'manager' && !ctx.path.startsWith('/advertisement')) ||
           (CTR_ENV === 'distribute' && ctx.path.startsWith('/advertisement'))
        ) {
            ctx.status = 404;
        } else {
            await next();
        }
    };
};