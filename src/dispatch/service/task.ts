/**
 * dispatch taskService Service
 * @module dispatch/service/taskService
 * @see module:../../common/tale/BaseService
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as Redis from 'ioredis';
import Bluebird = require('bluebird');

const ipdb = require('ipdb');
const hash = require('hash-code');

import BaseService from '../../common/tale/BaseService';

import {
    AdCacheVO, NativeTmplCacheVO, ConfigCacheVO, VersionGroupCacheVO, AbTestGroupCacheVO, AbTestMapCacheVO,
    RequestParamVO, AdControlVO, AppAllAdControlVO, InstantAdControlVO, HashVO
} from '../../advertisement/defines';

/**
 * 从 redis 缓存中获取下发数据相关 service
 * @class TaskService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class TaskService extends BaseService {
    private redis: Redis.Redis;
    private ipService: any;
    private keyPrefix = 'dispatch:';    // redis 哈希表的 key 前缀
    constructor() {
        super();
        this.redis = (think as any).redis('redis1');
        this.ipService = ipdb.getIPHelper();

    }

    /**
     * 获取 redis 哈希表数据，数据 json
     * @argument {string} redisKey redis key
     * @argument {string} filed redis filed
     */
    private async getOneCache(redisKey: string, filed: string) {
        let res;
        try {
            res = await this.redis.hget(redisKey, filed);
            if (res) {
                res = JSON.parse(res);

            }
            return res;

        } catch (e) {
            return res;

        }

    }

    /**
     * 批量获取 redis 哈希表数据，数据 json
     * @argument {string} redisKey redis key
     * @argument {string[]} fileds redis filed 列表
     */
    private async getArrCache(redisKey: string, fileds: string[]) {
        const list = await this.redis.hmget(redisKey, ...fileds);

        if (_.isEmpty(list)) {

            return _.compact(_.map(list, (json) => {
                if (json) {
                    return JSON.parse(json);

                }

            }));

        }

    }

    /**
     * 获取版本条件分组主键，
     * <br/>必须配置与国家无关的分组和该分组下的默认组
     * @argument {RequestParamVO} params 请求参数
     * @argument {number} type 类型，0 广告 1 游戏常量 2 商店
     */
    private async getVersionGroupId(params: RequestParamVO, type: number) {
        const { platform, packageName } = params;
        const { ip } = params;
        let { countryCode, versionCode } = params;

        if (!countryCode && ip) {
            countryCode = this.ipService.getCountryCodeByIp(ip);

        }
        if (!versionCode) {
            versionCode = 0;

        }
        // 获取 redis 哈希表的 key
        let redisKey;
        if (type === 0) {
            if (platform === 'ios') {
                redisKey = this.keyPrefix + 'Ios_Ad_Product';

            }
            if (platform === 'android') {
                redisKey = this.keyPrefix + 'Android_Ad_Product';

            }
            if (platform === 'wx' || platform === 'weixin') {
                redisKey = this.keyPrefix + 'Weixin_Ad_Product';

            }
            if (platform === 'web' || platform === 'instant') {
                redisKey = this.keyPrefix + 'Instant_Ad_Product';

            }

        }
        if (type === 1) {
            if (platform === 'ios') {
                redisKey = this.keyPrefix + 'Ios_Config_Product';

            }
            if (platform === 'android') {
                redisKey = this.keyPrefix + 'Android_Config_Product';

            }
            if (platform === 'wx' || platform === 'weixin') {
                redisKey = this.keyPrefix + 'Weixin_Config_Product';

            }
            if (platform === 'web' || platform === 'instant') {
                redisKey = this.keyPrefix + 'Instant_Config_Product';

            }

        }

        // 全部版本条件分组数据
        const allVersionGroupList: VersionGroupCacheVO[] = await this.getOneCache(redisKey, packageName);
        // think.logger.debug(`allVersionGroupList: ${JSON.stringify(allVersionGroupList)}`);

        // 查询符合的版本分组主键
        let versionGroupId: string;

        if (allVersionGroupList) {
            const nationVersionGroupList: VersionGroupCacheVO[] = [];    // 国家相关全部分组数据
            const noNationVersionGroupList: VersionGroupCacheVO[] = [];    // 与国家无关全部分组数据
            // 查出该国家所在分组和与国家无关全部分组
            for (let i = allVersionGroupList.length - 1; i >= 0; i--) {
                const {
                    include, code
                } = allVersionGroupList[i];
                if (code !== '[]') {
                    if (include === 1) {
                        if (code.indexOf(countryCode) !== -1) {
                            nationVersionGroupList.push(allVersionGroupList[i]);

                        }

                    } else {
                        if (code.indexOf(countryCode) === -1) {
                            nationVersionGroupList.push(allVersionGroupList[i]);

                        }

                    }

                } else {
                    noNationVersionGroupList.push(allVersionGroupList[i]);

                }

            }

            // think.logger.debug(`nationVersionGroupList: ${JSON.stringify(nationVersionGroupList)}`);
            // think.logger.debug(`noNationVersionGroupList: ${JSON.stringify(noNationVersionGroupList)}`);
            // 国家相关全部分组数据不为空，则表示该国家代码存在配置
            if (!_.isEmpty(nationVersionGroupList)) {
                // 从版本开始范围最大开始匹配，符合则跳出循环
                for (let i = nationVersionGroupList.length - 1; i >= 0; i--) {
                    const { id, begin } = nationVersionGroupList[i];

                    if (versionCode >= begin) {
                        versionGroupId = id;
                        break;

                    }

                }

            }
            // 国家相关全部分组中找不到符合的版本范围，则到与国家无关全部分组数据中查找
            if (!versionGroupId) {
                // 从版本开始范围最大开始匹配，符合则跳出循环
                for (let i = noNationVersionGroupList.length - 1; i >= 0; i--) {
                    const { id, begin } = noNationVersionGroupList[i];

                    if (versionCode >= begin) {
                        versionGroupId = id;
                        break;

                    }

                }

            }

        }
        return versionGroupId;

    }

    /**
     * 根据 idfa，将产品进行 ab 测试分组
     * @argument {string} versionGroupId 版本条件分组表主键
     * @argument {string} idfa idfa
     */
    private async getAbTestGroup(versionGroupId: string, idfa: string) {
        if (versionGroupId) {
            const redisKey = this.keyPrefix + 'AbTestGroup';
            // 全部版本 ab 测试分组数据
            const abTestGroupList: AbTestGroupCacheVO[] = await this.getOneCache(redisKey, versionGroupId);

            if (!_.isEmpty(abTestGroupList)) {

                // 获取具体的 ab 测试分组
                let abTestGroupCacheVo = abTestGroupList[0];

                if (!idfa || _.isEqual(idfa, '00000000-0000-0000-0000-000000000000')) {
                    return abTestGroupCacheVo;

                }

                // ab 测试分组默认组除外即真正的 ab 测试
                if (abTestGroupList.length > 1) {
                    const max = 100;
                    const userCode = Math.abs(hash.hashCode(idfa)) % max;

                    // 遍历 ab 测试分组查询匹配的用户范围
                    for (let i = abTestGroupList.length - 1; i >= 0; i--) {
                        const { begin, end } = abTestGroupList[i];

                        // 用户范围前后都包含
                        if (_.inRange(userCode, begin, end) || userCode === end) {
                            abTestGroupCacheVo = abTestGroupList[i];
                            break;

                        }

                    }

                }
                return abTestGroupCacheVo;

            }

        }

    }

    /**
     * 获取全部 ab 测试分组下广告位数据
     * @argument {string} abTestGroupId  ab 测试分组表主键
     */
    private async getAbTestMapList(abTestGroupId: string) {
        if (abTestGroupId) {
            const redisKey = this.keyPrefix + 'AbTestMap';
            // 全部 ab 测试分组下广告位数据
            const abTestMapList: AbTestMapCacheVO[] = await this.getOneCache(redisKey, abTestGroupId);

            return abTestMapList;

        }

    }

    /**
     * 获取广告组下广告信息，
     * @argument {AbTestMapCacheVO[]} abTestMapList 广告位表数据列表
     */
    private async getAdList(abTestMapList: AbTestMapCacheVO[]) {
        let adControlVoList: AdControlVO[] = [];

        if (!_.isEmpty(abTestMapList)) {
            const redisKey = this.keyPrefix + 'AdGroup';

            adControlVoList = await Bluebird.map(abTestMapList, async (abTestMapCacheVo) => {
                const { adGroupId, place } = abTestMapCacheVo;
                if (!adGroupId) {
                    return;

                }
                const adList: AdCacheVO[] = await this.getOneCache(redisKey, adGroupId);
                const adControlVo: AdControlVO = {
                    adList, place
                };

                return adControlVo;

            });
            // 删除空项
            adControlVoList = _.compact(adControlVoList);

        }
        return adControlVoList;

    }

    /**
     * 获取 native 模板组下 native 模板信息，
     * @argument {string} nativeTmplConfGroupId native 模板组主键
     */
    private async getNativeTmpl(nativeTmplConfGroupId: string) {
        let nativeTmplCacheVo: NativeTmplCacheVO[] = [];

        if (nativeTmplConfGroupId) {
            const redisKey = this.keyPrefix + 'NativeTmpl';

            if (nativeTmplConfGroupId) {
                nativeTmplCacheVo = await this.getOneCache(redisKey, nativeTmplConfGroupId) || [];

            }

        }
        return nativeTmplCacheVo;

    }

    /**
     * 获取常量组下常量数据信息，
     * @argument {string} configGroupId 常量组主键
     */
    private async getConfig(configGroupId: string) {
        let configCacheVo: ConfigCacheVO = { weightGroup: undefined };

        if (configGroupId) {
            const redisKey = this.keyPrefix + 'Config';
            configCacheVo = await this.getOneCache(redisKey, configGroupId) || {};

        }
        return configCacheVo;

    }

    /**
     * 获取常量组下常量数据信息，
     * @argument {string} configGroupId 常量组主键
     */
    private async getAdConfig(
        configGroupId: string, platform: string, packageName: string
    ) {
        const baseConfigKey = this.keyPrefix + 'BaseConfig';
        const productKey = this.keyPrefix + 'Product';
        const productFiled = platform + packageName;

        // 绑定广告常量，则返回的 key 根据基础常量为准
        if (configGroupId) {
            const redisKey = this.keyPrefix + 'Config';
            const [
                adConfigCacheVo, test, baseConfigVoHash
            ] = await Promise.all([
                this.getOneCache(redisKey, configGroupId),
                this.getOneCache(productKey, productFiled),
                this.redis.hgetall(baseConfigKey)
            ]);

            const newAdConfigCacheVo = adConfigCacheVo || {};

            const baseConfigVo: HashVO = JSON.parse(baseConfigVoHash[test]);

            // 以基础常量 key 为准， 基础常量关闭则不返回
            const configCacheVo: HashVO = {};
            for (const key of _.keys(baseConfigVo)) {
                configCacheVo[key] = newAdConfigCacheVo[key] || baseConfigVo[key];

            }
            return configCacheVo;

            // 未绑定广告常量组，则返回基础常量
        } else {
            const [
                test, baseConfigVoHash
            ] = await Promise.all([
                this.getOneCache(productKey, productFiled),
                this.redis.hgetall(baseConfigKey)
            ]);

            const baseConfigVo: HashVO = JSON.parse(baseConfigVoHash[test]);

            return baseConfigVo;
        }

    }

    /**
     * 返回所有的广告，native 模板和常量数据到 app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getAppAllAdControlInfo(params: RequestParamVO) {
        const { dId, packageName, platform } = params;

        // idfa
        const idfa = params.idfa || dId;

        // 分别获取广告版本条件分组和游戏常量版本条件分组主键
        const [adVersionGroupId, configVersionGroupId] = await Promise.all([
            this.getVersionGroupId(params, 0),
            this.getVersionGroupId(params, 1)
        ]);

        // 分别获取广告 ab 测试分组和游戏常量 ab 测试分组
        const [adAbTestGroupCacheVo, configAbTestGroupCacheVo] = await Promise.all([
            this.getAbTestGroup(adVersionGroupId, idfa),
            this.getAbTestGroup(configVersionGroupId, idfa)
        ]);

        let abTestMapList: AbTestMapCacheVO[];    // 广告位列表
        let nativeTmplConfGroupId;    // 应用 native 模板组表主键
        let weightGroup;    // ab 分组名
        let configGroupId;    // 游戏常量组表主键
        let adConfigGroupId;    // 广告常量组表主键

        // 广告相关
        if (adAbTestGroupCacheVo) {
            weightGroup = adAbTestGroupCacheVo.name;
            nativeTmplConfGroupId = adAbTestGroupCacheVo.nativeTmplConfGroupId;
            adConfigGroupId = adAbTestGroupCacheVo.configGroupId;

            const adAbTestGroupId = adAbTestGroupCacheVo.id;
            abTestMapList = await this.getAbTestMapList(adAbTestGroupId);

        }
        // 游戏常量相关
        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        const [
            nativeAdTemplateList,
            adConfigCacheVo,
            adControlList,
            configCacheVo
        ] = await Promise.all([
            this.getNativeTmpl(nativeTmplConfGroupId),
            this.getAdConfig(adConfigGroupId, platform, packageName),
            this.getAdList(abTestMapList),
            this.getConfig(configGroupId)
        ]);

        const configConstant = _.assign(adConfigCacheVo, configCacheVo);

        const appAllAdControlVo: AppAllAdControlVO = {
            adControlList,
            configConstant,
            nativeAdTemplateList,
            config: {
                weightGroup
            }
        };

        return appAllAdControlVo;

    }

    /**
     * 返回 facebook 小游戏所有的广告和常量数据到 app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getInstantAdControlInfo(params: RequestParamVO) {
        // idfa
        const idfa = params.idfa || params.dId;

        // 分别获取广告 ab 测试分组和游戏常量 ab 测试分组
        const [adVersionGroupId, configVersionGroupId] = await Promise.all([
            this.getVersionGroupId(params, 0),
            this.getVersionGroupId(params, 1)
        ]);

        // 分别获取广告 ab 测试分组和游戏常量 ab 测试分组
        const [adAbTestGroupCacheVo, configAbTestGroupCacheVo] = await Promise.all([
            this.getAbTestGroup(adVersionGroupId, idfa),
            this.getAbTestGroup(configVersionGroupId, idfa)
        ]);

        let abTestMapList: AbTestMapCacheVO[];
        let configGroupId;

        // 广告相关
        if (adAbTestGroupCacheVo) {
            const adAbTestGroupId = adAbTestGroupCacheVo.id;
            abTestMapList = await this.getAbTestMapList(adAbTestGroupId);

        }
        // 游戏常量相关
        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        const [
            adControlList,
            configConstant
        ] = await Promise.all([
            this.getAdList(abTestMapList),
            this.getConfig(configGroupId)
        ]);
        delete configConstant.weightGroup;

        const instantAdControlVo: InstantAdControlVO = {
            adControlList,
            configConstant
        };

        return instantAdControlVo;

    }

    /**
     * 返回所有的常量到 app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getConfigConstantInfo(params: RequestParamVO) {
        // idfa
        const idfa = params.idfa || params.dId;

        const configVersionGroupId = await this.getVersionGroupId(params, 1);
        const configAbTestGroupCacheVo = await this.getAbTestGroup(configVersionGroupId, idfa);

        // 常量组主键
        let configGroupId;

        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        return await this.getConfig(configGroupId);

    }

}