/**
 * IndexController module.
 * <br/>下发到 app 相关 api，与原广告分发接口一致，数据一致
 * @module dispatch/controller/index
 * @see dispatch/controller/index;
 * @debugger
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import BaseController from '../../common/tale/BaseController';
import TaskService from '../service/task';
import Utils from '../utils';

import { RequestParamVO } from '../../advertisement/defines';

const ipdb = require('ipdb');

export default class IndexController extends BaseController {
    /**
     * default
     */
    public async indexAction() {
        this.success();

    }

    /**
     * @getClientIP
     * @desc 获取用户 ip 地址
     * @param {Object} req - 请求
     */
    getClientIp(req: any, proxyType = 'nginx') {
        let ip = req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
        // think.logger.debug(`clientIp1: ${req.connection.remoteAddress}`);
        // think.logger.debug(`clientIp2: ${req.socket.remoteAddress}`);
        // if (req.connection.socket) {
        //     think.logger.debug(`clientIp3: ${req.connection.socket.remoteAddress}`);
        // }
        // 如果使用了 nginx 代理
        if (proxyType === 'nginx') {
            // headers 上的信息容易被伪造,但是我不 care,自有办法过滤,例如 'x-nginx-proxy' 和 'x-real-ip'
            // 我在 nginx 配置里做了一层拦截把他们设置成了 'true' 和真实 ip,
            // 所以不用担心被伪造
            // 如果没用代理的话,我直接通过 req.connection.remoteAddress 获取到的也是真实 ip,所以我不 care
            // think.logger.debug(`Tale-Real-Ip: ${req.headers['tale-real-ip']}`);
            // think.logger.debug(`x-real-ip: ${req.headers['x-real-ip']}`);
            // think.logger.debug(`x-forwarded-for: ${req.headers['x-forwarded-for']}`);
            ip = req.headers['tale-real-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || ip;

        }
        const ipArr = ip.split(',');
        const xffIp = req.headers['x-forwarded-for'];
        // if (xffIp) {
        //     const xffIpArr = xffIp.split(',');
        //     think.logger.debug(`clientIp6: ${xffIpArr}`);
        //     think.logger.debug(`clientIp7: ${xffIpArr[0]}`);
        // }
        // think.logger.debug(`clientIp8: ${ip}`);
        // 如果使用了nginx代理,如果没配置 'x-real-ip' 只配置了 'x-forwarded-for' 为 $proxy_add_x_forwarded_for,
        // 如果客户端也设置了 'x-forwarded-for' 进行伪造 ip
        // 则 req.headers['x-forwarded-for'] 的格式为 ip1,ip2 只有最后一个才是真实的 ip
        if (proxyType === 'nginx') {
            ip = ipArr[0];

        }
        if (ip.indexOf('::ffff:') !== -1) {
            ip = ip.substring(7);

        }
        // think.logger.debug(`clientIp9: ${ip}`);
        return ip;

    }

    /**
     * @getIPAdress
     * @desc 获取服务器 ip 地址
     * @param {Object} req - 请求
     */
    getIPAdress() {
        const interfaces = require('os').networkInterfaces();

        for (const devName of Object.keys(interfaces)) {
            const iface = interfaces[devName];

            for (const alias of iface) {
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;

                }

            }

        }

    }

    /**
     * 返回所有的广告常量到 app
     * <br/> 兼容云函数版本
     * @argument {number} _cloudApiVersion _cloudApiVersion 版本
     * @argument {string} packageName 包名
     * @argument {string} platform 平台名
     * @argument {string} idfa idfa
     * @argument {string} dId 设备 id
     * @argument {number} versionCode app 版本
     * @argument {string} countryCode 国家代码
     * @debugger yes
     */
    public async adControlInfoAction() {
        const apiVersion: number = this.post('_cloudApiVersion') || 2;
        const countryCode: string = this.post('countryCode');
        const versionCode: number = Number(this.post('versionCode'));
        const packageName: string = this.post('packageName');
        const ip: string = this.getClientIp(this.ctx.req); // 获取用户的 IP
        const idfa: string = this.post('idfa');
        const dId: string = this.post('dId');
        const platform: string = this.post('platform');

        let result: any = {
            AdControl: {
                interstitial: {
                    Facebook: 50,
                    Admob: 50
                },
                banner: {
                    Facebook: 1,
                }
            }
        };
        if (apiVersion && apiVersion > 1) {
            const taskService = this.taleService('task') as TaskService;
            const requestParamVo: RequestParamVO = {
                packageName,
                platform,
                idfa,
                dId,
                versionCode,
                countryCode,
                ip
            };
            const cacheData = await taskService.getAppAllAdControlInfo(requestParamVo);
            const resultData = Utils.rebuildAdInfoV1(cacheData.AdControl);

            result = _.defaults({ AdControl: resultData }, cacheData);

        }
        this.ctx.body = {
            result
        };

    }

    /**
     * 返回所有的广告常量到 app
     * @argument {number} _cloudApiVersion _cloudApiVersion 版本
     * @argument {string} packageName 包名
     * @argument {string} platform 平台名
     * @argument {string} idfa idfa
     * @argument {string} dId 设备 id
     * @argument {number} versionCode app 版本
     * @argument {string} countryCode 国家代码
     * @debugger yes
     */
    public async adInfoAction() {
        const apiVersion: number = this.post('_cloudApiVersion') || 2;
        const countryCode: string = this.post('countryCode');
        const versionCode: number = Number(this.post('versionCode'));
        const packageName: string = this.post('packageName');
        const ip: string = this.post('ip') || this.getClientIp(this.ctx.req); // 获取用户的 IP
        // think.logger.debug(`getClientIP: ${ip}`);
        // const ip = this.ip; // 获取用户的 IP
        const idfa: string = this.post('idfa');
        const dId: string = this.post('dId');
        const platform: string = this.post('platform');

        let result: any = {
            AdControl: {
                interstitial: [],
                banner: []
            }
        };
        if (apiVersion && apiVersion > 1) {
            const taskService = this.taleService('task') as TaskService;
            const requestParamVo: RequestParamVO = {
                packageName,
                platform,
                idfa,
                dId,
                versionCode,
                countryCode,
                ip
            };
            const cacheData = await taskService.getAppAllAdControlInfo(requestParamVo);
            const resultData = Utils.rebuildAdInfoV2(cacheData.AdControl);
            // think.logger.debug(`resultData: ${JSON.stringify(resultData)}`);

            result = _.defaults({ AdControl: resultData }, cacheData);

        }
        if (!packageName || !platform) {
            result = {
                code: 2502,
                message: 'not find group name info'
            };

        }

        this.header('N', 1);
        this.ctx.body = result;

    }

    /**
     * 返回所有的游戏常量到 app
     * @argument {number} _cloudApiVersion _cloudApiVersion 版本
     * @argument {string} packageName 包名
     * @argument {string} platform 平台名
     * @argument {string} idfa idfa
     * @argument {string} dId 设备 id
     * @argument {number} versionCode app 版本
     * @argument {string} countryCode 国家代码
     * @debugger yes
     */
    public async acigAction() {
        const apiVersion: number = this.post('_cloudApiVersion') || 2;
        const countryCode: string = this.post('countryCode');
        const versionCode: number = Number(this.post('versionCode'));
        const packageName: string = this.post('packageName');
        const ip: string = this.post('ip') || this.getClientIp(this.ctx.req); // 获取用户的 IP
        // think.logger.debug(`getClientIP: ${ip}`);
        // const ip = this.ip; // 获取用户的 IP
        const idfa: string = this.post('idfa');
        const dId: string = this.post('dId');
        const platform: string = this.post('platform');

        let result: any = {
            AdControl: {
                interstitial: [],
                banner: []
            }
        };
        if (apiVersion && apiVersion > 1) {
            const taskService = this.taleService('task') as TaskService;
            const requestParamVo: RequestParamVO = {
                packageName,
                platform,
                idfa,
                dId,
                versionCode,
                countryCode,
                ip
            };
            const cacheData = await taskService.getAppAllAdControlInfo(requestParamVo);
            const resultData = Utils.rebuildAdInfoV2(cacheData.AdControl);
            // think.logger.debug(`resultData: ${JSON.stringify(resultData)}`);

            result = _.defaults({ AdControl: resultData }, cacheData);

        }
        if (!packageName || !platform) {
            result = {
                code: 2502,
                message: 'not find group name info'
            };

        }
        this.ctx.body = result;

    }

    /**
     * 返回服务器 ip
     * @argument {string} packageName 包名
     * @argument {string} platform 平台名
     * @argument {string} idfa idfa
     * @argument {string} dId 设备 id
     * @argument {number} versionCode app 版本
     * @debugger yes
     */
    public async getIPAdressAction() {
        const ip = this.getIPAdress();
        this.ctx.body = { serverIp: ip };

    }

    /**
     * 返回客户端 ip
     * @argument {string} packageName 包名
     * @argument {string} platform 平台名
     * @argument {string} idfa idfa
     * @argument {string} dId 设备 id
     * @argument {number} versionCode app 版本
     * @debugger yes
     */
    public async getClientIpAction() {
        const ip = this.getClientIp(this.ctx.req); // 获取用户的 IP
        const ipService = ipdb.getIPHelper();
        const countryCode = ipService.getCountryCodeByIp(ip);

        this.ctx.body = { clientIp: ip, countryCode };

    }
}