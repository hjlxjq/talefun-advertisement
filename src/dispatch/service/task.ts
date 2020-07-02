import { think } from 'thinkjs';
import * as _ from 'lodash';
const ipdb = require('ipdb');
const hash = require('hash-code');

import BaseService from '../../common/tale/BaseService';

import * as Redis from 'ioredis';
import Utils from '../../advertisement/utils';

import {
    AdCacheVO,
    NativeTmplCacheVO,
    ConfigCacheVO,
    VersionGroupCacheVO,
    AbTestGroupCacheVO,
    AbTestMapCacheVO,
    RequestParamVO
} from '../../advertisement/defines';
import Bluebird = require('bluebird');

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
        return _.map(list, (json) => {
            return JSON.parse(json);

        });

    }

    /**
     * 获取分组信息，
     * <br/>必须配置无国家控制的分组，
     * <br/>任何国家分组和无国家分组都需要配置无版本控制的分组
     * @argument {RequestParamVO} params 请求参数
     * @argument {number} type 类型，广告/常量
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

        // 查询 符合的版本分组主键
        let versionGroupId: string;

        if (allVersionGroupList) {

            const nationVersionGroupList: VersionGroupCacheVO[] = [];    // 国家相关全部分组数据
            const noNationVersionGroupList: VersionGroupCacheVO[] = [];    // 非国家全部分组数据
            // 查出该国家所在分组和不含国家的全部分组
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
            let versionGroupList: VersionGroupCacheVO[] = [];
            if (!_.isEmpty(nationVersionGroupList)) {
                versionGroupList = nationVersionGroupList;

            } else {
                versionGroupList = noNationVersionGroupList;

            }

            for (let i = versionGroupList.length - 1; i > 0; i--) {
                const { id, begin } = versionGroupList[i];

                if (versionCode >= begin) {
                    versionGroupId = id;
                    break;

                }

            }

        }
        return versionGroupId;

    }

    /**
     * 根据 idfa，将产品进行 ab 分组
     * @argument {string} versionGroupId 版本条件分组表主键
     * @argument {string} idfa idfa
     */
    private async getAbTestGroup(versionGroupId: string, idfa: string) {
        if (versionGroupId) {
            const redisKey = this.keyPrefix + 'AbTestGroup';
            // 全部版本 ab 测试分组数据
            const abTestGroupList: AbTestGroupCacheVO[] = await this.getOneCache(redisKey, versionGroupId);

            // 获取具体的 ab  测试分组
            let abTestGroupCacheVo = abTestGroupList[0];
            if (!idfa || _.isEqual(idfa, '00000000-0000-0000-0000-000000000000')) {
                return abTestGroupCacheVo;

            }

            const max = 100;
            const userCode = Math.abs(hash.hashCode(idfa)) % max;

            if (abTestGroupList.length > 1) {
                for (let i = 1, l = abTestGroupList.length; i < l; i++) {
                    const { begin } = abTestGroupList[i];

                    if (userCode >= begin) {
                        abTestGroupCacheVo = abTestGroupList[i];
                        break;

                    }

                }

            }
            return abTestGroupCacheVo;

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
     * @argument {AbTestMapCacheVO[]} abTestMapList 广告组主键id
     */
    private async getAdList(abTestMapList: AbTestMapCacheVO[]) {
        if (!_.isEmpty(abTestMapList)) {
            const redisKey = this.keyPrefix + 'AdGroup';

            const AdControl = await Bluebird.map(abTestMapList, async (abTestMapCacheVo) => {
                const { adGroupId, place } = abTestMapCacheVo;
                if (!adGroupId) {
                    return;

                }
                const adList: AdCacheVO[] = await this.getOneCache(redisKey, adGroupId);
                // think.logger.debug(`adList: ${JSON.stringify(adList)}`);
                return { adList, place };

            });
            return _.compact(AdControl);

        }

    }

    /**
     * 获取 native 模板组下 native 模板信息，
     * @argument {string} nativeTmplConfGroupId native 模板组主键
     */
    private async getNativeTmpl(nativeTmplConfGroupId: string) {
        if (nativeTmplConfGroupId) {
            const redisKey = this.keyPrefix + 'NativeTmpl';

            if (nativeTmplConfGroupId) {
                const nativeTmpl: NativeTmplCacheVO[] = await this.getOneCache(redisKey, nativeTmplConfGroupId);
                return nativeTmpl;

            }

        }

    }

    /**
     * 获取常量组下常量数据信息，
     * @argument {string} configGroupId 常量组主键id
     */
    private async getConfig(configGroupId: string) {
        if (configGroupId) {
            const redisKey = this.keyPrefix + 'Config';
            const config: ConfigCacheVO = await this.getOneCache(redisKey, configGroupId);
            return config;

        }

    }

    /**
     * 返回所有的广告常量到 app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getAppAllAdControlInfo(params: RequestParamVO) {
        const idfa = params.idfa || params.dId;

        const [adVersionGroupId, configVersionGroupId] = await Promise.all([
            this.getVersionGroupId(params, 0),
            this.getVersionGroupId(params, 1)
        ]);

        // think.logger.debug(`adVersionGroupId: ${adVersionGroupId}`);
        // think.logger.debug(`configVersionGroupId: ${configVersionGroupId}`);

        const [adAbTestGroupCacheVo, configAbTestGroupCacheVo] = await Promise.all([
            this.getAbTestGroup(adVersionGroupId, idfa),
            this.getAbTestGroup(configVersionGroupId, idfa)
        ]);

        let abTestMapList: AbTestMapCacheVO[];
        let nativeTmplConfGroupId;
        let weightGroup;
        let configGroupId;

        if (adAbTestGroupCacheVo) {
            weightGroup = adAbTestGroupCacheVo.name;
            nativeTmplConfGroupId = adAbTestGroupCacheVo.nativeTmplConfGroupId;

            const adAbTestGroupId = adAbTestGroupCacheVo.id;
            abTestMapList = await this.getAbTestMapList(adAbTestGroupId);

        }
        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        const [
            nativeAdTemplate,
            AdControl,
            ConfigConstant
        ] = await Promise.all([
            this.getNativeTmpl(nativeTmplConfGroupId),
            this.getAdList(abTestMapList),
            this.getConfig(configGroupId)
        ]);

        // think.logger.debug(`AdControl: ${JSON.stringify(AdControl[0])}`);
        // think.logger.debug(`ConfigConstant: ${JSON.stringify(ConfigConstant)}`);
        // think.logger.debug(`nativeAdTemplate: ${JSON.stringify(nativeAdTemplate)}`);
        // think.logger.debug(`weightGroup: ${weightGroup}`);

        return {
            AdControl: AdControl || {},
            ConfigConstant: ConfigConstant || {},
            nativeAdTemplate: nativeAdTemplate || [],
            config: {
                weightGroup
            }
        };

    }

    /**
     * 返回 facebook 小游戏所有的广告常量到 app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getInstanAdControlInfo(params: RequestParamVO) {
        const idfa = params.idfa || params.dId;

        const [adVersionGroupId, configVersionGroupId] = await Promise.all([
            this.getVersionGroupId(params, 0),
            this.getVersionGroupId(params, 1)
        ]);

        think.logger.debug(`adVersionGroupId: ${adVersionGroupId}`);
        think.logger.debug(`configVersionGroupId: ${configVersionGroupId}`);

        const [adAbTestGroupCacheVo, configAbTestGroupCacheVo] = await Promise.all([
            this.getAbTestGroup(adVersionGroupId, idfa),
            this.getAbTestGroup(configVersionGroupId, idfa)
        ]);

        let abTestMapList: AbTestMapCacheVO[];
        let configGroupId;

        if (adAbTestGroupCacheVo) {

            const adAbTestGroupId = adAbTestGroupCacheVo.id;
            abTestMapList = await this.getAbTestMapList(adAbTestGroupId);

        }
        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        const [
            AdControl,
            ConfigConstantGroup
        ] = await Promise.all([
            this.getAdList(abTestMapList),
            this.getConfig(configGroupId)
        ]);
        delete ConfigConstantGroup.weightGroup;

        return {
            AdControl: AdControl || {},
            ConfigConstantGroup: ConfigConstantGroup || {},
        };

    }

    /**
     * 返回所有的常量到app
     * @argument {RequestParamVO} params 请求参数
     */
    public async getConfigConstantInfo(params: RequestParamVO) {
        const idfa = params.idfa || params.dId;

        const configVersionGroupId = await this.getVersionGroupId(params, 1);
        const configAbTestGroupCacheVo = await this.getAbTestGroup(configVersionGroupId, idfa);

        let configGroupId;

        if (configAbTestGroupCacheVo) {
            ({ configGroupId } = configAbTestGroupCacheVo);

        }

        const ConfigConstant = await this.getConfig(configGroupId);

        return ConfigConstant || {};

    }

}