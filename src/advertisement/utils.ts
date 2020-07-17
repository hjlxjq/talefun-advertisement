/**
 * 通用的函数实例，多处可用到
 */

'use strict';

import { think } from 'thinkjs';
import * as _ from 'lodash';
import { exec, ExecOptions } from 'shelljs';
import * as Bluebird from 'bluebird';
import * as moment from 'moment-mini-ts';
import * as fs from 'fs';

const uuid = require('node-uuid');
const rp = require('request-promise');

import { HashVO } from './defines';
import { delete } from 'request-promise';

const fsPromises = fs.promises;

const WxHook = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=537847c6-5bf0-45e5-af04-69c311cb3416';

export default class Utils {
    /**
     * 判断对象所有属性是否全部为 undefined,
     * <br/>主要用来判断是否插入或者更新数据表
     */
    public static isEmptyObj(obj: object): boolean {
        let isEmpty = true;

        for (const key of _.keys(obj)) {

            if (!_.isUndefined(obj[key])) {
                isEmpty = false;
                break;

            }

        }
        return isEmpty;

    }

    /**
     * 删除对象所有属性值为 undefined,
     */
    public static delUndefinedFromObj(obj: object): object {
        for (const key of _.keys(obj)) {

            if (_.isUndefined(obj[key])) {
               delete obj[key];

            }

        }
        return obj;

    }

    /**
     * 自动生成主键
     */
    public static generateId(): string {
        return uuid.v4();

    }

    /**
     * 数据库数据 处理成 redis hash 表数据，
     * @argument {{ [propName: string]: object; }} cacheData mysql 取出处理的缓存数据对象
     * @returns {HashVO} redis hash 表
     */
    public static getRedisHash(cacheData: { [propName: string]: object; }) {
        const redisHash: HashVO = {};

        _.each(cacheData, (value, key) => {
            redisHash[key] = JSON.stringify(value);

        });
        return redisHash;

    }

    /**
     * shell 异步执行，返回 Promise
     * @argument {string} command shell 命令
     * @argument {ExecOptions} options shelljs exec 函数执行参数
     * @returns {Promise<string>} 执行结果 code
     */
    public static asyncExec(command: string, options: ExecOptions = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(
                command, options,
                (code: number, stdout: string, stderr: string) => {

                    // think.logger.debug(`code: ${code}`);
                    if (code !== 0) {
                        const e: Error = new Error();
                        e.message = stderr;
                        e.name = String(code);
                        reject(e);

                    } else {
                        resolve(String(code));

                    }

                }

            );

        });

    }

    /**
     * 发送企业微信机器人，
     * <br>一般出现错误，需要通知负责人，则通过企业微信机器人 api 发送
     * @returns {HashVO} redis hash 表
     */
    public static async sendWxBot() {
        const appName = think.config('TLF_AppName');     // app 名
        // 发送内容主体
        const body = {
            msgtype: 'markdown',
            markdown: {
                content: `<font color=\'warning\'>${appName}单元测试失败</font>，请相关同事注意。
                    >原因：[测试结果](http://ad-manager.weplayer.cc/testReport/mochawesome.html)`
            }
        };

        const option = {
            method: 'POST',
            uri: WxHook,
            timeout: 10000,
            body,
            resolveWithFullResponse: true,
            json: true
        };

        await rp(option);

    }

    /**
     * 保存单元测试结果，
     * @argument {string} reportDir 报告目录
     * @argument {string} reportFilename 报告文件名称，报告名为日期形式
     */
    public static async setLastTestDate(reportDir: string, reportFilename: string) {
        const reportFilePath = reportDir + '/' + reportFilename + '.html';    // 报告地址
        const lastPath = reportDir + '/mochawesome.html';    // 最新更新的报告地址

        try {
            const stats = await fsPromises.stat(reportFilePath);

            if (stats.isFile()) {
                // 记录最新更新的报告名
                const versionPath = reportDir + '/version';

                await fsPromises.writeFile(versionPath, reportFilename);
                await fsPromises.copyFile(reportFilePath, lastPath);

            }

        } catch (e) { }

    }

    /**
     * 获取最新更新的报告地址
     * @argument {string} reportDir 报告目录
     * @returns {string} 最新更新的报告地址
     */
    public static async getLastTestDate(reportDir: string) {
        const lastPath = reportDir + '/version';
        const version = await fsPromises.readFile(lastPath);

        return version.toString();

    }

    /**
     * 删除单元测试报告，
     * <br/>防止报告文件过多，时间太长的参考意义不大，故定期删除时间过长的
     * @argument {string} reportDir 报告目录
     * @argument {number} days 定期删除的多少天以前的报告
     * @returns {HashVO} redis hash 表
     */
    public static async delFile(reportDir: string, days: number) {
        const files = await fsPromises.readdir(reportDir);
        // 获取报告文件，html 和 json 文件
        const needDelFiles = files.filter((f) => {
            return f.endsWith('.html') || f.endsWith('.json');

        }, files);

        return await Bluebird.map(needDelFiles, (needDelFile) => {
            // 不管 html 还是 json 文件，后缀都是 5 个字符
            const reportFilename = needDelFile.substring(0, needDelFile.length - 5);

            // 不删除最近的报告
            if (reportFilename === 'last' || reportFilename === 'mochawesome') {
                return;

            }
            // 判断报告是否在需要删除的日期以前，报告名为日期形式
            const met = moment().endOf('day').subtract(days, 'days');
            const bool = moment(reportFilename).isBefore(met);

            if (bool) {
                return fsPromises.unlink(reportDir + '/' + needDelFile);

            }

        });

    }

    /**
     * 获取验证码，
     * <br/>
     * @argument {{ [propName: string]: object; }} length 验证码长度
     * @returns {HashVO} redis hash 表
     */
    public static genVerifiCode(length: number = 6) {
        if (isNaN(length)) {
            throw new TypeError('Length must be a number');

        }
        if (length < 1) {
            throw new RangeError('Length must be at least 1');

        }
        let verifiCode = '';
        // 验证码取值范围
        const possible = '0123456789';

        for (let i = 0; i < length; i++) {
            verifiCode += possible.charAt(Math.floor(Math.random() * possible.length));

        }
        return verifiCode;

    }

    /**
     * 检查目录，不存在则创建目录
     * @argument {string} DirPath 目录
     */
    public static async thenCreateDir(DirPath: string) {
        try {
            await fsPromises.access(DirPath, fs.constants.F_OK);

        } catch (e) {
            await fsPromises.mkdir(DirPath, { recursive: true });

        }

    }

}