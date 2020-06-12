'use strict';
import { think } from 'thinkjs';
import * as _ from 'lodash';
const uuid = require('node-uuid');
import { exec, ExecOptions } from 'shelljs';
import * as Bluebird from 'bluebird';
const rp = require('request-promise');
import * as moment from 'moment-mini-ts';
import * as fs from 'fs';
import * as path from 'path';

const fsPromises = fs.promises;

interface IExecFunctionOptions extends ExecOptions {
    silent?: boolean;
    async?: false;
}
const WxHook = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=537847c6-5bf0-45e5-af04-69c311cb3416';

export default class Utils {

    /**
     * 是否为空或者null
     */
    public static isEmptyObj(obj: object): boolean {
        let isEmpty = true;
        _.each(obj, (value: any) => {
            if (value !== undefined) {
                isEmpty = false;

            }

        });
        return isEmpty;

    }

    /**
     * 自动生成主键id
     */
    public static generateId(): string {
        return uuid.v4();
    }

    /**
     * 对象子数组处理, redis hash表数据
     * @argument {{[propName: string]: object;}} cacheData mysql取出处理的缓存数据对象
     * @returns {{[propName: string]: string;}} redis hash表对象
     */
    public static redisHashObj(cacheData: {
        [propName: string]: object;
    }) {
        const hashObj: {
            [propName: string]: string;
        } = {};
        _.each(cacheData, (value, key) => {
            hashObj[key] = JSON.stringify(value);
        });
        return hashObj;
    }

    public static asyncExec(
        command: string,
        options: IExecFunctionOptions = {}
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(
                command,
                { ...options, async: false },
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

    public static async sendWxBot() {
        const appName = think.config('TLF_AppName');
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

    public static async setLastTestDate(dir: string, date: string) {
        const datePath = dir + '/' + date + '.html';
        const lastPath = dir + '/mochawesome.html';
        // think.logger.debug(`datePath: ${datePath}`);
        // think.logger.debug(`lastPath: ${lastPath}`);
        try {
            const stats = await fsPromises.stat(datePath);
            if (stats.isFile()) {
                const versionPath = dir + '/version';
                // think.logger.debug(`versionPath: ${versionPath}`);
                await fsPromises.writeFile(versionPath, date);
                await fsPromises.copyFile(datePath, lastPath);
            }
        } catch (e) { }
    }

    public static async getLastTestDate(dir: string) {
        const lastPath = dir + '/version';
        const version = await fsPromises.readFile(lastPath);
        return version.toString();
    }

    public static async delFile(dir: string, days: number) {
        const files = await fsPromises.readdir(dir);
        const needDelFiles = files.filter((f) => {
            return f.endsWith('.html') || f.endsWith('.json');
        }, files);
        // think.logger.debug(`needDelFiles: ${JSON.stringify(needDelFiles)}`);
        return await Bluebird.map(needDelFiles, (needDelFile) => {
            const date = needDelFile.substring(0, needDelFile.length - 5);
            if (date === 'last' || date === 'mochawesome') {
                return;
            }
            const met = moment().endOf('day').subtract(days, 'days');
            const bool = moment(date).isBefore(met);
            if (bool) {
                return fsPromises.unlink(dir + '/' + needDelFile);
            }
        });
    }

    public static genVerifiCode(length: number = 6) {
        if (isNaN(length)) {
            throw new TypeError('Length must be a number');
        }
        if (length < 1) {
            throw new RangeError('Length must be at least 1');
        }
        const possible = '0123456789';
        let verifiCode = '';
        for (let i = 0; i < length; i++) {
            verifiCode += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return verifiCode;
    }

    /**
     * 检查目录，不存在则创建目录
     */
    public static async thenCreateDir(DirPath: string) {
        try {
            await fsPromises.access(DirPath, fs.constants.F_OK);

        } catch (e) {
            await fsPromises.mkdir(DirPath, { recursive: true });
        }
    }

}