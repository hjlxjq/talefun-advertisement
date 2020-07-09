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
    RequestParamVO, AdControlVO, AppAllAdControlVO, InstantAdControlVO
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
            // think.logger.debug(`ip: ${ip}`);
            countryCode = this.ipService.getCountryCodeByIp(ip);
            // countryCode = undefined;
        }
        // think.logger.debug(`countryCode: ${countryCode}`);
        if (!versionCode) {
            versionCode = 0;

        }
        // think.logger.debug(`versionCode: ${versionCode}`);

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
        // think.logger.debug(`redisKey: ${redisKey}`);

        // 全部版本条件分组数据
        const allVersionGroupList: VersionGroupCacheVO[] = await this.getOneCache(redisKey, packageName);
        think.logger.debug(`allVersionGroupList: ${JSON.stringify(allVersionGroupList)}`);

        // 查询符合的版本分组主键
        let versionGroupId: string;

        if (allVersionGroupList) {
            const nationVersionGroupList: VersionGroupCacheVO[] = [];    // 国家相关全部分组数据
            const noNationVersionGroupList: VersionGroupCacheVO[] = [];    // 与国家无关全部分组数据
            // 查出该国家所在分组和与国家无关全部分组
            for (let i = 0, l = allVersionGroupList.length; i < l; i++) {
                const {
                    include, code
                } = allVersionGroupList[i];
                if (code !== '[]') {
                    if (include === 1) {
                        if (_.indexOf(code, countryCode) !== -1) {
                            nationVersionGroupList.push(allVersionGroupList[i]);

                        }

                    } else {
                        if (_.indexOf(code, countryCode) === -1) {
                            nationVersionGroupList.push(allVersionGroupList[i]);

                        }

                    }

                } else {
                    noNationVersionGroupList.push(allVersionGroupList[i]);

                }

            }
            // think.logger.debug(`nationVersionGroupList: ${JSON.stringify(nationVersionGroupList)}`);
            think.logger.debug(`noNationVersionGroupList: ${JSON.stringify(noNationVersionGroupList)}`);

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
        think.logger.debug(`versionGroupId: ${versionGroupId}`);
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
                // think.logger.debug(`adList: ${JSON.stringify(adList)}`);
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
     * 返回所有的广告，native 模板和常量数据到 app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getAppAllAdControlInfo(params: RequestParamVO) {
        // idfa
        const idfa = params.idfa || params.dId;

        // 分别获取广告版本条件分组和游戏常量版本条件分组主键
        const [adVersionGroupId, configVersionGroupId] = await Promise.all([
            this.getVersionGroupId(params, 0),
            this.getVersionGroupId(params, 1)
        ]);

        // think.logger.debug(`adVersionGroupId: ${adVersionGroupId}`);
        // think.logger.debug(`configVersionGroupId: ${configVersionGroupId}`);

        // 分别获取广告 ab 测试分组和游戏常量 ab 测试分组
        const [adAbTestGroupCacheVo, configAbTestGroupCacheVo] = await Promise.all([
            this.getAbTestGroup(adVersionGroupId, idfa),
            this.getAbTestGroup(configVersionGroupId, idfa)
        ]);

        let abTestMapList: AbTestMapCacheVO[];
        let nativeTmplConfGroupId;
        let weightGroup;
        let configGroupId;

        // 广告相关
        if (adAbTestGroupCacheVo) {
            weightGroup = adAbTestGroupCacheVo.name;
            nativeTmplConfGroupId = adAbTestGroupCacheVo.nativeTmplConfGroupId;

            const adAbTestGroupId = adAbTestGroupCacheVo.id;
            abTestMapList = await this.getAbTestMapList(adAbTestGroupId);

        }
        // 游戏常量相关
        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        const [
            nativeAdTemplateList,
            adControlList,
            configConstant
        ] = await Promise.all([
            this.getNativeTmpl(nativeTmplConfGroupId),
            this.getAdList(abTestMapList),
            this.getConfig(configGroupId)
        ]);

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

        // think.logger.debug(`adVersionGroupId: ${adVersionGroupId}`);
        // think.logger.debug(`configVersionGroupId: ${configVersionGroupId}`);

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